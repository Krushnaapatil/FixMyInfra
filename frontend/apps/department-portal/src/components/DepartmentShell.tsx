import type { ReactNode } from 'react';
import { useState } from 'react';
import { ClipboardList, LogOut, Menu, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '@fixmyinfra/auth';
import { departmentNameFor } from '@fixmyinfra/types';
import brandLogo from '../assets/brand-logo.png';

interface DepartmentShellProps {
  children: ReactNode;
  title: string;
}

const navItems = [{ label: 'Assigned Queue', to: '/', icon: ClipboardList }];

export function DepartmentShell({ children, title }: DepartmentShellProps) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getCurrentUser();
  const departmentLabel = user?.departmentId ? departmentNameFor(user.departmentId) : 'All queues';

  function handleLogout() {
    logout();
    setMobileOpen(false);
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#f7fafa] text-[#0F2A2E]">
      <button type="button" className={`fixed inset-0 z-30 bg-[#0f2a2e]/30 transition-opacity lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setMobileOpen(false)} aria-label="Close navigation" />
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-white px-5 py-6 transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex items-start justify-between">
          <Link to="/" onClick={() => setMobileOpen(false)} aria-label="InfraFix home"><img src={brandLogo} alt="InfraFix — Solutions for your Infrastructure" className="h-auto w-full max-w-[190px]" /></Link>
          <button type="button" className="rounded-lg p-1 text-[#6d8987] lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>

        <nav className="mt-8" aria-label="Department navigation">
          <ul className="space-y-2.5">
            {navItems.map(({ label, to, icon: Icon }) => (
              <li key={label}>
                <NavLink
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? 'bg-[#e2f2ee] font-semibold text-[#0D7A6E]'
                        : 'border border-[#eef4f3] bg-white font-medium text-[#5b7371] hover:border-[#0D7A6E]/40 hover:text-[#0D7A6E]'
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

        <div className="mt-auto pt-6">
          <div className="mb-3 px-1">
            <p className="truncate text-sm font-bold text-[#0F2A2E]">{user?.name ?? 'Officer'}</p>
            <p className="mt-0.5 text-xs font-medium text-[#0D7A6E]">{departmentLabel}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-[#8aa09f] transition-colors hover:bg-[#fff1f1] hover:text-[#b84d4d]"
            aria-label="Log out"
          >
            <LogOut size={18} /><span>Log out</span>
          </button>
          <div className="mt-4 px-1">
            <span className="block h-1 w-12 rounded-full bg-[#0D7A6E]" />
            <p className="mt-2 text-xs font-medium leading-5 text-[#5b7371]">Cleaner Cities<br />Stronger Communities</p>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-60">
        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="mb-5 lg:hidden">
            <button type="button" onClick={() => setMobileOpen(true)} className="rounded-xl border border-[#e1edeb] bg-white p-2.5 text-[#0D7A6E] shadow-sm" aria-label="Open navigation"><Menu size={20} /></button>
          </div>
          <div className="mb-7">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0D7A6E]">Field operations · {departmentLabel}</p>
            <h1 className="text-3xl font-bold tracking-[-0.04em]">{title}</h1>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
