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

const DUPLICATE_KEY_FIELDS: Record<string, { field: string; label: string }> = {
  uq_car_plate: { field: 'plate', label: 'Plate number' },
  uq_user_username: { field: 'username', label: 'Username' },
  uq_user_email: { field: 'email', label: 'Email' },
  uq_client_email: { field: 'email', label: 'Email' },
  uq_client_username: { field: 'username', label: 'Username' },
  uq_country_name: { field: 'countryName', label: 'Country name' },
  uq_country_iso: { field: 'isoCode', label: 'ISO code' },
  uq_city_country: { field: 'cityName', label: 'City' },
  uq_branch_name: { field: 'branchName', label: 'Branch name' },
  uq_dropoff_name: { field: 'locationName', label: 'Drop-off location name' },
  uq_manufacturer_name: { field: 'name', label: 'Manufacturer name' },
  uq_brand_name: { field: 'brandName', label: 'Brand name' },
  uq_model_brand: { field: 'modelName', label: 'Model name' },
  uq_category_name: { field: 'categoryName', label: 'Category name' },
  uq_promo_code: { field: 'code', label: 'Promo code' },
  uq_fine_reference: { field: 'referenceNo', label: 'Reference number' },
  uq_carimage_file: { field: 'fileReference', label: 'Image file' },
  uq_verification_doc: { field: 'documentID', label: 'Document ID' },
  uq_role_name: { field: 'roleName', label: 'Role name' },
};

const CHECK_CONSTRAINT_FIELDS: Record<string, { field: string; message: string }> = {
  chk_car_mileage: { field: 'currentMileage', message: 'Mileage cannot be negative' },
  chk_car_nextservice: { field: 'nextServiceMileage', message: 'Next service mileage cannot be negative' },
  chk_client_dob: { field: 'dateOfBirth', message: 'Date of birth must be on or after 1900-01-01' },
  chk_client_email: { field: 'email', message: 'Invalid email format' },
  chk_client_username: { field: 'username', message: 'Username must be at least 3 characters with no spaces' },
  chk_user_email: { field: 'email', message: 'Invalid email format' },
  chk_user_username: { field: 'username', message: 'Username must be at least 3 characters with no spaces' },
  chk_category_deposit: { field: 'depositAmount', message: 'Deposit amount cannot be negative' },
  chk_dropoff_fee: { field: 'dropoffFee', message: 'Drop-off fee cannot be negative' },
  chk_taxrule_rate: { field: 'ratePercent', message: 'Tax rate must be between 0 and 100' },
  chk_currency_rate: { field: 'exchangeRateToBase', message: 'Exchange rate must be greater than 0' },
  chk_cond_fuel: { field: 'fuelPercent', message: 'Fuel percent must be between 0 and 100' },
  chk_cond_mileage: { field: 'mileage', message: 'Mileage cannot be negative' },
  chk_verif_dates: { field: 'expiryDate', message: 'Expiry date must be after issue date' },
};

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

  if (dbErr?.errno === 1062 || dbErr?.code === 'ER_DUP_ENTRY') {
    const keyMatch = /for key '(?:[^.]+\.)?([^']+)'/i.exec(dbErr.sqlMessage || dbErr.message);
    const keyName = keyMatch?.[1] ?? '';
    const mapped = DUPLICATE_KEY_FIELDS[keyName];
    res.status(409).json({
      error: {
        code: 'DUPLICATE_ENTRY',
        field: mapped?.field,
        message: mapped ? `${mapped.label} already exists` : 'A record with the same unique value already exists',
      },
    });
    return;
  }

  if (dbErr?.errno === 1451 || dbErr?.code === 'ER_ROW_IS_REFERENCED_2') {
    res.status(409).json({
      error: {
        code: 'IN_USE',
        message: 'Cannot delete, it is used by other records',
      },
    });
    return;
  }

  if (dbErr?.errno === 1452 || dbErr?.code === 'ER_NO_REFERENCED_ROW_2') {
    res.status(400).json({
      error: {
        code: 'INVALID_REFERENCE',
        message: 'Selected parent record does not exist',
      },
    });
    return;
  }

  if (dbErr?.errno === 3819 || dbErr?.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    const chkMatch = /Check constraint '([^']+)'/i.exec(dbErr.sqlMessage || dbErr.message);
    const chkName = chkMatch?.[1] ?? '';
    const mapped = CHECK_CONSTRAINT_FIELDS[chkName];
    res.status(400).json({
      error: {
        code: 'CHECK_CONSTRAINT_VIOLATED',
        field: mapped?.field,
        message: mapped?.message ?? (dbErr.sqlMessage || 'Value violates a database constraint'),
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
