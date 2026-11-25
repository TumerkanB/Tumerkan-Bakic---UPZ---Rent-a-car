import { z } from 'zod';
import { APP_CONSTANTS } from '../../config/constants.js';

export const listCarsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(APP_CONSTANTS.DEFAULT_PAGE),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(APP_CONSTANTS.MAX_PAGE_SIZE)
    .default(APP_CONSTANTS.DEFAULT_PAGE_SIZE),
  status: z.enum(['Available', 'Maintenance', 'Inactive']).optional(),
  branchID: z.coerce.number().int().positive().optional(),
  categoryID: z.coerce.number().int().positive().optional(),
  search: z.string().trim().max(100).optional(),
});

export const carIdParamsSchema = z.object({
  carID: z.coerce.number().int().positive(),
});

export const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const carImageParamsSchema = z.object({
  carID: z.coerce.number().int().positive(),
  imageID: z.coerce.number().int().positive(),
});

export const manufacturerBodySchema = z.object({
  name: z.string().trim().min(1, 'Manufacturer name is required').max(100),
  logoUrl: z.string().trim().max(500).nullable().optional(),
});

export const brandBodySchema = z.object({
  brandName: z.string().trim().min(1, 'Brand name is required').max(100),
  manufacturerID: z.coerce.number().int().positive(),
  logoUrl: z.string().trim().max(500).nullable().optional(),
});

export const modelBodySchema = z.object({
  modelName: z.string().trim().min(1, 'Model name is required').max(100),
  brandID: z.coerce.number().int().positive(),
});

export const createCarBodySchema = z.object({
  modelID: z.coerce.number().int().positive(),
  categoryID: z.coerce.number().int().positive(),
  branchID: z.coerce.number().int().positive(),
  plate: z.string().trim().min(1, 'Plate is required').max(20),
  color: z.string().trim().max(50).nullable().optional(),
  fuelType: z.enum(['Gas', 'Diesel', 'Electric', 'Hybrid']),
  transmission: z.enum(['Manual', 'Automatic']).default('Manual'),
  status: z.enum(['Available', 'Maintenance', 'Inactive']).default('Available'),
  currentMileage: z.coerce.number().int().min(0).default(0),
  insuranceExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  registrationExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  inspectionExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  nextServiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  nextServiceMileage: z.coerce.number().int().min(0).nullable().optional(),
  initialImageUrl: z.string().trim().max(500).nullable().optional(),
});

export const updateCarBodySchema = z.object({
  modelID: z.coerce.number().int().positive().optional(),
  categoryID: z.coerce.number().int().positive().optional(),
  branchID: z.coerce.number().int().positive().optional(),
  plate: z.string().trim().min(1).max(20).optional(),
  color: z.string().trim().max(50).nullable().optional(),
  fuelType: z.enum(['Gas', 'Diesel', 'Electric', 'Hybrid']).optional(),
  transmission: z.enum(['Manual', 'Automatic']).optional(),
  status: z.enum(['Available', 'Maintenance', 'Inactive']).optional(),
  currentMileage: z.coerce.number().int().min(0).optional(),
  insuranceExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  registrationExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  inspectionExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  nextServiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  nextServiceMileage: z.coerce.number().int().min(0).nullable().optional(),
});

export const addCarImageSchema = z.object({
  fileReference: z.string().trim().min(1, 'Image URL/path is required').max(500),
  caption: z.string().trim().max(255).nullable().optional(),
  makePrimary: z.boolean().default(false),
});

export type ListCarsQuery = z.infer<typeof listCarsQuerySchema>;
export type CreateCarInput = z.infer<typeof createCarBodySchema>;
export type UpdateCarInput = z.infer<typeof updateCarBodySchema>;
