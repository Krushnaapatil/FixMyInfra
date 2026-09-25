import { ArrowUpRight } from 'lucide-react';
import type { Complaint } from '@fixmyinfra/types';
import { relativeTime } from '../utils/time';
import { thumbForCategory } from './homeAssets';

interface ComplaintCardProps {
  complaint: Complaint;
  showArrow?: boolean;
}

const statusStyles: Record<Complaint['status'], string> = {
  SUBMITTED: 'bg-slate-100 text-slate-600',
  VERIFIED: 'bg-blue-50 text-blue-700',
  ASSIGNED: 'bg-violet-50 text-violet-700',
  IN_PROGRESS: 'bg-amber-100/70 text-amber-700',
  RESOLVED: 'bg-emerald-100/70 text-emerald-700',
  CLOSED: 'bg-slate-100 text-slate-600'
};

function displayStatus(status: Complaint['status']): string {
  return status.replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ComplaintCard({ complaint, showArrow = false }: ComplaintCardProps) {
  return (
    <article className="flex items-center gap-3.5 border-b border-[#edf2f1] py-4 last:border-0">
      <img
        className="h-14 w-14 shrink-0 rounded-xl bg-[#eaf8f4] object-cover"
        src={complaint.imageUrl || thumbForCategory(complaint.category)}
        alt=""
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-[#17393b]">{complaint.category}</h3>
          {showArrow && <ArrowUpRight size={16} className="shrink-0 text-[#87a09e]" aria-hidden="true" />}
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-[#8aa09f]">
          <span className={`rounded-md px-2 py-0.5 font-semibold ${statusStyles[complaint.status]}`}>{displayStatus(complaint.status)}</span>
          <span>{relativeTime(complaint.createdAt)}</span>
        </div>
        {complaint.description && <p className="mt-1 truncate text-xs text-[#8aa09f]">{complaint.description}</p>}
      </div>
    </article>
  );
}
