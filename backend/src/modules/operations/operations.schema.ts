import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createDamageSchema = z.object({
  carID: z.coerce.number().int().positive(),
  reservationID: z.coerce.number().int().positive().nullable().optional(),
  description: z.string().trim().min(1).max(2000),
  repairCost: z.coerce.number().min(0).nullable().optional(),
});

export const billDamageSchema = z.object({
  amount: z.coerce.number().positive(),
});

export const markRepairedSchema = z.object({
  repairCost: z.coerce.number().min(0),
});

export const createFineSchema = z.object({
  carID: z.coerce.number().int().positive(),
  fineType: z.enum(['Speeding', 'Parking', 'Toll', 'Other']),
  occurredAt: z.string().min(1),
  amount: z.coerce.number().positive(),
  referenceNo: z.string().trim().max(100).nullable().optional(),
  description: z.string().trim().max(255).nullable().optional(),
});

export const fineStatusSchema = z.object({
  status: z.enum(['Received', 'Billed', 'Paid', 'Disputed', 'Void']),
});

export const createMaintenanceGlobalSchema = z.object({
  carID: z.coerce.number().int().positive(),
  serviceType: z.enum(['Service', 'Repair', 'Tyres', 'Inspection', 'Other']),
  serviceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mileage: z.coerce.number().int().min(0),
  cost: z.coerce.number().min(0).default(0),
  description: z.string().trim().max(2000).nullable().optional(),
  performedBy: z.string().trim().max(100).nullable().optional(),
  nextDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  nextDueMileage: z.coerce.number().int().min(0).nullable().optional(),
});
