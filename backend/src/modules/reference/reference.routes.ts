import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { cityBodySchema, countryBodySchema, idParamSchema, listQuerySchema } from './reference.schema.js';
import {
  createCity,
  createCountry,
  deleteCity,
  deleteCountry,
  getAllCities,
  getAllCountries,
  listCities,
  listCountries,
  updateCity,
  updateCountry,
} from './reference.service.js';

export const countriesRouter = Router();
countriesRouter.use(authenticate);

countriesRouter.get('/all', async (_req, res) => {
  const data = await getAllCountries();
  res.json({ data });
});

countriesRouter.get('/', validate({ query: listQuerySchema }), async (req, res) => {
  const q = req.query as unknown as {
    page: number;
    pageSize: number;
    q?: string;
    sort?: string;
    order: 'asc' | 'desc';
  };
  const result = await listCountries(q);
  res.json(result);
});

countriesRouter.post('/', requireAdmin(), validate({ body: countryBodySchema }), async (req, res) => {
  const country = await createCountry(req.body);
  res.status(201).json({ country });
});

countriesRouter.patch(
  '/:id',
  requireAdmin(),
  validate({ params: idParamSchema, body: countryBodySchema }),
  async (req, res) => {
    const country = await updateCountry(Number(req.params.id), req.body);
    res.json({ country });
  },
);

countriesRouter.delete('/:id', requireAdmin(), validate({ params: idParamSchema }), async (req, res) => {
  await deleteCountry(Number(req.params.id));
  res.status(204).end();
});

export const citiesRouter = Router();
citiesRouter.use(authenticate);

citiesRouter.get('/all', async (_req, res) => {
  const data = await getAllCities();
  res.json({ data });
});

citiesRouter.get('/', validate({ query: listQuerySchema }), async (req, res) => {
  const q = req.query as unknown as {
    page: number;
    pageSize: number;
    q?: string;
    countryID?: number;
    sort?: string;
    order: 'asc' | 'desc';
  };
  const result = await listCities(q);
  res.json(result);
});

citiesRouter.post('/', validate({ body: cityBodySchema }), async (req, res) => {
  const { cityName, countryID } = req.body as { cityName: string; countryID: number };
  const city = await createCity(cityName, countryID);
  res.status(201).json({ city });
});

citiesRouter.patch(
  '/:id',
  requireAdmin(),
  validate({ params: idParamSchema, body: cityBodySchema }),
  async (req, res) => {
    const { cityName, countryID } = req.body as { cityName: string; countryID: number };
    const city = await updateCity(Number(req.params.id), cityName, countryID);
    res.json({ city });
  },
);

citiesRouter.delete('/:id', requireAdmin(), validate({ params: idParamSchema }), async (req, res) => {
  await deleteCity(Number(req.params.id));
  res.status(204).end();
});
