import type { ApiResponse, ApiError } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';

export class ApiClientError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    const err = json as ApiError;
    throw new ApiClientError(err.error.message, err.error.code, res.status);
  }

  return json.data;
}

export const api = {
  get: <T = any>(path: string) => apiFetch<T>(path, { method: 'GET' }),
  post: <T = any>(path: string, body?: any) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T = any>(path: string, body?: any) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T = any>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};