import { apiRequest } from '../../lib/apiClient';

export interface ClientProfile {
  tokenType: 'client';
  clientID: number;
  username: string;
  email: string;
  name: string;
  surname: string;
}

export interface ClientAuthResponse {
  token: string;
  client: ClientProfile;
}

export interface ClientRegisterPayload {
  name: string;
  surname: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: {
    street: string;
    number: string;
    apt?: string;
    zip: string;
    cityID: number;
  };
  username: string;
  password: string;
}

export interface GeoCountry {
  countryID: number;
  countryName: string;
  phoneCode: string;
  flagIcon: string | null;
}

export interface GeoResponse {
  countries: GeoCountry[];
  cities: { cityID: number; cityName: string; countryID: number }[];
}

export function fetchGeo(): Promise<GeoResponse> {
  return apiRequest<GeoResponse>('/public/geo');
}

export function checkClientAvailability(params: {
  email?: string;
  phone?: string;
  username?: string;
}): Promise<{ emailTaken?: boolean; phoneTaken?: boolean; usernameTaken?: boolean }> {
  return apiRequest('/client/auth/check-availability', {
    query: params,
  });
}

export function clientLoginRequest(username: string, password: string): Promise<ClientAuthResponse> {
  return apiRequest<ClientAuthResponse>('/client/auth/login', {
    method: 'POST',
    body: { username, password },
  });
}

export function clientRegisterRequest(payload: ClientRegisterPayload): Promise<ClientAuthResponse> {
  return apiRequest<ClientAuthResponse>('/client/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function fetchCurrentClient(): Promise<{ client: ClientProfile }> {
  return apiRequest<{ client: ClientProfile }>('/client/auth/me');
}
