import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { listBranches, listCategories } from '../fleet/fleet.service.js';
import { publicCarsSearchSchema, type PublicCarsSearchQuery } from './publicCatalog.schema.js';
import { getPublicFilterOptions, getPublicLocations, searchPublicCars } from './publicCatalog.service.js';

export const publicCatalogRouter = Router();

publicCatalogRouter.get('/locations', async (_req, res) => {
  const locations = await getPublicLocations();
  res.json(locations);
});

publicCatalogRouter.get('/filter-options', async (_req, res) => {
  const options = await getPublicFilterOptions();
  res.json(options);
});

publicCatalogRouter.get('/cars', validate({ query: publicCarsSearchSchema }), async (req, res) => {
  const query = req.query as unknown as PublicCarsSearchQuery;
  const result = await searchPublicCars(query);
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
