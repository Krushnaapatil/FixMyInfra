import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { hasRole } from '@fixmyinfra/auth';

export function RequireAdminAuth({ children }: { children: ReactNode }) {
  return hasRole(['ADMIN']) ? <>{children}</> : <Navigate to="/login" replace />;
}
