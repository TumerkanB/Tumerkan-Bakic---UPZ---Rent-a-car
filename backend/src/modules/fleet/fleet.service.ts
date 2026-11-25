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

const CAR_SORT_COLS: Record<string, string> = {
  plate: 'c.plate',
  brandName: 'b.brandName',
  categoryName: 'cc.categoryName',
  branchName: 'br.branchName',
  currentMileage: 'c.currentMileage',
  dailyRate: 'dailyRate',
  status: 'c.status',
  carID: 'c.carID',
};

export async function listCars(query: ListCarsQuery, userBranchId: number | null = null) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (userBranchId !== null) {
    conditions.push('c.branchID = ?');
    params.push(userBranchId);
  } else if (query.branchID) {
    conditions.push('c.branchID = ?');
    params.push(query.branchID);
  }
  if (query.status) {
    conditions.push('c.status = ?');
    params.push(query.status);
  }
  if (query.categoryID) {
    conditions.push('c.categoryID = ?');
    params.push(query.categoryID);
  }
  if (query.brandID) {
    conditions.push('b.brandID = ?');
    params.push(query.brandID);
  }
  if (query.fuelType) {
    conditions.push('c.fuelType = ?');
    params.push(query.fuelType);
  }
  if (query.transmission) {
    conditions.push('c.transmission = ?');
    params.push(query.transmission);
  }
  if (query.expiringSoon === 'true') {
    conditions.push(
      `(c.insuranceExpiry IS NULL OR c.insuranceExpiry <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        OR c.registrationExpiry IS NULL OR c.registrationExpiry <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        OR c.inspectionExpiry IS NULL OR c.inspectionExpiry <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        OR (c.nextServiceDate IS NOT NULL AND c.nextServiceDate <= DATE_ADD(CURDATE(), INTERVAL 30 DAY))
        OR (c.nextServiceMileage IS NOT NULL AND c.currentMileage >= c.nextServiceMileage - 1000))`,
    );
  }
  if (query.search) {
    conditions.push('(c.plate LIKE ? OR mo.modelName LIKE ? OR b.brandName LIKE ? OR m.name LIKE ?)');
    const pattern = `%${query.search}%`;
    params.push(pattern, pattern, pattern, pattern);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (query.page - 1) * query.pageSize;
  const sortCol = CAR_SORT_COLS[query.sort ?? ''] ?? 'c.carID';
  const dir = query.order === 'asc' ? 'ASC' : 'DESC';

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
     ORDER BY ${sortCol} ${dir}
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

export async function reorderCarImages(userID: number, carID: number, imageIDs: number[]) {
  await withTransaction(userID, async (conn) => {
    for (let idx = 0; idx < imageIDs.length; idx++) {
      await conn.query(`UPDATE carimage SET sortOrder = ? WHERE imageID = ? AND carID = ?`, [
        idx + 1,
        imageIDs[idx],
        carID,
      ]);
    }
  });
  return getCarById(carID);
}

export async function deleteCar(userID: number, carID: number) {
  await withDbSession(userID, async (conn) => {
    const [res] = await conn.query<ResultSetHeader>(`DELETE FROM car WHERE carID = ?`, [carID]);
    if (res.affectedRows === 0) throw new NotFoundError(`Car #${carID} not found`);
  });
}

export async function getCarWorkspace(carID: number) {
  const car = await getCarById(carID);

  const [carPriceRows] = await pool.query<RowDataPacket[]>(
    `SELECT dailyRate FROM pricehistory
     WHERE carID = ? AND effectiveFrom <= CURDATE() AND (effectiveTo IS NULL OR effectiveTo >= CURDATE())
     ORDER BY effectiveFrom DESC, priceID DESC LIMIT 1`,
    [carID],
  );

  const [catPriceRows] = await pool.query<RowDataPacket[]>(
    `SELECT cp.dailyRate, cp.isSeasonal, cp.seasonName
     FROM categoryprice cp
     WHERE cp.categoryID = ? AND cp.effectiveFrom <= CURDATE() AND (cp.effectiveTo IS NULL OR cp.effectiveTo >= CURDATE())
     ORDER BY cp.isSeasonal DESC, cp.effectiveFrom DESC, cp.priceID DESC LIMIT 1`,
    [car.categoryID],
  );

  let priceSource = 'None';
  if (carPriceRows.length > 0) {
    priceSource = 'Car-specific price';
  } else if (catPriceRows.length > 0) {
    priceSource =
      catPriceRows[0]?.isSeasonal === 1
        ? `Seasonal category price (${catPriceRows[0].seasonName})`
        : 'Base category price';
  }

  const [priceHistory] = await pool.query<RowDataPacket[]>(
    `SELECT priceID, dailyRate, DATE_FORMAT(effectiveFrom, '%Y-%m-%d') AS effectiveFrom,
            DATE_FORMAT(effectiveTo, '%Y-%m-%d') AS effectiveTo
     FROM pricehistory WHERE carID = ? ORDER BY effectiveFrom DESC, priceID DESC`,
    [carID],
  );

  const [priceAuditLog] = await pool.query<RowDataPacket[]>(
    `SELECT p.auditID, p.oldDailyRate, p.newDailyRate, p.actionType, p.changedAt, p.changedBy, u.username AS changedByUser
     FROM priceauditlog p
     LEFT JOIN \`user\` u ON u.userID = p.changedByUserID
     WHERE p.carID = ?
     ORDER BY p.changedAt DESC, p.auditID DESC`,
    [carID],
  );

  const [maintenance] = await pool.query<RowDataPacket[]>(
    `SELECT m.maintenanceID, m.serviceType, DATE_FORMAT(m.serviceDate, '%Y-%m-%d') AS serviceDate,
            m.mileage, m.cost, m.description, m.performedBy,
            DATE_FORMAT(m.nextDueDate, '%Y-%m-%d') AS nextDueDate, m.nextDueMileage,
            u.username AS loggedBy
     FROM maintenancerecord m
     LEFT JOIN \`user\` u ON u.userID = m.createdByUserID
     WHERE m.carID = ?
     ORDER BY m.serviceDate DESC, m.maintenanceID DESC`,
    [carID],
  );

  const [damages] = await pool.query<RowDataPacket[]>(
    `SELECT d.damageID, d.reservationID, d.reportDate, d.description, d.repairCost,
            d.isRepaired, d.billedChargeID, u.username AS reportedBy
     FROM damagereport d
     LEFT JOIN \`user\` u ON u.userID = d.reportedByUserID
     WHERE d.carID = ?
     ORDER BY d.reportDate DESC, d.damageID DESC`,
    [carID],
  );

  const [fines] = await pool.query<RowDataPacket[]>(
    `SELECT f.fineID, f.fineType, f.occurredAt, f.amount, f.referenceNo, f.description,
            f.status, f.reservationID, f.billedChargeID
     FROM trafficfine f
     WHERE f.carID = ?
     ORDER BY f.occurredAt DESC`,
    [carID],
  );

  const [reservations] = await pool.query<RowDataPacket[]>(
    `SELECT r.reservationID, r.startDate, r.endDate, r.status, r.totalPrice,
            CONCAT(cl.name, ' ', cl.surname) AS clientName, pb.branchName AS pickupBranch
     FROM reservation r
     JOIN \`client\` cl ON cl.clientID = r.clientID
     JOIN branch pb ON pb.branchID = r.pickupBranchID
     WHERE r.carID = ?
     ORDER BY r.startDate DESC`,
    [carID],
  );

  return {
    car,
    pricing: {
      effectiveDailyRate: car.dailyRate,
      priceSource,
      priceHistory,
      priceAuditLog,
    },
    maintenance,
    damages,
    fines,
    reservations,
  };
}

export async function setCarPrice(userId: number, carID: number, dailyRate: number, effectiveFrom: string) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_set_car_price(?, ?, ?)`, [carID, dailyRate, effectiveFrom]);
  });
}

export async function createMaintenance(
  userId: number,
  carID: number,
  input: {
    serviceType: string;
    serviceDate: string;
    mileage: number;
    cost: number;
    description?: string | null;
    performedBy?: string | null;
    nextDueDate?: string | null;
    nextDueMileage?: number | null;
  },
) {
  await withDbSession(userId, async (conn) => {
    await conn.query(
      `INSERT INTO maintenancerecord (carID, serviceType, serviceDate, mileage, cost, description, performedBy, nextDueDate, nextDueMileage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        carID,
        input.serviceType,
        input.serviceDate,
        input.mileage,
        input.cost,
        input.description || null,
        input.performedBy || null,
        input.nextDueDate || null,
        input.nextDueMileage ?? null,
      ],
    );
  });
}

