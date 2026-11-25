import { Router } from 'express';
import { authenticateClient } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  changePasswordSchema,
  updateProfileSchema,
  updateUsernameSchema,
  type ChangePasswordInput,
  type UpdateProfileInput,
  type UpdateUsernameInput,
} from './clientAccount.schema.js';
import {
  changeClientPassword,
  getClientAccountOverview,
  updateClientContact,
  updateClientUsername,
} from './clientAccount.service.js';

export const clientAccountRouter = Router();

clientAccountRouter.use(authenticateClient);

clientAccountRouter.get('/', async (req, res) => {
  const data = await getClientAccountOverview(req.client!.clientID);
  res.json(data);
});

clientAccountRouter.patch('/profile', validate({ body: updateProfileSchema }), async (req, res) => {
  const input = req.body as UpdateProfileInput;
  const result = await updateClientContact(req.client!.clientID, input);
  res.json(result);
});

clientAccountRouter.patch('/username', validate({ body: updateUsernameSchema }), async (req, res) => {
  const { username, currentPassword } = req.body as UpdateUsernameInput;
  const result = await updateClientUsername(req.client!.clientID, username, currentPassword);
  res.json(result);
});

clientAccountRouter.patch('/password', validate({ body: changePasswordSchema }), async (req, res) => {
  const { currentPassword, newPassword } = req.body as ChangePasswordInput;
  await changeClientPassword(req.client!.clientID, currentPassword, newPassword);
  res.json({ message: 'Password updated successfully' });
});
