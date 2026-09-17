import { ActivityChart } from "@/components/activity-chart";
import { SweatLevelBar } from "@/components/sweat-level-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demoScore } from "@/lib/fitness";

export default function ProgressPage() {
  return <div className="flex flex-col gap-7"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-pulse">Progress</p><h1 className="display text-5xl font-bold uppercase">The long line.</h1><p className="mt-2 text-muted-foreground">What is moving, and exactly why.</p></div><div className="grid gap-6 lg:grid-cols-[440px_1fr]"><Card><CardHeader><CardTitle className="display text-2xl uppercase">Current level</CardTitle><CardDescription>Updated from your local activity history.</CardDescription></CardHeader><CardContent className="flex flex-col gap-6"><SweatLevelBar score={demoScore} compact /><div className="grid w-full grid-cols-3 gap-2 text-center">{[["40", "Consistency"], ["28", "Momentum"], ["30", "Recency"]].map(([value, label]) => <div key={label} className="rounded-lg bg-muted p-3"><p className="display text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>)}</div></CardContent></Card><Card><CardHeader><CardTitle className="display text-2xl uppercase">Seven-day shape</CardTitle><CardDescription>Your daily load is 28% above Monday.</CardDescription><Badge variant="outline">Load + baseline</Badge></CardHeader><CardContent><ActivityChart /></CardContent></Card></div></div>;
}
