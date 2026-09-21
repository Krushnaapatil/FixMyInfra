import { apiClient } from '@fixmyinfra/api-client';
import type { User } from '@fixmyinfra/types';

export type Role = User['role'];

export interface DecodedToken {
  sub: string;
  role: Role;
  departmentId?: string;
  exp: number;
}

interface AuthResponse {
  token: string;
  user: User;
}

const tokenStorageKey = 'fixmyinfra_token';
const userStorageKey = 'fixmyinfra_user';

function storeAuth(response: AuthResponse) {
  localStorage.setItem(tokenStorageKey, response.token);
  localStorage.setItem(userStorageKey, JSON.stringify(response.user));
  return response;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  return storeAuth(data);
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const { data } = await apiClient.post<User>('/auth/register', { name, email, password });
  return data;
}

export function logout() {
  localStorage.removeItem(tokenStorageKey);
  localStorage.removeItem(userStorageKey);
}

export function getCurrentUser(): User | null {
  const storedUser = localStorage.getItem(userStorageKey);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
}

export function hasRole(requiredRoles: Role[]): boolean {
  const token = localStorage.getItem(tokenStorageKey);
  if (!token || requiredRoles.length === 0) return false;

  try {
    const payload = token.split('.')[1];
    if (!payload) return false;
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalizedPayload)) as Partial<DecodedToken>;
    return typeof decoded.role === 'string' && requiredRoles.includes(decoded.role as Role);
  } catch {
    return false;
  }
}
