import { z } from 'zod';

export const clientLoginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const checkAvailabilityQuerySchema = z.object({
  email: z.string().trim().max(255).optional(),
  phone: z.string().trim().max(50).optional(),
  username: z.string().trim().max(100).optional(),
});

export const clientRegisterSchema = z.object({
  name: z.string().trim().min(1, 'First name is required').max(100),
  surname: z.string().trim().min(1, 'Last name is required').max(100),
  email: z
    .string()
    .trim()
    .email('Valid email is required')
    .max(255)
    .refine((val) => !/\s/.test(val), 'Email cannot contain spaces'),
  phone: z.string().trim().min(6, 'Phone number must be at least 6 characters').max(50),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD')
    .refine((val) => val >= '1900-01-01', 'Date of birth must be after 1900-01-01')
    .refine((val) => new Date(val) <= new Date(), 'Date of birth cannot be in the future'),
  address: z.object({
    street: z.string().trim().min(1, 'Street is required').max(255),
    number: z.string().trim().min(1, 'House/building number is required').max(20),
    apt: z.string().trim().max(20).optional(),
    zip: z.string().trim().min(1, 'ZIP/postal code is required').max(20),
    cityID: z.coerce.number().int().positive('City is required'),
  }),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(100)
    .refine((val) => !/\s/.test(val), 'Username cannot contain spaces'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export type ClientLoginInput = z.infer<typeof clientLoginSchema>;
export type ClientRegisterInput = z.infer<typeof clientRegisterSchema>;
