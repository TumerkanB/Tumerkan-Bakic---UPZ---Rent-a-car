import type { RowDataPacket } from 'mysql2/promise';
import { pool } from '../../db/pool.js';
import { BadRequestError } from '../../errors/AppError.js';
import type { PublicCarsSearchQuery } from './publicCatalog.schema.js';

interface CountryRow extends RowDataPacket {
  countryID: number;
  countryName: string;
}

interface CityRow extends RowDataPacket {
  cityID: number;
  cityName: string;
  countryID: number;
}

interface PublicCarRow extends RowDataPacket {
  carID: number;
  plate: string;
  color: string | null;
  fuelType: 'Gas' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Manual' | 'Automatic';
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
  depositAmount: number;
  branchID: number;
  branchName: string;
  pickupCityID: number;
  pickupCityName: string;
  pickupCountryID: number;
  pickupCountryName: string;
  dailyRate: number | null;
  periodTotalPrice: number | null;
  isExactAvailable: number;
}

interface CountRow extends RowDataPacket {
  total: number;
}

const SORT_ORDER_MAP: Record<PublicCarsSearchQuery['sortBy'], string> = {
  price_asc: 'isExactAvailable DESC, dailyRate IS NULL ASC, dailyRate ASC, c.carID DESC',
  price_desc: 'isExactAvailable DESC, dailyRate IS NULL ASC, dailyRate DESC, c.carID DESC',
  mileage_asc: 'isExactAvailable DESC, c.currentMileage ASC, c.carID DESC',
  newest: 'isExactAvailable DESC, c.carID DESC',
};

function toMysqlDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestError(`Invalid date/time: ${value}`);
  }
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export async function getPublicLocations() {
  const [pickupCities] = await pool.query<CityRow[]>(
    `SELECT DISTINCT ci.cityID, ci.cityName, ci.countryID
     FROM branch br
     JOIN address a ON a.addressID = br.addressID
     JOIN city ci ON ci.cityID = a.cityID
     WHERE br.isActive = 1
     ORDER BY ci.cityName ASC`,
  );

  const [pickupCountries] = await pool.query<CountryRow[]>(
    `SELECT DISTINCT co.countryID, co.countryName
     FROM branch br
     JOIN address a ON a.addressID = br.addressID
     JOIN city ci ON ci.cityID = a.cityID
     JOIN country co ON co.countryID = ci.countryID
     WHERE br.isActive = 1
     ORDER BY co.countryName ASC`,
  );

  const [dropoffCities] = await pool.query<CityRow[]>(
    `SELECT DISTINCT ci.cityID, ci.cityName, ci.countryID
     FROM city ci
     WHERE EXISTS (
       SELECT 1 FROM branch br
       JOIN address a ON a.addressID = br.addressID
       WHERE a.cityID = ci.cityID AND br.isActive = 1
     ) OR EXISTS (
       SELECT 1 FROM dropofflocation dl
       JOIN address a ON a.addressID = dl.addressID
       JOIN branch br ON br.branchID = dl.branchID
       WHERE a.cityID = ci.cityID AND dl.isActive = 1 AND br.isActive = 1
     )
     ORDER BY ci.cityName ASC`,
  );

  const [dropoffCountries] = await pool.query<CountryRow[]>(
    `SELECT DISTINCT co.countryID, co.countryName
     FROM country co
     JOIN city ci ON ci.countryID = co.countryID
     WHERE EXISTS (
       SELECT 1 FROM branch br
       JOIN address a ON a.addressID = br.addressID
       WHERE a.cityID = ci.cityID AND br.isActive = 1
     ) OR EXISTS (
       SELECT 1 FROM dropofflocation dl
       JOIN address a ON a.addressID = dl.addressID
       JOIN branch br ON br.branchID = dl.branchID
       WHERE a.cityID = ci.cityID AND dl.isActive = 1 AND br.isActive = 1
     )
     ORDER BY co.countryName ASC`,
  );

  return {
    pickupCountries,
    pickupCities,
    dropoffCountries,
    dropoffCities,
  };
}

