import { Surface } from './Surface';
import type { Complaint } from '@fixmyinfra/types';
import impactCircle from '../assets/home/impact-circle.png';
import leaves from '../assets/home/leaves.png';

function isResolved(status: Complaint['status']) {
  return status === 'RESOLVED' || status === 'CLOSED';
}

export function ImpactCard({ complaints = [] }: { complaints?: Complaint[] }) {
  const resolved = complaints.filter((complaint) => isResolved(complaint.status)).length;
  const active = complaints.length - resolved;

  return (
    <Surface className="!rounded-2xl !border-[#e7efec] !p-5 !shadow-sm">
      <div className="flex items-start gap-3">
        <span className="relative block h-12 w-12 shrink-0" role="img" aria-label="Growing plant">
          <img src={impactCircle} alt="" className="absolute inset-0 h-full w-full" />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[#2e9e5b]"
            style={{ WebkitMaskImage: `url(${leaves})`, maskImage: `url(${leaves})`, WebkitMaskSize: '55%', maskSize: '55%', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }}
          />
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-[#17393b]">Your Impact</h2>
          {complaints.length === 0 ? (
            <p className="mt-1 text-xs leading-5 text-[#5f7c7a]">Every report helps build a better community.</p>
          ) : (
            <p className="mt-1 text-xs leading-5 text-[#5f7c7a]">
              <strong className="text-[#0D7A6E]">{complaints.length} {complaints.length === 1 ? 'report' : 'reports'} filed</strong>,{' '}
              {resolved} resolved, {active} in progress.
            </p>
          )}
        </div>
      </div>
    </Surface>
  );
}
