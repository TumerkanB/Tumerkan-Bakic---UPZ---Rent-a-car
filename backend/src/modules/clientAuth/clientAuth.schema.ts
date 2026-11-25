import { z } from 'zod';

export const clientLoginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const clientRegisterSchema = z.object({
  name: z.string().trim().min(1, 'First name is required').max(100),
  surname: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Valid email is required').max(255),
  phone: z.string().trim().max(50).optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD')
    .optional(),
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
