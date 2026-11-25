import mysql, { type PoolConnection } from 'mysql2/promise';
import { env } from '../config/env.js';

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  connectionLimit: env.db.connectionLimit,
  waitForConnections: true,
  queueLimit: 0,
  namedPlaceholders: false,
  decimalNumbers: true,
});

/**
 * Acquires a connection from the pool, sets `@app_user_id` for DB triggers and
 * audit logs, executes the callback, and always releases the connection.
 */
export async function withDbSession<T>(
  userId: number | null,
  fn: (conn: PoolConnection) => Promise<T>,
): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.query('SET @app_user_id = ?', [userId]);
    return await fn(conn);
  } finally {
    await conn.query('SET @app_user_id = NULL').catch(() => undefined);
    conn.release();
  }
}

/**
 * Executes a callback inside a MySQL transaction with `@app_user_id` set.
 */
export async function withTransaction<T>(
  userId: number | null,
  fn: (conn: PoolConnection) => Promise<T>,
): Promise<T> {
  return withDbSession(userId, async (conn) => {
    await conn.beginTransaction();
    try {
      const result = await fn(conn);
      await conn.commit();
      return result;
    } catch (error) {
      await conn.rollback();
      throw error;
    }
  });
}

export async function checkDbHealth(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = performance.now();
  await pool.query('SELECT 1');
  return {
    ok: true,
    latencyMs: Math.round((performance.now() - start) * 100) / 100,
  };
}
