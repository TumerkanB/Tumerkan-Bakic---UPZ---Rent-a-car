import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { env } from '../../config/env.js';
import { pool, withTransaction } from '../../db/pool.js';
import { ConflictError, ForbiddenError, UnauthorizedError } from '../../errors/AppError.js';
import type { AuthClient } from '../../middleware/auth.js';
import type { ClientRegisterInput } from './clientAuth.schema.js';

interface ClientRow extends RowDataPacket {
  clientID: number;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  username: string;
  password: string;
}

interface LoginStateRow extends RowDataPacket {
  state: 'UNKNOWN' | 'INACTIVE' | 'LOCKED' | 'OK';
}

function signClientToken(client: AuthClient): string {
  const signOptions: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(client, env.jwt.secret, signOptions);
}

export async function loginClient(
  username: string,
  password: string,
): Promise<{ token: string; client: AuthClient }> {
  const [stateRows] = await pool.query<LoginStateRow[]>(
    `SELECT fn_client_login_state(?) AS state`,
    [username],
  );
  const state = stateRows[0]?.state ?? 'UNKNOWN';

  if (state === 'UNKNOWN') {
    throw new UnauthorizedError('Invalid username or password');
  }
  if (state === 'INACTIVE') {
    throw new ForbiddenError('Client account is inactive');
  }
  if (state === 'LOCKED') {
    throw new ForbiddenError('Account is temporarily locked due to failed login attempts');
  }

  const [rows] = await pool.query<ClientRow[]>(
    `SELECT clientID, name, surname, email, username, password
     FROM \`client\`
     WHERE username = ?
     LIMIT 1`,
    [username],
  );

  const row = rows[0];
  if (!row || !row.password) {
    throw new UnauthorizedError('Invalid username or password');
  }

  const passwordValid = await bcrypt.compare(password, row.password);
  if (!passwordValid) {
    await pool.query(`CALL sp_client_login_failed(?)`, [username]);
    throw new UnauthorizedError('Invalid username or password');
  }

  await pool.query(`CALL sp_client_login_succeeded(?, @out_client_id)`, [username]);

  const client: AuthClient = {
    tokenType: 'client',
    clientID: row.clientID,
    username: row.username,
    email: row.email,
    name: row.name,
    surname: row.surname,
  };

  return { token: signClientToken(client), client };
}

export async function checkClientAvailability(params: {
  email?: string;
  phone?: string;
  username?: string;
}): Promise<{ emailTaken?: boolean; phoneTaken?: boolean; usernameTaken?: boolean }> {
  const result: { emailTaken?: boolean; phoneTaken?: boolean; usernameTaken?: boolean } = {};

  if (params.email) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 1 FROM \`client\` WHERE email = ? LIMIT 1`,
      [params.email],
    );
    result.emailTaken = rows.length > 0;
  }

  if (params.phone) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 1 FROM \`client\` WHERE phone = ? LIMIT 1`,
      [params.phone],
    );
    result.phoneTaken = rows.length > 0;
  }

  if (params.username) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 1 FROM \`client\` WHERE username = ? LIMIT 1`,
      [params.username],
    );
    result.usernameTaken = rows.length > 0;
  }

  return result;
}

export async function registerClient(
  input: ClientRegisterInput,
): Promise<{ token: string; client: AuthClient }> {
  const availability = await checkClientAvailability({
    email: input.email,
    phone: input.phone,
    username: input.username,
  });

  if (availability.emailTaken) {
    throw new ConflictError('Email is already registered');
  }
  if (availability.phoneTaken) {
    throw new ConflictError('Phone number is already registered');
  }
  if (availability.usernameTaken) {
    throw new ConflictError('Username is already taken');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const clientID = await withTransaction(null, async (conn) => {
    const [addrResult] = await conn.query<ResultSetHeader>(
      `INSERT INTO \`address\` (street, number, apt, zip, cityID)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.address.street,
        input.address.number,
        input.address.apt || null,
        input.address.zip,
        input.address.cityID,
      ],
    );

    const [clientResult] = await conn.query<ResultSetHeader>(
      `INSERT INTO \`client\` (name, surname, email, phone, addressID, dateOfBirth, username, password, lastLoginAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        input.name,
        input.surname,
        input.email,
        input.phone,
        addrResult.insertId,
        input.dateOfBirth,
        input.username,
        passwordHash,
      ],
    );

    return clientResult.insertId;
  });

  const client: AuthClient = {
    tokenType: 'client',
    clientID,
    username: input.username,
    email: input.email,
    name: input.name,
    surname: input.surname,
  };

  return { token: signClientToken(client), client };
}
