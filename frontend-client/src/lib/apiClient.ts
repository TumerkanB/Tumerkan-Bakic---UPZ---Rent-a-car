import { STORAGE_KEYS } from '../config/constants';
import { env } from '../config/env';

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, status: number, code = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
  const url = new URL(`${env.apiBaseUrl}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, headers: customHeaders, ...rest } = options;
  const token = localStorage.getItem(STORAGE_KEYS.CLIENT_TOKEN);

  const headers = new Headers(customHeaders);
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errObj = (payload as { error?: { message?: string; code?: string; details?: unknown } } | null)?.error;
    throw new ApiError(
      errObj?.message ?? `Request failed with status ${response.status}`,
      response.status,
      errObj?.code ?? 'API_ERROR',
      errObj?.details,
    );
  }

  return payload as T;
}
