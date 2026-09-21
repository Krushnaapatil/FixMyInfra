import { ArrowRight } from 'lucide-react';
import { Surface } from './Surface';
import { recentUpdates } from '../data/mock';
import { ComplaintCard } from './ComplaintCard';
import type { Complaint } from '@fixmyinfra/types';

interface RecentUpdatesProps {
  fullPage?: boolean;
  complaints?: Complaint[];
}

export function RecentUpdates({ fullPage = false, complaints }: RecentUpdatesProps) {
  const items = complaints ?? recentUpdates;
  return (
    <Surface className={`${fullPage ? 'mx-auto max-w-3xl !p-2' : '!p-1'} !rounded-2xl`}>
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#17393b]">Recent Updates</h2>
          <p className="mt-1 text-xs text-[#8aa09f]">Stay up to date with your reports</p>
        </div>
        {!fullPage && <a href="/complaints" className="flex items-center gap-1 text-xs font-semibold text-[#0D7A6E]">View More <ArrowRight size={14} /></a>}
      </div>
      <div>{items.map((complaint) => <ComplaintCard key={complaint.id} complaint={complaint} showArrow={fullPage} />)}</div>
    </Surface>
  );
}
