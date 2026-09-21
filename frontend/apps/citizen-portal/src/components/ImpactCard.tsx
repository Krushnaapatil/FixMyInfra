import { HeartHandshake } from 'lucide-react';
import { Surface } from './Surface';

export function ImpactCard() {
  return (
    <Surface className="portal-card-mint">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0D7A6E] shadow-sm"><HeartHandshake size={20} /></div>
      <h2 className="mt-4 text-base font-bold text-[#17393b]">Your Impact</h2>
      <p className="mt-1.5 text-xs leading-5 text-[#5f7c7a]">You helped make your community cleaner with <strong className="text-[#0D7A6E]">3 reports</strong> this month.</p>
    </Surface>
  );
}
