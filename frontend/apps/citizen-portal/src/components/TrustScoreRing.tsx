interface TrustScoreRingProps {
  score: number;
}

export function TrustScoreRing({ score }: TrustScoreRingProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative mx-auto h-32 w-32" aria-label={`Trust score ${score} out of 100`} role="img">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e7f1ef" strokeWidth="8" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#2e9e5b" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <strong className="text-2xl font-bold text-[#0F2A2E]">{score}%</strong>
        <span className="text-[10px] font-medium text-[#7b9291]">Great work!</span>
      </div>
    </div>
  );
}
