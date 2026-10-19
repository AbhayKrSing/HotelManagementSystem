export type Role = 'GUEST' | 'HOST' | 'ADMIN';

export interface User {
  id?: string;
  email: string;
  name?: string;
  fullName?: string;
  roles?: Role[];
  enabled?: boolean;
  isEnabled?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  roles: Role[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  email: string;
  token: string;
  role: Role[] | Role;
}
