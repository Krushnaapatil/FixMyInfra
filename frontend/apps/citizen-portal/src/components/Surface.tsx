import type { ReactNode } from 'react';
import { Card } from './StyledCard';

interface SurfaceProps {
  children: ReactNode;
  className?: string;
}

export function Surface({ children, className = '' }: SurfaceProps) {
  return <Card className={className}>{children}</Card>;
}
