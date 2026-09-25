import { AlertCircle, Building2, CheckCircle2, Clock3, Inbox, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@fixmyinfra/ui-kit';
import { getComplaints, getUsers } from '@fixmyinfra/api-client';
import { DEPARTMENTS, type Complaint } from '@fixmyinfra/types';
import { AdminShell } from '../components/AdminShell';

function isActiveComplaint(status: Complaint['status']) {
  return status !== 'RESOLVED' && status !== 'CLOSED';
}

export default function DepartmentManagementPage() {
  const complaintsQuery = useQuery({ queryKey: ['admin-complaints'], queryFn: getComplaints });
  const usersQuery = useQuery({ queryKey: ['admin-users'], queryFn: getUsers });
  const complaints = complaintsQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const officers = users.filter((user) => user.role === 'OFFICER');
  const unassigned = complaints.filter((complaint) => !complaint.departmentId);
  const loading = complaintsQuery.isPending || usersQuery.isPending;
  const failed = complaintsQuery.isError || usersQuery.isError;

  return (
    <AdminShell title="Departments" eyebrow="Organization">
      <p className="mb-5 text-sm text-slate-500">
        Workload per department, computed live from complaints and officer assignments.
      </p>
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-44 animate-pulse rounded-lg bg-slate-200" />
          ))}
        </div>
      )}
      {failed && (
        <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} /> Could not load departments. Confirm the gateway and backend services are running.
        </div>
      )}
      {!loading && !failed && (
        <>
          {unassigned.length > 0 && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <Inbox size={18} className="mt-0.5 shrink-0" />
              <p>
                <strong>{unassigned.length}</strong> {unassigned.length === 1 ? 'complaint has' : 'complaints have'}{' '}
                no department. Unknown categories stay unassigned until routed — officers without a department can
                still see them in their queue.
              </p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {DEPARTMENTS.map((department) => {
              const deptComplaints = complaints.filter((complaint) => complaint.departmentId === department.id);
              const deptOfficers = officers.filter((officer) => officer.departmentId === department.id);
              const active = deptComplaints.filter((complaint) => isActiveComplaint(complaint.status)).length;
              const resolved = deptComplaints.length - active;
              return (
                <Card key={department.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                        <Building2 size={18} />
                      </span>
                      <h2 className="text-lg font-bold">{department.name}</h2>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                      <Users size={13} /> {deptOfficers.length} {deptOfficers.length === 1 ? 'officer' : 'officers'}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-slate-50 px-2 py-3">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total</dt>
                      <dd className="mt-1 text-2xl font-bold">{deptComplaints.length}</dd>
                    </div>
                    <div className="rounded-lg bg-amber-50 px-2 py-3">
                      <dt className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                        <Clock3 size={12} /> Active
                      </dt>
                      <dd className="mt-1 text-2xl font-bold text-amber-700">{active}</dd>
                    </div>
                    <div className="rounded-lg bg-green-50 px-2 py-3">
                      <dt className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-green-700">
                        <CheckCircle2 size={12} /> Done
                      </dt>
                      <dd className="mt-1 text-2xl font-bold text-green-700">{resolved}</dd>
                    </div>
                  </dl>
                  {deptOfficers.length > 0 ? (
                    <p className="mt-3 text-xs text-slate-500">{deptOfficers.map((officer) => officer.name).join(', ')}</p>
                  ) : (
                    <p className="mt-3 text-xs font-medium text-amber-700">
                      No officers assigned — route one from the Users tab.
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}
    </AdminShell>
  );
}
