import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { env } from '../../config/env.js';
import { pool, withTransaction } from '../../db/pool.js';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../errors/AppError.js';
import type { AuthClient } from '../../middleware/auth.js';
import type { UpdateProfileInput } from './clientAccount.schema.js';

interface ClientProfileRow extends RowDataPacket {
  clientID: number;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  username: string;
  dateOfBirth: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  addressID: number | null;
  street: string | null;
  number: string | null;
  apt: string | null;
  zip: string | null;
  cityID: number | null;
  cityName: string | null;
  countryID: number | null;
  countryName: string | null;
}

interface SummaryRow extends RowDataPacket {
  totalRentals: number;
  lifetimeSpend: number;
  loyaltyDiscountPercent: number;
}

interface AuthPasswordRow extends RowDataPacket {
  clientID: number;
  name: string;
  surname: string;
  email: string;
  username: string;
  password: string;
  addressID: number | null;
}

function signClientToken(client: AuthClient): string {
  const signOptions: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(client, env.jwt.secret, signOptions);
}

export async function getClientAccountOverview(clientID: number) {
  const [profileRows] = await pool.query<ClientProfileRow[]>(
    `SELECT cl.clientID, cl.name, cl.surname, cl.email, cl.phone, cl.username,
            DATE_FORMAT(cl.dateOfBirth, '%Y-%m-%d') AS dateOfBirth,
            cl.lastLoginAt, cl.createdAt, cl.addressID,
            a.street, a.number, a.apt, a.zip,
            ci.cityID, ci.cityName, co.countryID, co.countryName
     FROM \`client\` cl
     LEFT JOIN address a ON a.addressID = cl.addressID
     LEFT JOIN city ci ON ci.cityID = a.cityID
     LEFT JOIN country co ON co.countryID = ci.countryID
     WHERE cl.clientID = ?
     LIMIT 1`,
    [clientID],
  );

  const profile = profileRows[0];
  if (!profile) {
    throw new NotFoundError('Client account not found');
  }

  const [summaryRows] = await pool.query<SummaryRow[]>(
    `SELECT COALESCE(vs.totalRentals, 0) AS totalRentals,
            COALESCE(vs.lifetimeSpend, 0) AS lifetimeSpend,
            fn_loyalty_percent(?) AS loyaltyDiscountPercent
     FROM view_clientsummary vs
     WHERE vs.clientID = ?
     LIMIT 1`,
    [clientID, clientID],
  );

  const [reservations] = await pool.query<RowDataPacket[]>(
    `SELECT r.reservationID, r.startDate, r.endDate, r.returnedAt, r.status,
            r.totalPrice, r.discountAmount, r.depositAmount,
            c.carID, c.plate, c.fuelType, c.transmission,
            b.brandName, mo.modelName, cc.categoryName,
            pb.branchName AS pickupBranch,
            COALESCE(dl.locationName, pb.branchName) AS dropoffPlace,
            (SELECT i.fileReference FROM carimage i WHERE i.carID = c.carID AND i.isPrimary = 1 LIMIT 1) AS thumbnail,
            vb.totalDue, vb.paid, vb.balance, vb.paymentStatus, vb.depositHeld
     FROM reservation r
     JOIN car c ON c.carID = r.carID
     JOIN model mo ON mo.modelID = c.modelID
     JOIN brand b ON b.brandID = mo.brandID
     JOIN carcategory cc ON cc.categoryID = c.categoryID
     JOIN branch pb ON pb.branchID = r.pickupBranchID
     LEFT JOIN dropofflocation dl ON dl.locationID = r.dropoffLocationID
     LEFT JOIN view_reservationbalance vb ON vb.reservationID = r.reservationID
     WHERE r.clientID = ?
     ORDER BY r.startDate DESC`,
    [clientID],
  );

  const [verifications] = await pool.query<RowDataPacket[]>(
    `SELECT v.verificationID, v.documentType, v.documentID, v.attribute,
            DATE_FORMAT(v.issueDate, '%Y-%m-%d') AS issueDate,
            DATE_FORMAT(v.expiryDate, '%Y-%m-%d') AS expiryDate,
            v.isVerified, v.verifiedAt, co.countryName AS documentCountry
     FROM verification v
     LEFT JOIN country co ON co.countryID = v.documentCountryID
     WHERE v.clientID = ?
     ORDER BY v.verificationID DESC`,
    [clientID],
  );

  const [payments] = await pool.query<RowDataPacket[]>(
    `SELECT p.paymentID, p.receiptNumber, p.reservationID, p.paymentType,
            p.amount, p.currencyCode, p.amountBase, p.method, p.paidAt
     FROM payment p
     JOIN reservation r ON r.reservationID = p.reservationID
     WHERE r.clientID = ?
     ORDER BY p.paidAt DESC`,
    [clientID],
  );

  return {
    profile,
    summary: summaryRows[0] ?? { totalRentals: 0, lifetimeSpend: 0, loyaltyDiscountPercent: 0 },
    reservations,
    verifications,
    payments,
  };
}

