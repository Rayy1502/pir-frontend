// User
export interface User {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  divisi: string;
  unit: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Auth
export interface LoginRequest {
  nip: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

// API
export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  meta?: any;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;