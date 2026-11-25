import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool, withTransaction } from '../../db/pool.js';
import { NotFoundError } from '../../errors/AppError.js';
import type { BranchInput, DropoffInput } from './locations.schema.js';

interface CountRow extends RowDataPacket {
  total: number;
}

const BRANCH_SORT: Record<string, string> = {
  branchName: 'br.branchName',
  cityName: 'ci.cityName',
  carCount: 'carCount',
  branchID: 'br.branchID',
};

const DROPOFF_SORT: Record<string, string> = {
  locationName: 'dl.locationName',
  branchName: 'br.branchName',
  dropoffFee: 'dl.dropoffFee',
  locationID: 'dl.locationID',
};

export async function listBranchesAdmin(params: {
  page: number;
  pageSize: number;
  q?: string;
  isActive?: 'true' | 'false';
  sort?: string;
  order: 'asc' | 'desc';
  userBranchId: number | null;
}) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (params.userBranchId !== null) {
    conditions.push('br.branchID = ?');
    values.push(params.userBranchId);
  }
  if (params.isActive !== undefined) {
    conditions.push('br.isActive = ?');
    values.push(params.isActive === 'true' ? 1 : 0);
  }
  if (params.q) {
    conditions.push('(br.branchName LIKE ? OR ci.cityName LIKE ? OR co.countryName LIKE ?)');
    const p = `%${params.q}%`;
    values.push(p, p, p);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortCol = BRANCH_SORT[params.sort ?? ''] ?? 'br.branchName';
  const dir = params.order === 'desc' ? 'DESC' : 'ASC';
  const offset = (params.page - 1) * params.pageSize;

  const [countRows] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS total
     FROM branch br
     JOIN address a ON a.addressID = br.addressID
     JOIN city ci ON ci.cityID = a.cityID
     JOIN country co ON co.countryID = ci.countryID
     ${where}`,
    values,
  );

  const [data] = await pool.query<RowDataPacket[]>(
    `SELECT br.branchID, br.branchName, br.phone, br.isActive, br.addressID,
            a.street, a.number, a.apt, a.zip, ci.cityID, ci.cityName, co.countryID, co.countryName,
            (SELECT COUNT(*) FROM car c WHERE c.branchID = br.branchID) AS carCount
     FROM branch br
     JOIN address a ON a.addressID = br.addressID
     JOIN city ci ON ci.cityID = a.cityID
     JOIN country co ON co.countryID = ci.countryID
     ${where}
     ORDER BY ${sortCol} ${dir}
     LIMIT ? OFFSET ?`,
    [...values, params.pageSize, offset],
  );

  return { data, total: countRows[0]?.total ?? 0, page: params.page, pageSize: params.pageSize };
}

export async function createBranch(userId: number, input: BranchInput) {
  return withTransaction(userId, async (conn) => {
    const [addr] = await conn.query<ResultSetHeader>(
      `INSERT INTO address (street, number, apt, zip, cityID) VALUES (?, ?, ?, ?, ?)`,
      [input.address.street, input.address.number, input.address.apt || null, input.address.zip, input.address.cityID],
    );
    const [br] = await conn.query<ResultSetHeader>(
      `INSERT INTO branch (branchName, addressID, phone, isActive) VALUES (?, ?, ?, ?)`,
      [input.branchName, addr.insertId, input.phone || null, input.isActive ? 1 : 0],
    );
    return { branchID: br.insertId };
  });
}

export async function updateBranch(userId: number, branchID: number, input: BranchInput) {
  return withTransaction(userId, async (conn) => {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT addressID FROM branch WHERE branchID = ? FOR UPDATE`,
      [branchID],
    );
    const existing = rows[0];
    if (!existing) throw new NotFoundError('Branch not found');

    await conn.query(
      `UPDATE address SET street = ?, number = ?, apt = ?, zip = ?, cityID = ? WHERE addressID = ?`,
      [
        input.address.street,
        input.address.number,
        input.address.apt || null,
        input.address.zip,
        input.address.cityID,
        existing.addressID,
      ],
    );

    await conn.query(
      `UPDATE branch SET branchName = ?, phone = ?, isActive = ? WHERE branchID = ?`,
      [input.branchName, input.phone || null, input.isActive ? 1 : 0, branchID],
    );
    return { branchID };
  });
}

export async function setBranchActive(userId: number, branchID: number, isActive: boolean) {
  return withTransaction(userId, async (conn) => {
    const [res] = await conn.query<ResultSetHeader>(
      `UPDATE branch SET isActive = ? WHERE branchID = ?`,
      [isActive ? 1 : 0, branchID],
    );
    if (res.affectedRows === 0) throw new NotFoundError('Branch not found');
  });
}

