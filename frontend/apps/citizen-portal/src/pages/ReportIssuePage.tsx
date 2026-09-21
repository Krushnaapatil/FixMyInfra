import { useState, type FormEvent } from 'react';
import { Camera, CheckCircle2, LoaderCircle, MapPin, Upload } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@fixmyinfra/ui-kit';
import { createComplaint, type CreateComplaintPayload } from '@fixmyinfra/api-client';
import { PageShell } from '../components/PageShell';
import { Card } from '../components/StyledCard';

interface ComplaintFormState {
  category: string;
  description: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
}

const initialForm: ComplaintFormState = { category: '', description: '', latitude: '', longitude: '', imageUrl: '' };

function getApiError(error: unknown): string {
  const responseError = (error as { response?: { data?: { error?: string } } }).response?.data?.error;
  return responseError ?? 'We could not submit your report. Please try again.';
}

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ComplaintFormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const mutation = useMutation({
    mutationFn: (payload: CreateComplaintPayload) => createComplaint(payload),
    onSuccess: () => { setForm(initialForm); setSubmitted(true); },
    onError: () => setSubmitted(false)
  });

  function updateField(field: keyof ComplaintFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSubmitted(false);
    if (mutation.isError) mutation.reset();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!localStorage.getItem('fixmyinfra_token')) {
      navigate('/login');
      return;
    }
    mutation.mutate({
      category: form.category,
      ...(form.description ? { description: form.description } : {}),
      ...(form.imageUrl ? { imageUrl: form.imageUrl } : {}),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude)
    });
  }

  return <PageShell title="Report a grievance"><div className="mx-auto max-w-3xl"><div className="mb-6"><p className="text-sm text-[#78908e]">Help us make your neighborhood better.</p><div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">{[{ icon: Upload, label: 'Upload a Photo' }, { icon: MapPin, label: 'Confirm Location' }, { icon: CheckCircle2, label: 'Submit' }].map(({ icon: Icon, label }, index) => <div key={label} className="flex items-center gap-2"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${index === 0 ? 'bg-[#d9f2ec] text-[#0D7A6E]' : 'bg-white text-[#9bb1af]'} shadow-sm`}><Icon size={16} /></span><span className="hidden text-xs font-semibold text-[#617c79] sm:block">{label}</span>{index < 2 && <span className="ml-auto h-px flex-1 bg-[#dbeae7]" />}</div>)}</div></div><Card className="portal-card-cta"><form onSubmit={handleSubmit} className="space-y-6"><label className="block"><span className="mb-2 block text-sm font-semibold text-[#315250]">Photo URL <span className="font-normal text-[#9aacab]">(optional)</span></span><span className="relative block"><Camera className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0D7A6E]" size={17} /><input value={form.imageUrl} onChange={(event) => updateField('imageUrl', event.target.value)} type="url" placeholder="Paste an image URL" className="w-full rounded-xl border border-[#dce9e6] bg-white py-3 pl-10 pr-3 text-sm outline-none placeholder:text-[#a9bbba] focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10" /></span></label><div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-semibold text-[#315250]">Issue category</span><select required value={form.category} onChange={(event) => updateField('category', event.target.value)} className="w-full rounded-xl border border-[#dce9e6] bg-white px-3.5 py-3 text-sm text-[#315250] outline-none focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10"><option value="">Select a category</option><option>Road damage</option><option>Water and drainage</option><option>Garbage</option><option>Streetlight</option></select></label><label className="block"><span className="mb-2 block text-sm font-semibold text-[#315250]">Location</span><div className="grid grid-cols-2 gap-2"><input required value={form.latitude} onChange={(event) => updateField('latitude', event.target.value)} type="number" step="any" placeholder="Latitude" className="w-full rounded-xl border border-[#dce9e6] px-3 py-3 text-sm outline-none focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10" /><input required value={form.longitude} onChange={(event) => updateField('longitude', event.target.value)} type="number" step="any" placeholder="Longitude" className="w-full rounded-xl border border-[#dce9e6] px-3 py-3 text-sm outline-none focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10" /></div></label></div><label className="block"><span className="mb-2 block text-sm font-semibold text-[#315250]">Tell us more <span className="font-normal text-[#9aacab]">(optional)</span></span><textarea rows={4} value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Describe what is happening and where..." className="w-full resize-none rounded-xl border border-[#dce9e6] bg-white px-3.5 py-3 text-sm outline-none placeholder:text-[#a9bbba] focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10" /></label>{mutation.isError && <div role="alert" className="rounded-xl border border-[#f2c9c9] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#b84d4d]">{getApiError(mutation.error)}</div>}{submitted && <div role="status" className="rounded-xl border border-[#bfe8dd] bg-[#effbf8] px-4 py-3 text-sm font-medium text-[#0D7A6E]">Your complaint was submitted successfully.</div>}<div className="flex items-center justify-end border-t border-[#edf2f1] pt-5"><Button type="submit" disabled={mutation.isPending} className="!rounded-xl !bg-[#0D7A6E] !px-5 !py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60">{mutation.isPending ? <><LoaderCircle className="mr-2 inline animate-spin" size={16} />Submitting...</> : 'Submit Report'}</Button></div></form></Card></div></PageShell>;
}
