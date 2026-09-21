import { RunManager } from "@/components/run-manager";
import { getAppData } from "@/lib/data";

export default async function RunsPage() {
  const { runs } = await getAppData();
  return <div className="flex flex-col gap-7"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-pulse">Run log</p><h1 className="display text-5xl font-bold uppercase">Distance, on your terms.</h1><p className="mt-2 text-muted-foreground">Elapsed time is clear, pace is calculated, and every run stays yours.</p></div><RunManager initialRuns={runs} /></div>;
}
