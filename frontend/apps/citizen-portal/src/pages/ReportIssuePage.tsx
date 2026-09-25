import { useState, type FormEvent } from 'react';
import { CheckCircle2, Crosshair, LoaderCircle, MapPin, Upload } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@fixmyinfra/ui-kit';
import { createComplaint, type CreateComplaintPayload } from '@fixmyinfra/api-client';
import { DEPARTMENTS, ISSUE_CATEGORIES } from '@fixmyinfra/types';
import { PageShell } from '../components/PageShell';
import { MapPicker } from '../components/MapPicker';
import { PhotoCapture } from '../components/PhotoCapture';
import { useGeolocation } from '../hooks/useGeolocation';
import { NASHIK_CENTER } from '../components/homeAssets';
import { Card } from '../components/StyledCard';

interface ComplaintFormState {
  category: string;
  description: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
}

const initialForm: ComplaintFormState = {
  category: '',
  description: '',
  latitude: String(NASHIK_CENTER.latitude),
  longitude: String(NASHIK_CENTER.longitude),
  imageUrl: ''
};

const steps = [
  { icon: Upload, label: 'Upload a Photo' },
  { icon: MapPin, label: 'Confirm Location' },
  { icon: CheckCircle2, label: 'Submit' }
];

function getApiError(error: unknown): string {
  const responseError = (error as { response?: { data?: { error?: string } } }).response?.data?.error;
  return responseError ?? 'We could not submit your report. Please try again.';
}

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ComplaintFormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const geolocation = useGeolocation();
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

  function setCoordinates(latitude: number, longitude: number) {
    setForm((current) => ({ ...current, latitude: String(latitude), longitude: String(longitude) }));
    setSubmitted(false);
  }

  async function handleUseMyLocation() {
    const located = await geolocation.locate();
    if (located) setCoordinates(located.latitude, located.longitude);
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

  const accuracy = geolocation.location?.accuracy;
  const accuracyLabel = accuracy ? `±${Math.round(accuracy)} m accuracy` : null;
  const selectedCategory = ISSUE_CATEGORIES.find((entry) => entry.label === form.category) ?? null;

  return (
    <PageShell title="Report a grievance">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-sm text-[#78908e]">Help us make your neighborhood better.</p>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
            {steps.map(({ icon: Icon, label }, index) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${index === 0 ? 'bg-[#d9f2ec] text-[#0D7A6E]' : 'bg-white text-[#9bb1af]'} shadow-sm`}>
                  <Icon size={16} />
                </span>
                <span className="hidden text-xs font-semibold text-[#617c79] sm:block">{label}</span>
                {index < steps.length - 1 && <span className="ml-auto h-px flex-1 bg-[#dbeae7]" />}
              </div>
            ))}
          </div>
        </div>

        <Card className="portal-card-cta">
          <form onSubmit={handleSubmit} className="space-y-6">
            <PhotoCapture
              imageUrl={form.imageUrl}
              onUploaded={(imageUrl) => updateField('imageUrl', imageUrl)}
              onCleared={() => updateField('imageUrl', '')}
              onPhotoSelected={() => { void handleUseMyLocation(); }}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#315250]">Issue category</span>
                <select
                  required
                  value={form.category}
                  onChange={(event) => updateField('category', event.target.value)}
                  className="w-full rounded-xl border border-[#dce9e6] bg-white px-3.5 py-3 text-sm text-[#315250] outline-none focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10"
                >
                  <option value="">Select a category</option>
                  {/* Grouping only helps once a department owns more than one
                      category. While every department owns exactly one, seven
                      single-item groups are noisier than a flat list, so the
                      owning department is surfaced by the hint below instead. */}
                  {DEPARTMENTS.every((department) => department.categories.length === 1)
                    ? ISSUE_CATEGORIES.map((entry) => (
                        <option key={entry.label} value={entry.label}>{entry.label}</option>
                      ))
                    : DEPARTMENTS.map((department) => (
                        <optgroup key={department.id} label={department.name}>
                          {department.categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </optgroup>
                      ))}
                </select>
                {selectedCategory && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#617c79]">
                    <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: selectedCategory.color }} />
                    Handled by {selectedCategory.departmentName}
                  </p>
                )}
              </label>

              <div className="block">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[#315250]">Pin the location</span>
                  <button
                    type="button"
                    onClick={() => void handleUseMyLocation()}
                    disabled={geolocation.status === 'locating'}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#dce9e6] bg-white px-2.5 py-1.5 text-xs font-bold text-[#0D7A6E] transition hover:border-[#0D7A6E] hover:bg-[#f2faf8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {geolocation.status === 'locating'
                      ? <LoaderCircle className="animate-spin" size={13} />
                      : <Crosshair size={13} />}
                    Use my current location
                  </button>
                </div>

                <MapPicker
                  latitude={Number(form.latitude) || NASHIK_CENTER.latitude}
                  longitude={Number(form.longitude) || NASHIK_CENTER.longitude}
                  onChange={(latitude, longitude) => setCoordinates(latitude, longitude)}
                />

                <p className="mt-2 text-xs text-[#9aacab]">
                  Pinned at {form.latitude || '—'}, {form.longitude || '—'}
                  {geolocation.status === 'located' && accuracyLabel && (
                    <span className="ml-1 font-semibold text-[#0D7A6E]">({accuracyLabel})</span>
                  )}
                  {' '}— click the map or drag the pin to the exact issue spot.
                </p>

                {geolocation.status === 'denied' && (
                  <p role="alert" className="mt-2 rounded-lg border border-[#f2c9c9] bg-[#fff5f5] px-3 py-2 text-xs font-medium text-[#b84d4d]">
                    {geolocation.message}
                  </p>
                )}
                {geolocation.status === 'unavailable' && (
                  <p role="alert" className="mt-2 rounded-lg border border-[#f7e2b8] bg-[#fffaf0] px-3 py-2 text-xs font-medium text-[#8a6a1f]">
                    {geolocation.message}
                  </p>
                )}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#315250]">Tell us more <span className="font-normal text-[#9aacab]">(optional)</span></span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Describe what is happening and where..."
                className="w-full resize-none rounded-xl border border-[#dce9e6] bg-white px-3.5 py-3 text-sm outline-none placeholder:text-[#a9bbba] focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10"
              />
            </label>

            {mutation.isError && (
              <div role="alert" className="rounded-xl border border-[#f2c9c9] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#b84d4d]">
                {getApiError(mutation.error)}
              </div>
            )}
            {submitted && (
              <div role="status" className="rounded-xl border border-[#bfe8dd] bg-[#effbf8] px-4 py-3 text-sm font-medium text-[#0D7A6E]">
                Your complaint was submitted successfully.
              </div>
            )}

            <div className="flex items-center justify-end border-t border-[#edf2f1] pt-5">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="!rounded-xl !bg-[#0D7A6E] !px-5 !py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mutation.isPending ? (
                  <><LoaderCircle className="mr-2 inline animate-spin" size={16} />Submitting...</>
                ) : 'Submit Report'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
