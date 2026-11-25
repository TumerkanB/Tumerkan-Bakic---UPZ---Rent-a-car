import { apiRequest } from '../../lib/apiClient';

export interface CountryOption {
  countryID: number;
  countryName: string;
}

export interface CityOption {
  cityID: number;
  cityName: string;
  countryID: number;
}

export interface PublicLocationsResponse {
  pickupCountries: CountryOption[];
  pickupCities: CityOption[];
  dropoffCountries: CountryOption[];
  dropoffCities: CityOption[];
}

export interface ManufacturerOption {
  manufacturerID: number;
  manufacturerName: string;
  logoUrl: string | null;
}

export interface BrandOption {
  brandID: number;
  brandName: string;
  logoUrl: string | null;
  manufacturerID: number;
}

export interface PublicFilterOptions {
  categories: { categoryID: number; categoryName: string; depositAmount: number }[];
  manufacturers: ManufacturerOption[];
  brands: BrandOption[];
  branches: { branchID: number; branchName: string; cityName: string; countryName: string }[];
  colors: string[];
  fuelTypes: ('Gas' | 'Diesel' | 'Electric' | 'Hybrid')[];
  transmissions: ('Manual' | 'Automatic')[];
}

export interface PublicCarItem {
  carID: number;
  plate: string;
  color: string | null;
  fuelType: 'Gas' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Manual' | 'Automatic';
  currentMileage: number;
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
  depositAmount: number;
  branchID: number;
  branchName: string;
  pickupCityID: number;
  pickupCityName: string;
  pickupCountryID: number;
  pickupCountryName: string;
  dailyRate: number | null;
  periodTotalPrice: number | null;
  isExactAvailable: number;
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

export type SortOption = 'price_asc' | 'price_desc' | 'mileage_asc' | 'newest';

export interface PublicCarSearchParams {
  pickupCountryID?: number;
  pickupCityID?: number;
  dropoffCountryID?: number;
  dropoffCityID?: number;
  startDate?: string;
  endDate?: string;
  flexDays?: number;
  crossBorder?: boolean;
  categoryID?: number;
  manufacturerID?: number;
  brandID?: number;
  branchID?: number;
  fuelType?: string;
  transmission?: string;
  color?: string;
  minDailyRate?: number;
  maxDailyRate?: number;
  maxMileage?: number;
  sortBy?: SortOption;
  search?: string;
}

export function fetchPublicLocations(): Promise<PublicLocationsResponse> {
  return apiRequest<PublicLocationsResponse>('/public/locations');
}

export function fetchPublicFilterOptions(): Promise<PublicFilterOptions> {
  return apiRequest<PublicFilterOptions>('/public/filter-options');
}

export function fetchPublicCars(params: PublicCarSearchParams): Promise<PaginatedResponse<PublicCarItem>> {
  return apiRequest<PaginatedResponse<PublicCarItem>>('/public/cars', {
    query: {
      pickupCountryID: params.pickupCountryID,
      pickupCityID: params.pickupCityID,
      dropoffCountryID: params.dropoffCountryID,
      dropoffCityID: params.dropoffCityID,
      startDate: params.startDate,
      endDate: params.endDate,
      flexDays: params.flexDays,
      crossBorder: params.crossBorder ? 'true' : undefined,
      categoryID: params.categoryID,
      manufacturerID: params.manufacturerID,
      brandID: params.brandID,
      branchID: params.branchID,
      fuelType: params.fuelType,
      transmission: params.transmission,
      color: params.color,
      minDailyRate: params.minDailyRate,
      maxDailyRate: params.maxDailyRate,
      maxMileage: params.maxMileage,
      sortBy: params.sortBy,
      search: params.search,
    },
  });
}

export function fetchPublicCategories(): Promise<{ items: PublicCategoryItem[] }> {
  return apiRequest<{ items: PublicCategoryItem[] }>('/public/categories');
}
