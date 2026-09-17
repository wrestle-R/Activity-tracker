import type { ScoreBreakdown } from "@/lib/fitness";
import { cn } from "@/lib/utils";

export function SweatLevelBar({
  score,
  compact = false,
}: {
  score: ScoreBreakdown;
  compact?: boolean;
}) {
  return (
    <div
      className="w-full"
      role="meter"
      aria-label={`Sweat Level ${score.total} out of 100, ${score.label}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={score.total}
      aria-valuetext={score.label}
    >
      <div className="mb-4 flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-pulse">Sweat level</p>
          <p className={cn("display mt-1 font-bold uppercase leading-none", compact ? "text-3xl" : "text-5xl sm:text-6xl")}>{score.label}</p>
        </div>
        <p className={cn("display font-bold leading-none tabular-nums", compact ? "text-4xl" : "text-6xl sm:text-7xl")}>
          {score.total}<span className="ml-1 text-base font-semibold opacity-55">/100</span>
        </p>
      </div>

      <div className={cn("relative overflow-hidden bg-current/10", compact ? "h-4" : "h-6")} aria-hidden="true">
        <div className="h-full bg-pulse transition-[width] duration-700 ease-out" style={{ width: `${score.total}%` }} />
        {[25, 50, 75].map((tick) => <span key={tick} className="absolute inset-y-0 w-px bg-current/25" style={{ left: `${tick}%` }} />)}
      </div>

      <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-[.14em] opacity-55" aria-hidden="true">
        <span>Cooling off</span><span>Building</span><span>Locked in</span>
      </div>
    </div>
  );
}
