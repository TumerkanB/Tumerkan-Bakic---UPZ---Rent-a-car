import { z } from 'zod';
import { addressSchema } from '../locations/locations.schema.js';

export const listClientsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  verifiedLicence: z.enum(['true', 'false']).optional(),
  locked: z.enum(['true', 'false']).optional(),
  sort: z.string().trim().max(50).optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const clientBodySchema = z.object({
  name: z.string().trim().min(1, 'First name is required').max(100),
  surname: z.string().trim().min(1, 'Last name is required').max(100),
  email: z
    .string()
    .trim()
    .email('Valid email is required')
    .max(255)
    .refine((v) => !/\s/.test(v), 'Email cannot contain spaces'),
  phone: z.string().trim().max(50).nullable().optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .nullable()
    .optional(),
  isActive: z.boolean().default(true),
  address: addressSchema.nullable().optional(),
});

export const setClientCredentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(100)
    .refine((v) => !/\s/.test(v), 'Username cannot contain spaces'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const verificationBodySchema = z.object({
  documentType: z.enum(['DrivingLicence', 'Passport', 'NationalID', 'Other']),
  documentID: z.string().trim().min(1, 'Document ID is required').max(100),
  documentCountryID: z.coerce.number().int().positive('Country is required'),
  attribute: z.string().trim().max(100).nullable().optional(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  isVerified: z.boolean().default(false),
});

export const rejectVerificationSchema = z.object({
  reason: z.string().trim().min(1, 'Reason is required').max(100),
});

export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
export type ClientBodyInput = z.infer<typeof clientBodySchema>;
export type VerificationBodyInput = z.infer<typeof verificationBodySchema>;
