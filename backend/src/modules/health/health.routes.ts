import { Router } from 'express';
import { checkDbHealth } from '../../db/pool.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    const db = await checkDbHealth();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: db,
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        ok: false,
        error: error instanceof Error ? error.message : 'Database unreachable',
      },
    });
  }
});
