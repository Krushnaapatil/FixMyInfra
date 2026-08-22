import { PropsWithChildren } from 'react';

export function Card({ children }: PropsWithChildren) {
  return <div className="border rounded-lg p-4 shadow-sm bg-white">{children}</div>;
}