export async function deleteMaintenance(userId: number, maintenanceID: number) {
  await withDbSession(userId, async (conn) => {
    const [res] = await conn.query<ResultSetHeader>(
      `DELETE FROM maintenancerecord WHERE maintenanceID = ?`,
      [maintenanceID],
    );
    if (res.affectedRows === 0) throw new NotFoundError('Maintenance record not found');
  });
}

export async function reportCarDamage(
  userId: number,
  carID: number,
  reservationID: number | null,
  description: string,
  repairCost: number | null,
) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_report_damage(?, ?, ?, ?, @out_damage_id)`, [
      carID,
      reservationID,
      description,
      repairCost,
    ]);
  });
}

export async function markDamageRepaired(userId: number, damageID: number, repairCost: number) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_mark_damage_repaired(?, ?)`, [damageID, repairCost]);
  });
}

export async function getCatalogData() {
  const [manufacturers] = await pool.query<RowDataPacket[]>(
    `SELECT m.manufacturerID, m.name, m.logoUrl,
            (SELECT COUNT(*) FROM brand b WHERE b.manufacturerID = m.manufacturerID) AS brandCount
     FROM manufacturer m
     ORDER BY m.name ASC`,
  );
  const [brands] = await pool.query<RowDataPacket[]>(
    `SELECT b.brandID, b.brandName, b.manufacturerID, m.name AS manufacturerName, b.logoUrl,
            (SELECT COUNT(*) FROM model mo WHERE mo.brandID = b.brandID) AS modelCount
     FROM brand b
     JOIN manufacturer m ON m.manufacturerID = b.manufacturerID
     ORDER BY b.brandName ASC`,
  );
  const [models] = await pool.query<RowDataPacket[]>(
    `SELECT mo.modelID, mo.modelName, mo.brandID, b.brandName, b.manufacturerID,
            (SELECT COUNT(*) FROM car c WHERE c.modelID = mo.modelID) AS carCount
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

export async function bulkImportModels(
  userId: number,
  items: { modelName: string; brandName: string }[],
) {
  return withTransaction(userId, async (conn) => {
    const [brandRows] = await conn.query<RowDataPacket[]>(`SELECT brandID, brandName FROM brand`);
    const brandMap = new Map(brandRows.map((b) => [String(b.brandName).trim().toLowerCase(), Number(b.brandID)]));

    let insertedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      const brandID = brandMap.get(item.brandName.trim().toLowerCase());
      if (!brandID) {
        errors.push(`Row ${i + 1}: Unknown brand "${item.brandName}"`);
        continue;
      }
      const [exists] = await conn.query<RowDataPacket[]>(
        `SELECT 1 FROM model WHERE brandID = ? AND LOWER(modelName) = LOWER(?) LIMIT 1`,
        [brandID, item.modelName.trim()],
      );
      if (exists.length > 0) {
        skippedCount++;
        continue;
      }
      await conn.query(`INSERT INTO model (modelName, brandID) VALUES (?, ?)`, [
        item.modelName.trim(),
        brandID,
      ]);
      insertedCount++;
    }

    return { insertedCount, skippedCount, errors };
  });
}

export async function listAllCategoriesAdmin() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT cc.categoryID, cc.categoryName, cc.description, cc.depositAmount, cc.isActive,
            (SELECT cp.dailyRate
             FROM categoryprice cp
             WHERE cp.categoryID = cc.categoryID
               AND cp.isSeasonal = 0
               AND cp.effectiveFrom <= CURDATE()
               AND (cp.effectiveTo IS NULL OR cp.effectiveTo >= CURDATE())
             ORDER BY cp.effectiveFrom DESC, cp.priceID DESC
             LIMIT 1) AS currentBaseRate
     FROM carcategory cc
     ORDER BY cc.categoryID ASC`,
  );
  return rows;
}

