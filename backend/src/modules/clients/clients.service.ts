import bcrypt from 'bcryptjs';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool, withDbSession, withTransaction } from '../../db/pool.js';
import { NotFoundError } from '../../errors/AppError.js';
import type { ClientBodyInput, ListClientsQuery, VerificationBodyInput } from './clients.schema.js';

interface CountRow extends RowDataPacket {
  total: number;
}

const CLIENT_SORT_COLS: Record<string, string> = {
  name: 'cl.name',
  email: 'cl.email',
  username: 'cl.username',
  cityName: 'ci.cityName',
  totalRentals: 'totalRentals',
  lastLoginAt: 'cl.lastLoginAt',
  clientID: 'cl.clientID',
};

export async function listClients(query: ListClientsQuery) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (query.isActive !== undefined) {
    conditions.push('cl.isActive = ?');
    params.push(query.isActive === 'true' ? 1 : 0);
  }
  if (query.locked === 'true') {
    conditions.push('cl.lockedUntil IS NOT NULL AND cl.lockedUntil > NOW()');
  } else if (query.locked === 'false') {
    conditions.push('(cl.lockedUntil IS NULL OR cl.lockedUntil <= NOW())');
  }
  if (query.verifiedLicence === 'true') {
    conditions.push(
      `EXISTS (SELECT 1 FROM verification v WHERE v.clientID = cl.clientID AND v.documentType = 'DrivingLicence' AND v.isVerified = 1 AND (v.expiryDate IS NULL OR v.expiryDate >= CURDATE()))`,
    );
  } else if (query.verifiedLicence === 'false') {
    conditions.push(
      `NOT EXISTS (SELECT 1 FROM verification v WHERE v.clientID = cl.clientID AND v.documentType = 'DrivingLicence' AND v.isVerified = 1 AND (v.expiryDate IS NULL OR v.expiryDate >= CURDATE()))`,
    );
  }
  if (query.q) {
    conditions.push(
      `(CONCAT(cl.name, ' ', cl.surname) LIKE ? OR cl.email LIKE ? OR cl.username LIKE ? OR cl.phone LIKE ?)`,
    );
    const p = `%${query.q}%`;
    params.push(p, p, p, p);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortCol = CLIENT_SORT_COLS[query.sort ?? ''] ?? 'cl.clientID';
  const dir = query.order === 'asc' ? 'ASC' : 'DESC';
  const offset = (query.page - 1) * query.pageSize;

  const [countRows] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS total FROM \`client\` cl ${where}`,
    params,
  );

  const [data] = await pool.query<RowDataPacket[]>(
    `SELECT cl.clientID, cl.name, cl.surname, cl.email, cl.username, cl.phone,
            cl.isActive, DATE_FORMAT(cl.dateOfBirth, '%Y-%m-%d') AS dateOfBirth,
            cl.lastLoginAt, cl.failedLoginCount, cl.lockedUntil,
            ci.cityName, co.countryName,
            COALESCE(vs.totalRentals, 0) AS totalRentals,
            COALESCE(vs.lifetimeSpend, 0) AS lifetimeSpend
     FROM \`client\` cl
     LEFT JOIN address a ON a.addressID = cl.addressID
     LEFT JOIN city ci ON ci.cityID = a.cityID
     LEFT JOIN country co ON co.countryID = ci.countryID
     LEFT JOIN view_clientsummary vs ON vs.clientID = cl.clientID
     ${where}
     ORDER BY ${sortCol} ${dir}
     LIMIT ? OFFSET ?`,
    [...params, query.pageSize, offset],
  );

  return { data, total: countRows[0]?.total ?? 0, page: query.page, pageSize: query.pageSize };
}

