import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { loginBodySchema } from './auth.schema.js';
import { loginUser } from './auth.service.js';

export const authRouter = Router();

authRouter.post('/login', validate({ body: loginBodySchema }), async (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  const result = await loginUser(username, password);
  res.json(result);
});

authRouter.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});