export async function createCategory(input: {
  categoryName: string;
  description?: string | null;
  depositAmount: number;
  isActive: boolean;
}) {
  const [res] = await pool.query<ResultSetHeader>(
    `INSERT INTO carcategory (categoryName, description, depositAmount, isActive) VALUES (?, ?, ?, ?)`,
    [input.categoryName, input.description || null, input.depositAmount, input.isActive ? 1 : 0],
  );
  return { categoryID: res.insertId, ...input };
}

export async function updateCategory(
  id: number,
  input: {
    categoryName: string;
    description?: string | null;
    depositAmount: number;
    isActive: boolean;
  },
) {
  const [res] = await pool.query<ResultSetHeader>(
    `UPDATE carcategory SET categoryName = ?, description = ?, depositAmount = ?, isActive = ? WHERE categoryID = ?`,
    [input.categoryName, input.description || null, input.depositAmount, input.isActive ? 1 : 0, id],
  );
  if (res.affectedRows === 0) throw new NotFoundError('Category not found');
  return { categoryID: id, ...input };
}

export async function deleteCategory(id: number) {
  const [res] = await pool.query<ResultSetHeader>(`DELETE FROM carcategory WHERE categoryID = ?`, [id]);
  if (res.affectedRows === 0) throw new NotFoundError('Category not found');
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
