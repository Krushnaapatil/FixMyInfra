import { Bell, CircleHelp, FileText, Home, LogOut, Menu, UserRound, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '@fixmyinfra/auth';
import { Brand } from './Brand';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { label: 'Home', to: '/home', icon: Home },
  { label: 'Report Grievance', to: '/', icon: FileText },
  { label: 'My Complaints', to: '/complaints', icon: FileText },
  { label: 'Notifications', to: '/home', icon: Bell, badge: '2' },
  { label: 'Profile', to: '/home', icon: UserRound },
  { label: 'Help and Support', to: '/home', icon: CircleHelp }
];

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    onMobileClose?.();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <button type="button" className={`fixed inset-0 z-30 bg-[#0f2a2e]/30 transition-opacity lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={onMobileClose} aria-label="Close navigation" />
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-[#e5efed] bg-white px-5 py-6 transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-start justify-between"><Link to="/home" onClick={onMobileClose}><Brand /></Link><button type="button" className="rounded-lg p-1 text-[#6d8987] lg:hidden" onClick={onMobileClose} aria-label="Close menu"><X size={20} /></button></div>
        <nav className="mt-12 space-y-1" aria-label="Main navigation">
          {navItems.map(({ label, to, icon: Icon, badge }) => <NavLink key={label} to={to} onClick={onMobileClose} className={({ isActive }) => `group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-[#e9f7f4] text-[#0D7A6E]' : 'text-[#718987] hover:bg-[#f3f8f7] hover:text-[#0D7A6E]'}`}><Icon size={18} strokeWidth={1.9} /><span>{label}</span>{badge && <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e45b5b] px-1 text-[10px] font-bold text-white">{badge}</span>}</NavLink>)}
        </nav>
        <div className="mt-auto"><div className="rounded-2xl bg-[#f5faf9] p-4"><p className="text-xs font-semibold leading-5 text-[#446866]">Cleaner Cities<br /><span className="text-[#0D7A6E]">Stronger Communities</span></p><div className="mt-4 h-1 w-16 rounded-full bg-[#14B8A6]" /></div><button type="button" onClick={handleLogout} className="mt-4 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-[#718987] transition-colors hover:bg-[#fff1f1] hover:text-[#b84d4d]" aria-label="Log out"><LogOut size={18} /><span>Log out</span></button></div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="rounded-xl border border-[#e1edeb] bg-white p-2.5 text-[#0D7A6E] shadow-sm lg:hidden" aria-label="Open navigation"><Menu size={20} /></button>;
}
