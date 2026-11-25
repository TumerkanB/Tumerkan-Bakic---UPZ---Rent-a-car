import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../../db/pool.js';
import { NotFoundError } from '../../errors/AppError.js';

interface CountRow extends RowDataPacket {
  total: number;
}

const COUNTRY_SORT_COLS: Record<string, string> = {
  countryName: 'countryName',
  isoCode: 'isoCode',
  phoneCode: 'phoneCode',
  countryID: 'countryID',
};

const CITY_SORT_COLS: Record<string, string> = {
  cityName: 'ci.cityName',
  countryName: 'co.countryName',
  cityID: 'ci.cityID',
};

export async function listCountries(params: {
  page: number;
  pageSize: number;
  q?: string;
  sort?: string;
  order: 'asc' | 'desc';
}) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (params.q) {
    conditions.push('(countryName LIKE ? OR isoCode LIKE ? OR phoneCode LIKE ?)');
    const pattern = `%${params.q}%`;
    values.push(pattern, pattern, pattern);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortCol = COUNTRY_SORT_COLS[params.sort ?? ''] ?? 'countryName';
  const dir = params.order === 'desc' ? 'DESC' : 'ASC';
  const offset = (params.page - 1) * params.pageSize;

  const [countRows] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS total FROM country ${where}`,
    values,
  );
  const [data] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM country ${where} ORDER BY ${sortCol} ${dir} LIMIT ? OFFSET ?`,
    [...values, params.pageSize, offset],
  );

  return {
    data,
    total: countRows[0]?.total ?? 0,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function getAllCountries() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM country ORDER BY countryName ASC`,
  );
  return rows;
}

export async function createCountry(input: {
  countryName: string;
  isoCode?: string | null;
  phoneCode?: string | null;
  flagUrl?: string | null;
}) {
  const [res] = await pool.query<ResultSetHeader>(
    `INSERT INTO country (countryName, isoCode, phoneCode, flagUrl) VALUES (?, ?, ?, ?)`,
    [input.countryName, input.isoCode || null, input.phoneCode || null, input.flagUrl || null],
  );
  return { countryID: res.insertId, ...input };
}

export async function updateCountry(
  id: number,
  input: {
    countryName: string;
    isoCode?: string | null;
    phoneCode?: string | null;
    flagUrl?: string | null;
  },
) {
  const [res] = await pool.query<ResultSetHeader>(
    `UPDATE country SET countryName = ?, isoCode = ?, phoneCode = ?, flagUrl = ? WHERE countryID = ?`,
    [input.countryName, input.isoCode || null, input.phoneCode || null, input.flagUrl || null, id],
  );
  if (res.affectedRows === 0) throw new NotFoundError('Country not found');
  return { countryID: id, ...input };
}

export async function deleteCountry(id: number) {
  const [res] = await pool.query<ResultSetHeader>(`DELETE FROM country WHERE countryID = ?`, [id]);
  if (res.affectedRows === 0) throw new NotFoundError('Country not found');
}

export async function listCities(params: {
  page: number;
  pageSize: number;
  q?: string;
  countryID?: number;
  sort?: string;
  order: 'asc' | 'desc';
}) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (params.countryID) {
    conditions.push('ci.countryID = ?');
    values.push(params.countryID);
  }
  if (params.q) {
    conditions.push('(ci.cityName LIKE ? OR co.countryName LIKE ?)');
    const pattern = `%${params.q}%`;
    values.push(pattern, pattern);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortCol = CITY_SORT_COLS[params.sort ?? ''] ?? 'ci.cityName';
  const dir = params.order === 'desc' ? 'DESC' : 'ASC';
  const offset = (params.page - 1) * params.pageSize;

  const [countRows] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS total FROM city ci JOIN country co ON co.countryID = ci.countryID ${where}`,
    values,
  );
  const [data] = await pool.query<RowDataPacket[]>(
    `SELECT ci.cityID, ci.cityName, ci.countryID, co.countryName
     FROM city ci
     JOIN country co ON co.countryID = ci.countryID
     ${where}
     ORDER BY ${sortCol} ${dir}
     LIMIT ? OFFSET ?`,
    [...values, params.pageSize, offset],
  );

  return {
    data,
    total: countRows[0]?.total ?? 0,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function getAllCities() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ci.cityID, ci.cityName, ci.countryID, co.countryName
     FROM city ci
     JOIN country co ON co.countryID = ci.countryID
     ORDER BY ci.cityName ASC`,
  );
  return rows;
}

export async function createCity(cityName: string, countryID: number) {
  const [res] = await pool.query<ResultSetHeader>(
    `INSERT INTO city (cityName, countryID) VALUES (?, ?)`,
    [cityName, countryID],
  );
  return { cityID: res.insertId, cityName, countryID };
}

export async function updateCity(id: number, cityName: string, countryID: number) {
  const [res] = await pool.query<ResultSetHeader>(
    `UPDATE city SET cityName = ?, countryID = ? WHERE cityID = ?`,
    [cityName, countryID, id],
  );
  if (res.affectedRows === 0) throw new NotFoundError('City not found');
  return { cityID: id, cityName, countryID };
}

export async function deleteCity(id: number) {
  const [res] = await pool.query<ResultSetHeader>(`DELETE FROM city WHERE cityID = ?`, [id]);
  if (res.affectedRows === 0) throw new NotFoundError('City not found');
}
