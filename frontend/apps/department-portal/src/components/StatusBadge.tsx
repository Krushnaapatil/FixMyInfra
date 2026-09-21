import type { Complaint } from '@fixmyinfra/types';

const statusStyles: Record<Complaint['status'], string> = {
  SUBMITTED: 'bg-[#fff4df] text-[#996514]',
  VERIFIED: 'bg-[#e8f0ff] text-[#315d9d]',
  ASSIGNED: 'bg-[#eee8ff] text-[#6548a1]',
  IN_PROGRESS: 'bg-[#e3f5f1] text-[#0D7A6E]',
  RESOLVED: 'bg-[#e8f8e8] text-[#357c47]',
  CLOSED: 'bg-[#edf1f1] text-[#5d7371]'
};

export function StatusBadge({ status }: { status: Complaint['status'] }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${statusStyles[status]}`}>{status.replace('_', ' ')}</span>;
}
