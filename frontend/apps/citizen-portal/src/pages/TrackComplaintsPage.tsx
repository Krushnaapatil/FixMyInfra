import { FileText, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@fixmyinfra/ui-kit';
import { getComplaints } from '@fixmyinfra/api-client';
import { PageShell } from '../components/PageShell';
import { RecentUpdates } from '../components/RecentUpdates';
import { Card } from '../components/StyledCard';

export default function TrackComplaintsPage() {
  const complaintsQuery = useQuery({ queryKey: ['complaints'], queryFn: getComplaints });
  const complaints = complaintsQuery.data ?? [];
  const resolvedCount = complaints.filter(({ status }) => status === 'RESOLVED' || status === 'CLOSED').length;
  const activeCount = complaints.length - resolvedCount;

  return <PageShell title="My complaints"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-[#78908e]">Track the progress of every report you&apos;ve made.</p><div className="mt-4 flex gap-5 text-xs font-semibold text-[#78908e]"><span className="text-[#0D7A6E]">All ({complaints.length})</span><span>Active ({activeCount})</span><span>Resolved ({resolvedCount})</span></div></div><Link to="/"><Button className="!rounded-xl !bg-[#0D7A6E] !px-4 !py-3 text-xs font-bold"><Plus className="mr-1.5" size={15} /> New report</Button></Link></div>{complaintsQuery.isPending && <Card className="portal-card"><div className="space-y-4 animate-pulse"><div className="h-5 w-40 rounded bg-[#eaf1ef]" /><div className="h-12 rounded-xl bg-[#f1f6f5]" /><div className="h-12 rounded-xl bg-[#f1f6f5]" /><div className="h-12 rounded-xl bg-[#f1f6f5]" /></div></Card>}{complaintsQuery.isError && <div role="alert" className="rounded-2xl border border-[#f2c9c9] bg-[#fff5f5] px-5 py-4 text-sm font-medium text-[#b84d4d]">We could not load your complaints. Please refresh and try again.</div>}{!complaintsQuery.isPending && !complaintsQuery.isError && complaints.length === 0 && <Card className="portal-card"><div className="flex flex-col items-center px-5 py-12 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf8f4] text-[#0D7A6E]"><FileText size={21} /></span><h2 className="mt-4 text-lg font-bold text-[#17393b]">No complaints yet</h2><p className="mt-1 text-sm text-[#78908e]">Report your first issue and help improve your neighborhood.</p><Link to="/" className="mt-5"><Button className="!rounded-xl !bg-[#0D7A6E] !px-4 !py-3 text-xs font-bold">Report an issue</Button></Link></div></Card>}{!complaintsQuery.isPending && !complaintsQuery.isError && complaints.length > 0 && <><RecentUpdates fullPage complaints={complaints} /><div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#eaf8f4] px-5 py-4 text-xs text-[#52716f]"><FileText size={17} className="text-[#0D7A6E]" /> Updates will appear here as your reports move through review and resolution.</div></>}</PageShell>;
}
