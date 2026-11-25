import { apiRequest } from '../../lib/apiClient';

export interface UserProfile {
  userID: number;
  username: string;
  email: string;
  roleID: number;
  roleName: string;
  branchID: number | null;
  branchName: string | null;
  permissions: string[];
  mustChangePassword?: boolean;
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

export function changeStaffPasswordRequest(
  currentPassword: string,
  newPassword: string,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/change-password', {
    method: 'POST',
    body: { currentPassword, newPassword },
  });
}

export function fetchCurrentUser(): Promise<{ user: UserProfile }> {
  return apiRequest<{ user: UserProfile }>('/auth/me');
}
