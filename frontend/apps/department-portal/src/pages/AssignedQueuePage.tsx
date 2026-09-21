import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, ClipboardList, Inbox, LoaderCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAssignedComplaints } from '@fixmyinfra/api-client';
import { Card } from '@fixmyinfra/ui-kit';
import type { Complaint } from '@fixmyinfra/types';
import { DepartmentShell } from '../components/DepartmentShell';
import { StatusBadge } from '../components/StatusBadge';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}

function ComplaintQueueCard({ complaint }: { complaint: Complaint }) {
  return <Link to={`/complaints/${complaint.id}`} className="block transition hover:-translate-y-0.5"><Card><div className="flex gap-4"><div className="hidden h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-[#eaf2f0] sm:block">{complaint.imageUrl ? <img src={complaint.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#91aaa6]"><ClipboardList size={22} /></div>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#78908e]">{complaint.id}</p><h2 className="mt-1 text-lg font-bold text-[#173f42]">{complaint.category}</h2></div><StatusBadge status={complaint.status} /></div><p className="mt-2 line-clamp-2 text-sm leading-5 text-[#617c79]">{complaint.description || 'No description provided.'}</p><div className="mt-3 flex items-center justify-between gap-3 text-xs font-medium text-[#8aa09f]"><span>Submitted {formatDate(complaint.createdAt)}</span><span className="inline-flex items-center gap-1 font-bold text-[#0D7A6E]">Review <ArrowRight size={14} /></span></div></div></div></Card></Link>;
}

export default function AssignedQueuePage() {
  const complaintsQuery = useQuery({ queryKey: ['assigned-complaints'], queryFn: getAssignedComplaints });

  return <DepartmentShell title="Assigned complaints"><div className="mb-5 flex items-center justify-between rounded-xl border border-[#dce9e6] bg-white px-4 py-3 text-sm text-[#617c79]"><span className="inline-flex items-center gap-2"><ClipboardList size={17} className="text-[#0D7A6E]" /> Department queue</span>{complaintsQuery.data && <strong className="text-[#173f42]">{complaintsQuery.data.length} open items</strong>}</div>{complaintsQuery.isPending && <div className="space-y-3" aria-label="Loading assigned complaints">{[1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-lg bg-[#e5eeec]" />)}</div>}{complaintsQuery.isError && <div role="alert" className="flex items-start gap-3 rounded-xl border border-[#f2c9c9] bg-[#fff5f5] px-4 py-4 text-sm font-medium text-[#b84d4d]"><AlertCircle size={18} />Unable to load your assigned complaints. Check that the complaint service is running.</div>}{complaintsQuery.isSuccess && complaintsQuery.data.length === 0 && <div className="rounded-xl border border-dashed border-[#c8dbd7] bg-white px-6 py-14 text-center"><Inbox className="mx-auto text-[#8fb5ae]" size={30} /><h2 className="mt-3 text-lg font-bold text-[#173f42]">No complaints assigned to your department yet</h2><p className="mt-2 text-sm text-[#78908e]">Newly routed complaints will appear here.</p></div>}{complaintsQuery.isSuccess && complaintsQuery.data.length > 0 && <div className="space-y-3">{complaintsQuery.data.map((complaint) => <ComplaintQueueCard key={complaint.id} complaint={complaint} />)}</div>}{complaintsQuery.isFetching && !complaintsQuery.isPending && <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#78908e]"><LoaderCircle className="animate-spin" size={14} />Refreshing queue</p>}</DepartmentShell>;
}
