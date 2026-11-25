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
  phone?: string;
  dateOfBirth?: string;
  username: string;
  password: string;
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
