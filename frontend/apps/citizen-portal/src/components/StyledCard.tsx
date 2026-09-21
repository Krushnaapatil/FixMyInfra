import type { PropsWithChildren } from 'react';
import { Card as BaseCard } from '@fixmyinfra/ui-kit';

interface StyledCardProps extends PropsWithChildren {
  className?: string;
}

export function Card({ children, className = '' }: StyledCardProps) {
  return <div className={`portal-card ${className}`}><BaseCard>{children}</BaseCard></div>;
}
