import { CalendarDays, ChevronRight, CircleHelp, Sparkles } from 'lucide-react';
import { Card } from '../components/StyledCard';
import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { ReportCTA } from '../components/ReportCTA';
import { IssuesMap } from '../components/IssuesMap';
import { RecentUpdates } from '../components/RecentUpdates';
import { ImpactCard } from '../components/ImpactCard';
import { TrustScoreRing } from '../components/TrustScoreRing';

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className="min-h-screen bg-[#f7fafa] text-[#0F2A2E]"><Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} /><main className="min-h-screen lg:pl-60"><div className="mx-auto max-w-[1440px] px-5 py-5 sm:px-8 lg:px-10"><TopHeader onMenuClick={() => setMobileOpen(true)} /><div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold tracking-[-0.04em] sm:text-[28px]">Good Morning, Aarav! <span aria-hidden="true">👋</span></h2><p className="mt-1.5 text-sm text-[#78908e]">Let&apos;s keep our city better, together.</p></div><div className="hidden items-center gap-2 text-xs text-[#78908e] sm:flex"><CalendarDays size={15} /> Monday, 23 September 2024</div></div><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]"><div className="min-w-0 space-y-6"><ReportCTA /><div className="grid gap-6 2xl:grid-cols-[minmax(0,1.08fr)_minmax(300px,.92fr)]"><IssuesMap /><RecentUpdates /></div></div><aside className="space-y-5"><ImpactCard /><Card className="!rounded-2xl !border-0 !p-5 !shadow-sm"><div className="flex items-start justify-between"><div><h2 className="text-base font-bold text-[#17393b]">Your Activity</h2><p className="mt-1 text-xs text-[#8aa09f]">Your recent contribution</p></div><CircleHelp size={17} className="text-[#9ab1af]" /></div><div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#d6e7e3] px-4 py-6 text-center"><Sparkles size={22} className="text-[#9acbc2]" /><p className="mt-2 text-xs font-medium text-[#77918f]">Your activity will appear here</p><p className="mt-1 text-[10px] text-[#a0b2b1]">Report an issue to get started</p></div></Card><Card className="!rounded-2xl !border-0 !p-5 !shadow-sm"><div className="flex items-start justify-between"><div><h2 className="text-base font-bold text-[#17393b]">Your Trust Score</h2><p className="mt-1 text-xs text-[#8aa09f]">Based on your reports</p></div><ChevronRight size={17} className="text-[#9ab1af]" /></div><TrustScoreRing score={78} /><p className="text-center text-xs leading-5 text-[#77918f]">Thank you for helping us<br />build a better city.</p></Card></aside></div></div></main></div>;
}
