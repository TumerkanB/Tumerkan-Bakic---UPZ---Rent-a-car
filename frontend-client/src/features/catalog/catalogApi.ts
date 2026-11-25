import { apiRequest } from '../../lib/apiClient';

export interface PublicCarItem {
  carID: number;
  plate: string;
  color: string | null;
  fuelType: 'Gas' | 'Diesel' | 'Electric' | 'Hybrid';
  modelName: string;
  brandName: string;
  manufacturerName: string;
  categoryID: number;
  categoryName: string;
  branchID: number;
  branchName: string;
  dailyRate: number | null;
}

export interface PublicBranchItem {
  branchID: number;
  branchName: string;
  cityName: string;
  countryName: string;
}

export interface PublicCategoryItem {
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

export function fetchPublicCars(filter: {
  branchID?: number;
  categoryID?: number;
  search?: string;
}): Promise<PaginatedResponse<PublicCarItem>> {
  return apiRequest<PaginatedResponse<PublicCarItem>>('/public/cars', {
    query: {
      branchID: filter.branchID,
      categoryID: filter.categoryID,
      search: filter.search,
    },
  });
}

export function fetchPublicBranches(): Promise<{ items: PublicBranchItem[] }> {
  return apiRequest<{ items: PublicBranchItem[] }>('/public/branches');
}

export function fetchPublicCategories(): Promise<{ items: PublicCategoryItem[] }> {
  return apiRequest<{ items: PublicCategoryItem[] }>('/public/categories');
}
