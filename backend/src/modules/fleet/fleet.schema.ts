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
  brandID: z.coerce.number().int().positive().optional(),
  fuelType: z.enum(['Gas', 'Diesel', 'Electric', 'Hybrid']).optional(),
  transmission: z.enum(['Manual', 'Automatic']).optional(),
  expiringSoon: z.enum(['true', 'false']).optional(),
  sort: z.string().trim().max(50).optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
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

export const bulkModelsBodySchema = z.object({
  items: z
    .array(
      z.object({
        modelName: z.string().trim().min(1).max(100),
        brandName: z.string().trim().min(1).max(100),
      }),
    )
    .min(1, 'At least one model row is required')
    .max(500),
});

export const categoryBodySchema = z.object({
  categoryName: z.string().trim().min(1, 'Category name is required').max(50),
  description: z.string().trim().max(255).nullable().optional(),
  depositAmount: z.coerce.number().min(0, 'Deposit cannot be negative').default(0),
  isActive: z.boolean().default(true),
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

export const reorderImagesSchema = z.object({
  imageIDs: z.array(z.coerce.number().int().positive()).min(1),
});

export const setCarPriceSchema = z.object({
  dailyRate: z.coerce.number().positive('Daily rate must be greater than 0'),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

export const maintenanceBodySchema = z.object({
  serviceType: z.enum(['Service', 'Repair', 'Tyres', 'Inspection', 'Other']),
  serviceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  mileage: z.coerce.number().int().min(0),
  cost: z.coerce.number().min(0).default(0),
  description: z.string().trim().max(2000).nullable().optional(),
  performedBy: z.string().trim().max(100).nullable().optional(),
  nextDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  nextDueMileage: z.coerce.number().int().min(0).nullable().optional(),
});

export const reportDamageSchema = z.object({
  reservationID: z.coerce.number().int().positive().nullable().optional(),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  repairCost: z.coerce.number().min(0).nullable().optional(),
});

export const markRepairedSchema = z.object({
  repairCost: z.coerce.number().min(0),
});

export type ListCarsQuery = z.infer<typeof listCarsQuerySchema>;
export type CreateCarInput = z.infer<typeof createCarBodySchema>;
export type UpdateCarInput = z.infer<typeof updateCarBodySchema>;