export async function updateClientUsername(
  clientID: number,
  newUsername: string,
  currentPassword: string,
): Promise<{ token: string; client: AuthClient }> {
  const [rows] = await pool.query<AuthPasswordRow[]>(
    `SELECT clientID, name, surname, email, username, password
     FROM \`client\`
     WHERE clientID = ?
     LIMIT 1`,
    [clientID],
  );
  const row = rows[0];
  if (!row || !row.password) {
    throw new NotFoundError('Client account not found');
  }

  const valid = await bcrypt.compare(currentPassword, row.password);
  if (!valid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  const [existing] = await pool.query<RowDataPacket[]>(
    `SELECT 1 FROM \`client\` WHERE username = ? AND clientID <> ? LIMIT 1`,
    [newUsername, clientID],
  );
  if (existing.length > 0) {
    throw new ConflictError('Username is already taken');
  }

  await pool.query(`UPDATE \`client\` SET username = ? WHERE clientID = ?`, [newUsername, clientID]);

  const client: AuthClient = {
    tokenType: 'client',
    clientID: row.clientID,
    username: newUsername,
    email: row.email,
    name: row.name,
    surname: row.surname,
  };

  return { token: signClientToken(client), client };
}

export async function changeClientPassword(
  clientID: number,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const [rows] = await pool.query<AuthPasswordRow[]>(
    `SELECT clientID, password FROM \`client\` WHERE clientID = ? LIMIT 1`,
    [clientID],
  );
  const row = rows[0];
  if (!row || !row.password) {
    throw new NotFoundError('Client account not found');
  }

  const valid = await bcrypt.compare(currentPassword, row.password);
  if (!valid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await pool.query(`UPDATE \`client\` SET password = ? WHERE clientID = ?`, [passwordHash, clientID]);
}

export async function updateClientContact(
  clientID: number,
  input: UpdateProfileInput,
): Promise<{ token: string; client: AuthClient }> {
  const [dupEmail] = await pool.query<RowDataPacket[]>(
    `SELECT 1 FROM \`client\` WHERE email = ? AND clientID <> ? LIMIT 1`,
    [input.email, clientID],
  );
  if (dupEmail.length > 0) {
    throw new ConflictError('Email is already registered');
  }

  const [dupPhone] = await pool.query<RowDataPacket[]>(
    `SELECT 1 FROM \`client\` WHERE phone = ? AND clientID <> ? LIMIT 1`,
    [input.phone, clientID],
  );
  if (dupPhone.length > 0) {
    throw new ConflictError('Phone number is already registered');
  }

  const updated = await withTransaction(null, async (conn) => {
    const [rows] = await conn.query<AuthPasswordRow[]>(
      `SELECT clientID, name, surname, username, addressID FROM \`client\` WHERE clientID = ? FOR UPDATE`,
      [clientID],
    );
    const row = rows[0];
    if (!row) {
      throw new NotFoundError('Client account not found');
    }

    let addressID = row.addressID;
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
      const [addrResult] = await conn.query<ResultSetHeader>(
        `INSERT INTO address (street, number, apt, zip, cityID) VALUES (?, ?, ?, ?, ?)`,
        [
          input.address.street,
          input.address.number,
          input.address.apt || null,
          input.address.zip,
          input.address.cityID,
        ],
      );
      addressID = addrResult.insertId;
    }

    await conn.query(
      `UPDATE \`client\` SET email = ?, phone = ?, addressID = ? WHERE clientID = ?`,
      [input.email, input.phone, addressID, clientID],
    );

    return row;
  });

  const client: AuthClient = {
    tokenType: 'client',
    clientID: updated.clientID,
    username: updated.username,
    email: input.email,
    name: updated.name,
    surname: updated.surname,
  };

  return { token: signClientToken(client), client };
}
