import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  changeStaffPasswordSchema,
  loginBodySchema,
  type ChangeStaffPasswordInput,
  type LoginInput,
} from './auth.schema.js';
import { changeStaffPassword, loginUser } from './auth.service.js';

export const authRouter = Router();

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many login attempts, please try again later' } },
});

authRouter.post('/login', loginRateLimiter, validate({ body: loginBodySchema }), async (req, res) => {
  const { username, password } = req.body as LoginInput;
  const result = await loginUser(username, password);
  res.json(result);
});

authRouter.post(
  '/change-password',
  authenticate,
  validate({ body: changeStaffPasswordSchema }),
  async (req, res) => {
    const { currentPassword, newPassword } = req.body as ChangeStaffPasswordInput;
    const result = await changeStaffPassword(req.user!.userID, currentPassword, newPassword);
    res.json(result);
  },
);

authRouter.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});
