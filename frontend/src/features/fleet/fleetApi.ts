import { apiRequest } from '../../lib/apiClient';

export interface CarItem {
  carID: number;
  plate: string;
  color: string | null;
  fuelType: 'Gas' | 'Diesel' | 'Electric' | 'Hybrid';
  status: 'Available' | 'Maintenance' | 'Inactive';
  currentMileage: number;
  modelID: number;
  modelName: string;
  brandName: string;
  manufacturerName: string;
  categoryID: number;
  categoryName: string;
  branchID: number;
  branchName: string;
  dailyRate: number | null;
  issues: string | null;
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

export function fetchBranches(): Promise<{ items: BranchItem[] }> {
  return apiRequest<{ items: BranchItem[] }>('/fleet/branches');
}

export function fetchCategories(): Promise<{ items: CategoryItem[] }> {
  return apiRequest<{ items: CategoryItem[] }>('/fleet/categories');
}