export async function deleteBranch(userId: number, branchID: number) {
  return withTransaction(userId, async (conn) => {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT addressID FROM branch WHERE branchID = ? FOR UPDATE`,
      [branchID],
    );
    const existing = rows[0];
    if (!existing) throw new NotFoundError('Branch not found');

    await conn.query(`DELETE FROM branch WHERE branchID = ?`, [branchID]);
    await conn.query(`DELETE FROM address WHERE addressID = ?`, [existing.addressID]);
  });
}

export async function listDropoffsAdmin(params: {
  page: number;
  pageSize: number;
  q?: string;
  isActive?: 'true' | 'false';
  branchID?: number;
  sort?: string;
  order: 'asc' | 'desc';
  userBranchId: number | null;
}) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (params.userBranchId !== null) {
    conditions.push('dl.branchID = ?');
    values.push(params.userBranchId);
  } else if (params.branchID) {
    conditions.push('dl.branchID = ?');
    values.push(params.branchID);
  }
  if (params.isActive !== undefined) {
    conditions.push('dl.isActive = ?');
    values.push(params.isActive === 'true' ? 1 : 0);
  }
  if (params.q) {
    conditions.push('(dl.locationName LIKE ? OR br.branchName LIKE ? OR ci.cityName LIKE ?)');
    const p = `%${params.q}%`;
    values.push(p, p, p);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortCol = DROPOFF_SORT[params.sort ?? ''] ?? 'dl.locationName';
  const dir = params.order === 'desc' ? 'DESC' : 'ASC';
  const offset = (params.page - 1) * params.pageSize;

  const [countRows] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS total
     FROM dropofflocation dl
     JOIN branch br ON br.branchID = dl.branchID
     JOIN address a ON a.addressID = dl.addressID
     JOIN city ci ON ci.cityID = a.cityID
     ${where}`,
    values,
  );

  const [data] = await pool.query<RowDataPacket[]>(
    `SELECT dl.locationID, dl.locationName, dl.branchID, br.branchName, dl.dropoffFee, dl.isActive, dl.addressID,
            a.street, a.number, a.apt, a.zip, ci.cityID, ci.cityName, co.countryID, co.countryName
     FROM dropofflocation dl
     JOIN branch br ON br.branchID = dl.branchID
     JOIN address a ON a.addressID = dl.addressID
     JOIN city ci ON ci.cityID = a.cityID
     JOIN country co ON co.countryID = ci.countryID
     ${where}
     ORDER BY ${sortCol} ${dir}
     LIMIT ? OFFSET ?`,
    [...values, params.pageSize, offset],
  );

  return { data, total: countRows[0]?.total ?? 0, page: params.page, pageSize: params.pageSize };
}

export async function createDropoff(userId: number, input: DropoffInput) {
  return withTransaction(userId, async (conn) => {
    const [addr] = await conn.query<ResultSetHeader>(
      `INSERT INTO address (street, number, apt, zip, cityID) VALUES (?, ?, ?, ?, ?)`,
      [input.address.street, input.address.number, input.address.apt || null, input.address.zip, input.address.cityID],
    );
    const [dl] = await conn.query<ResultSetHeader>(
      `INSERT INTO dropofflocation (locationName, addressID, branchID, dropoffFee, isActive) VALUES (?, ?, ?, ?, ?)`,
      [input.locationName, addr.insertId, input.branchID, input.dropoffFee, input.isActive ? 1 : 0],
    );
    return { locationID: dl.insertId };
  });
}

export async function updateDropoff(userId: number, locationID: number, input: DropoffInput) {
  return withTransaction(userId, async (conn) => {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT addressID FROM dropofflocation WHERE locationID = ? FOR UPDATE`,
      [locationID],
    );
    const existing = rows[0];
    if (!existing) throw new NotFoundError('Drop-off location not found');

    await conn.query(
      `UPDATE address SET street = ?, number = ?, apt = ?, zip = ?, cityID = ? WHERE addressID = ?`,
      [
        input.address.street,
        input.address.number,
        input.address.apt || null,
        input.address.zip,
        input.address.cityID,
        existing.addressID,
      ],
    );

    await conn.query(
      `UPDATE dropofflocation SET locationName = ?, branchID = ?, dropoffFee = ?, isActive = ? WHERE locationID = ?`,
      [input.locationName, input.branchID, input.dropoffFee, input.isActive ? 1 : 0, locationID],
    );
    return { locationID };
  });
}

export async function setDropoffActive(userId: number, locationID: number, isActive: boolean) {
  return withTransaction(userId, async (conn) => {
    const [res] = await conn.query<ResultSetHeader>(
      `UPDATE dropofflocation SET isActive = ? WHERE locationID = ?`,
      [isActive ? 1 : 0, locationID],
    );
    if (res.affectedRows === 0) throw new NotFoundError('Drop-off location not found');
  });
}

export async function deleteDropoff(userId: number, locationID: number) {
  return withTransaction(userId, async (conn) => {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT addressID FROM dropofflocation WHERE locationID = ? FOR UPDATE`,
      [locationID],
    );
    const existing = rows[0];
    if (!existing) throw new NotFoundError('Drop-off location not found');

    await conn.query(`DELETE FROM dropofflocation WHERE locationID = ?`, [locationID]);
    await conn.query(`DELETE FROM address WHERE addressID = ?`, [existing.addressID]);
  });
}
