import { z } from 'zod';

export const updateUsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(100)
    .refine((val) => !/\s/.test(val), 'Username cannot contain spaces'),
  currentPassword: z.string().min(1, 'Current password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
});

export const updateProfileSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Valid email is required')
    .max(255)
    .refine((val) => !/\s/.test(val), 'Email cannot contain spaces'),
  phone: z.string().trim().min(6, 'Phone number must be at least 6 characters').max(50),
  address: z.object({
    street: z.string().trim().min(1, 'Street is required').max(255),
    number: z.string().trim().min(1, 'House/building number is required').max(20),
    apt: z.string().trim().max(20).optional(),
    zip: z.string().trim().min(1, 'ZIP/postal code is required').max(20),
    cityID: z.coerce.number().int().positive('City is required'),
  }),
});

export type UpdateUsernameInput = z.infer<typeof updateUsernameSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
