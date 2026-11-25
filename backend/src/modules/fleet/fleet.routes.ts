import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { carIdParamsSchema, listCarsQuerySchema, type ListCarsQuery } from './fleet.schema.js';
import { getCarById, listBranches, listCars, listCategories } from './fleet.service.js';

export const fleetRouter = Router();

fleetRouter.use(authenticate);

fleetRouter.get('/cars', validate({ query: listCarsQuerySchema }), async (req, res) => {
  const result = await listCars(req.query as unknown as ListCarsQuery);
  res.json(result);
});

fleetRouter.get('/cars/:carID', validate({ params: carIdParamsSchema }), async (req, res) => {
  const carID = Number(req.params.carID);
  const car = await getCarById(carID);
  res.json({ car });
});

fleetRouter.get('/branches', async (_req, res) => {
  const branches = await listBranches();
  res.json({ items: branches });
});

fleetRouter.get('/categories', async (_req, res) => {
  const categories = await listCategories();
  res.json({ items: categories });
});
