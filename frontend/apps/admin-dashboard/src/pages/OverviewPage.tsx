import { AlertCircle, CheckCircle2, ClipboardList, Clock3, LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@fixmyinfra/ui-kit';
import { getComplaints } from '@fixmyinfra/api-client';
import { getCurrentUser, logout } from '@fixmyinfra/auth';
import type { Complaint } from '@fixmyinfra/types';
import { departmentNameFor } from '@fixmyinfra/types';

function statusClass(status: Complaint['status']) {
  if (status === 'RESOLVED' || status === 'CLOSED') return 'bg-green-100 text-green-700';
  if (status === 'IN_PROGRESS') return 'bg-teal-100 text-teal-700';
  return 'bg-amber-100 text-amber-700';
}

export default function OverviewPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const complaintsQuery = useQuery({ queryKey: ['admin-complaints'], queryFn: getComplaints });
  const complaints = complaintsQuery.data ?? [];
  const resolved = complaints.filter((complaint) => complaint.status === 'RESOLVED' || complaint.status === 'CLOSED').length;
  const active = complaints.length - resolved;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

   return <main className="min-h-screen bg-slate-100 px-5 py-6 text-slate-900 sm:px-8"><header className="mx-auto flex max-w-6xl items-center justify-between border-b border-slate-200 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">InfraFix administration</p><h1 className="mt-2 text-3xl font-bold">Complaint overview</h1><p className="mt-1 text-sm text-slate-500">All citizen reports across the municipality.</p></div><div className="flex items-center gap-3"><span className="hidden text-right text-sm sm:block"><strong className="block">{user?.name ?? 'Administrator'}</strong><span className="text-xs uppercase text-slate-500">{user?.role ?? 'ADMIN'}</span></span><Button type="button" onClick={handleLogout} className="!rounded-lg !bg-white !px-3 !py-2 !text-slate-700 !shadow-sm"><LogOut size={16} /></Button></div></header><section className="mx-auto mt-8 max-w-6xl"><div className="grid gap-4 sm:grid-cols-3"><Card><p className="text-sm text-slate-500">Total complaints</p><p className="mt-2 text-3xl font-bold">{complaints.length}</p></Card><Card><p className="text-sm text-slate-500">Active work</p><p className="mt-2 flex items-center gap-2 text-3xl font-bold"><Clock3 className="text-amber-600" size={25} />{active}</p></Card><Card><p className="text-sm text-slate-500">Resolved</p><p className="mt-2 flex items-center gap-2 text-3xl font-bold"><CheckCircle2 className="text-green-600" size={25} />{resolved}</p></Card></div>{complaintsQuery.isPending && <div className="mt-6 space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-lg bg-slate-200" />)}</div>}{complaintsQuery.isError && <div role="alert" className="mt-6 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={18} />Could not load complaints. Confirm the gateway and complaint service are running.</div>}{complaintsQuery.isSuccess && complaints.length === 0 && <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><ClipboardList className="mx-auto text-slate-400" size={30} /><h2 className="mt-3 text-lg font-bold">No complaints received yet</h2><p className="mt-1 text-sm text-slate-500">New citizen submissions will appear here.</p></div>}{complaintsQuery.isSuccess && complaints.length > 0 && <div className="mt-6"><Card><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-5 py-4">Complaint</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Department</th><th className="px-5 py-4">Submitted</th></tr></thead><tbody>{complaints.map((complaint) => <tr key={complaint.id} className="border-b border-slate-100 last:border-0"><td className="px-5 py-4 font-semibold">{complaint.id}</td><td className="px-5 py-4">{complaint.category}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(complaint.status)}`}>{complaint.status.replace('_', ' ')}</span></td><td className="px-5 py-4 text-slate-500">{departmentNameFor(complaint.departmentId)}</td><td className="px-5 py-4 text-slate-500">{new Date(complaint.createdAt).toLocaleString('en-IN')}</td></tr>)}</tbody></table></div></Card></div>}</section></main>;
}
