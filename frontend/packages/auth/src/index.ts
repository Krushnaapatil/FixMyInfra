import { apiClient } from '@fixmyinfra/api-client';

export type Role = 'CITIZEN' | 'OFFICER' | 'ADMIN';

export interface DecodedToken {
  sub: string;
  role: Role;
  departmentId?: string;
  exp: number;
}

export async function login(email: string, password: string) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  localStorage.setItem('fixmyinfra_token', data.token);
  return data;
}

export function logout() {
  localStorage.removeItem('fixmyinfra_token');
}

export function hasRole(required: Role): boolean {
  // TODO: decode JWT and compare role claim
  return true;
}
