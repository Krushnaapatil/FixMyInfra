import { useState } from 'react';
import { AlertCircle, CheckCircle2, ClipboardList, Users } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@fixmyinfra/ui-kit';
import { assignUserDepartment, getUsers } from '@fixmyinfra/api-client';
import { DEPARTMENTS, departmentNameFor, type User } from '@fixmyinfra/types';
import { AdminShell } from '../components/AdminShell';

function roleClass(role: User['role']) {
  if (role === 'ADMIN') return 'bg-slate-900 text-white';
  if (role === 'OFFICER') return 'bg-teal-100 text-teal-700';
  return 'bg-amber-100 text-amber-700';
}

function getApiError(error: unknown): string {
  const responseError = (error as { response?: { data?: { error?: string } } }).response?.data?.error;
  return responseError ?? 'We could not complete that action. Please try again.';
}

function DepartmentCell({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const [failure, setFailure] = useState('');
  const mutation = useMutation({
    mutationFn: (departmentId: string | null) => assignUserDepartment(user.id, departmentId),
    onSuccess: async () => {
      setConfirmation(`Department updated for ${user.name}. They must log in again for it to take effect.`);
      setFailure('');
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error) => {
      setFailure(getApiError(error));
      setConfirmation('');
    },
    onSettled: () => setPendingId(null)
  });

  if (user.role !== 'OFFICER') {
    return <span className="text-slate-500">{departmentNameFor(user.departmentId)}</span>;
  }

  return (
    <div>
      <select
        aria-label={`Department for ${user.name}`}
        value={user.departmentId ?? ''}
        disabled={mutation.isPending}
        onChange={(event) => {
          setPendingId(user.id);
          setConfirmation('');
          setFailure('');
          mutation.mutate(event.target.value === '' ? null : event.target.value);
        }}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-teal-600 disabled:opacity-60"
      >
        <option value="">Unassigned</option>
        {DEPARTMENTS.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.name}
          </option>
        ))}
      </select>
      {pendingId === user.id && mutation.isPending && <p className="mt-1 text-xs text-slate-500">Saving...</p>}
      {confirmation && (
        <p role="status" className="mt-1 flex items-center gap-1 text-xs font-medium text-teal-700">
          <CheckCircle2 size={13} /> {confirmation}
        </p>
      )}
      {failure && (
        <p role="alert" className="mt-1 text-xs font-medium text-red-700">
          {failure}
        </p>
      )}
    </div>
  );
}

export default function UserManagementPage() {
  const usersQuery = useQuery({ queryKey: ['admin-users'], queryFn: getUsers });
  const users = usersQuery.data ?? [];

  return (
    <AdminShell title="User management" eyebrow="People & access">
      <p className="mb-5 text-sm text-slate-500">Assign officers to departments so queues route correctly.</p>
      <Card>
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
            <Users size={16} className="text-teal-700" />
            {usersQuery.data && (
              <strong className="text-slate-900">
                {users.length} registered {users.length === 1 ? 'user' : 'users'}
              </strong>
            )}
          </div>
          {usersQuery.isPending && (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-14 animate-pulse rounded-lg bg-slate-200" />
              ))}
            </div>
          )}
          {usersQuery.isError && (
            <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={18} /> {getApiError(usersQuery.error)}
            </div>
          )}
          {usersQuery.isSuccess && users.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <ClipboardList className="mx-auto text-slate-400" size={30} />
              <h2 className="mt-3 text-lg font-bold">No users yet</h2>
              <p className="mt-1 text-sm text-slate-500">Officers appear here after they register.</p>
            </div>
          )}
          {usersQuery.isSuccess && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
                  <tr>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 align-top last:border-0">
                      <td className="px-5 py-4">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${roleClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <DepartmentCell user={user} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
    </AdminShell>
  );
}
