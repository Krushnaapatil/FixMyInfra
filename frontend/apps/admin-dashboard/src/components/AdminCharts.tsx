import type { Complaint } from '@fixmyinfra/types';

const WIDTH = 560;
const HEIGHT = 220;
const PAD_LEFT = 36;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;

export interface DayBucket {
  label: string;
  submitted: number;
  resolved: number;
}

export function last30DayBuckets(complaints: Complaint[], now = new Date()): DayBucket[] {
  const days: DayBucket[] = [];
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 29);

  for (let i = 0; i < 30; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const submitted = complaints.filter((complaint) => {
      const created = new Date(complaint.createdAt).getTime();
      return created >= day.getTime() && created < next.getTime();
    }).length;
    const resolved = complaints.filter((complaint) => {
      if (complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED') return false;
      const updated = new Date(complaint.updatedAt ?? complaint.createdAt).getTime();
      return updated >= day.getTime() && updated < next.getTime();
    }).length;
    days.push({
      label: new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' }).format(day),
      submitted,
      resolved
    });
  }
  return days;
}

function points(values: number[], max: number): string {
  const innerWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  return values
    .map((value, index) => {
      const x = PAD_LEFT + (index / (values.length - 1)) * innerWidth;
      const y = PAD_TOP + innerHeight - (value / max) * innerHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function TrendChart({ buckets }: { buckets: DayBucket[] }) {
  const max = Math.max(1, ...buckets.map((bucket) => Math.max(bucket.submitted, bucket.resolved)));
  const submittedLine = points(buckets.map((bucket) => bucket.submitted), max);
  const resolvedLine = points(buckets.map((bucket) => bucket.resolved), max);
  const ticks = [0, 7, 14, 21, 29].map((index) => buckets[index]?.label ?? '');
  const gridLines = [0, 0.5, 1].map((fraction) => PAD_TOP + (HEIGHT - PAD_TOP - PAD_BOTTOM) * fraction);

  return (
    <figure>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Complaints submitted and resolved per day over the last 30 days">
        {gridLines.map((y) => (
          <line key={y} x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={y} y2={y} stroke="#eef2f1" strokeWidth="1" />
        ))}
        <polyline points={`${PAD_LEFT},${HEIGHT - PAD_BOTTOM} ${submittedLine} ${WIDTH - PAD_RIGHT},${HEIGHT - PAD_BOTTOM}`} fill="rgba(59,130,246,0.08)" stroke="none" />
        <polyline points={submittedLine} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={resolvedLine} fill="none" stroke="#0D7A6E" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {ticks.map((label, i) => (
          <text key={label} x={PAD_LEFT + (i / (ticks.length - 1)) * (WIDTH - PAD_LEFT - PAD_RIGHT)} y={HEIGHT - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">
            {label}
          </text>
        ))}
      </svg>
      <figcaption className="mt-3 flex items-center justify-center gap-5 text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" /> Complaints Submitted</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#0D7A6E]" /> Complaints Resolved</span>
      </figcaption>
    </figure>
  );
}

const donutColors = ['#0e7490', '#60a5fa', '#22c55e', '#f59e0b', '#a78bfa', '#cbd5e1'];

export interface CategoryShare {
  label: string;
  value: number;
}

export function CategoryDonut({ shares, total }: { shares: CategoryShare[]; total: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 25;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180" role="img" aria-label="Share of complaints by category">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="#eef2f1" strokeWidth="22" />
        {shares.map((share, index) => {
          const fraction = total > 0 ? share.value / total : 0;
          const dash = `${(fraction * circumference).toFixed(1)} ${(circumference - fraction * circumference).toFixed(1)}`;
          const rotation = (offset / 100) * 360;
          offset += fraction * 100;
          return (
            <circle
              key={share.label}
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={donutColors[index % donutColors.length]}
              strokeWidth="22"
              strokeDasharray={dash}
              transform={`rotate(${rotation.toFixed(1)} 90 90)`}
            />
          );
        })}
        <text x="90" y="86" textAnchor="middle" fontSize="26" fontWeight="800" fill="#0f172a">
          {total.toLocaleString('en-IN')}
        </text>
        <text x="90" y="106" textAnchor="middle" fontSize="11" fill="#64748b">
          Total
        </text>
      </svg>
      <ul className="w-full max-w-[220px] space-y-2.5">
        {shares.map((share, index) => (
          <li key={share.label} className="flex items-center gap-2.5 text-sm">
            <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: donutColors[index % donutColors.length] }} />
            <span className="flex-1 text-slate-600">{share.label}</span>
            <strong className="text-slate-900">{total > 0 ? Math.round((share.value / total) * 100) : 0}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
