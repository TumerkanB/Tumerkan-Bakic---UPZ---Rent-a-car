import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STORAGE_KEYS } from '../../config/constants';
import {
  changeStaffPasswordRequest,
  fetchCurrentUser,
  loginRequest,
  type UserProfile,
} from './authApi';

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchCurrentUser()
      .then((res) => setUser(res.user))
      .catch(() => {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await loginRequest(username, password);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.token);
    setUser(res.user);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const res = await changeStaffPasswordRequest(currentPassword, newPassword);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (permission: string) => Boolean(user?.permissions.includes(permission)),
    [user],
  );

  const isAdmin = user?.roleName === 'Admin';

  const value = useMemo(
    () => ({ user, isLoading, isAdmin, login, changePassword, logout, hasPermission }),
    [user, isLoading, isAdmin, login, changePassword, logout, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
