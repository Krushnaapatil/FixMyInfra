import { AlertCircle, Bell, CheckCircle2, Clock3, FileText, Flag, Settings2, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@fixmyinfra/ui-kit';
import { getComplaints } from '@fixmyinfra/api-client';
import { DEPARTMENTS } from '@fixmyinfra/types';
import type { Complaint } from '@fixmyinfra/types';
import { getCurrentUser } from '@fixmyinfra/auth';
import { AdminShell } from '../components/AdminShell';
import { CategoryDonut, TrendChart, last30DayBuckets } from '../components/AdminCharts';
import { HotspotMap } from '../components/HotspotMap';
import cityIllustration from '../assets/city-illustration.png';

const OVERDUE_DAYS = 7;

function isResolved(status: Complaint['status']) {
  return status === 'RESOLVED' || status === 'CLOSED';
}

function isActive(status: Complaint['status']) {
  return !isResolved(status);
}

function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function daysBetween(from: string, to: string): number {
  return (new Date(to).getTime() - new Date(from).getTime()) / 86400000;
}

function KpiCard({ icon, tint, label, value, sub }: { icon: React.ReactNode; tint: string; label: string; value: string; sub: string }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint}`}>{icon}</span>
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </Card>
  );
}

export default function OverviewPage() {
  const user = getCurrentUser();
  const firstName = user?.name?.split(' ')[0] ?? 'Admin';
  const complaintsQuery = useQuery({ queryKey: ['admin-complaints'], queryFn: getComplaints });
  const complaints = complaintsQuery.data ?? [];

  const pending = complaints.filter((complaint) => complaint.status === 'SUBMITTED');
  const inProgress = complaints.filter(
    (complaint) => complaint.status === 'VERIFIED' || complaint.status === 'ASSIGNED' || complaint.status === 'IN_PROGRESS'
  );
  const resolved = complaints.filter((complaint) => isResolved(complaint.status));
  const overdue = complaints.filter(
    (complaint) => isActive(complaint.status) && daysBetween(complaint.createdAt, new Date().toISOString()) > OVERDUE_DAYS
  );
  const unassigned = complaints.filter((complaint) => !complaint.departmentId);
  const last30Days = complaints.filter((complaint) => daysBetween(complaint.createdAt, new Date().toISOString()) <= 30);
  const resolutionRate = complaints.length > 0 ? Math.round((resolved.length / complaints.length) * 1000) / 10 : 0;

  const shares = DEPARTMENTS.map((department) => ({
    label: department.name,
    value: complaints.filter((complaint) => complaint.departmentId === department.id).length
  })).filter((share) => share.value > 0);
  const others = complaints.filter((complaint) => !complaint.departmentId).length;
  if (others > 0) shares.push({ label: 'Unassigned', value: others });

  const departments = DEPARTMENTS.map((department) => {
    const assigned = complaints.filter((complaint) => complaint.departmentId === department.id);
    const done = assigned.filter((complaint) => isResolved(complaint.status));
    const rate = assigned.length > 0 ? (done.length / assigned.length) * 100 : 0;
    const times = done.map((complaint) => daysBetween(complaint.createdAt, complaint.updatedAt));
    const avgTime = times.length > 0 ? times.reduce((sum, days) => sum + days, 0) / times.length : null;
    return { ...department, assigned: assigned.length, resolved: done.length, rate, avgTime };
  });
  const topRate = Math.max(0, ...departments.filter((department) => department.assigned > 0).map((department) => department.rate));

  return (
    <AdminShell>
      <div className="relative mb-6 overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {greetingForHour(new Date().getHours())}, {firstName} <span aria-hidden="true">☀️</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">Overview of grievance activity and infrastructure management.</p>
          </div>
          <Link
            to="/departments"
            className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500"
            aria-label={unassigned.length > 0 ? `${unassigned.length} unassigned reports` : 'No unassigned reports'}
            title={unassigned.length > 0 ? `${unassigned.length} unassigned reports` : 'No unassigned reports'}
          >
            <Bell size={18} />
            {unassigned.length > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />}
          </Link>
        </div>
        <img src={cityIllustration} alt="" aria-hidden="true" className="pointer-events-none mt-4 h-24 w-full rounded-2xl object-cover object-top opacity-90" />
      </div>

      {complaintsQuery.isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-lg bg-slate-200" />
          ))}
        </div>
      )}
      {complaintsQuery.isError && (
        <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} /> Could not load complaints. Confirm the gateway and complaint service are running.
        </div>
      )}
      {complaintsQuery.isSuccess && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard icon={<FileText size={20} />} tint="bg-blue-50 text-blue-600" label="Total Complaints" value={complaints.length.toLocaleString('en-IN')} sub={`${last30Days.length} filed in the last 30 days`} />
            <KpiCard icon={<Clock3 size={20} />} tint="bg-amber-50 text-amber-600" label="Pending" value={pending.length.toLocaleString('en-IN')} sub="Needs attention" />
            <KpiCard icon={<Settings2 size={20} />} tint="bg-sky-50 text-sky-600" label="In Progress" value={inProgress.length.toLocaleString('en-IN')} sub="Verified, assigned or underway" />
            <KpiCard icon={<CheckCircle2 size={20} />} tint="bg-green-50 text-green-600" label="Resolved" value={resolved.length.toLocaleString('en-IN')} sub={`${resolutionRate}% resolution rate`} />
            <KpiCard icon={<Flag size={20} />} tint="bg-red-50 text-red-600" label="Overdue" value={overdue.length.toLocaleString('en-IN')} sub={overdue.length > 0 ? `Active for ${OVERDUE_DAYS}+ days — requires escalation` : 'All clear'} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="text-base font-bold text-slate-900">Complaint Trends</h2>
              <p className="mt-1 text-xs text-slate-500">Submitted vs resolved per day, last 30 days</p>
              <div className="mt-4">
                <TrendChart buckets={last30DayBuckets(complaints)} />
              </div>
            </Card>
            <Card>
              <h2 className="text-base font-bold text-slate-900">Complaints by Category</h2>
              <p className="mt-1 text-xs text-slate-500">Live share of all citizen reports</p>
              <div className="mt-4">
                {complaints.length === 0 ? (
                  <p className="py-10 text-center text-sm text-slate-500">No reports yet.</p>
                ) : (
                  <CategoryDonut shares={shares} total={complaints.length} />
                )}
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <HotspotMap complaints={complaints} />
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Department Performance</h2>
                <Link to="/departments" className="text-xs font-semibold text-teal-700">
                  View All →
                </Link>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[460px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="py-2 pr-3 font-semibold">Department</th>
                      <th className="py-2 pr-3 text-right font-semibold">Assigned</th>
                      <th className="py-2 pr-3 text-right font-semibold">Resolved</th>
                      <th className="py-2 pr-3 text-right font-semibold">Rate</th>
                      <th className="py-2 pr-3 text-right font-semibold">Avg. Time</th>
                      <th className="py-2 text-right font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((department) => (
                      <tr key={department.id} className="border-t border-slate-100">
                        <td className="py-3 pr-3 font-semibold">{department.name}</td>
                        <td className="py-3 pr-3 text-right text-slate-500">{department.assigned}</td>
                        <td className="py-3 pr-3 text-right text-slate-500">{department.resolved}</td>
                        <td className="py-3 pr-3 text-right font-bold text-green-700">{Math.round(department.rate)}%</td>
                        <td className="py-3 pr-3 text-right text-slate-500">
                          {department.avgTime === null ? '—' : `${department.avgTime.toFixed(1)} days`}
                        </td>
                        <td className="py-3 text-right">
                          {department.assigned > 0 && department.rate === topRate ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                              <Trophy size={13} /> Top Performer
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[11px] text-slate-400">Avg. time = created → last update for resolved reports.</p>
            </Card>
          </div>
        </>
      )}
    </AdminShell>
  );
}
