import { ArrowUpRight } from 'lucide-react';
import type { Complaint } from '@fixmyinfra/types';
import type { RecentUpdate } from '../data/mock';

interface ComplaintCardProps {
  complaint: Complaint | RecentUpdate;
  showArrow?: boolean;
}

const statusStyles: Record<Complaint['status'], string> = {
  SUBMITTED: 'bg-slate-100 text-slate-600',
  VERIFIED: 'bg-blue-50 text-blue-700',
  ASSIGNED: 'bg-violet-50 text-violet-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  RESOLVED: 'bg-emerald-50 text-emerald-700',
  CLOSED: 'bg-slate-100 text-slate-600'
};

function displayStatus(status: Complaint['status']): string {
  return status.replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ComplaintCard({ complaint, showArrow = false }: ComplaintCardProps) {
  const update = 'title' in complaint ? complaint : undefined;
  return (
    <article className="flex items-center gap-3 border-b border-[#edf2f1] py-4 last:border-0">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#eaf8f4] text-[10px] font-bold uppercase tracking-wide text-[#0D7A6E]">
        {update?.thumbnail || complaint.imageUrl ? <img className="h-full w-full object-cover" src={update?.thumbnail ?? complaint.imageUrl} alt="" /> : 'Issue'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-[#17393b]">{update?.title ?? complaint.category}</h3>
          {showArrow && <ArrowUpRight size={16} className="shrink-0 text-[#87a09e]" aria-hidden="true" />}
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-[#8aa09f]">
          <span className={`rounded-full px-2 py-0.5 font-medium ${statusStyles[complaint.status]}`}>{displayStatus(complaint.status)}</span>
          {update && <span>{update.timestamp}</span>}
        </div>
      </div>
    </article>
  );
}
