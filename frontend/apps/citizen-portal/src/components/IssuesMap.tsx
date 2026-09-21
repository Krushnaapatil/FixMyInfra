import { MapPin } from 'lucide-react';
import { Surface } from './Surface';

interface MapPinData {
  left: string;
  top: string;
  color: string;
  label: string;
}

const pins: MapPinData[] = [
  { left: '26%', top: '33%', color: '#ef6262', label: 'Road issue' },
  { left: '61%', top: '25%', color: '#e7ae3d', label: 'Water and drainage' },
  { left: '70%', top: '64%', color: '#3aae7c', label: 'Garbage' },
  { left: '37%', top: '69%', color: '#5792d9', label: 'Streetlight' },
  { left: '82%', top: '42%', color: '#ef6262', label: 'Road issue' }
];

const legend = [
  ['#ef6262', 'Road Issues'],
  ['#e7ae3d', 'Water and Drainage'],
  ['#3aae7c', 'Garbage'],
  ['#5792d9', 'Streetlights']
];

export function IssuesMap() {
  return (
    <Surface className="!rounded-2xl !p-1">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#17393b]">Issues around you</h2>
          <p className="mt-1 text-xs text-[#8aa09f]">Reported in your neighborhood</p>
        </div>
        <button type="button" className="text-xs font-semibold text-[#0D7A6E]">View map</button>
      </div>
      <div className="relative h-48 overflow-hidden rounded-xl border border-[#dceae7] bg-[#eef7f4]" aria-label="Map showing nearby infrastructure issues">
        <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(32deg, transparent 46%, #c7e2dc 47%, #c7e2dc 49%, transparent 50%), linear-gradient(112deg, transparent 46%, #d6e9e5 47%, #d6e9e5 49%, transparent 50%)', backgroundSize: '82px 68px' }} />
        <div className="absolute left-[13%] top-[-10%] h-[140%] w-10 rotate-[28deg] rounded-full bg-white/70" />
        <div className="absolute right-[17%] top-[-15%] h-[150%] w-8 -rotate-[24deg] rounded-full bg-white/60" />
        {pins.map((pin) => (
          <span key={`${pin.left}-${pin.top}`} className="absolute -translate-x-1/2 -translate-y-full drop-shadow-sm" style={{ left: pin.left, top: pin.top, color: pin.color }} title={pin.label}>
            <MapPin size={26} fill="currentColor" strokeWidth={1.5} />
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {legend.map(([color, label]) => <span key={label} className="flex items-center gap-1.5 text-[10px] text-[#76908f]"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{label}</span>)}
      </div>
    </Surface>
  );
}
