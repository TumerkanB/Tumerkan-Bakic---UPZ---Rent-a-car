import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),

  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().min(1).default('rentacar'),
  DB_CONNECTION_LIMIT: z.coerce.number().int().min(1).max(100).default(10),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().min(1).default('8h'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;

export const env = Object.freeze({
  nodeEnv: data.NODE_ENV,
  isProduction: data.NODE_ENV === 'production',
  port: data.PORT,
  corsOrigins: Object.freeze(
    data.CORS_ORIGIN.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ),
  db: Object.freeze({
    host: data.DB_HOST,
    port: data.DB_PORT,
    user: data.DB_USER,
    password: data.DB_PASSWORD,
    database: data.DB_NAME,
    connectionLimit: data.DB_CONNECTION_LIMIT,
  }),
  jwt: Object.freeze({
    secret: data.JWT_SECRET,
    expiresIn: data.JWT_EXPIRES_IN,
  }),
});
