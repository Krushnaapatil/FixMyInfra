import type { ReactNode } from 'react';
import { ClipboardList, LogOut, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '@fixmyinfra/auth';

interface DepartmentShellProps {
  children: ReactNode;
  title: string;
}

export function DepartmentShell({ children, title }: DepartmentShellProps) {
  const navigate = useNavigate();
  const user = getCurrentUser();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return <div className="min-h-screen bg-[#f5f8f7] text-[#163638]"><header className="border-b border-[#dfeae7] bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8"><Link to="/" className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173f42] text-white"><ShieldCheck size={20} /></span><span><span className="block text-sm font-bold tracking-[-0.02em] text-[#173f42]">InfraFix Operations</span><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#78908e]">Department portal</span></span></Link><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-[#315250]">{user?.name ?? 'Officer'}</p><p className="text-xs uppercase tracking-[0.12em] text-[#7b9592]">{user?.role ?? 'OFFICER'}</p></div><button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg border border-[#dce9e6] px-3 py-2 text-sm font-semibold text-[#526f6c] transition hover:border-[#0D7A6E] hover:text-[#0D7A6E]" aria-label="Log out"><LogOut size={16} /> <span className="hidden sm:inline">Log out</span></button></div></div></header><main className="mx-auto max-w-6xl px-5 py-8 sm:px-8"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0D7A6E]"><ClipboardList size={14} /> Field operations</p><h1 className="text-3xl font-bold tracking-[-0.04em] text-[#163638]">{title}</h1></div></div>{children}</main></div>;
}
