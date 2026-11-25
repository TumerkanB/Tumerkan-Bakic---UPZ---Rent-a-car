import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool, withDbSession, withTransaction } from '../../db/pool.js';
import { BadRequestError, NotFoundError } from '../../errors/AppError.js';
import type { CreateCarInput, ListCarsQuery, UpdateCarInput } from './fleet.schema.js';

interface CarRow extends RowDataPacket {
  carID: number;
  plate: string;
  color: string | null;
  fuelType: 'Gas' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Manual' | 'Automatic';
  status: 'Available' | 'Maintenance' | 'Inactive';
  currentMileage: number;
  modelID: number;
  modelName: string;
  brandID: number;
  brandName: string;
  brandLogo: string | null;
  manufacturerID: number;
  manufacturerName: string;
  manufacturerLogo: string | null;
  thumbnail: string | null;
  categoryID: number;
  categoryName: string;
  branchID: number;
  branchName: string;
  dailyRate: number | null;
  issues: string | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

export async function listCars(query: ListCarsQuery) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (query.status) {
    conditions.push('c.status = ?');
    params.push(query.status);
  }
  if (query.branchID) {
    conditions.push('c.branchID = ?');
    params.push(query.branchID);
  }
  if (query.categoryID) {
    conditions.push('c.categoryID = ?');
    params.push(query.categoryID);
  }
  if (query.search) {
    conditions.push('(c.plate LIKE ? OR mo.modelName LIKE ? OR b.brandName LIKE ? OR m.name LIKE ?)');
    const pattern = `%${query.search}%`;
    params.push(pattern, pattern, pattern, pattern);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (query.page - 1) * query.pageSize;

  const [countRows] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS total
     FROM car c
     JOIN model mo ON mo.modelID = c.modelID
     JOIN brand b ON b.brandID = mo.brandID
     JOIN manufacturer m ON m.manufacturerID = b.manufacturerID
     ${whereClause}`,
    params,
  );

  const [rows] = await pool.query<CarRow[]>(
    `SELECT c.carID, c.plate, c.color, c.fuelType, c.transmission, c.status, c.currentMileage,
            DATE_FORMAT(c.insuranceExpiry, '%Y-%m-%d') AS insuranceExpiry,
            DATE_FORMAT(c.registrationExpiry, '%Y-%m-%d') AS registrationExpiry,
            DATE_FORMAT(c.inspectionExpiry, '%Y-%m-%d') AS inspectionExpiry,
            DATE_FORMAT(c.nextServiceDate, '%Y-%m-%d') AS nextServiceDate,
            c.nextServiceMileage,
            mo.modelID, mo.modelName,
            b.brandID, b.brandName, b.logoUrl AS brandLogo,
            m.manufacturerID, m.name AS manufacturerName, m.logoUrl AS manufacturerLogo,
            (SELECT i.fileReference FROM carimage i WHERE i.carID = c.carID AND i.isPrimary = 1 LIMIT 1) AS thumbnail,
            cc.categoryID, cc.categoryName, br.branchID, br.branchName,
            fn_get_daily_rate(c.carID, CURDATE()) AS dailyRate,
            vc.issues
     FROM car c
     JOIN model mo ON mo.modelID = c.modelID
     JOIN brand b ON b.brandID = mo.brandID
     JOIN manufacturer m ON m.manufacturerID = b.manufacturerID
     JOIN carcategory cc ON cc.categoryID = c.categoryID
     JOIN branch br ON br.branchID = c.branchID
     LEFT JOIN view_carcompliance vc ON vc.carID = c.carID
     ${whereClause}
     ORDER BY c.carID DESC
     LIMIT ? OFFSET ?`,
    [...params, query.pageSize, offset],
  );

  const total = countRows[0]?.total ?? 0;

  return {
    items: rows,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  };
}

export async function getCarById(carID: number) {
  const [rows] = await pool.query<CarRow[]>(
    `SELECT c.carID, c.plate, c.color, c.fuelType, c.transmission, c.status, c.currentMileage,
            DATE_FORMAT(c.insuranceExpiry, '%Y-%m-%d') AS insuranceExpiry,
            DATE_FORMAT(c.registrationExpiry, '%Y-%m-%d') AS registrationExpiry,
            DATE_FORMAT(c.inspectionExpiry, '%Y-%m-%d') AS inspectionExpiry,
            DATE_FORMAT(c.nextServiceDate, '%Y-%m-%d') AS nextServiceDate,
            c.nextServiceMileage,
            mo.modelID, mo.modelName,
            b.brandID, b.brandName, b.logoUrl AS brandLogo,
            m.manufacturerID, m.name AS manufacturerName, m.logoUrl AS manufacturerLogo,
            cc.categoryID, cc.categoryName, br.branchID, br.branchName,
            fn_get_daily_rate(c.carID, CURDATE()) AS dailyRate,
            vc.issues
     FROM car c
     JOIN model mo ON mo.modelID = c.modelID
     JOIN brand b ON b.brandID = mo.brandID
     JOIN manufacturer m ON m.manufacturerID = b.manufacturerID
     JOIN carcategory cc ON cc.categoryID = c.categoryID
     JOIN branch br ON br.branchID = c.branchID
     LEFT JOIN view_carcompliance vc ON vc.carID = c.carID
     WHERE c.carID = ?
     LIMIT 1`,
    [carID],
  );

  const car = rows[0];
  if (!car) {
    throw new NotFoundError(`Car #${carID} not found`);
  }