export async function getClientWorkspace(clientID: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT cl.clientID, cl.name, cl.surname, cl.email, cl.username, cl.phone,
            cl.isActive, DATE_FORMAT(cl.dateOfBirth, '%Y-%m-%d') AS dateOfBirth,
            cl.lastLoginAt, cl.failedLoginCount, cl.lockedUntil, cl.createdAt, cl.addressID,
            a.street, a.number, a.apt, a.zip, ci.cityID, ci.cityName, co.countryID, co.countryName,
            COALESCE(vs.totalRentals, 0) AS totalRentals,
            COALESCE(vs.lifetimeSpend, 0) AS lifetimeSpend,
            fn_loyalty_percent(cl.clientID) AS loyaltyDiscountPercent
     FROM \`client\` cl
     LEFT JOIN address a ON a.addressID = cl.addressID
     LEFT JOIN city ci ON ci.cityID = a.cityID
     LEFT JOIN country co ON co.countryID = ci.countryID
     LEFT JOIN view_clientsummary vs ON vs.clientID = cl.clientID
     WHERE cl.clientID = ?
     LIMIT 1`,
    [clientID],
  );

  const client = rows[0];
  if (!client) throw new NotFoundError(`Client #${clientID} not found`);

  const [verifications] = await pool.query<RowDataPacket[]>(
    `SELECT v.verificationID, v.clientID, v.documentID, v.documentCountryID, co.countryName AS documentCountry,
            v.documentType, v.attribute,
            DATE_FORMAT(v.issueDate, '%Y-%m-%d') AS issueDate,
            DATE_FORMAT(v.expiryDate, '%Y-%m-%d') AS expiryDate,
            v.isVerified, v.verifiedAt, u.username AS verifiedBy
     FROM verification v
     LEFT JOIN country co ON co.countryID = v.documentCountryID
     LEFT JOIN \`user\` u ON u.userID = v.verifiedByUserID
     WHERE v.clientID = ?
     ORDER BY v.verificationID DESC`,
    [clientID],
  );

  const [reservations] = await pool.query<RowDataPacket[]>(
    `SELECT r.reservationID, r.startDate, r.endDate, r.status, c.plate, b.brandName, mo.modelName,
            vb.totalDue, vb.paid, vb.balance, vb.paymentStatus
     FROM reservation r
     JOIN car c ON c.carID = r.carID
     JOIN model mo ON mo.modelID = c.modelID
     JOIN brand b ON b.brandID = mo.brandID
     LEFT JOIN view_reservationbalance vb ON vb.reservationID = r.reservationID
     WHERE r.clientID = ?
     ORDER BY r.startDate DESC`,
    [clientID],
  );

  const [payments] = await pool.query<RowDataPacket[]>(
    `SELECT p.paymentID, p.receiptNumber, p.reservationID, p.paymentType, p.amount, p.currencyCode, p.method, p.paidAt
     FROM payment p
     JOIN reservation r ON r.reservationID = p.reservationID
     WHERE r.clientID = ?
     ORDER BY p.paidAt DESC`,
    [clientID],
  );

  const [invoices] = await pool.query<RowDataPacket[]>(
    `SELECT i.invoiceID, i.invoiceNumber, i.invoiceType, i.status, i.reservationID, i.total, i.currencyCode, i.issuedAt
     FROM invoice i
     JOIN reservation r ON r.reservationID = i.reservationID
     WHERE r.clientID = ?
     ORDER BY i.issuedAt DESC`,
    [clientID],
  );

  return { client, verifications, reservations, payments, invoices };
}

export async function createClientAdmin(userId: number, input: ClientBodyInput) {
  return withTransaction(userId, async (conn) => {
    let addressID: number | null = null;
    if (input.address && input.address.cityID > 0) {
      const [addr] = await conn.query<ResultSetHeader>(
        `INSERT INTO address (street, number, apt, zip, cityID) VALUES (?, ?, ?, ?, ?)`,
        [input.address.street, input.address.number, input.address.apt || null, input.address.zip, input.address.cityID],
      );
      addressID = addr.insertId;
    }

    const [res] = await conn.query<ResultSetHeader>(
      `INSERT INTO \`client\` (name, surname, email, phone, addressID, isActive, dateOfBirth)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.name,
        input.surname,
        input.email,
        input.phone || null,
        addressID,
        input.isActive ? 1 : 0,
        input.dateOfBirth || null,
      ],
    );
    return { clientID: res.insertId };
  });
}

export async function updateClientAdmin(userId: number, clientID: number, input: ClientBodyInput) {
  return withTransaction(userId, async (conn) => {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT addressID FROM \`client\` WHERE clientID = ? FOR UPDATE`,
      [clientID],
    );
    const existing = rows[0];
    if (!existing) throw new NotFoundError('Client not found');

    let addressID = existing.addressID as number | null;
    if (input.address && input.address.cityID > 0) {
      if (addressID) {
        await conn.query(
          `UPDATE address SET street = ?, number = ?, apt = ?, zip = ?, cityID = ? WHERE addressID = ?`,
          [
            input.address.street,
            input.address.number,
            input.address.apt || null,
            input.address.zip,
            input.address.cityID,
            addressID,
          ],
        );
      } else {
        const [addr] = await conn.query<ResultSetHeader>(
          `INSERT INTO address (street, number, apt, zip, cityID) VALUES (?, ?, ?, ?, ?)`,
          [
            input.address.street,
            input.address.number,
            input.address.apt || null,
            input.address.zip,
            input.address.cityID,
          ],
        );
        addressID = addr.insertId;
      }
    }

    await conn.query(
      `UPDATE \`client\` SET name = ?, surname = ?, email = ?, phone = ?, addressID = ?, isActive = ?, dateOfBirth = ?
       WHERE clientID = ?`,
      [
        input.name,
        input.surname,
        input.email,
        input.phone || null,
        addressID,
        input.isActive ? 1 : 0,
        input.dateOfBirth || null,
        clientID,
      ],
    );
  });
}

