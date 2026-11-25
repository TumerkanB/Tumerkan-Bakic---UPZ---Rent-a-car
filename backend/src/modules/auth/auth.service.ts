import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { RowDataPacket } from 'mysql2/promise';
import { APP_CONSTANTS } from '../../config/constants.js';
import { env } from '../../config/env.js';
import { pool } from '../../db/pool.js';
import { ForbiddenError, UnauthorizedError } from '../../errors/AppError.js';
import type { AuthUser } from '../../middleware/auth.js';

interface UserRow extends RowDataPacket {
  userID: number;
  username: string;
  password: string;
  email: string;
  roleID: number;
  roleName: string;
  isActive: number;
  branchID: number | null;
  failedLoginCount: number;
  lockedUntil: Date | null;
}

interface PermissionRow extends RowDataPacket {
  permissionName: string;
}

interface SettingRow extends RowDataPacket {
  settingKey: string;
  settingValue: number;
}

async function getLoginSecuritySettings(): Promise<{ maxFailedLogins: number; lockoutMinutes: number }> {
  const [rows] = await pool.query<SettingRow[]>(
    `SELECT settingKey, settingValue FROM setting WHERE settingKey IN ('max_failed_logins', 'lockout_minutes')`,
  );
  const map = new Map(rows.map((r) => [r.settingKey, Number(r.settingValue)]));
  return {
    maxFailedLogins: map.get('max_failed_logins') ?? APP_CONSTANTS.DEFAULT_MAX_FAILED_LOGINS,
    lockoutMinutes: map.get('lockout_minutes') ?? APP_CONSTANTS.DEFAULT_LOCKOUT_MINUTES,
  };
}

async function getRolePermissions(roleID: number): Promise<string[]> {
  const [rows] = await pool.query<PermissionRow[]>(
    `SELECT permissionName FROM view_rolepermission WHERE roleID = ? ORDER BY permissionName`,
    [roleID],
  );
  return rows.map((r) => r.permissionName);
}

export async function loginUser(username: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const [rows] = await pool.query<UserRow[]>(
    `SELECT u.userID, u.username, u.password, u.email, u.roleID, r.roleName,
            u.isActive, u.branchID, u.failedLoginCount, u.lockedUntil
     FROM \`user\` u
     JOIN \`role\` r ON r.roleID = u.roleID
     WHERE u.username = ?
     LIMIT 1`,
    [username],
  );

  const userRow = rows[0];
  if (!userRow) {
    throw new UnauthorizedError('Invalid username or password');
  }

  if (userRow.isActive !== 1) {
    throw new ForbiddenError('Account is inactive');
  }

  if (userRow.lockedUntil && new Date(userRow.lockedUntil) > new Date()) {
    throw new ForbiddenError('Account is temporarily locked due to failed login attempts');
  }

  const passwordValid = await bcrypt.compare(password, userRow.password);
  if (!passwordValid) {
    const { maxFailedLogins, lockoutMinutes } = await getLoginSecuritySettings();
    const nextCount = userRow.failedLoginCount + 1;
    const shouldLock = nextCount >= maxFailedLogins;

    await pool.query(
      `UPDATE \`user\`
       SET failedLoginCount = ?,
           lastFailedLoginAt = NOW(),
           lockedUntil = IF(?, DATE_ADD(NOW(), INTERVAL ? MINUTE), lockedUntil)
       WHERE userID = ?`,
      [nextCount, shouldLock ? 1 : 0, lockoutMinutes, userRow.userID],
    );

    throw new UnauthorizedError('Invalid username or password');
  }

  await pool.query(
    `UPDATE \`user\`
     SET failedLoginCount = 0, lockedUntil = NULL, lastLoginAt = NOW()
     WHERE userID = ?`,
    [userRow.userID],
  );

  const permissions = await getRolePermissions(userRow.roleID);
  const authUser: AuthUser = {
    userID: userRow.userID,
    username: userRow.username,
    email: userRow.email,
    roleID: userRow.roleID,
    roleName: userRow.roleName,
    branchID: userRow.branchID,
    permissions,
  };

  const signOptions: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'],
  };
  const token = jwt.sign(authUser, env.jwt.secret, signOptions);

  return { token, user: authUser };
}
