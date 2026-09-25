import { MobileMenuButton } from './Sidebar';

interface TopHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function TopHeader({ onMenuClick, title }: TopHeaderProps) {
  return <header className="mb-8 flex items-center gap-3"><MobileMenuButton onClick={onMenuClick} /><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-[#87a09e]">Citizen portal</p>{title && <h1 className="mt-1 text-xl font-bold text-[#0F2A2E]">{title}</h1>}</div></header>;
}
