"use client";

import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const config = { load: { label: "Training load", color: "var(--pulse)" }, baseline: { label: "4-week baseline", color: "var(--warm)" } } satisfies ChartConfig;

export function ActivityChart({ data }: { data: { day: string; load: number; baseline: number }[] }) {
  if (!data.length) return <div className="grid h-64 place-items-center rounded-lg border border-dashed text-sm text-muted-foreground">Log a workout or run to see your training shape.</div>;
  return (
    <ChartContainer config={config} className="h-64 w-full aspect-auto" aria-label="Seven day training load trend">
      <AreaChart data={data} margin={{ left: -22, right: 8, top: 12 }}>
        <defs><linearGradient id="loadFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-load)" stopOpacity={0.28} /><stop offset="100%" stopColor="var(--color-load)" stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid vertical={false} strokeDasharray="3 5" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
        <YAxis tickLine={false} axisLine={false} tickMargin={6} domain={[0, "auto"]} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area dataKey="load" type="monotone" fill="url(#loadFill)" stroke="var(--color-load)" strokeWidth={3} isAnimationActive={false} />
        <Line dataKey="baseline" type="monotone" stroke="var(--color-baseline)" strokeDasharray="5 5" strokeWidth={2} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ChartContainer>
  );
}
