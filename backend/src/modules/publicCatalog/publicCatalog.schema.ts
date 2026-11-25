import { z } from 'zod';
import { APP_CONSTANTS } from '../../config/constants.js';

export const publicCarsSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(APP_CONSTANTS.DEFAULT_PAGE),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(APP_CONSTANTS.MAX_PAGE_SIZE)
    .default(APP_CONSTANTS.DEFAULT_PAGE_SIZE),
  pickupCountryID: z.coerce.number().int().positive().optional(),
  pickupCityID: z.coerce.number().int().positive().optional(),
  dropoffCountryID: z.coerce.number().int().positive().optional(),
  dropoffCityID: z.coerce.number().int().positive().optional(),
  startDate: z.string().trim().min(1).optional(),
  endDate: z.string().trim().min(1).optional(),
  flexDays: z.coerce.number().int().min(0).max(7).default(0),
  crossBorder: z
    .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
    .transform((v) => v === true || v === 'true' || v === '1')
    .optional(),
  categoryID: z.coerce.number().int().positive().optional(),
  manufacturerID: z.coerce.number().int().positive().optional(),
  brandID: z.coerce.number().int().positive().optional(),
  branchID: z.coerce.number().int().positive().optional(),
  fuelType: z.enum(['Gas', 'Diesel', 'Electric', 'Hybrid']).optional(),
  transmission: z.enum(['Manual', 'Automatic']).optional(),
  color: z.string().trim().max(50).optional(),
  minDailyRate: z.coerce.number().min(0).optional(),
  maxDailyRate: z.coerce.number().min(0).optional(),
  maxMileage: z.coerce.number().int().min(0).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'mileage_asc', 'newest']).default('price_asc'),
  search: z.string().trim().max(100).optional(),
});

export type PublicCarsSearchQuery = z.infer<typeof publicCarsSearchSchema>;
