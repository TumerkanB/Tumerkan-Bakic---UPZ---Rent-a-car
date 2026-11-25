import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { env } from '../../config/env.js';
import { pool } from '../../db/pool.js';
import { ForbiddenError, UnauthorizedError } from '../../errors/AppError.js';
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

export async function registerClient(
  input: ClientRegisterInput,
): Promise<{ token: string; client: AuthClient }> {
  const passwordHash = await bcrypt.hash(input.password, 12);

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO \`client\` (name, surname, email, phone, dateOfBirth, username, password)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name,
      input.surname,
      input.email,
      input.phone ?? null,
      input.dateOfBirth ?? null,
      input.username,
      passwordHash,
    ],
  );

  const client: AuthClient = {
    tokenType: 'client',
    clientID: result.insertId,
    username: input.username,
    email: input.email,
    name: input.name,
    surname: input.surname,
  };

  return { token: signClientToken(client), client };
}
