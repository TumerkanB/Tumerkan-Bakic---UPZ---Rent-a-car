import { apiRequest } from '../../lib/apiClient';

export interface UserProfile {
  userID: number;
  username: string;
  email: string;
  roleID: number;
  roleName: string;
  branchID: number | null;
  permissions: string[];
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export function loginRequest(username: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { username, password },
  });
}

export function fetchCurrentUser(): Promise<{ user: UserProfile }> {
  return apiRequest<{ user: UserProfile }>('/auth/me');
}
