import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  financeListQuerySchema,
  idParamSchema,
  refundMethodSchema,
  voidInvoiceSchema,
} from './finance.schema.js';
import {
  getInvoiceDetail,
  issueInvoice,
  listInvoices,
  listPayments,
  listPendingRefunds,
  listUninvoicedReservations,
  refundOverpayment,
  voidInvoice,
} from './finance.service.js';

export const paymentsRouter = Router();
paymentsRouter.use(authenticate, requirePermission('MANAGE_PAYMENTS'));

paymentsRouter.get('/', validate({ query: financeListQuerySchema }), async (req, res) => {
  const q = req.query as unknown as {
    page: number;
    pageSize: number;
    q?: string;
    paymentType?: string;
  };
  const result = await listPayments({ ...q, userBranchId: req.user!.branchID });
  res.json(result);
});

paymentsRouter.get('/pending-refunds', async (req, res) => {
  const data = await listPendingRefunds(req.user!.branchID);
  res.json({ data });
});

paymentsRouter.post(
  '/refund/:id',
  validate({ params: idParamSchema, body: refundMethodSchema }),
  async (req, res) => {
    const { method } = req.body as { method: string };
    await refundOverpayment(req.user!.userID, Number(req.params.id), method);
    res.json({ ok: true });
  },
);

export const invoicesRouter = Router();
invoicesRouter.use(authenticate, requirePermission('MANAGE_INVOICES'));

invoicesRouter.get('/', validate({ query: financeListQuerySchema }), async (req, res) => {
  const q = req.query as unknown as {
    page: number;
    pageSize: number;
    q?: string;
    invoiceStatus?: string;
  };
  const result = await listInvoices({ ...q, userBranchId: req.user!.branchID });
  res.json(result);
});

invoicesRouter.get('/status', async (req, res) => {
  const data = await listUninvoicedReservations(req.user!.branchID);
  res.json({ data });
});

invoicesRouter.get('/:id', validate({ params: idParamSchema }), async (req, res) => {
  const detail = await getInvoiceDetail(Number(req.params.id));
  res.json(detail);
});

invoicesRouter.post('/:id/void', validate({ params: idParamSchema, body: voidInvoiceSchema }), async (req, res) => {
  const { reason } = req.body as { reason: string };
  const result = await voidInvoice(req.user!.userID, Number(req.params.id), reason);
  res.json(result);
});

invoicesRouter.post('/issue/:id', validate({ params: idParamSchema }), async (req, res) => {
  const result = await issueInvoice(req.user!.userID, Number(req.params.id));
  res.status(201).json(result);
});
