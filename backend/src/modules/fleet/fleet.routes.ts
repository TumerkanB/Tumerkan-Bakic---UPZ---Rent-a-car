import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  addCarImageSchema,
  brandBodySchema,
  bulkModelsBodySchema,
  carIdParamsSchema,
  carImageParamsSchema,
  categoryBodySchema,
  createCarBodySchema,
  idParamsSchema,
  listCarsQuerySchema,
  maintenanceBodySchema,
  manufacturerBodySchema,
  markRepairedSchema,
  modelBodySchema,
  reorderImagesSchema,
  reportDamageSchema,
  setCarPriceSchema,
  updateCarBodySchema,
  type CreateCarInput,
  type ListCarsQuery,
  type UpdateCarInput,
} from './fleet.schema.js';
import {
  addCarImage,
  bulkImportModels,
  createBrand,
  createCar,
  createCategory,
  createMaintenance,
  createManufacturer,
  createModel,
  deleteBrand,
  deleteCar,
  deleteCarImage,
  deleteCategory,
  deleteMaintenance,
  deleteManufacturer,
  deleteModel,
  getCarById,
  getCarWorkspace,
  getCatalogData,
  listAllCategoriesAdmin,
  listBranches,
  listCars,
  listCategories,
  markDamageRepaired,
  reorderCarImages,
  reportCarDamage,
  setCarPrice,
  setPrimaryCarImage,
  updateBrand,
  updateCar,
  updateCategory,
  updateManufacturer,
  updateModel,
} from './fleet.service.js';

export const fleetRouter = Router();

fleetRouter.use(authenticate);

// Cars
fleetRouter.get('/cars', validate({ query: listCarsQuerySchema }), async (req, res) => {
  const result = await listCars(req.query as unknown as ListCarsQuery, req.user!.branchID);
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

fleetRouter.get('/cars/:carID/workspace', validate({ params: carIdParamsSchema }), async (req, res) => {
  const data = await getCarWorkspace(Number(req.params.carID));
  res.json(data);
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

fleetRouter.delete(
  '/cars/:carID',
  requirePermission('MANAGE_CARS'),
  validate({ params: carIdParamsSchema }),
  async (req, res) => {
    await deleteCar(req.user!.userID, Number(req.params.carID));
    res.status(204).end();
  },
);

fleetRouter.post(
  '/cars/:carID/price',
  requirePermission('MANAGE_PRICES'),
  validate({ params: carIdParamsSchema, body: setCarPriceSchema }),
  async (req, res) => {
    const { dailyRate, effectiveFrom } = req.body as { dailyRate: number; effectiveFrom: string };
    await setCarPrice(req.user!.userID, Number(req.params.carID), dailyRate, effectiveFrom);
    res.status(201).json({ ok: true });
  },
);

fleetRouter.post(
  '/cars/:carID/maintenance',
  requirePermission('MANAGE_MAINTENANCE'),
  validate({ params: carIdParamsSchema, body: maintenanceBodySchema }),
  async (req, res) => {
    await createMaintenance(req.user!.userID, Number(req.params.carID), req.body);
    res.status(201).json({ ok: true });
  },
);

fleetRouter.delete(
  '/maintenance/:id',
  requirePermission('MANAGE_MAINTENANCE'),
  validate({ params: idParamsSchema }),
  async (req, res) => {
    await deleteMaintenance(req.user!.userID, Number(req.params.id));
    res.status(204).end();
  },
);

fleetRouter.post(
  '/cars/:carID/damages',
  requirePermission('MANAGE_DAMAGES'),
  validate({ params: carIdParamsSchema, body: reportDamageSchema }),
  async (req, res) => {
    const { reservationID, description, repairCost } = req.body as {
      reservationID?: number | null;
      description: string;
      repairCost?: number | null;
    };
    await reportCarDamage(
      req.user!.userID,
      Number(req.params.carID),
      reservationID ?? null,
      description,
      repairCost ?? null,
    );
    res.status(201).json({ ok: true });
  },
);

fleetRouter.patch(
  '/damages/:id/repaired',
  requirePermission('MANAGE_DAMAGES'),
  validate({ params: idParamsSchema, body: markRepairedSchema }),
  async (req, res) => {
    const { repairCost } = req.body as { repairCost: number };
    await markDamageRepaired(req.user!.userID, Number(req.params.id), repairCost);
    res.json({ ok: true });
  },
);

fleetRouter.patch(
  '/cars/:carID/images/reorder',
  requirePermission('MANAGE_CARS'),
  validate({ params: carIdParamsSchema, body: reorderImagesSchema }),
  async (req, res) => {
    const { imageIDs } = req.body as { imageIDs: number[] };
    const car = await reorderCarImages(req.user!.userID, Number(req.params.carID), imageIDs);
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

fleetRouter.post(
  '/models/bulk',
  requirePermission('MANAGE_CARS'),
  validate({ body: bulkModelsBodySchema }),
  async (req, res) => {
    const { items } = req.body as { items: { modelName: string; brandName: string }[] };
    const result = await bulkImportModels(req.user!.userID, items);
    res.status(201).json(result);
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

fleetRouter.get('/categories/all', async (_req, res) => {
  const categories = await listAllCategoriesAdmin();
  res.json({ items: categories });
});

fleetRouter.post(
  '/categories',
  requirePermission('MANAGE_CARS'),
  validate({ body: categoryBodySchema }),
  async (req, res) => {
    const category = await createCategory(req.body);
    res.status(201).json({ category });
  },
);

fleetRouter.patch(
  '/categories/:id',
  requirePermission('MANAGE_CARS'),
  validate({ params: idParamsSchema, body: categoryBodySchema }),
  async (req, res) => {
    const category = await updateCategory(Number(req.params.id), req.body);
    res.json({ category });
  },
);

fleetRouter.delete(
  '/categories/:id',
  requirePermission('MANAGE_CARS'),
  validate({ params: idParamsSchema }),
  async (req, res) => {
    await deleteCategory(Number(req.params.id));
    res.status(204).end();
  },
);
