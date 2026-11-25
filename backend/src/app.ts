import path from 'node:path';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { APP_CONSTANTS } from './config/constants.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { clientAccountRouter } from './modules/clientAccount/clientAccount.routes.js';
import { clientAuthRouter } from './modules/clientAuth/clientAuth.routes.js';
import { clientsRouter } from './modules/clients/clients.routes.js';
import { invoicesRouter, paymentsRouter } from './modules/finance/finance.routes.js';
import { fleetRouter } from './modules/fleet/fleet.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { branchesRouter, dropoffsRouter } from './modules/locations/locations.routes.js';
import { damagesRouter, finesRouter, maintenanceRouter } from './modules/operations/operations.routes.js';
import { publicCatalogRouter } from './modules/publicCatalog/publicCatalog.routes.js';
import { citiesRouter, countriesRouter } from './modules/reference/reference.routes.js';
import { reservationsRouter } from './modules/reservations/reservations.routes.js';
import { uploadsRouter } from './modules/uploads/uploads.routes.js';

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: [...env.corsOrigins],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.use('/uploads', express.static(path.resolve(env.uploadDir)));

  app.use(`${APP_CONSTANTS.API_PREFIX}/health`, healthRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/auth`, authRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/client/auth`, clientAuthRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/client/account`, clientAccountRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/public`, publicCatalogRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/countries`, countriesRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/cities`, citiesRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/branches`, branchesRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/dropoffs`, dropoffsRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/fleet`, fleetRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/clients`, clientsRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/reservations`, reservationsRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/payments`, paymentsRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/invoices`, invoicesRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/damages`, damagesRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/fines`, finesRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/maintenance`, maintenanceRouter);
  app.use(`${APP_CONSTANTS.API_PREFIX}/uploads`, uploadsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
