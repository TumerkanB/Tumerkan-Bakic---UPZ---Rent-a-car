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
}

export interface ManufacturerItem {
  manufacturerID: number;
  name: string;
  logoUrl: string | null;
}

export interface BrandItem {
  brandID: number;
  brandName: string;
  manufacturerID: number;
  manufacturerName: string;
  logoUrl: string | null;
}

export interface ModelItem {
  modelID: number;
  modelName: string;
  brandID: number;
  brandName: string;
  manufacturerID: number;
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
  search?: string;
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
      search: filter.search,
    },
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
