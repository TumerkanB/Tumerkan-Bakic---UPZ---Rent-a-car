import { apiRequest } from '../../lib/apiClient';

export interface CountryRow {
  countryID: number;
  countryName: string;
  isoCode: string | null;
  phoneCode: string | null;
  flagUrl: string | null;
}

export interface CityRow {
  cityID: number;
  cityName: string;
  countryID: number;
  countryName: string;
}

export interface BranchAdminRow {
  branchID: number;
  branchName: string;
  phone: string | null;
  isActive: number;
  addressID: number;
  street: string;
  number: string;
  apt: string | null;
  zip: string;
  cityID: number;
  cityName: string;
  countryID: number;
  countryName: string;
  carCount: number;
}

export interface DropoffAdminRow {
  locationID: number;
  locationName: string;
  branchID: number;
  branchName: string;
  dropoffFee: number;
  isActive: number;
  addressID: number;
  street: string;
  number: string;
  apt: string | null;
  zip: string;
  cityID: number;
  cityName: string;
  countryID: number;
  countryName: string;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AddressInput {
  street: string;
  number: string;
  apt?: string | null;
  zip: string;
  cityID: number;
}

export function fetchCountries(params: { page: number; pageSize: number; q?: string; sort?: string; order?: 'asc' | 'desc' }) {
  return apiRequest<PagedResult<CountryRow>>('/countries', { query: params });
}

export function fetchAllCountries() {
  return apiRequest<{ data: CountryRow[] }>('/countries/all');
}

export function createCountry(body: Omit<CountryRow, 'countryID'>) {
  return apiRequest('/countries', { method: 'POST', body });
}

export function updateCountry(id: number, body: Omit<CountryRow, 'countryID'>) {
  return apiRequest(`/countries/${id}`, { method: 'PATCH', body });
}

export function deleteCountry(id: number) {
  return apiRequest(`/countries/${id}`, { method: 'DELETE' });
}

export function fetchCities(params: {
  page: number;
  pageSize: number;
  q?: string;
  countryID?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  return apiRequest<PagedResult<CityRow>>('/cities', { query: params });
}

export function fetchAllCities() {
  return apiRequest<{ data: CityRow[] }>('/cities/all');
}

export function createCity(cityName: string, countryID: number) {
  return apiRequest<{ city: { cityID: number; cityName: string; countryID: number } }>('/cities', {
    method: 'POST',
    body: { cityName, countryID },
  });
}

export function updateCity(id: number, cityName: string, countryID: number) {
  return apiRequest(`/cities/${id}`, { method: 'PATCH', body: { cityName, countryID } });
}

export function deleteCity(id: number) {
  return apiRequest(`/cities/${id}`, { method: 'DELETE' });
}

export function fetchBranchesAdmin(params: {
  page: number;
  pageSize: number;
  q?: string;
  isActive?: 'true' | 'false';
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  return apiRequest<PagedResult<BranchAdminRow>>('/branches', { query: params });
}

export function createBranch(body: { branchName: string; phone?: string | null; isActive: boolean; address: AddressInput }) {
  return apiRequest('/branches', { method: 'POST', body });
}

export function updateBranch(
  id: number,
  body: { branchName: string; phone?: string | null; isActive: boolean; address: AddressInput },
) {
  return apiRequest(`/branches/${id}`, { method: 'PATCH', body });
}

export function toggleBranchActive(id: number, isActive: boolean) {
  return apiRequest(`/branches/${id}/active`, { method: 'PATCH', body: { isActive } });
}

export function deleteBranch(id: number) {
  return apiRequest(`/branches/${id}`, { method: 'DELETE' });
}

export function fetchDropoffsAdmin(params: {
  page: number;
  pageSize: number;
  q?: string;
  isActive?: 'true' | 'false';
  branchID?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  return apiRequest<PagedResult<DropoffAdminRow>>('/dropoffs', { query: params });
}

export function createDropoff(body: {
  locationName: string;
  branchID: number;
  dropoffFee: number;
  isActive: boolean;
  address: AddressInput;
}) {
  return apiRequest('/dropoffs', { method: 'POST', body });
}

export function updateDropoff(
  id: number,
  body: {
    locationName: string;
    branchID: number;
    dropoffFee: number;
    isActive: boolean;
    address: AddressInput;
  },
) {
  return apiRequest(`/dropoffs/${id}`, { method: 'PATCH', body });
}

export function toggleDropoffActive(id: number, isActive: boolean) {
  return apiRequest(`/dropoffs/${id}/active`, { method: 'PATCH', body: { isActive } });
}

export function deleteDropoff(id: number) {
  return apiRequest(`/dropoffs/${id}`, { method: 'DELETE' });
}
