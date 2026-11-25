import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createMaintenance } from '../fleet/fleet.service.js';
import {
  billDamageSchema,
  createDamageSchema,
  createFineSchema,
  createMaintenanceGlobalSchema,
  fineStatusSchema,
  idParamSchema,
  markRepairedSchema,
} from './operations.schema.js';
import {
  billDamage,
  billFine,
  createFine,
  listAllMaintenance,
  listDamages,
  listFines,
  markDamageRepaired,
  reportDamage,
  setFineStatus,
} from './operations.service.js';

export const damagesRouter = Router();
damagesRouter.use(authenticate, requirePermission('MANAGE_DAMAGES'));

damagesRouter.get('/', async (req, res) => {
  const data = await listDamages(req.user!.branchID);
  res.json({ data });
});

damagesRouter.post('/', validate({ body: createDamageSchema }), async (req, res) => {
  await reportDamage(req.user!.userID, req.body);
  res.status(201).json({ ok: true });
});

damagesRouter.post('/:id/bill', validate({ params: idParamSchema, body: billDamageSchema }), async (req, res) => {
  const { amount } = req.body as { amount: number };
  await billDamage(req.user!.userID, Number(req.params.id), amount);
  res.json({ ok: true });
});

damagesRouter.patch(
  '/:id/repaired',
  validate({ params: idParamSchema, body: markRepairedSchema }),
  async (req, res) => {
    const { repairCost } = req.body as { repairCost: number };
    await markDamageRepaired(req.user!.userID, Number(req.params.id), repairCost);
    res.json({ ok: true });
  },
);

export const finesRouter = Router();
finesRouter.use(authenticate, requirePermission('MANAGE_FINES'));

finesRouter.get('/', async (req, res) => {
  const data = await listFines(req.user!.branchID);
  res.json({ data });
});

finesRouter.post('/', validate({ body: createFineSchema }), async (req, res) => {
  await createFine(req.user!.userID, req.body);
  res.status(201).json({ ok: true });
});

finesRouter.post('/:id/bill', validate({ params: idParamSchema }), async (req, res) => {
  await billFine(req.user!.userID, Number(req.params.id));
  res.json({ ok: true });
});

finesRouter.patch('/:id/status', validate({ params: idParamSchema, body: fineStatusSchema }), async (req, res) => {
  const { status } = req.body as { status: string };
  await setFineStatus(req.user!.userID, Number(req.params.id), status);
  res.json({ ok: true });
});

export const maintenanceRouter = Router();
maintenanceRouter.use(authenticate, requirePermission('MANAGE_MAINTENANCE'));

maintenanceRouter.get('/', async (req, res) => {
  const result = await listAllMaintenance(req.user!.branchID);
  res.json(result);
});

maintenanceRouter.post('/', validate({ body: createMaintenanceGlobalSchema }), async (req, res) => {
  const { carID, ...rest } = req.body as { carID: number } & Parameters<typeof createMaintenance>[2];
  await createMaintenance(req.user!.userID, carID, rest);
  res.status(201).json({ ok: true });
});
