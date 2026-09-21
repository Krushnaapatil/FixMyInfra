import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

interface PageShellProps {
  children: ReactNode;
  title: string;
}

export function PageShell({ children, title }: PageShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className="min-h-screen bg-[#f7fafa]"><Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} /><main className="min-h-screen lg:pl-60"><div className="mx-auto max-w-5xl px-5 py-5 sm:px-8 lg:px-10"><TopHeader title={title} onMenuClick={() => setMobileOpen(true)} />{children}</div></main></div>;
}
