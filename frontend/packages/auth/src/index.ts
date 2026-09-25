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

export async function register(name: string, email: string, password: string, role: Role = 'CITIZEN'): Promise<User> {
  const { data } = await apiClient.post<User>('/auth/register', { name, email, password, role });
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
    if (!payload) {
      logout();
      return false;
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    );
    const decoded = JSON.parse(atob(paddedPayload)) as Partial<DecodedToken>;
    const hasValidClaims =
      typeof decoded.sub === 'string' &&
      typeof decoded.exp === 'number' &&
      decoded.exp * 1000 > Date.now() &&
      typeof decoded.role === 'string' &&
      requiredRoles.includes(decoded.role as Role);

    if (!hasValidClaims) {
      logout();
      return false;
    }

    return true;
  } catch {
    logout();
    return false;
  }
}
