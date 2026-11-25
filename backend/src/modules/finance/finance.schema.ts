import { z } from 'zod';

export const financeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
  paymentType: z.enum(['Payment', 'Refund', 'Deposit', 'DepositRefund']).optional(),
  invoiceStatus: z.enum(['Issued', 'Voided']).optional(),
  sort: z.string().trim().max(50).optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const voidInvoiceSchema = z.object({
  reason: z.string().trim().min(1, 'Void reason is required').max(255),
});

export const refundMethodSchema = z.object({
  method: z.enum(['Cash', 'Card', 'BankTransfer', 'Other']),
});
