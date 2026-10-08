import { api } from './client';
import type { LoginRequest, LoginResponse, User } from '@/types';

export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  me: () => api.get<User>('/auth/me'),
  logout: () => api.post<{ message: string }>('/auth/logout'),
};