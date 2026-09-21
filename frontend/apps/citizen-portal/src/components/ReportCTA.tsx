import { ArrowRight, Camera, CheckCircle2, MapPinned } from 'lucide-react';
import { Button } from '@fixmyinfra/ui-kit';
import { Surface } from './Surface';
import { Link } from 'react-router-dom';

const steps = [
  { icon: Camera, label: 'Upload a Photo' },
  { icon: MapPinned, label: 'Confirm Location' },
  { icon: CheckCircle2, label: 'Submit' }
];

export function ReportCTA() {
  return (
    <Surface className="portal-card-cta relative isolate overflow-hidden">
      <div className="relative z-10 max-w-md">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#0D7A6E]">Make a difference</span>
        <h2 className="mt-2 text-2xl font-bold leading-tight tracking-[-0.03em] text-[#0F2A2E]">See an issue? Report it in a few clicks.</h2>
        <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-5">
          {steps.map(({ icon: Icon, label }, index) => <div key={label} className="flex items-center gap-2 text-xs font-medium text-[#52716f]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0D7A6E] shadow-sm"><Icon size={15} /></span><span>{label}</span>{index < steps.length - 1 && <ArrowRight size={14} className="ml-0 text-[#9ac8bf]" />}</div>)}
        </div>
        <Link to="/" className="mt-6 inline-block"><Button className="!rounded-xl !bg-[#0D7A6E] !px-5 !py-3 text-sm font-semibold shadow-sm">Report Grievance <ArrowRight className="ml-2 inline" size={16} /></Button></Link>
      </div>
      <div className="absolute -right-6 bottom-[-32px] hidden h-48 w-52 rotate-[-7deg] rounded-[34px] border-[7px] border-[#0D7A6E]/20 bg-white/80 shadow-xl sm:block" aria-hidden="true"><div className="absolute left-1/2 top-2 h-1.5 w-14 -translate-x-1/2 rounded-full bg-[#b9d9d3]" /><div className="absolute left-5 right-5 top-10 h-14 rounded-xl bg-[#d9f1eb]" /><div className="absolute bottom-5 left-5 h-3 w-24 rounded-full bg-[#b9d9d3]" /><div className="absolute bottom-5 right-5 h-3 w-8 rounded-full bg-[#14B8A6]" /></div>
    </Surface>
  );
}
