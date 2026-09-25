import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@fixmyinfra/ui-kit';
import { getCurrentUser, logout } from '@fixmyinfra/auth';
import { getComplaints } from '@fixmyinfra/api-client';
import { PageShell } from '../components/PageShell';
import { Card } from '../components/StyledCard';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const name = user?.name ?? 'Citizen';
  const complaintsQuery = useQuery({ queryKey: ['complaints'], queryFn: getComplaints });
  const complaints = complaintsQuery.data ?? [];
  const resolved = complaints.filter((complaint) => complaint.status === 'RESOLVED' || complaint.status === 'CLOSED').length;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <PageShell title="Profile" activeCount={complaints.length - resolved}>
      <div className="mx-auto max-w-2xl">
        <Card className="!rounded-2xl !border !border-[#e7efec] !p-6 !shadow-sm sm:!p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0D7A6E] text-xl font-bold text-white" aria-hidden="true">
              {initials(name)}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-[#0F2A2E]">{name}</h2>
              <p className="truncate text-sm text-[#78908e]">{user?.email ?? ''}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#0D7A6E]">{user?.role ?? 'CITIZEN'}</p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-[#f2f8f7] px-2 py-4">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#78908e]">Reports</dt>
              <dd className="mt-1 text-2xl font-bold text-[#0F2A2E]">{complaints.length}</dd>
            </div>
            <div className="rounded-xl bg-[#f2f8f7] px-2 py-4">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#78908e]">Active</dt>
              <dd className="mt-1 text-2xl font-bold text-amber-600">{complaints.length - resolved}</dd>
            </div>
            <div className="rounded-xl bg-[#f2f8f7] px-2 py-4">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#78908e]">Resolved</dt>
              <dd className="mt-1 text-2xl font-bold text-emerald-600">{resolved}</dd>
            </div>
          </dl>
          <Button type="button" onClick={handleLogout} className="mt-6 flex w-full items-center justify-center gap-2 !rounded-xl !border !border-[#f2c9c9] !bg-white !py-3 text-sm font-bold !text-[#b84d4d] hover:!bg-[#fff5f5]">
            <LogOut size={16} /> Log out
          </Button>
        </Card>
      </div>
    </PageShell>
  );
}
