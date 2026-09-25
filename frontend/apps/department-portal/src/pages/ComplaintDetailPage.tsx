import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, MapPin } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Button, Card } from '@fixmyinfra/ui-kit';
import { getComplaintById, updateComplaintStatus } from '@fixmyinfra/api-client';
import type { Complaint } from '@fixmyinfra/types';
import { departmentNameFor } from '@fixmyinfra/types';
import { DepartmentShell } from '../components/DepartmentShell';
import { StatusBadge } from '../components/StatusBadge';

const statuses: Complaint['status'][] = ['SUBMITTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

function getApiError(error: unknown): string {
  const responseError = (error as { response?: { data?: { error?: string } } }).response?.data?.error;
  return responseError ?? 'We could not complete that action. Please try again.';
}

export default function ComplaintDetailPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Complaint['status']>('SUBMITTED');
  const [confirmation, setConfirmation] = useState('');
  const complaintQuery = useQuery({ queryKey: ['complaint', id], queryFn: () => getComplaintById(id), enabled: Boolean(id) });
  const updateMutation = useMutation({ mutationFn: () => updateComplaintStatus(id, status), onSuccess: async (complaint) => { setStatus(complaint.status); setConfirmation('Status updated successfully.'); await queryClient.invalidateQueries({ queryKey: ['complaint', id] }); await queryClient.invalidateQueries({ queryKey: ['assigned-complaints'] }); } });

  useEffect(() => {
    if (complaintQuery.data) setStatus(complaintQuery.data.status);
  }, [complaintQuery.data]);

  return <DepartmentShell title="Complaint detail"><Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0D7A6E]"><ArrowLeft size={16} /> Back to queue</Link>{complaintQuery.isPending && <div className="h-96 animate-pulse rounded-xl bg-[#e5eeec]" />}{complaintQuery.isError && <div role="alert" className="flex items-start gap-3 rounded-xl border border-[#f2c9c9] bg-[#fff5f5] px-4 py-4 text-sm font-medium text-[#b84d4d]"><AlertCircle size={18} />{getApiError(complaintQuery.error)}</div>}{complaintQuery.data && <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"><div className="space-y-6"><Card><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#78908e]">{complaintQuery.data.id}</p><h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#173f42]">{complaintQuery.data.category}</h2></div><StatusBadge status={complaintQuery.data.status} /></div>{complaintQuery.data.imageUrl && <img src={complaintQuery.data.imageUrl} alt="Complaint evidence" className="mt-6 max-h-[420px] w-full rounded-xl object-cover" />}<p className="mt-6 text-sm leading-7 text-[#526f6c]">{complaintQuery.data.description || 'No description provided.'}</p><div className="mt-6 grid gap-3 border-t border-[#edf2f1] pt-5 text-sm text-[#617c79] sm:grid-cols-2"><p className="flex items-center gap-2"><MapPin size={16} className="text-[#0D7A6E]" /> Latitude: {complaintQuery.data.latitude}</p><p>Longitude: {complaintQuery.data.longitude}</p><p className="sm:col-span-2"><a href={`https://www.google.com/maps?q=${complaintQuery.data.latitude},${complaintQuery.data.longitude}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-[#0D7A6E] hover:underline">Open location in Maps <ExternalLink size={14} /></a></p><p>Department: {departmentNameFor(complaintQuery.data.departmentId)}</p><p>Submitted: {new Date(complaintQuery.data.createdAt).toLocaleString('en-IN')}</p></div></Card></div><aside><Card><h2 className="text-base font-bold text-[#173f42]">Update status</h2><p className="mt-1 text-sm text-[#78908e]">Keep the resident-facing lifecycle current.</p><label className="mt-5 block"><span className="mb-2 block text-sm font-semibold text-[#315250]">New status</span><select value={status} onChange={(event) => { setStatus(event.target.value as Complaint['status']); setConfirmation(''); }} className="w-full rounded-lg border border-[#dce9e6] bg-white px-3 py-3 text-sm outline-none focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10">{statuses.map((option) => <option key={option} value={option}>{option.replace('_', ' ')}</option>)}</select></label>{updateMutation.isError && <div role="alert" className="mt-4 rounded-lg border border-[#f2c9c9] bg-[#fff5f5] px-3 py-3 text-sm font-medium text-[#b84d4d]">{getApiError(updateMutation.error)}</div>}{confirmation && <div role="status" className="mt-4 flex items-center gap-2 rounded-lg border border-[#bfe8dd] bg-[#effbf8] px-3 py-3 text-sm font-medium text-[#0D7A6E]"><CheckCircle2 size={16} />{confirmation}</div>}<Button type="button" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || status === complaintQuery.data.status} className="mt-5 w-full !rounded-lg !bg-[#173f42] font-bold disabled:cursor-not-allowed disabled:opacity-50">{updateMutation.isPending ? 'Updating...' : 'Update status'}</Button></Card></aside></div>}</DepartmentShell>;
}
