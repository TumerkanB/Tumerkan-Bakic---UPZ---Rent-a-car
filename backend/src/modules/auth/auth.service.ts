import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { RowDataPacket } from 'mysql2/promise';
import { env } from '../../config/env.js';
import { pool } from '../../db/pool.js';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../../errors/AppError.js';
import type { AuthUser } from '../../middleware/auth.js';

interface UserRow extends RowDataPacket {
  userID: number;
  username: string;
  password: string;
  email: string;
  roleID: number;
  roleName: string;
  branchID: number | null;
  branchName: string | null;
  lockedUntil: Date | null;
}

interface LoginStateRow extends RowDataPacket {
  state: 'UNKNOWN' | 'INACTIVE' | 'LOCKED' | 'OK';
}

interface PermissionRow extends RowDataPacket {
  permissionName: string;
}

function signStaffToken(user: AuthUser): string {
  const signOptions: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(user, env.jwt.secret, signOptions);
}

async function getRolePermissions(roleID: number): Promise<string[]> {
  const [rows] = await pool.query<PermissionRow[]>(
    `SELECT permissionName FROM view_rolepermission WHERE roleID = ? ORDER BY permissionName`,
    [roleID],
  );
  return rows.map((r) => r.permissionName);
}

export async function loginUser(username: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const [stateRows] = await pool.query<LoginStateRow[]>(`SELECT fn_login_state(?) AS state`, [username]);
  const state = stateRows[0]?.state ?? 'UNKNOWN';

  if (state === 'UNKNOWN') {
    throw new UnauthorizedError('Invalid username or password');
  }
  if (state === 'INACTIVE') {
    throw new ForbiddenError('Account is inactive');
  }
  if (state === 'LOCKED') {
    const [lockRows] = await pool.query<RowDataPacket[]>(
      `SELECT lockedUntil FROM \`user\` WHERE username = ? LIMIT 1`,
      [username],
    );
    const lockedUntil = lockRows[0]?.lockedUntil ? new Date(lockRows[0].lockedUntil as string).toLocaleString() : 'shortly';
    throw new ForbiddenError(`Account is locked until ${lockedUntil}`);
  }

  const [rows] = await pool.query<UserRow[]>(
    `SELECT u.userID, u.username, u.password, u.email, u.roleID, r.roleName,
            u.branchID, br.branchName
     FROM \`user\` u
     JOIN \`role\` r ON r.roleID = u.roleID
     LEFT JOIN branch br ON br.branchID = u.branchID
     WHERE u.username = ?
     LIMIT 1`,
    [username],
  );

  const userRow = rows[0];
  if (!userRow) {
    throw new UnauthorizedError('Invalid username or password');
  }

  const passwordValid = await bcrypt.compare(password, userRow.password);
  if (!passwordValid) {
    await pool.query(`CALL sp_login_failed(?)`, [username]);
    throw new UnauthorizedError('Invalid username or password');
  }

  await pool.query(`CALL sp_login_succeeded(?, @out_user_id)`, [username]);

  const permissions = await getRolePermissions(userRow.roleID);
  const mustChangePassword = userRow.username === 'admin' && password === 'admin123';

  const authUser: AuthUser = {
    tokenType: 'staff',
    userID: userRow.userID,
    username: userRow.username,
    email: userRow.email,
    roleID: userRow.roleID,
    roleName: userRow.roleName,
    branchID: userRow.branchID,
    branchName: userRow.branchName,
    permissions,
    mustChangePassword,
  };

  return { token: signStaffToken(authUser), user: authUser };
}

export async function changeStaffPassword(
  userID: number,
  currentPassword: string,
  newPassword: string,
): Promise<{ token: string; user: AuthUser }> {
  const [rows] = await pool.query<UserRow[]>(
    `SELECT u.userID, u.username, u.password, u.email, u.roleID, r.roleName,
            u.branchID, br.branchName
     FROM \`user\` u
     JOIN \`role\` r ON r.roleID = u.roleID
     LEFT JOIN branch br ON br.branchID = u.branchID
     WHERE u.userID = ?
     LIMIT 1`,
    [userID],
  );
  const userRow = rows[0];
  if (!userRow) {
    throw new NotFoundError('User not found');
  }

  const valid = await bcrypt.compare(currentPassword, userRow.password);
  if (!valid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await pool.query(`UPDATE \`user\` SET password = ? WHERE userID = ?`, [hash, userID]);

  const permissions = await getRolePermissions(userRow.roleID);
  const authUser: AuthUser = {
    tokenType: 'staff',
    userID: userRow.userID,
    username: userRow.username,
    email: userRow.email,
    roleID: userRow.roleID,
    roleName: userRow.roleName,
    branchID: userRow.branchID,
    branchName: userRow.branchName,
    permissions,
    mustChangePassword: false,
  };

  return { token: signStaffToken(authUser), user: authUser };
}
