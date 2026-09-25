import { useQuery } from '@tanstack/react-query';
import { PageShell } from '../components/PageShell';
import { RecentUpdates } from '../components/RecentUpdates';
import { getComplaints } from '@fixmyinfra/api-client';

export default function NotificationsPage() {
  const complaintsQuery = useQuery({ queryKey: ['complaints'], queryFn: getComplaints });
  const complaints = [...(complaintsQuery.data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const activeCount = complaints.filter((complaint) => complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED').length;

  return (
    <PageShell title="Notifications" activeCount={activeCount}>
      <p className="mb-5 text-sm text-[#78908e]">Status updates on every report you&apos;ve made.</p>
      {complaintsQuery.isPending && (
        <div className="mx-auto max-w-3xl space-y-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-[#e5eeec]" />)}
        </div>
      )}
      {complaintsQuery.isError && (
        <div role="alert" className="mx-auto max-w-3xl rounded-2xl border border-[#f2c9c9] bg-[#fff5f5] px-5 py-4 text-sm font-medium text-[#b84d4d]">
          We could not load your updates. Please refresh and try again.
        </div>
      )}
      {!complaintsQuery.isPending && !complaintsQuery.isError && <RecentUpdates fullPage complaints={complaints} />}
    </PageShell>
  );
}
