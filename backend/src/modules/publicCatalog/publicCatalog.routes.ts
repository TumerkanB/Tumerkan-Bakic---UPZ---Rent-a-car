import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { listCarsQuerySchema, type ListCarsQuery } from '../fleet/fleet.schema.js';
import { listBranches, listCars, listCategories } from '../fleet/fleet.service.js';

export const publicCatalogRouter = Router();

publicCatalogRouter.get('/cars', validate({ query: listCarsQuerySchema }), async (req, res) => {
  const query = req.query as unknown as ListCarsQuery;
  const result = await listCars({ ...query, status: 'Available' });
  res.json(result);
});

publicCatalogRouter.get('/branches', async (_req, res) => {
  const branches = await listBranches();
  res.json({ items: branches.filter((b) => b.isActive === 1) });
});

publicCatalogRouter.get('/categories', async (_req, res) => {
  const categories = await listCategories();
  res.json({ items: categories });
});
