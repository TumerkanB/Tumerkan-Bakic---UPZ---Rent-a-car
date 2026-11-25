import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  addCarImageSchema,
  brandBodySchema,
  carIdParamsSchema,
  carImageParamsSchema,
  createCarBodySchema,
  idParamsSchema,
  listCarsQuerySchema,
  manufacturerBodySchema,
  modelBodySchema,
  updateCarBodySchema,
  type CreateCarInput,
  type ListCarsQuery,
  type UpdateCarInput,
} from './fleet.schema.js';
import {
  addCarImage,
  createBrand,
  createCar,
  createManufacturer,
  createModel,
  deleteBrand,
  deleteCarImage,
  deleteManufacturer,
  deleteModel,
  getCarById,
  getCatalogData,
  listBranches,
  listCars,
  listCategories,
  setPrimaryCarImage,
  updateBrand,
  updateCar,
  updateManufacturer,
  updateModel,
} from './fleet.service.js';

export const fleetRouter = Router();

fleetRouter.use(authenticate);

// Cars
fleetRouter.get('/cars', validate({ query: listCarsQuerySchema }), async (req, res) => {
  const result = await listCars(req.query as unknown as ListCarsQuery);
  res.json(result);
});

fleetRouter.post(
  '/cars',
  requirePermission('MANAGE_CARS'),
  validate({ body: createCarBodySchema }),
  async (req, res) => {
    const car = await createCar(req.user!.userID, req.body as CreateCarInput);
    res.status(201).json({ car });
  },
);

fleetRouter.get('/cars/:carID', validate({ params: carIdParamsSchema }), async (req, res) => {
  const carID = Number(req.params.carID);
  const car = await getCarById(carID);
  res.json({ car });
});

fleetRouter.patch(
  '/cars/:carID',
  requirePermission('MANAGE_CARS'),
  validate({ params: carIdParamsSchema, body: updateCarBodySchema }),
  async (req, res) => {
    const car = await updateCar(req.user!.userID, Number(req.params.carID), req.body as UpdateCarInput);
    res.json({ car });
  },
);

// Car Images
fleetRouter.post(
  '/cars/:carID/images',
  requirePermission('MANAGE_CARS'),
  validate({ params: carIdParamsSchema, body: addCarImageSchema }),
  async (req, res) => {
    const { fileReference, caption, makePrimary } = req.body as {
      fileReference: string;
      caption?: string | null;
      makePrimary: boolean;
    };
    const car = await addCarImage(
      req.user!.userID,
      Number(req.params.carID),
      fileReference,
      caption ?? null,
      makePrimary,
    );
    res.status(201).json({ car });
  },
);

fleetRouter.patch(
  '/cars/:carID/images/:imageID/primary',
  requirePermission('MANAGE_CARS'),
  validate({ params: carImageParamsSchema }),
  async (req, res) => {
    const car = await setPrimaryCarImage(
      req.user!.userID,
      Number(req.params.carID),
      Number(req.params.imageID),
    );
    res.json({ car });
  },
);

fleetRouter.delete(
  '/cars/:carID/images/:imageID',
  requirePermission('MANAGE_CARS'),
  validate({ params: carImageParamsSchema }),
  async (req, res) => {
    const car = await deleteCarImage(
      req.user!.userID,
      Number(req.params.carID),
      Number(req.params.imageID),
    );
    res.json({ car });
  },
);

// Catalog: Manufacturers, Brands, Models
fleetRouter.get('/catalog', async (_req, res) => {
  const catalog = await getCatalogData();
  res.json(catalog);
});

fleetRouter.post(
  '/manufacturers',
  requirePermission('MANAGE_CARS'),
  validate({ body: manufacturerBodySchema }),
  async (req, res) => {
    const { name, logoUrl } = req.body as { name: string; logoUrl?: string | null };
    const manufacturer = await createManufacturer(name, logoUrl);
    res.status(201).json({ manufacturer });
  },
);

fleetRouter.patch(
  '/manufacturers/:id',
  requirePermission('MANAGE_CARS'),
  validate({ params: idParamsSchema, body: manufacturerBodySchema }),
  async (req, res) => {
    const { name, logoUrl } = req.body as { name: string; logoUrl?: string | null };
    const manufacturer = await updateManufacturer(Number(req.params.id), name, logoUrl);
    res.json({ manufacturer });
  },
);

fleetRouter.delete(
  '/manufacturers/:id',
  requirePermission('MANAGE_CARS'),
  validate({ params: idParamsSchema }),
  async (req, res) => {
    await deleteManufacturer(Number(req.params.id));
    res.status(204).end();
  },
);

fleetRouter.post(
  '/brands',
  requirePermission('MANAGE_CARS'),
  validate({ body: brandBodySchema }),
  async (req, res) => {
    const { brandName, manufacturerID, logoUrl } = req.body as {
      brandName: string;
      manufacturerID: number;
      logoUrl?: string | null;
    };
    const brand = await createBrand(brandName, manufacturerID, logoUrl);
    res.status(201).json({ brand });
  },
);

fleetRouter.patch(
  '/brands/:id',
  requirePermission('MANAGE_CARS'),
  validate({ params: idParamsSchema, body: brandBodySchema }),
  async (req, res) => {
    const { brandName, manufacturerID, logoUrl } = req.body as {
      brandName: string;
      manufacturerID: number;
      logoUrl?: string | null;
    };
    const brand = await updateBrand(Number(req.params.id), brandName, manufacturerID, logoUrl);
    res.json({ brand });
  },
);

fleetRouter.delete(
  '/brands/:id',
  requirePermission('MANAGE_CARS'),
  validate({ params: idParamsSchema }),
  async (req, res) => {
    await deleteBrand(Number(req.params.id));
    res.status(204).end();
  },
);

fleetRouter.post(
  '/models',
  requirePermission('MANAGE_CARS'),
  validate({ body: modelBodySchema }),
  async (req, res) => {
    const { modelName, brandID } = req.body as { modelName: string; brandID: number };
    const model = await createModel(modelName, brandID);
    res.status(201).json({ model });
  },
);

fleetRouter.patch(
  '/models/:id',
  requirePermission('MANAGE_CARS'),
  validate({ params: idParamsSchema, body: modelBodySchema }),
  async (req, res) => {
    const { modelName, brandID } = req.body as { modelName: string; brandID: number };
    const model = await updateModel(Number(req.params.id), modelName, brandID);
    res.json({ model });
  },
);

fleetRouter.delete(
  '/models/:id',
  requirePermission('MANAGE_CARS'),
  validate({ params: idParamsSchema }),
  async (req, res) => {
    await deleteModel(Number(req.params.id));
    res.status(204).end();
  },
);

// Branches & Categories
fleetRouter.get('/branches', async (_req, res) => {
  const branches = await listBranches();
  res.json({ items: branches });
});

fleetRouter.get('/categories', async (_req, res) => {
  const categories = await listCategories();
  res.json({ items: categories });
});
