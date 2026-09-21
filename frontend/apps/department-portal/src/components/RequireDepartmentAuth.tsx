import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasRole } from '@fixmyinfra/auth';

interface RequireDepartmentAuthProps {
  children: ReactNode;
}

export function RequireDepartmentAuth({ children }: RequireDepartmentAuthProps) {
  const location = useLocation();

  if (!hasRole(['OFFICER', 'ADMIN'])) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
