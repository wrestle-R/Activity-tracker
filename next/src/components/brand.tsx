import Link from "next/link";
import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg className={cn("size-8", className)} viewBox="0 0 40 40" role="img" aria-label="Sweatline mark">
      <path d="M4 23h7l3-11 6 20 5-14 3 5h8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex min-h-11 items-center gap-2 font-heading text-2xl font-bold uppercase tracking-tight" aria-label="Sweatline home">
      <span className="grid size-10 place-items-center rounded-lg bg-pulse text-pulse-foreground"><Mark className="size-7" /></span>
      {!compact && <span>Sweatline</span>}
    </Link>
  );
}