  const [images] = await pool.query<RowDataPacket[]>(
    `SELECT imageID, carID, fileReference, caption, sortOrder, isPrimary, createdAt
     FROM carimage
     WHERE carID = ?
     ORDER BY isPrimary DESC, sortOrder ASC, imageID ASC`,
    [carID],
  );

  return { ...car, images };
}

export async function createCar(userID: number, input: CreateCarInput) {
  const carID = await withTransaction(userID, async (conn) => {
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO car (
        modelID, categoryID, branchID, plate, color, fuelType, transmission, status,
        currentMileage, insuranceExpiry, registrationExpiry, inspectionExpiry,
        nextServiceDate, nextServiceMileage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.modelID,
        input.categoryID,
        input.branchID,
        input.plate,
        input.color || null,
        input.fuelType,
        input.transmission,
        input.status,
        input.currentMileage,
        input.insuranceExpiry || null,
        input.registrationExpiry || null,
        input.inspectionExpiry || null,
        input.nextServiceDate || null,
        input.nextServiceMileage ?? null,
      ],
    );

    const newCarID = result.insertId;
    if (input.initialImageUrl) {
      await conn.query(`CALL sp_add_car_image(?, ?, ?, 1, @out_img_id)`, [
        newCarID,
        input.initialImageUrl,
        null,
      ]);
    }
    return newCarID;
  });

  return getCarById(carID);
}

export async function updateCar(userID: number, carID: number, input: UpdateCarInput) {
  const fields: string[] = [];
  const values: unknown[] = [];

  const entries: [keyof UpdateCarInput, unknown][] = [
    ['modelID', input.modelID],
    ['categoryID', input.categoryID],
    ['branchID', input.branchID],
    ['plate', input.plate],
    ['color', input.color === '' ? null : input.color],
    ['fuelType', input.fuelType],
    ['transmission', input.transmission],
    ['status', input.status],
    ['currentMileage', input.currentMileage],
    ['insuranceExpiry', input.insuranceExpiry === '' ? null : input.insuranceExpiry],
    ['registrationExpiry', input.registrationExpiry === '' ? null : input.registrationExpiry],
    ['inspectionExpiry', input.inspectionExpiry === '' ? null : input.inspectionExpiry],
    ['nextServiceDate', input.nextServiceDate === '' ? null : input.nextServiceDate],
    ['nextServiceMileage', input.nextServiceMileage],
  ];

  for (const [col, val] of entries) {
    if (val !== undefined) {
      fields.push(`${col} = ?`);
      values.push(val);
    }
  }

  if (fields.length === 0) {
    throw new BadRequestError('No fields provided to update');
  }

  await withDbSession(userID, async (conn) => {
    const [result] = await conn.query<ResultSetHeader>(
      `UPDATE car SET ${fields.join(', ')} WHERE carID = ?`,
      [...values, carID],
    );
    if (result.affectedRows === 0) {
      throw new NotFoundError(`Car #${carID} not found`);
    }
  });

  return getCarById(carID);
}

export async function addCarImage(
  userID: number,
  carID: number,
  fileReference: string,
  caption: string | null,
  makePrimary: boolean,
) {
  await withDbSession(userID, async (conn) => {
    await conn.query(`CALL sp_add_car_image(?, ?, ?, ?, @out_img_id)`, [
      carID,
      fileReference,
      caption,
      makePrimary ? 1 : 0,
    ]);
  });
  return getCarById(carID);
}

export async function setPrimaryCarImage(userID: number, carID: number, imageID: number) {
  await withDbSession(userID, async (conn) => {
    await conn.query(`CALL sp_set_primary_car_image(?)`, [imageID]);
  });
  return getCarById(carID);
}

