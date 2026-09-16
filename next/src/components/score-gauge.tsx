import type { ScoreBreakdown } from "@/lib/fitness";

export function ScoreGauge({ score, size = "large" }: { score: ScoreBreakdown; size?: "large" | "small" }) {
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * score.total / 100;
  return (
    <div className={size === "large" ? "relative size-56" : "relative size-36"} role="img" aria-label={`Sweat Score ${score.total} out of 100, ${score.label}`}>
      <svg viewBox="0 0 180 180" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted" />
        <circle cx="90" cy="90" r={radius} fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="square" className="text-pulse" strokeDasharray={`${dash} ${circumference - dash}`} />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="display text-6xl font-bold leading-none tabular-nums">{score.total}</span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">{score.label}</span>
      </div>
    </div>
  );
}

