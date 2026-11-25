import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  branchBodySchema,
  dropoffBodySchema,
  idParamSchema,
  locationListQuerySchema,
  type BranchInput,
  type DropoffInput,
} from './locations.schema.js';
import {
  createBranch,
  createDropoff,
  deleteBranch,
  deleteDropoff,
  listBranchesAdmin,
  listDropoffsAdmin,
  setBranchActive,
  setDropoffActive,
  updateBranch,
  updateDropoff,
} from './locations.service.js';

export const branchesRouter = Router();
branchesRouter.use(authenticate);

branchesRouter.get('/', validate({ query: locationListQuerySchema }), async (req, res) => {
  const q = req.query as unknown as {
    page: number;
    pageSize: number;
    q?: string;
    isActive?: 'true' | 'false';
    sort?: string;
    order: 'asc' | 'desc';
  };
  const result = await listBranchesAdmin({ ...q, userBranchId: req.user!.branchID });
  res.json(result);
});

branchesRouter.post(
  '/',
  requirePermission('MANAGE_CARS'),
  validate({ body: branchBodySchema }),
  async (req, res) => {
    const branch = await createBranch(req.user!.userID, req.body as BranchInput);
    res.status(201).json({ branch });
  },
);

branchesRouter.patch(
  '/:id',
  requirePermission('MANAGE_CARS'),
  validate({ params: idParamSchema, body: branchBodySchema }),
  async (req, res) => {
    const branch = await updateBranch(req.user!.userID, Number(req.params.id), req.body as BranchInput);
    res.json({ branch });
  },
);

branchesRouter.patch(
  '/:id/active',
  requirePermission('MANAGE_CARS'),
  validate({ params: idParamSchema, body: z.object({ isActive: z.boolean() }) }),
  async (req, res) => {
    const { isActive } = req.body as { isActive: boolean };
    await setBranchActive(req.user!.userID, Number(req.params.id), isActive);
    res.json({ ok: true });
  },
);

branchesRouter.delete(
  '/:id',
  requirePermission('MANAGE_CARS'),
  validate({ params: idParamSchema }),
  async (req, res) => {
    await deleteBranch(req.user!.userID, Number(req.params.id));
    res.status(204).end();
  },
);

export const dropoffsRouter = Router();
dropoffsRouter.use(authenticate);

dropoffsRouter.get('/', validate({ query: locationListQuerySchema }), async (req, res) => {
  const q = req.query as unknown as {
    page: number;
    pageSize: number;
    q?: string;
    isActive?: 'true' | 'false';
    branchID?: number;
    sort?: string;
    order: 'asc' | 'desc';
  };
  const result = await listDropoffsAdmin({ ...q, userBranchId: req.user!.branchID });
  res.json(result);
});

dropoffsRouter.post(
  '/',
  requirePermission('MANAGE_CARS'),
  validate({ body: dropoffBodySchema }),
  async (req, res) => {
    const dropoff = await createDropoff(req.user!.userID, req.body as DropoffInput);
    res.status(201).json({ dropoff });
  },
);

dropoffsRouter.patch(
  '/:id',
  requirePermission('MANAGE_CARS'),
  validate({ params: idParamSchema, body: dropoffBodySchema }),
  async (req, res) => {
    const dropoff = await updateDropoff(req.user!.userID, Number(req.params.id), req.body as DropoffInput);
    res.json({ dropoff });
  },
);

dropoffsRouter.patch(
  '/:id/active',
  requirePermission('MANAGE_CARS'),
  validate({ params: idParamSchema, body: z.object({ isActive: z.boolean() }) }),
  async (req, res) => {
    const { isActive } = req.body as { isActive: boolean };
    await setDropoffActive(req.user!.userID, Number(req.params.id), isActive);
    res.json({ ok: true });
  },
);

dropoffsRouter.delete(
  '/:id',
  requirePermission('MANAGE_CARS'),
  validate({ params: idParamSchema }),
  async (req, res) => {
    await deleteDropoff(req.user!.userID, Number(req.params.id));
    res.status(204).end();
  },
);
