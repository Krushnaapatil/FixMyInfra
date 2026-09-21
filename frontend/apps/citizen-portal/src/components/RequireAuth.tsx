import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasRole } from '@fixmyinfra/auth';

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();

  if (!hasRole(['CITIZEN'])) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
