import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../errors/AppError.js';

interface MySqlError extends Error {
  code?: string;
  errno?: number;
  sqlState?: string;
  sqlMessage?: string;
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.flatten(),
      },
    });
    return;
  }

  const dbErr = err as MySqlError;
  if (dbErr?.sqlState === '45000') {
    res.status(400).json({
      error: {
        code: 'BUSINESS_RULE_VIOLATION',
        message: dbErr.sqlMessage || dbErr.message,
      },
    });
    return;
  }

  if (dbErr?.code === 'ER_DUP_ENTRY') {
    res.status(409).json({
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'A record with the same unique value already exists',
      },
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: env.isProduction ? 'An unexpected error occurred' : (err as Error)?.message || 'Internal error',
    },
  });
}
