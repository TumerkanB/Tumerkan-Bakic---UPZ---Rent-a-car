import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STORAGE_KEYS } from '../../config/constants';
import {
  clientLoginRequest,
  clientRegisterRequest,
  fetchCurrentClient,
  type ClientProfile,
  type ClientRegisterPayload,
} from './clientAuthApi';

interface ClientAuthContextValue {
  client: ClientProfile | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: ClientRegisterPayload) => Promise<void>;
  logout: () => void;
}

const ClientAuthContext = createContext<ClientAuthContextValue | null>(null);

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.CLIENT_TOKEN);
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchCurrentClient()
      .then((res) => setClient(res.client))
      .catch(() => {
        localStorage.removeItem(STORAGE_KEYS.CLIENT_TOKEN);
        setClient(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await clientLoginRequest(username, password);
    localStorage.setItem(STORAGE_KEYS.CLIENT_TOKEN, res.token);
    setClient(res.client);
  }, []);

  const register = useCallback(async (payload: ClientRegisterPayload) => {
    const res = await clientRegisterRequest(payload);
    localStorage.setItem(STORAGE_KEYS.CLIENT_TOKEN, res.token);
    setClient(res.client);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.CLIENT_TOKEN);
    setClient(null);
  }, []);

  const value = useMemo(
    () => ({ client, isLoading, login, register, logout }),
    [client, isLoading, login, register, logout],
  );

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>;
}

export function useClientAuth(): ClientAuthContextValue {
  const ctx = useContext(ClientAuthContext);
  if (!ctx) {
    throw new Error('useClientAuth must be used within ClientAuthProvider');
  }
  return ctx;
}
