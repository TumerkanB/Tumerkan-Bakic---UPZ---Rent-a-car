import type { RowDataPacket } from 'mysql2/promise';
import { pool } from '../../db/pool.js';
import { NotFoundError } from '../../errors/AppError.js';
import type { ListCarsQuery } from './fleet.schema.js';

interface CarRow extends RowDataPacket {
  carID: number;
  plate: string;
  color: string | null;
  fuelType: 'Gas' | 'Diesel' | 'Electric' | 'Hybrid';
  status: 'Available' | 'Maintenance' | 'Inactive';
  currentMileage: number;
  modelID: number;
  modelName: string;
  brandName: string;
  manufacturerName: string;
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
    conditions.push('(c.plate LIKE ? OR mo.modelName LIKE ? OR b.brandName LIKE ?)');
    const pattern = `%${query.search}%`;
    params.push(pattern, pattern, pattern);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (query.page - 1) * query.pageSize;

  const [countRows] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS total
     FROM car c
     JOIN model mo ON mo.modelID = c.modelID
     JOIN brand b ON b.brandID = mo.brandID
     ${whereClause}`,
    params,
  );

  const [rows] = await pool.query<CarRow[]>(
    `SELECT c.carID, c.plate, c.color, c.fuelType, c.status, c.currentMileage,
            mo.modelID, mo.modelName, b.brandName, m.name AS manufacturerName,
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
    `SELECT c.carID, c.plate, c.color, c.fuelType, c.status, c.currentMileage,
            c.insuranceExpiry, c.registrationExpiry, c.inspectionExpiry,
            c.nextServiceDate, c.nextServiceMileage,
            mo.modelID, mo.modelName, b.brandName, m.name AS manufacturerName,
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
  return car;
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
