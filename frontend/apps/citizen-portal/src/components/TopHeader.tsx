import { Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MobileMenuButton } from './Sidebar';

interface TopHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function TopHeader({ onMenuClick, title }: TopHeaderProps) {
  return <header className="mb-8 flex items-center justify-between gap-4"><div className="flex items-center gap-3"><MobileMenuButton onClick={onMenuClick} /><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-[#87a09e]">Citizen portal</p>{title && <h1 className="mt-1 text-xl font-bold text-[#0F2A2E]">{title}</h1>}</div></div><div className="flex items-center gap-3"><button type="button" className="hidden rounded-xl border border-[#e1edeb] bg-white p-2.5 text-[#6e8886] sm:block" aria-label="Search"><Search size={18} /></button><button type="button" className="relative rounded-xl border border-[#e1edeb] bg-white p-2.5 text-[#6e8886]" aria-label="Notifications"><Bell size={18} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e45b5b]" /></button><Link to="/home" className="flex items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c9eee6] text-sm font-bold text-[#0D7A6E]">AM</span><span className="hidden text-sm font-semibold text-[#294746] md:block">Aarav Mehta</span></Link></div></header>;
}
