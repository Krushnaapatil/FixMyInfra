import { MapPin } from 'lucide-react';

interface BrandProps {
  compact?: boolean;
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D7A6E] text-white shadow-sm">
        <MapPin size={21} strokeWidth={2.5} fill="currentColor" />
      </span>
      <span className="min-w-0">
        <span className="block text-[19px] font-bold leading-none tracking-[-0.03em] text-[#0F2A2E]">InfraFix</span>
        {!compact && <span className="mt-1 block whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.12em] text-[#6A8585]">Solutions for your Infrastructure</span>}
      </span>
    </div>
  );
}
