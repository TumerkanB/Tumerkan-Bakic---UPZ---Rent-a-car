import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { APP_CONSTANTS } from './config/constants.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { clientAccountRouter } from './modules/clientAccount/clientAccount.routes.js';
import { clientAuthRouter } from './modules/clientAuth/clientAuth.routes.js';
import { fleetRouter } from './modules/fleet/fleet.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { publicCatalogRouter } from './modules/publicCatalog/publicCatalog.routes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: [...env.corsOrigins],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.use(`${APP_CONSTANTS.API_PREFIX}/health`, healthRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/auth`, authRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/client/auth`, clientAuthRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/client/account`, clientAccountRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/public`, publicCatalogRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/fleet`, fleetRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
