import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/StyledCard';
import { Sidebar, MobileMenuButton } from '../components/Sidebar';
import { ReportCTA } from '../components/ReportCTA';
import { IssuesMap } from '../components/IssuesMap';
import { RecentUpdates } from '../components/RecentUpdates';
import { ImpactCard } from '../components/ImpactCard';
import { TrustScoreRing } from '../components/TrustScoreRing';
import { getComplaints } from '@fixmyinfra/api-client';
import { getCurrentUser } from '@fixmyinfra/auth';
import headerSkyline from '../assets/home/header-skyline.png';

function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getCurrentUser();
  const name = user?.name ?? 'Citizen';
  const firstName = name.split(' ')[0] ?? 'there';
  const now = new Date();
  const complaintsQuery = useQuery({ queryKey: ['complaints'], queryFn: getComplaints });
  const complaints = complaintsQuery.data ?? [];
  const activeCount = complaints.filter((complaint) => complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED').length;
  const resolvedCount = complaints.length - activeCount;
  const resolutionRate = complaints.length > 0 ? Math.round((resolvedCount / complaints.length) * 100) : null;
  const latest = [...complaints]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f7fafa] text-[#0F2A2E]">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} activeCount={activeCount} />
      <main className="min-h-screen lg:pl-60">
        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center gap-3 lg:hidden">
            <MobileMenuButton onClick={() => setMobileOpen(true)} />
          </div>

          <header className="relative overflow-hidden rounded-2xl border border-[#e7efec] bg-white shadow-sm">
            <img src={headerSkyline} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right" />
            <div className="relative flex items-center justify-between gap-4 px-6 py-7 sm:px-9">
              <div>
                <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[#0F2A2E] sm:text-3xl">
                  {greetingForHour(now.getHours())}, {firstName}! <span role="img" aria-label="waving hand">👋</span>
                </h1>
                <p className="mt-1.5 text-sm text-[#5b7371]">Let&apos;s keep our city better, together.</p>
              </div>
              <div className="hidden items-center gap-2.5 sm:flex">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8a9a99] text-sm font-bold text-white" aria-hidden="true">
                  {initial(name)}
                </span>
                <span className="text-sm font-semibold text-[#33484a]">{name}</span>
              </div>
            </div>
          </header>

          <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 space-y-5">
              <ReportCTA />
              <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,.88fr)]">
                <IssuesMap complaints={complaints} />
                <RecentUpdates complaints={latest} />
              </div>
            </div>
            <aside className="space-y-5">
              <ImpactCard complaints={complaints} />
              <Card className="!rounded-2xl !border !border-[#e7efec] !p-5 !shadow-sm">
                <h2 className="text-[15px] font-bold text-[#17393b]">Your Activity</h2>
                <dl className="mt-3 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-[#5f7c7a]">Reports filed</dt>
                    <dd className="font-bold text-[#0F2A2E]">{complaints.length}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#5f7c7a]">In progress</dt>
                    <dd className="font-bold text-amber-600">{activeCount}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#5f7c7a]">Resolved</dt>
                    <dd className="font-bold text-emerald-600">{resolvedCount}</dd>
                  </div>
                </dl>
              </Card>
              <Card className="!rounded-2xl !border !border-[#e7efec] !p-5 !shadow-sm">
                <h2 className="text-[15px] font-bold text-[#17393b]">Your Trust Score</h2>
                {resolutionRate === null ? (
                  <p className="mt-4 rounded-xl border border-dashed border-[#d6e7e3] px-4 py-6 text-center text-xs font-medium text-[#77918f]">
                    File your first report to start your score.
                  </p>
                ) : (
                  <>
                    <div className="mt-2"><TrustScoreRing score={resolutionRate} /></div>
                    <p className="mt-1 text-center text-xs leading-5 text-[#77918f]">{resolvedCount} of {complaints.length} reports resolved.</p>
                  </>
                )}
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
