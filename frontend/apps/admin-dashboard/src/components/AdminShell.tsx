import type { ReactNode } from 'react';
import { Building2, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getComplaints } from '@fixmyinfra/api-client';
import { getCurrentUser, logout } from '@fixmyinfra/auth';
import brandLogo from '../assets/brand-logo.png';

interface AdminShellProps {
  children: ReactNode;
  title?: string;
  eyebrow?: string;
}

const tabs = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/departments', label: 'Departments', icon: Building2, end: false },
  { to: '/users', label: 'Users', icon: Users, end: false }
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'A';
}

export function AdminShell({ children, title, eyebrow }: AdminShellProps) {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const name = user?.name ?? 'Administrator';
  const healthQuery = useQuery({ queryKey: ['admin-complaints'], queryFn: getComplaints, retry: 1 });
  const operational = !healthQuery.isError;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#f4f8f7] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-white px-5 py-6 lg:flex" aria-label="Admin navigation">
        <Link to="/" className="px-1">
          <img src={brandLogo} alt="InfraFix — Solutions for your Infrastructure" className="h-11 w-auto" />
        </Link>
        <nav className="mt-10" aria-label="Admin sections">
          <ul className="space-y-1">
            {tabs.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                      isActive ? 'bg-[#e9f7f4] text-[#0D7A6E]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={1.9} />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4" role="status">
            <p className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span className={`h-2 w-2 rounded-full ${operational ? 'bg-green-500' : 'bg-red-500'}`} />
              System Status
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {healthQuery.isPending ? 'Checking API…' : operational ? 'All systems operational' : 'API unreachable'}
            </p>
          </div>
          <p className="px-1 text-xs font-semibold leading-5 text-slate-500">
            Cleaner Cities<br />
            <span className="text-[#0D7A6E]">Stronger Communities</span>
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={18} /> Log out
          </button>
        </div>
      </aside>
      <div className="lg:pl-60">
        <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 lg:hidden">InfraFix Admin</p>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-right text-sm sm:block">
              <strong className="block">{name}</strong>
              <span className="text-xs uppercase text-slate-500">Admin</span>
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-white" aria-hidden="true">
              {initials(name)}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 lg:hidden"
            >
              Log out
            </button>
          </div>
        </div>
        <nav aria-label="Admin sections" className="border-b border-slate-200 bg-white px-5 sm:px-8 lg:hidden">
          <ul className="flex gap-1 overflow-x-auto">
            {tabs.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                      isActive ? 'border-teal-700 text-teal-800' : 'border-transparent text-slate-500'
                    }`
                  }
                >
                  <Icon size={16} /> {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          {title && (
            <div className="mb-7">
              {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{eyebrow}</p>}
              <h1 className="text-3xl font-bold tracking-[-0.02em]">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
