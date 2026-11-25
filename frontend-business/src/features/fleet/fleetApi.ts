import { apiRequest } from '../../lib/apiClient';

export interface CarImageItem {
  imageID: number;
  carID: number;
  fileReference: string;
  caption: string | null;
  sortOrder: number;
  isPrimary: number;
}

export interface CarItem {
  carID: number;
  plate: string;
  color: string | null;
  fuelType: 'Gas' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Manual' | 'Automatic';
  status: 'Available' | 'Maintenance' | 'Inactive';
  currentMileage: number;
  insuranceExpiry: string | null;
  registrationExpiry: string | null;
  inspectionExpiry: string | null;
  nextServiceDate: string | null;
  nextServiceMileage: number | null;
  modelID: number;
  modelName: string;
  brandID: number;
  brandName: string;
  brandLogo: string | null;
  manufacturerID: number;
  manufacturerName: string;
  manufacturerLogo: string | null;
  thumbnail: string | null;
  categoryID: number;
  categoryName: string;
  branchID: number;
  branchName: string;
  dailyRate: number | null;
  issues: string | null;
  images?: CarImageItem[];
}

export interface BranchItem {
  branchID: number;
  branchName: string;
  cityName: string;
  countryName: string;
  phone: string | null;
  isActive: number;
}

export interface CategoryItem {
  categoryID: number;
  categoryName: string;
  description: string | null;
  depositAmount: number;
  isActive?: number;
  currentBaseRate?: number | null;
}

export interface ManufacturerItem {
  manufacturerID: number;
  name: string;
  logoUrl: string | null;
  brandCount?: number;
}

export interface BrandItem {
  brandID: number;
  brandName: string;
  manufacturerID: number;
  manufacturerName: string;
  logoUrl: string | null;
  modelCount?: number;
}

export interface ModelItem {
  modelID: number;
  modelName: string;
  brandID: number;
  brandName: string;
  manufacturerID: number;
  carCount?: number;
}

