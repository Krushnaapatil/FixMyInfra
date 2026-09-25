import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Surface } from './Surface';
import { ComplaintCard } from './ComplaintCard';
import type { Complaint } from '@fixmyinfra/types';

interface RecentUpdatesProps {
  fullPage?: boolean;
  complaints?: Complaint[];
}

export function RecentUpdates({ fullPage = false, complaints = [] }: RecentUpdatesProps) {
  return (
    <Surface className="!rounded-2xl !border-[#e7efec] !p-5 !shadow-sm">
      <h2 className="text-[15px] font-bold text-[#17393b]">Recent Updates</h2>
      {complaints.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf8f4] text-[#0D7A6E]"><FileText size={19} /></span>
          <p className="mt-3 text-sm font-semibold text-[#17393b]">No reports yet</p>
          <p className="mt-1 text-xs text-[#8aa09f]">Your reported issues will appear here.</p>
        </div>
      ) : (
        <div className={fullPage ? 'mx-auto max-w-3xl' : ''}>{complaints.map((complaint) => <ComplaintCard key={complaint.id} complaint={complaint} showArrow={fullPage} />)}</div>
      )}
      {!fullPage && complaints.length > 0 && (
        <div className="mt-1 text-right">
          <Link to="/complaints" className="text-xs font-semibold text-[#0D7A6E] hover:underline">View More</Link>
        </div>
      )}
    </Surface>
  );
}
