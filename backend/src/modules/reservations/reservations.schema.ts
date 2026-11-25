import { z } from 'zod';

export const listReservationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
  status: z.enum(['Pending', 'Active', 'Completed', 'Cancelled']).optional(),
  branchID: z.coerce.number().int().positive().optional(),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  overdue: z.enum(['true', 'false']).optional(),
  unpaid: z.enum(['true', 'false']).optional(),
  sort: z.string().trim().max(50).optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const availableCarsQuerySchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  branchID: z.coerce.number().int().positive().optional(),
});

export const createReservationSchema = z.object({
  clientID: z.coerce.number().int().positive(),
  carID: z.coerce.number().int().positive(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  pickupBranchID: z.coerce.number().int().positive(),
  dropoffLocationID: z.coerce.number().int().positive().nullable().optional(),
  promoCode: z.string().trim().max(50).optional(),
  extras: z
    .array(
      z.object({
        extraID: z.coerce.number().int().positive(),
        quantity: z.coerce.number().positive().default(1),
      }),
    )
    .optional(),
  additionalDriverIds: z.array(z.coerce.number().int().positive()).optional(),
});

export const updateDatesSchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export const completeRentalSchema = z.object({
  endMileage: z.coerce.number().int().min(0),
  returnedAt: z.string().min(1),
});

export const cancelReservationSchema = z.object({
  reason: z.string().trim().min(1, 'Cancellation reason is required').max(255),
});

export const applyPromoSchema = z.object({
  code: z.string().trim().min(1).max(50),
});

export const addExtraSchema = z.object({
  extraID: z.coerce.number().int().positive(),
  quantity: z.coerce.number().positive().default(1),
});

export const addChargeSchema = z.object({
  chargeType: z.enum([
    'OneWay',
    'Extra',
    'LateFee',
    'Damage',
    'Fuel',
    'Cleaning',
    'CancellationFee',
    'Other',
    'Fine',
    'Toll',
    'AdditionalDriver',
  ]),
  description: z.string().trim().min(1).max(255),
  quantity: z.coerce.number().positive().default(1),
  unitAmount: z.coerce.number().min(0),
});

export const driverBodySchema = z.object({
  clientID: z.coerce.number().int().positive(),
});

export const recordConditionSchema = z.object({
  stage: z.enum(['Pickup', 'Return']),
  mileage: z.coerce.number().int().min(0),
  fuelPercent: z.coerce.number().int().min(0).max(100),
  isClean: z.boolean().default(true),
  existingDamage: z.string().trim().max(2000).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  photos: z
    .array(
      z.object({
        fileReference: z.string().trim().min(1).max(500),
        caption: z.string().trim().max(255).nullable().optional(),
      }),
    )
    .optional(),
});

export const recordPaymentSchema = z.object({
  paymentType: z.enum(['Payment', 'Refund', 'Deposit', 'DepositRefund']),
  amount: z.coerce.number().positive(),
  currencyCode: z.string().trim().length(3).default('EUR'),
  method: z.enum(['Cash', 'Card', 'BankTransfer', 'Other']),
  reference: z.string().trim().max(100).nullable().optional(),
});

export const settleMethodSchema = z.object({
  method: z.enum(['Cash', 'Card', 'BankTransfer', 'Other']),
});

export type ListReservationsQuery = z.infer<typeof listReservationsQuerySchema>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type RecordConditionInput = z.infer<typeof recordConditionSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
