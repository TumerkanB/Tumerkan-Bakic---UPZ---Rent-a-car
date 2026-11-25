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

export type ListCarsQuery = z.infer<typeof listCarsQuerySchema>;