export interface CatalogDataResponse {
  manufacturers: ManufacturerItem[];
  brands: BrandItem[];
  models: ModelItem[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CarsFilter {
  page?: number;
  pageSize?: number;
  status?: string;
  branchID?: number;
  categoryID?: number;
  brandID?: number;
  fuelType?: string;
  transmission?: string;
  expiringSoon?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface CarWorkspaceResponse {
  car: CarItem;
  pricing: {
    effectiveDailyRate: number | null;
    priceSource: string;
    priceHistory: { priceID: number; dailyRate: number; effectiveFrom: string; effectiveTo: string | null }[];
    priceAuditLog: {
      auditID: number;
      oldDailyRate: number | null;
      newDailyRate: number | null;
      actionType: string;
      changedAt: string;
      changedBy: string;
      changedByUser: string | null;
    }[];
  };
  maintenance: {
    maintenanceID: number;
    serviceType: string;
    serviceDate: string;
    mileage: number;
    cost: number;
    description: string | null;
    performedBy: string | null;
    nextDueDate: string | null;
    nextDueMileage: number | null;
    loggedBy: string | null;
  }[];
  damages: {
    damageID: number;
    reservationID: number | null;
    reportDate: string;
    description: string;
    repairCost: number | null;
    isRepaired: number;
    billedChargeID: number | null;
    reportedBy: string | null;
  }[];
  fines: {
    fineID: number;
    fineType: string;
    occurredAt: string;
    amount: number;
    referenceNo: string | null;
    description: string | null;
    status: string;
    reservationID: number | null;
  }[];
  reservations: {
    reservationID: number;
    startDate: string;
    endDate: string;
    status: string;
    totalPrice: number | null;
    clientName: string;
    pickupBranch: string;
  }[];
}

export interface CreateCarPayload {
  modelID: number;
  categoryID: number;
  branchID: number;
  plate: string;
  color?: string | null;
  fuelType: 'Gas' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Manual' | 'Automatic';
  status: 'Available' | 'Maintenance' | 'Inactive';
  currentMileage: number;
  insuranceExpiry?: string | null;
  registrationExpiry?: string | null;
  inspectionExpiry?: string | null;
  nextServiceDate?: string | null;
  nextServiceMileage?: number | null;
  initialImageUrl?: string | null;
}

export type UpdateCarPayload = Partial<Omit<CreateCarPayload, 'initialImageUrl'>>;

export function fetchCars(filter: CarsFilter = {}): Promise<PaginatedResponse<CarItem>> {
  return apiRequest<PaginatedResponse<CarItem>>('/fleet/cars', {
    query: {
      page: filter.page,
      pageSize: filter.pageSize,
      status: filter.status,
      branchID: filter.branchID,
      categoryID: filter.categoryID,
      brandID: filter.brandID,
      fuelType: filter.fuelType,
      transmission: filter.transmission,
      expiringSoon: filter.expiringSoon ? 'true' : undefined,
      sort: filter.sort,
      order: filter.order,
      search: filter.search,
    },
  });
}

export function fetchCarWorkspace(carID: number): Promise<CarWorkspaceResponse> {
  return apiRequest<CarWorkspaceResponse>(`/fleet/cars/${carID}/workspace`);
}

export function deleteCar(carID: number) {
  return apiRequest(`/fleet/cars/${carID}`, { method: 'DELETE' });
}

export function reorderCarImages(carID: number, imageIDs: number[]): Promise<{ car: CarItem }> {
  return apiRequest<{ car: CarItem }>(`/fleet/cars/${carID}/images/reorder`, {
    method: 'PATCH',
    body: { imageIDs },
  });
}

export function setCarPrice(carID: number, dailyRate: number, effectiveFrom: string) {
  return apiRequest(`/fleet/cars/${carID}/price`, {
    method: 'POST',
    body: { dailyRate, effectiveFrom },
  });
}

export function createMaintenance(
  carID: number,
  body: {
    serviceType: string;
    serviceDate: string;
    mileage: number;
    cost: number;
    description?: string | null;
    performedBy?: string | null;
    nextDueDate?: string | null;
    nextDueMileage?: number | null;
  },
) {
  return apiRequest(`/fleet/cars/${carID}/maintenance`, { method: 'POST', body });
}

export function deleteMaintenance(id: number) {
  return apiRequest(`/fleet/maintenance/${id}`, { method: 'DELETE' });
}

export function reportCarDamage(
  carID: number,
  body: { reservationID?: number | null; description: string; repairCost?: number | null },
) {
  return apiRequest(`/fleet/cars/${carID}/damages`, { method: 'POST', body });
}

export function markDamageRepaired(damageID: number, repairCost: number) {
  return apiRequest(`/fleet/damages/${damageID}/repaired`, {
    method: 'PATCH',
    body: { repairCost },
  });
}

export function fetchCarById(carID: number): Promise<{ car: CarItem }> {
  return apiRequest<{ car: CarItem }>(`/fleet/cars/${carID}`);
}

export function createCar(payload: CreateCarPayload): Promise<{ car: CarItem }> {
  return apiRequest<{ car: CarItem }>('/fleet/cars', { method: 'POST', body: payload });
}

export function updateCar(carID: number, payload: UpdateCarPayload): Promise<{ car: CarItem }> {
  return apiRequest<{ car: CarItem }>(`/fleet/cars/${carID}`, { method: 'PATCH', body: payload });
}

export function addCarImage(
  carID: number,
  fileReference: string,
  caption: string | null,
  makePrimary: boolean,
): Promise<{ car: CarItem }> {
  return apiRequest<{ car: CarItem }>(`/fleet/cars/${carID}/images`, {
    method: 'POST',
    body: { fileReference, caption, makePrimary },
  });
}

export function setPrimaryCarImage(carID: number, imageID: number): Promise<{ car: CarItem }> {
  return apiRequest<{ car: CarItem }>(`/fleet/cars/${carID}/images/${imageID}/primary`, {
    method: 'PATCH',
  });
}

export function deleteCarImage(carID: number, imageID: number): Promise<{ car: CarItem }> {
  return apiRequest<{ car: CarItem }>(`/fleet/cars/${carID}/images/${imageID}`, {
    method: 'DELETE',
  });
}

export function fetchBranches(): Promise<{ items: BranchItem[] }> {
  return apiRequest<{ items: BranchItem[] }>('/fleet/branches');
}

export function fetchCategories(): Promise<{ items: CategoryItem[] }> {
  return apiRequest<{ items: CategoryItem[] }>('/fleet/categories');
}

export function fetchCatalogData(): Promise<CatalogDataResponse> {
  return apiRequest<CatalogDataResponse>('/fleet/catalog');
}

export function createManufacturer(name: string, logoUrl?: string | null) {
  return apiRequest('/fleet/manufacturers', { method: 'POST', body: { name, logoUrl: logoUrl || null } });
}

export function updateManufacturer(id: number, name: string, logoUrl?: string | null) {
  return apiRequest(`/fleet/manufacturers/${id}`, { method: 'PATCH', body: { name, logoUrl: logoUrl || null } });
}

export function deleteManufacturer(id: number) {
  return apiRequest(`/fleet/manufacturers/${id}`, { method: 'DELETE' });
}

export function createBrand(brandName: string, manufacturerID: number, logoUrl?: string | null) {
  return apiRequest('/fleet/brands', {
    method: 'POST',
    body: { brandName, manufacturerID, logoUrl: logoUrl || null },
  });
}

export function updateBrand(id: number, brandName: string, manufacturerID: number, logoUrl?: string | null) {
  return apiRequest(`/fleet/brands/${id}`, {
    method: 'PATCH',
    body: { brandName, manufacturerID, logoUrl: logoUrl || null },
  });
}

export function deleteBrand(id: number) {
  return apiRequest(`/fleet/brands/${id}`, { method: 'DELETE' });
}

export function createModel(modelName: string, brandID: number) {
  return apiRequest('/fleet/models', { method: 'POST', body: { modelName, brandID } });
}

export function updateModel(id: number, modelName: string, brandID: number) {
  return apiRequest(`/fleet/models/${id}`, { method: 'PATCH', body: { modelName, brandID } });
}

export function deleteModel(id: number) {
  return apiRequest(`/fleet/models/${id}`, { method: 'DELETE' });
}

export function bulkImportModels(items: { modelName: string; brandName: string }[]) {
  return apiRequest<{ insertedCount: number; skippedCount: number; errors: string[] }>(
    '/fleet/models/bulk',
    { method: 'POST', body: { items } },
  );
}

export function fetchAllCategoriesAdmin(): Promise<{ items: CategoryItem[] }> {
  return apiRequest<{ items: CategoryItem[] }>('/fleet/categories/all');
}

export function createCategory(body: {
  categoryName: string;
  description?: string | null;
  depositAmount: number;
  isActive: boolean;
}) {
  return apiRequest('/fleet/categories', { method: 'POST', body });
}

export function updateCategory(
  id: number,
  body: {
    categoryName: string;
    description?: string | null;
    depositAmount: number;
    isActive: boolean;
  },
) {
  return apiRequest(`/fleet/categories/${id}`, { method: 'PATCH', body });
}

export function deleteCategory(id: number) {
  return apiRequest(`/fleet/categories/${id}`, { method: 'DELETE' });
}
