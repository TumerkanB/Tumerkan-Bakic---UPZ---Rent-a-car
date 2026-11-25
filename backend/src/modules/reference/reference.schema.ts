import { z } from 'zod';

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
  sort: z.string().trim().max(50).optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
  countryID: z.coerce.number().int().positive().optional(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const countryBodySchema = z.object({
  countryName: z.string().trim().min(1, 'Country name is required').max(100),
  isoCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, 'ISO code must be 2 capital letters')
    .nullable()
    .optional(),
  phoneCode: z.string().trim().max(10).nullable().optional(),
  flagUrl: z.string().trim().max(500).nullable().optional(),
});

export const cityBodySchema = z.object({
  cityName: z.string().trim().min(1, 'City name is required').max(100),
  countryID: z.coerce.number().int().positive('Country is required'),
});
