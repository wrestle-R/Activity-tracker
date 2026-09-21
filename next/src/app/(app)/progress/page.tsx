import { ActivityChart } from "@/components/activity-chart";
import { SweatLevelBar } from "@/components/sweat-level-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData } from "@/lib/data";

export default async function ProgressPage() {
  const { workouts, runs, score } = await getAppData();
  const chart = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); return { day: new Intl.DateTimeFormat("en", { weekday: "narrow" }).format(date), sessions: [...workouts, ...runs].filter((item) => new Date(item.performed_at).toDateString() === date.toDateString()).length }; });
  return <div className="flex flex-col gap-7"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-pulse">Progress</p><h1 className="display text-5xl font-bold uppercase">The long line.</h1><p className="mt-2 text-muted-foreground">A clear view of your training rhythm.</p></div><div className="grid gap-6 lg:grid-cols-[440px_1fr]"><Card><CardHeader><CardTitle className="display text-2xl uppercase">Training rhythm</CardTitle><CardDescription>Calculated only from your private training history.</CardDescription></CardHeader><CardContent className="flex flex-col gap-6"><SweatLevelBar score={score} compact /><div className="grid w-full grid-cols-3 gap-2 text-center">{[[score.consistency, "Active days"], [score.rhythm, "Four weeks"], [score.recency, "Recency"]].map(([value, label]) => <div key={String(label)} className="rounded-lg bg-muted p-3"><p className="display text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>)}</div></CardContent></Card><Card><CardHeader><CardTitle className="display text-2xl uppercase">Seven-day activity</CardTitle><CardDescription>{workouts.length + runs.length ? "How often you moved each day." : "Your chart begins with your first session."}</CardDescription><Badge variant="outline">Sessions</Badge></CardHeader><CardContent><ActivityChart data={chart} /></CardContent></Card></div></div>;
}
