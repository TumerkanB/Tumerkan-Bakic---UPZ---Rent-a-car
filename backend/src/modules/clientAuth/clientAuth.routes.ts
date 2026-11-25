import { Router } from 'express';
import { authenticateClient } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  checkAvailabilityQuerySchema,
  clientLoginSchema,
  clientRegisterSchema,
  type ClientLoginInput,
  type ClientRegisterInput,
} from './clientAuth.schema.js';
import { checkClientAvailability, loginClient, registerClient } from './clientAuth.service.js';

export const clientAuthRouter = Router();

clientAuthRouter.get(
  '/check-availability',
  validate({ query: checkAvailabilityQuerySchema }),
  async (req, res) => {
    const query = req.query as { email?: string; phone?: string; username?: string };
    const result = await checkClientAvailability(query);
    res.json(result);
  },
);

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
