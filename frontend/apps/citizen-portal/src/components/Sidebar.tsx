import { Bell, CircleHelp, Flag, Home, LogOut, Menu, SquarePen, UserRound, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '@fixmyinfra/auth';
import brandLogo from '../assets/brand-logo.png';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  activeCount?: number;
}

export function Sidebar({ mobileOpen = false, onMobileClose, activeCount = 0 }: SidebarProps) {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', to: '/home', icon: Home },
    { label: 'Report Grievance', to: '/', icon: Flag },
    { label: 'My Complaints', to: '/complaints', icon: SquarePen },
    { label: 'Notifications', to: '/notifications', icon: Bell, badge: activeCount > 0 ? activeCount : undefined },
    { label: 'Profile', to: '/profile', icon: UserRound },
    { label: 'Help and Support', to: '/support', icon: CircleHelp }
  ];

  function handleLogout() {
    logout();
    onMobileClose?.();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <button type="button" className={`fixed inset-0 z-30 bg-[#0f2a2e]/30 transition-opacity lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={onMobileClose} aria-label="Close navigation" />
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-white px-5 py-6 transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex items-start justify-between">
          <Link to="/home" onClick={onMobileClose} aria-label="InfraFix home"><img src={brandLogo} alt="InfraFix — Solutions for your Infrastructure" className="h-auto w-full max-w-[190px]" /></Link>
          <button type="button" className="rounded-lg p-1 text-[#6d8987] lg:hidden" onClick={onMobileClose} aria-label="Close menu"><X size={20} /></button>
        </div>

        <nav className="mt-8" aria-label="Main navigation">
          <ul className="space-y-2.5">
            {navItems.map(({ label, to, icon: Icon, badge }) => (
              <li key={label}>
                <NavLink
                  to={to}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? 'bg-[#e2f2ee] font-semibold text-[#0D7A6E]'
                        : 'border border-[#eef4f3] bg-white font-medium text-[#5b7371] hover:border-[#0D7A6E]/40 hover:text-[#0D7A6E]'
                    }`
                  }
                >
                  <Icon size={20} strokeWidth={1.9} />
                  <span>{label}</span>
                  {badge !== undefined && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e5484d] px-1.5 text-[10px] font-bold text-white">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-6">
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
          <p className="mt-4 px-1 text-[11px] text-[#9db3b1]">{activeCount} active {activeCount === 1 ? 'report' : 'reports'}</p>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="rounded-xl border border-[#e1edeb] bg-white p-2.5 text-[#0D7A6E] shadow-sm lg:hidden" aria-label="Open navigation"><Menu size={20} /></button>;
}
