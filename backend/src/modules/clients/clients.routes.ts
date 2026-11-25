import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  clientBodySchema,
  idParamSchema,
  listClientsQuerySchema,
  rejectVerificationSchema,
  setClientCredentialsSchema,
  verificationBodySchema,
  type ClientBodyInput,
  type ListClientsQuery,
  type VerificationBodyInput,
} from './clients.schema.js';
import {
  addVerification,
  approveVerification,
  createClientAdmin,
  deleteClientAdmin,
  deleteVerification,
  getClientWorkspace,
  listClients,
  listUnverifiedDocuments,
  rejectVerification,
  setClientCredentials,
  unlockClientAccount,
  updateClientAdmin,
  updateVerification,
} from './clients.service.js';

export const clientsRouter = Router();
clientsRouter.use(authenticate, requirePermission('MANAGE_CLIENTS'));

clientsRouter.get('/', validate({ query: listClientsQuerySchema }), async (req, res) => {
  const result = await listClients(req.query as unknown as ListClientsQuery);
  res.json(result);
});

clientsRouter.post('/', validate({ body: clientBodySchema }), async (req, res) => {
  const created = await createClientAdmin(req.user!.userID, req.body as ClientBodyInput);
  res.status(201).json(created);
});

clientsRouter.get('/documents/queue', async (_req, res) => {
  const data = await listUnverifiedDocuments();
  res.json({ data });
});

clientsRouter.patch('/documents/:id/approve', validate({ params: idParamSchema }), async (req, res) => {
  await approveVerification(req.user!.userID, Number(req.params.id));
  res.json({ ok: true });
});

clientsRouter.patch(
  '/documents/:id/reject',
  validate({ params: idParamSchema, body: rejectVerificationSchema }),
  async (req, res) => {
    const { reason } = req.body as { reason: string };
    await rejectVerification(req.user!.userID, Number(req.params.id), reason);
    res.json({ ok: true });
  },
);

clientsRouter.patch(
  '/documents/:id',
  validate({ params: idParamSchema, body: verificationBodySchema }),
  async (req, res) => {
    await updateVerification(req.user!.userID, Number(req.params.id), req.body as VerificationBodyInput);
    res.json({ ok: true });
  },
);

clientsRouter.delete('/documents/:id', validate({ params: idParamSchema }), async (req, res) => {
  await deleteVerification(req.user!.userID, Number(req.params.id));
  res.status(204).end();
});

clientsRouter.get('/:id', validate({ params: idParamSchema }), async (req, res) => {
  const workspace = await getClientWorkspace(Number(req.params.id));
  res.json(workspace);
});

clientsRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: clientBodySchema }),
  async (req, res) => {
    await updateClientAdmin(req.user!.userID, Number(req.params.id), req.body as ClientBodyInput);
    res.json({ ok: true });
  },
);

clientsRouter.delete('/:id', validate({ params: idParamSchema }), async (req, res) => {
  await deleteClientAdmin(req.user!.userID, Number(req.params.id));
  res.status(204).end();
});

clientsRouter.post(
  '/:id/credentials',
  validate({ params: idParamSchema, body: setClientCredentialsSchema }),
  async (req, res) => {
    const { username, password } = req.body as { username: string; password: string };
    await setClientCredentials(req.user!.userID, Number(req.params.id), username, password);
    res.json({ ok: true });
  },
);

clientsRouter.post('/:id/unlock', validate({ params: idParamSchema }), async (req, res) => {
  await unlockClientAccount(req.user!.userID, Number(req.params.id));
  res.json({ ok: true });
});

clientsRouter.post(
  '/:id/documents',
  validate({ params: idParamSchema, body: verificationBodySchema }),
  async (req, res) => {
    await addVerification(req.user!.userID, Number(req.params.id), req.body as VerificationBodyInput);
    res.status(201).json({ ok: true });
  },
);