export async function getPublicFilterOptions() {
  const [categories] = await pool.query<RowDataPacket[]>(
    `SELECT categoryID, categoryName, depositAmount
     FROM carcategory
     WHERE isActive = 1
     ORDER BY categoryID ASC`,
  );

  const [manufacturers] = await pool.query<RowDataPacket[]>(
    `SELECT DISTINCT m.manufacturerID, m.name AS manufacturerName, m.logoUrl
     FROM manufacturer m
     JOIN brand b ON b.manufacturerID = m.manufacturerID
     JOIN model mo ON mo.brandID = b.brandID
     JOIN car c ON c.modelID = mo.modelID
     WHERE c.status = 'Available'
     ORDER BY m.name ASC`,
  );

  const [brands] = await pool.query<RowDataPacket[]>(
    `SELECT DISTINCT b.brandID, b.brandName, COALESCE(b.logoUrl, m.logoUrl) AS logoUrl, b.manufacturerID
     FROM brand b
     JOIN manufacturer m ON m.manufacturerID = b.manufacturerID
     JOIN model mo ON mo.brandID = b.brandID
     JOIN car c ON c.modelID = mo.modelID
     WHERE c.status = 'Available'
     ORDER BY b.brandName ASC`,
  );

  const [branches] = await pool.query<RowDataPacket[]>(
    `SELECT br.branchID, br.branchName, ci.cityName, co.countryName
     FROM branch br
     JOIN address a ON a.addressID = br.addressID
     JOIN city ci ON ci.cityID = a.cityID
     JOIN country co ON co.countryID = ci.countryID
     WHERE br.isActive = 1
     ORDER BY br.branchName ASC`,
  );

  const [colorRows] = await pool.query<RowDataPacket[]>(
    `SELECT DISTINCT color
     FROM car
     WHERE status = 'Available' AND color IS NOT NULL AND color <> ''
     ORDER BY color ASC`,
  );

  return {
    categories,
    manufacturers,
    brands,
    branches,
    colors: colorRows.map((r) => String(r.color)),
    fuelTypes: ['Gas', 'Diesel', 'Electric', 'Hybrid'] as const,
    transmissions: ['Manual', 'Automatic'] as const,
  };
}

