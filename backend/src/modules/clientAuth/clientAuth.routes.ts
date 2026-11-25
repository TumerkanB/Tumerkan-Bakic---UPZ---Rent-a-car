import { Router } from 'express';
import { authenticateClient } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  clientLoginSchema,
  clientRegisterSchema,
  type ClientLoginInput,
  type ClientRegisterInput,
} from './clientAuth.schema.js';
import { loginClient, registerClient } from './clientAuth.service.js';

export const clientAuthRouter = Router();

clientAuthRouter.post('/login', validate({ body: clientLoginSchema }), async (req, res) => {
  const { username, password } = req.body as ClientLoginInput;
  const result = await loginClient(username, password);
  res.json(result);
});

clientAuthRouter.post('/register', validate({ body: clientRegisterSchema }), async (req, res) => {
  const input = req.body as ClientRegisterInput;
  const result = await registerClient(input);
  res.status(201).json(result);
});

clientAuthRouter.get('/me', authenticateClient, (req, res) => {
  res.json({ client: req.client });
});
