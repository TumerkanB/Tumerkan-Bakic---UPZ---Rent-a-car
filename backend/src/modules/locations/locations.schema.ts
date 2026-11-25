import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().trim().min(1, 'Street is required').max(255),
  number: z.string().trim().min(1, 'Number is required').max(20),
  apt: z.string().trim().max(20).nullable().optional(),
  zip: z.string().trim().min(1, 'ZIP is required').max(20),
  cityID: z.coerce.number().int().positive('City is required'),
});

export const branchBodySchema = z.object({
  branchName: z.string().trim().min(1, 'Branch name is required').max(100),
  phone: z.string().trim().max(50).nullable().optional(),
  isActive: z.boolean().default(true),
  address: addressSchema,
});

export const dropoffBodySchema = z.object({
  locationName: z.string().trim().min(1, 'Location name is required').max(100),
  branchID: z.coerce.number().int().positive('Branch is required'),
  dropoffFee: z.coerce.number().min(0, 'Drop-off fee cannot be negative').default(0),
  isActive: z.boolean().default(true),
  address: addressSchema,
});

export const locationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  branchID: z.coerce.number().int().positive().optional(),
  sort: z.string().trim().max(50).optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type BranchInput = z.infer<typeof branchBodySchema>;
export type DropoffInput = z.infer<typeof dropoffBodySchema>;