export async function deleteCarImage(userID: number, carID: number, imageID: number) {
  await withDbSession(userID, async (conn) => {
    await conn.query(`CALL sp_delete_car_image(?)`, [imageID]);
  });
  return getCarById(carID);
}

export async function getCatalogData() {
  const [manufacturers] = await pool.query<RowDataPacket[]>(
    `SELECT manufacturerID, name, logoUrl FROM manufacturer ORDER BY name ASC`,
  );
  const [brands] = await pool.query<RowDataPacket[]>(
    `SELECT b.brandID, b.brandName, b.manufacturerID, m.name AS manufacturerName, b.logoUrl
     FROM brand b
     JOIN manufacturer m ON m.manufacturerID = b.manufacturerID
     ORDER BY b.brandName ASC`,
  );
  const [models] = await pool.query<RowDataPacket[]>(
    `SELECT mo.modelID, mo.modelName, mo.brandID, b.brandName, b.manufacturerID
     FROM model mo
     JOIN brand b ON b.brandID = mo.brandID
     ORDER BY b.brandName ASC, mo.modelName ASC`,
  );
  return { manufacturers, brands, models };
}

export async function createManufacturer(name: string, logoUrl?: string | null) {
  const [res] = await pool.query<ResultSetHeader>(
    `INSERT INTO manufacturer (name, logoUrl) VALUES (?, ?)`,
    [name, logoUrl || null],
  );
  return { manufacturerID: res.insertId, name, logoUrl: logoUrl || null };
}

export async function updateManufacturer(id: number, name: string, logoUrl?: string | null) {
  const [res] = await pool.query<ResultSetHeader>(
    `UPDATE manufacturer SET name = ?, logoUrl = ? WHERE manufacturerID = ?`,
    [name, logoUrl || null, id],
  );
  if (res.affectedRows === 0) throw new NotFoundError('Manufacturer not found');
  return { manufacturerID: id, name, logoUrl: logoUrl || null };
}

export async function deleteManufacturer(id: number) {
  const [res] = await pool.query<ResultSetHeader>(`DELETE FROM manufacturer WHERE manufacturerID = ?`, [id]);
  if (res.affectedRows === 0) throw new NotFoundError('Manufacturer not found');
}

export async function createBrand(brandName: string, manufacturerID: number, logoUrl?: string | null) {
  const [res] = await pool.query<ResultSetHeader>(
    `INSERT INTO brand (brandName, manufacturerID, logoUrl) VALUES (?, ?, ?)`,
    [brandName, manufacturerID, logoUrl || null],
  );
  return { brandID: res.insertId, brandName, manufacturerID, logoUrl: logoUrl || null };
}

export async function updateBrand(id: number, brandName: string, manufacturerID: number, logoUrl?: string | null) {
  const [res] = await pool.query<ResultSetHeader>(
    `UPDATE brand SET brandName = ?, manufacturerID = ?, logoUrl = ? WHERE brandID = ?`,
    [brandName, manufacturerID, logoUrl || null, id],
  );
  if (res.affectedRows === 0) throw new NotFoundError('Brand not found');
  return { brandID: id, brandName, manufacturerID, logoUrl: logoUrl || null };
}

export async function deleteBrand(id: number) {
  const [res] = await pool.query<ResultSetHeader>(`DELETE FROM brand WHERE brandID = ?`, [id]);
  if (res.affectedRows === 0) throw new NotFoundError('Brand not found');
}

export async function createModel(modelName: string, brandID: number) {
  const [res] = await pool.query<ResultSetHeader>(
    `INSERT INTO model (modelName, brandID) VALUES (?, ?)`,
    [modelName, brandID],
  );
  return { modelID: res.insertId, modelName, brandID };
}

export async function updateModel(id: number, modelName: string, brandID: number) {
  const [res] = await pool.query<ResultSetHeader>(
    `UPDATE model SET modelName = ?, brandID = ? WHERE modelID = ?`,
    [modelName, brandID, id],
  );
  if (res.affectedRows === 0) throw new NotFoundError('Model not found');
  return { modelID: id, modelName, brandID };
}

export async function deleteModel(id: number) {
  const [res] = await pool.query<ResultSetHeader>(`DELETE FROM model WHERE modelID = ?`, [id]);
  if (res.affectedRows === 0) throw new NotFoundError('Model not found');
}

export async function listBranches() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT branchID, branchName, street, number, zip, cityName, countryName, phone, isActive
     FROM view_branch
     ORDER BY branchName ASC`,
  );
  return rows;
}

export async function listCategories() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT categoryID, categoryName, description, depositAmount, isActive
     FROM carcategory
     WHERE isActive = 1
     ORDER BY categoryID ASC`,
  );
  return rows;
}
