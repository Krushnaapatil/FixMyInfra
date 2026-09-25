import { Link } from 'react-router-dom';
import { Surface } from './Surface';
import reportPhone from '../assets/home/report-phone.png';
import step1 from '../assets/home/step-1.png';
import step2 from '../assets/home/step-2.png';
import step3 from '../assets/home/step-3.png';

const steps = [
  { icon: step1, label: 'Upload a Photo' },
  { icon: step2, label: 'Confirm Location' },
  { icon: step3, label: 'Submit' }
];

export function ReportCTA() {
  return (
    <Surface className="!rounded-2xl !border-[#e7efec] !p-6 !shadow-sm sm:!p-7">
      <div className="flex items-center gap-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-[22px] font-bold leading-8 tracking-[-0.02em] text-[#0F2A2E] sm:text-2xl">
            See an issue?<br />Report it in a few clicks.
          </h2>
          <p className="mt-2 max-w-sm text-[13px] leading-5 text-[#78908e]">
            Upload a photo, confirm the location and let us handle the rest
          </p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-[10px] bg-[#0D7A6E] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#0b6a5d]"
          >
            Report Grievance
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            {steps.map(({ icon, label }) => (
              <span key={label} className="flex items-center gap-2 text-xs font-medium text-[#43586c]">
                <img src={icon} alt="" className="h-4 w-4" />
                {label}
              </span>
            ))}
          </div>
        </div>
        <img
          src={reportPhone}
          alt="Report an issue from your phone"
          className="hidden w-36 shrink-0 sm:block lg:w-44"
        />
      </div>
    </Surface>
  );
}
