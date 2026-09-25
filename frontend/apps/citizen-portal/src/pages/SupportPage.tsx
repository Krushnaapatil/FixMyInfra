import { Link } from 'react-router-dom';
import { Camera, MapPin, BellRing } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card } from '../components/StyledCard';

const faqs = [
  {
    icon: Camera,
    title: 'How do I report an issue?',
    body: 'Open Report Grievance, upload a clear photo of the issue, confirm the location on the map, and submit. You can track it under My Complaints.'
  },
  {
    icon: MapPin,
    title: 'How does location confirmation work?',
    body: 'Move the pin to the exact spot of the issue before submitting. Accurate locations help officers reach the site faster.'
  },
  {
    icon: BellRing,
    title: 'How do I get status updates?',
    body: 'Every status change on your reports appears under Notifications and on the tracking page — from verification through resolution.'
  }
];

export default function SupportPage() {
  return (
    <PageShell title="Help and Support" activeCount={0}>
      <p className="mb-5 max-w-2xl text-sm leading-6 text-[#78908e]">
        Answers to common questions about reporting and tracking civic issues. For anything else, visit your ward office with your complaint ID.
      </p>
      <div className="grid max-w-3xl gap-4">
        {faqs.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="!rounded-2xl !border !border-[#e7efec] !p-5 !shadow-sm">
            <div className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf8f4] text-[#0D7A6E]"><Icon size={19} /></span>
              <div>
                <h2 className="text-[15px] font-bold text-[#17393b]">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-[#5f7c7a]">{body}</p>
              </div>
            </div>
          </Card>
        ))}
        <Card className="!rounded-2xl !border !border-[#e7efec] !bg-[#eaf8f4] !p-5 !shadow-sm">
          <h2 className="text-[15px] font-bold text-[#17393b]">Still stuck?</h2>
          <p className="mt-1 text-sm text-[#5f7c7a]">
            <Link to="/" className="font-semibold text-[#0D7A6E] hover:underline">File a new report</Link> or{' '}
            <Link to="/complaints" className="font-semibold text-[#0D7A6E] hover:underline">check your existing reports</Link>.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
