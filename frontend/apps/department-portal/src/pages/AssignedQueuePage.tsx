import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, ClipboardList, Inbox, LoaderCircle, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAssignedComplaints } from '@fixmyinfra/api-client';
import { Card } from '@fixmyinfra/ui-kit';
import type { Complaint } from '@fixmyinfra/types';
import { DepartmentShell } from '../components/DepartmentShell';
import { StatusBadge } from '../components/StatusBadge';

type StatusFilter = 'ALL' | Complaint['status'];

const allStatuses: Complaint['status'][] = ['SUBMITTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}

function ComplaintQueueCard({ complaint }: { complaint: Complaint }) {
  return <Link to={`/complaints/${complaint.id}`} className="block transition hover:-translate-y-0.5"><Card><div className="flex gap-4"><div className="hidden h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-[#eaf2f0] sm:block">{complaint.imageUrl ? <img src={complaint.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#91aaa6]"><ClipboardList size={22} /></div>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-[#78908e]">{complaint.id.slice(0, 8)}</p><h2 className="mt-1 text-lg font-bold text-[#173f42]">{complaint.category}</h2></div><StatusBadge status={complaint.status} /></div><p className="mt-2 line-clamp-2 text-sm leading-5 text-[#617c79]">{complaint.description || 'No description provided.'}</p><div className="mt-3 flex items-center justify-between gap-3 text-xs font-medium text-[#8aa09f]"><span>Submitted {formatDate(complaint.createdAt)}</span><span className="inline-flex items-center gap-1 font-bold text-[#0D7A6E]">Review <ArrowRight size={14} /></span></div></div></div></Card></Link>;
}

export default function AssignedQueuePage() {
  const complaintsQuery = useQuery({
    queryKey: ['assigned-complaints'],
    queryFn: getAssignedComplaints,
    // A 403 (notably DEPARTMENT_UNASSIGNED) will never become a 200 on retry.
    // Without this the pending-assignment panel only appears after react-query
    // has exhausted three backoff retries, several seconds later.
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } } | null)?.response?.status;
      if (typeof status === 'number' && status >= 400 && status < 500) return false;
      return failureCount < 2;
    }
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const complaints = complaintsQuery.data ?? [];
  // Officers self-register, so the service refuses the queue until an admin
  // assigns a department. That is a pending state, not a failure.
  const awaitingAssignment =
    (complaintsQuery.error as { response?: { data?: { code?: string } } } | null)?.response?.data?.code ===
    'DEPARTMENT_UNASSIGNED';

  const counts = useMemo(() => {
    const tally = new Map<Complaint['status'], number>();
    for (const complaint of complaints) tally.set(complaint.status, (tally.get(complaint.status) ?? 0) + 1);
    return tally;
  }, [complaints]);

  const visibleStatuses = allStatuses.filter((status) => counts.has(status));

  const filtered = complaints.filter((complaint) => {
    if (statusFilter !== 'ALL' && complaint.status !== statusFilter) return false;
    const needle = search.trim().toLowerCase();
    if (!needle) return true;
    return (
      complaint.category.toLowerCase().includes(needle) ||
      (complaint.description ?? '').toLowerCase().includes(needle) ||
      complaint.id.toLowerCase().includes(needle)
    );
  });

  return <DepartmentShell title="Assigned complaints"><div className="mb-5 flex items-center justify-between rounded-xl border border-[#dce9e6] bg-white px-4 py-3 text-sm text-[#617c79]"><span className="inline-flex items-center gap-2"><ClipboardList size={17} className="text-[#0D7A6E]" /> Department queue</span>{complaintsQuery.data && <strong className="text-[#173f42]">{complaints.length} open items</strong>}</div><div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status"><button key="ALL" type="button" onClick={() => setStatusFilter('ALL')} aria-pressed={statusFilter === 'ALL'} className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${statusFilter === 'ALL' ? 'bg-[#173f42] text-white' : 'bg-white text-[#617c79] ring-1 ring-[#dce9e6] hover:ring-[#0D7A6E]'}`}>All · {complaints.length}</button>{visibleStatuses.map((status) => <button key={status} type="button" onClick={() => setStatusFilter(status)} aria-pressed={statusFilter === status} className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${statusFilter === status ? 'bg-[#173f42] text-white' : 'bg-white text-[#617c79] ring-1 ring-[#dce9e6] hover:ring-[#0D7A6E]'}`}>{status.replace('_', ' ')} · {counts.get(status)}</button>)}</div><label className="relative block lg:w-72"><Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91aaa6]" /><span className="sr-only">Search complaints</span><input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Search category, text, or ID" className="w-full rounded-xl border border-[#dce9e6] bg-white py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-[#a9bbba] focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10" /></label></div>{complaintsQuery.isPending && <div className="space-y-3" aria-label="Loading assigned complaints">{[1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-lg bg-[#e5eeec]" />)}</div>}{complaintsQuery.isError && !awaitingAssignment && <div role="alert" className="flex items-start gap-3 rounded-xl border border-[#f2c9c9] bg-[#fff5f5] px-4 py-4 text-sm font-medium text-[#b84d4d]"><AlertCircle size={18} />Unable to load your assigned complaints. Check that the complaint service is running.</div>}{awaitingAssignment && <div className="rounded-xl border border-dashed border-[#c8dbd7] bg-white px-6 py-14 text-center"><Inbox className="mx-auto text-[#8fb5ae]" size={30} /><h2 className="mt-3 text-lg font-bold text-[#173f42]">Waiting for department assignment</h2><p className="mx-auto mt-2 max-w-md text-sm text-[#78908e]">Your account is active, but an administrator has not yet assigned you to a department. Complaints for your department will appear here as soon as that happens.</p></div>}{complaintsQuery.isSuccess && complaints.length === 0 && <div className="rounded-xl border border-dashed border-[#c8dbd7] bg-white px-6 py-14 text-center"><Inbox className="mx-auto text-[#8fb5ae]" size={30} /><h2 className="mt-3 text-lg font-bold text-[#173f42]">No complaints assigned to your department yet</h2><p className="mt-2 text-sm text-[#78908e]">Newly routed complaints will appear here.</p></div>}{complaintsQuery.isSuccess && complaints.length > 0 && filtered.length === 0 && <div className="rounded-xl border border-dashed border-[#c8dbd7] bg-white px-6 py-14 text-center"><Search className="mx-auto text-[#8fb5ae]" size={30} /><h2 className="mt-3 text-lg font-bold text-[#173f42]">No matches</h2><p className="mt-2 text-sm text-[#78908e]">Try a different status or search term.</p></div>}{complaintsQuery.isSuccess && filtered.length > 0 && <div className="space-y-3">{filtered.map((complaint) => <ComplaintQueueCard key={complaint.id} complaint={complaint} />)}</div>}{complaintsQuery.isFetching && !complaintsQuery.isPending && <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#78908e]"><LoaderCircle className="animate-spin" size={14} />Refreshing queue</p>}</DepartmentShell>;
}