export async function setClientCredentials(
  userId: number,
  clientID: number,
  username: string,
  password: string,
) {
  const hash = await bcrypt.hash(password, 12);
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_client_set_credentials(?, ?, ?)`, [clientID, username, hash]);
  });
}

export async function unlockClientAccount(userId: number, clientID: number) {
  await withDbSession(userId, async (conn) => {
    const [res] = await conn.query<ResultSetHeader>(
      `UPDATE \`client\` SET failedLoginCount = 0, lockedUntil = NULL WHERE clientID = ?`,
      [clientID],
    );
    if (res.affectedRows === 0) throw new NotFoundError('Client not found');
  });
}

export async function deleteClientAdmin(userId: number, clientID: number) {
  await withDbSession(userId, async (conn) => {
    const [res] = await conn.query<ResultSetHeader>(`DELETE FROM \`client\` WHERE clientID = ?`, [clientID]);
    if (res.affectedRows === 0) throw new NotFoundError('Client not found');
  });
}

// Verifications
export async function addVerification(userId: number, clientID: number, input: VerificationBodyInput) {
  await withDbSession(userId, async (conn) => {
    await conn.query(
      `INSERT INTO verification (clientID, documentID, documentCountryID, documentType, attribute, issueDate, expiryDate, isVerified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clientID,
        input.documentID,
        input.documentCountryID,
        input.documentType,
        input.attribute || null,
        input.issueDate || null,
        input.expiryDate || null,
        input.isVerified ? 1 : 0,
      ],
    );
  });
}

export async function updateVerification(
  userId: number,
  verificationID: number,
  input: VerificationBodyInput,
) {
  await withDbSession(userId, async (conn) => {
    const [res] = await conn.query<ResultSetHeader>(
      `UPDATE verification
       SET documentID = ?, documentCountryID = ?, documentType = ?, attribute = ?,
           issueDate = ?, expiryDate = ?, isVerified = ?
       WHERE verificationID = ?`,
      [
        input.documentID,
        input.documentCountryID,
        input.documentType,
        input.attribute || null,
        input.issueDate || null,
        input.expiryDate || null,
        input.isVerified ? 1 : 0,
        verificationID,
      ],
    );
    if (res.affectedRows === 0) throw new NotFoundError('Verification document not found');
  });
}

export async function deleteVerification(userId: number, verificationID: number) {
  await withDbSession(userId, async (conn) => {
    const [res] = await conn.query<ResultSetHeader>(
      `DELETE FROM verification WHERE verificationID = ?`,
      [verificationID],
    );
    if (res.affectedRows === 0) throw new NotFoundError('Verification document not found');
  });
}

export async function listUnverifiedDocuments() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT v.verificationID, v.clientID, CONCAT(cl.name, ' ', cl.surname) AS clientName, cl.email,
            v.documentType, v.documentID, co.countryName AS documentCountry, v.attribute,
            DATE_FORMAT(v.issueDate, '%Y-%m-%d') AS issueDate,
            DATE_FORMAT(v.expiryDate, '%Y-%m-%d') AS expiryDate
     FROM verification v
     JOIN \`client\` cl ON cl.clientID = v.clientID
     LEFT JOIN country co ON co.countryID = v.documentCountryID
     WHERE v.isVerified = 0
     ORDER BY v.verificationID ASC`,
  );
  return rows;
}

export async function approveVerification(userId: number, verificationID: number) {
  await withDbSession(userId, async (conn) => {
    const [res] = await conn.query<ResultSetHeader>(
      `UPDATE verification SET isVerified = 1 WHERE verificationID = ?`,
      [verificationID],
    );
    if (res.affectedRows === 0) throw new NotFoundError('Document not found');
  });
}

export async function rejectVerification(userId: number, verificationID: number, reason: string) {
  await withDbSession(userId, async (conn) => {
    const [res] = await conn.query<ResultSetHeader>(
      `UPDATE verification SET isVerified = 0, attribute = ? WHERE verificationID = ?`,
      [reason.slice(0, 100), verificationID],
    );
    if (res.affectedRows === 0) throw new NotFoundError('Document not found');
  });
}