export async function searchPublicCars(query: PublicCarsSearchQuery) {
  let startSql: string | null = null;
  let endSql: string | null = null;

  if (query.startDate && query.endDate) {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestError('Invalid startDate or endDate');
    }
    if (end <= start) {
      throw new BadRequestError('Return date must be after pick-up date');
    }
    startSql = toMysqlDateTime(query.startDate);
    endSql = toMysqlDateTime(query.endDate);
  }

  const conditions: string[] = [`c.status = 'Available'`, `br.isActive = 1`];
  const filterParams: unknown[] = [];

  if (query.pickupCountryID) {
    conditions.push('co.countryID = ?');
    filterParams.push(query.pickupCountryID);
  }
  if (query.pickupCityID) {
    conditions.push('ci.cityID = ?');
    filterParams.push(query.pickupCityID);
  }
  if (query.categoryID) {
    conditions.push('c.categoryID = ?');
    filterParams.push(query.categoryID);
  }
  if (query.manufacturerID) {
    conditions.push('m.manufacturerID = ?');
    filterParams.push(query.manufacturerID);
  }
  if (query.brandID) {
    conditions.push('b.brandID = ?');
    filterParams.push(query.brandID);
  }
  if (query.branchID) {
    conditions.push('c.branchID = ?');
    filterParams.push(query.branchID);
  }
  if (query.fuelType) {
    conditions.push('c.fuelType = ?');
    filterParams.push(query.fuelType);
  }
  if (query.transmission) {
    conditions.push('c.transmission = ?');
    filterParams.push(query.transmission);
  }
  if (query.color) {
    conditions.push('c.color = ?');
    filterParams.push(query.color);
  }
  if (query.maxMileage !== undefined) {
    conditions.push('c.currentMileage <= ?');
    filterParams.push(query.maxMileage);
  }
  if (query.minDailyRate !== undefined) {
    conditions.push('fn_get_daily_rate(c.carID, CURDATE()) >= ?');
    filterParams.push(query.minDailyRate);
  }
  if (query.maxDailyRate !== undefined) {
    conditions.push('fn_get_daily_rate(c.carID, CURDATE()) <= ?');
    filterParams.push(query.maxDailyRate);
  }
  if (query.search) {
    conditions.push('(mo.modelName LIKE ? OR b.brandName LIKE ? OR m.name LIKE ?)');
    const pattern = `%${query.search}%`;
    filterParams.push(pattern, pattern, pattern);
  }

  if (startSql && endSql) {
    if (query.flexDays > 0) {
      conditions.push(
        `(fn_is_car_available(c.carID, ?, ?, NULL) = 1 OR fn_is_car_available(c.carID, DATE_SUB(?, INTERVAL ? DAY), DATE_ADD(?, INTERVAL ? DAY), NULL) = 1)`,
      );
      filterParams.push(startSql, endSql, startSql, query.flexDays, endSql, query.flexDays);
    } else {
      conditions.push(`fn_is_car_available(c.carID, ?, ?, NULL) = 1`);
      filterParams.push(startSql, endSql);
    }
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const offset = (query.page - 1) * query.pageSize;
  const orderBy = SORT_ORDER_MAP[query.sortBy];

  const [countRows] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS total
     FROM car c
     JOIN model mo ON mo.modelID = c.modelID
     JOIN brand b ON b.brandID = mo.brandID
     JOIN manufacturer m ON m.manufacturerID = b.manufacturerID
     JOIN branch br ON br.branchID = c.branchID
     JOIN address a ON a.addressID = br.addressID
     JOIN city ci ON ci.cityID = a.cityID
     JOIN country co ON co.countryID = ci.countryID
     ${whereClause}`,
    filterParams,
  );

  const selectDateCols =
    startSql && endSql
      ? `fn_calculate_price(c.carID, ?, ?) AS periodTotalPrice,
         fn_is_car_available(c.carID, ?, ?, NULL) AS isExactAvailable`
      : `NULL AS periodTotalPrice,
         1 AS isExactAvailable`;

  const selectParams = startSql && endSql ? [startSql, endSql, startSql, endSql] : [];

  const [rows] = await pool.query<PublicCarRow[]>(
    `SELECT c.carID, c.plate, c.color, c.fuelType, c.transmission, c.currentMileage,
            mo.modelID, mo.modelName, b.brandID, b.brandName, b.logoUrl AS brandLogo,
            m.manufacturerID, m.name AS manufacturerName, m.logoUrl AS manufacturerLogo,
            (SELECT i.fileReference FROM carimage i WHERE i.carID = c.carID AND i.isPrimary = 1 LIMIT 1) AS thumbnail,
            cc.categoryID, cc.categoryName, cc.depositAmount,
            br.branchID, br.branchName,
            ci.cityID AS pickupCityID, ci.cityName AS pickupCityName,
            co.countryID AS pickupCountryID, co.countryName AS pickupCountryName,
            fn_get_daily_rate(c.carID, CURDATE()) AS dailyRate,
            ${selectDateCols}
     FROM car c
     JOIN model mo ON mo.modelID = c.modelID
     JOIN brand b ON b.brandID = mo.brandID
     JOIN manufacturer m ON m.manufacturerID = b.manufacturerID
     JOIN carcategory cc ON cc.categoryID = c.categoryID
     JOIN branch br ON br.branchID = c.branchID
     JOIN address a ON a.addressID = br.addressID
     JOIN city ci ON ci.cityID = a.cityID
     JOIN country co ON co.countryID = ci.countryID
     ${whereClause}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...selectParams, ...filterParams, query.pageSize, offset],
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
