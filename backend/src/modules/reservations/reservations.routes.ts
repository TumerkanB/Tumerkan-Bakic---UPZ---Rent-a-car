import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  addChargeSchema,
  addExtraSchema,
  applyPromoSchema,
  availableCarsQuerySchema,
  cancelReservationSchema,
  completeRentalSchema,
  createReservationSchema,
  driverBodySchema,
  idParamSchema,
  listReservationsQuerySchema,
  recordConditionSchema,
  recordPaymentSchema,
  settleMethodSchema,
  updateDatesSchema,
  type CreateReservationInput,
  type ListReservationsQuery,
  type RecordConditionInput,
  type RecordPaymentInput,
} from './reservations.schema.js';
import {
  addCharge,
  addDriver,
  addExtra,
  applyPromo,
  cancelReservation,
  completeRental,
  createReservation,
  getAvailableCarsForBooking,
  getReservationWorkspace,
  issueInvoice,
  listConditionReports,
  listReservations,
  recordCondition,
  recordPayment,
  refundOverpayment,
  removeDriver,
  removePromo,
  settleDeposit,
  startRental,
  updateReservationDates,
} from './reservations.service.js';

export const reservationsRouter = Router();
reservationsRouter.use(authenticate, requirePermission('MANAGE_RESERVATIONS'));

reservationsRouter.get('/', validate({ query: listReservationsQuerySchema }), async (req, res) => {
  const result = await listReservations(
    req.query as unknown as ListReservationsQuery,
    req.user!.branchID,
  );
  res.json(result);
});

reservationsRouter.get(
  '/available-cars',
  validate({ query: availableCarsQuerySchema }),
  async (req, res) => {
    const { startDate, endDate, branchID } = req.query as unknown as {
      startDate: string;
      endDate: string;
      branchID?: number;
    };
    const effectiveBranch = req.user!.branchID ?? branchID ?? null;
    const items = await getAvailableCarsForBooking(startDate, endDate, effectiveBranch);
    res.json({ items });
  },
);

reservationsRouter.get('/conditions', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;
  const data = await listConditionReports(q);
  res.json({ data });
});

reservationsRouter.post('/', validate({ body: createReservationSchema }), async (req, res) => {
  const created = await createReservation(req.user!.userID, req.body as CreateReservationInput);
  res.status(201).json(created);
});

reservationsRouter.get('/:id', validate({ params: idParamSchema }), async (req, res) => {
  const ws = await getReservationWorkspace(Number(req.params.id));
  res.json(ws);
});

reservationsRouter.patch(
  '/:id/dates',
  validate({ params: idParamSchema, body: updateDatesSchema }),
  async (req, res) => {
    const { startDate, endDate } = req.body as { startDate: string; endDate: string };
    await updateReservationDates(req.user!.userID, Number(req.params.id), startDate, endDate);
    res.json({ ok: true });
  },
);

reservationsRouter.post('/:id/start', validate({ params: idParamSchema }), async (req, res) => {
  await startRental(req.user!.userID, Number(req.params.id));
  res.json({ ok: true });
});

reservationsRouter.post(
  '/:id/complete',
  validate({ params: idParamSchema, body: completeRentalSchema }),
  async (req, res) => {
    const { endMileage, returnedAt } = req.body as { endMileage: number; returnedAt: string };
    await completeRental(req.user!.userID, Number(req.params.id), endMileage, returnedAt);
    res.json({ ok: true });
  },
);

reservationsRouter.post(
  '/:id/cancel',
  validate({ params: idParamSchema, body: cancelReservationSchema }),
  async (req, res) => {
    const { reason } = req.body as { reason: string };
    await cancelReservation(req.user!.userID, Number(req.params.id), reason);
    res.json({ ok: true });
  },
);

reservationsRouter.post(
  '/:id/promo',
  validate({ params: idParamSchema, body: applyPromoSchema }),
  async (req, res) => {
    const { code } = req.body as { code: string };
    await applyPromo(req.user!.userID, Number(req.params.id), code);
    res.json({ ok: true });
  },
);

reservationsRouter.delete('/:id/promo', validate({ params: idParamSchema }), async (req, res) => {
  await removePromo(req.user!.userID, Number(req.params.id));
  res.json({ ok: true });
});

reservationsRouter.post(
  '/:id/extras',
  validate({ params: idParamSchema, body: addExtraSchema }),
  async (req, res) => {
    const { extraID, quantity } = req.body as { extraID: number; quantity: number };
    await addExtra(req.user!.userID, Number(req.params.id), extraID, quantity);
    res.status(201).json({ ok: true });
  },
);

reservationsRouter.post(
  '/:id/charges',
  validate({ params: idParamSchema, body: addChargeSchema }),
  async (req, res) => {
    const { chargeType, description, quantity, unitAmount } = req.body as {
      chargeType: string;
      description: string;
      quantity: number;
      unitAmount: number;
    };
    await addCharge(
      req.user!.userID,
      Number(req.params.id),
      chargeType,
      description,
      quantity,
      unitAmount,
    );
    res.status(201).json({ ok: true });
  },
);

reservationsRouter.post(
  '/:id/drivers',
  validate({ params: idParamSchema, body: driverBodySchema }),
  async (req, res) => {
    const { clientID } = req.body as { clientID: number };
    await addDriver(req.user!.userID, Number(req.params.id), clientID);
    res.status(201).json({ ok: true });
  },
);

reservationsRouter.delete(
  '/:id/drivers/:driverId',
  validate({ params: idParamSchema }),
  async (req, res) => {
    await removeDriver(req.user!.userID, Number(req.params.id), Number(req.params.driverId));
    res.status(204).end();
  },
);

reservationsRouter.post(
  '/:id/conditions',
  validate({ params: idParamSchema, body: recordConditionSchema }),
  async (req, res) => {
    await recordCondition(req.user!.userID, Number(req.params.id), req.body as RecordConditionInput);
    res.status(201).json({ ok: true });
  },
);

reservationsRouter.post(
  '/:id/payments',
  requirePermission('MANAGE_PAYMENTS'),
  validate({ params: idParamSchema, body: recordPaymentSchema }),
  async (req, res) => {
    await recordPayment(req.user!.userID, Number(req.params.id), req.body as RecordPaymentInput);
    res.status(201).json({ ok: true });
  },
);

reservationsRouter.post(
  '/:id/settle-deposit',
  requirePermission('MANAGE_PAYMENTS'),
  validate({ params: idParamSchema, body: settleMethodSchema }),
  async (req, res) => {
    const { method } = req.body as { method: string };
    await settleDeposit(req.user!.userID, Number(req.params.id), method);
    res.json({ ok: true });
  },
);

reservationsRouter.post(
  '/:id/refund-overpayment',
  requirePermission('MANAGE_PAYMENTS'),
  validate({ params: idParamSchema, body: settleMethodSchema }),
  async (req, res) => {
    const { method } = req.body as { method: string };
    await refundOverpayment(req.user!.userID, Number(req.params.id), method);
    res.json({ ok: true });
  },
);

reservationsRouter.post(
  '/:id/invoice',
  requirePermission('MANAGE_INVOICES'),
  validate({ params: idParamSchema }),
  async (req, res) => {
    await issueInvoice(req.user!.userID, Number(req.params.id));
    res.status(201).json({ ok: true });
  },
);
