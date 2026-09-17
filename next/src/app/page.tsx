import Link from "next/link";
import { ArrowRightIcon, CloudOffIcon, DumbbellIcon, FootprintsIcon, ShieldCheckIcon } from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { SweatLevelBar } from "@/components/sweat-level-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demoScore } from "@/lib/fitness";

const features = [
  { icon: DumbbellIcon, title: "Your actual split", text: "Six editable push, pull, and leg templates—ready before your first set." },
  { icon: FootprintsIcon, title: "Runs, honestly logged", text: "Distance and time stay manual. Strava links are saved as references, never scraped." },
  { icon: CloudOffIcon, title: "Offline is the default", text: "Log in the basement, on the trail, or between dead zones. Sync waits for you." },
  { icon: ShieldCheckIcon, title: "Your line, your data", text: "Private rows, transparent scoring, and no made-up health claims." },
];

export default function Home() {
  return (
    <main className="grain min-h-dvh overflow-hidden">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-7 text-sm font-semibold md:flex" aria-label="Main navigation">
          <a href="#how-it-works" className="hover:text-pulse">How it works</a>
          <Link href="/workouts" className="hover:text-pulse">Templates</Link>
        </nav>
        <div className="flex items-center gap-2"><ThemeToggle /><Button size="lg" nativeButton={false} render={<Link href="/dashboard" />}>Open dashboard <ArrowRightIcon data-icon="inline-end" /></Button></div>
      </header>

      <section className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:py-24">
        <div>
          <Badge variant="outline" className="mb-8">Manual by design · Offline by default</Badge>
          <h1 className="display balance max-w-4xl text-6xl font-bold uppercase leading-[.86] sm:text-8xl lg:text-[7.6rem]">Hold the <span className="text-pulse">line.</span><br />Build the proof.</h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">Sweatline turns every set and every kilometre into one clear training throughline—without wearables, noise, or invented data.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Button size="lg" nativeButton={false} render={<Link href="/dashboard" />}>See your dashboard <ArrowRightIcon data-icon="inline-end" /></Button><Button size="lg" variant="outline" nativeButton={false} render={<a href="#how-it-works" />}>Why the score works</Button></div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-10 -rotate-3 rounded-[2.5rem] border border-pulse/30" aria-hidden="true" />
          <Card className="relative border-0 bg-card/95 shadow-2xl">
            <CardHeader className="border-b"><div className="flex items-center justify-between"><Badge>Today · live preview</Badge><span className="size-2 rounded-full bg-pulse" aria-label="Synced" /></div><CardTitle className="display mt-4 text-4xl uppercase">Your week has a pulse.</CardTitle><CardDescription>One score, with every component visible.</CardDescription></CardHeader>
            <CardContent className="grid gap-8 pt-3">
              <SweatLevelBar score={demoScore} />
              <div className="grid gap-5 sm:grid-cols-3">{[["Consistency", demoScore.consistency, "40"], ["Momentum", demoScore.momentum, "30"], ["Recency", demoScore.recency, "30"]].map(([label, value, max]) => <div key={label as string}><div className="mb-2 flex justify-between text-sm"><span>{label}</span><span className="font-semibold tabular-nums">{value}/{max}</span></div><div className="h-1.5 bg-muted"><div className="h-full bg-pulse" style={{ width: `${(Number(value) / Number(max)) * 100}%` }} /></div></div>)}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="how-it-works" className="border-y bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="mb-14 grid gap-5 md:grid-cols-2 md:items-end"><h2 className="display text-5xl font-bold uppercase sm:text-7xl">Everything useful.<br />Nothing pretending.</h2><p className="max-w-lg text-lg text-background/65 md:justify-self-end">The system rewards showing up, moving forward, and staying recent. Tap the score and see the math. No mystery metric.</p></div>
          <div className="grid gap-px bg-background/15 md:grid-cols-2 lg:grid-cols-4">{features.map((item, index) => <article key={item.title} className="bg-foreground p-7"><span className="display text-sm text-pulse">0{index + 1}</span><item.icon className="my-8 size-8 text-pulse" aria-hidden="true" /><h3 className="display text-2xl font-semibold uppercase">{item.title}</h3><p className="mt-3 leading-7 text-background/60">{item.text}</p></article>)}</div>
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8"><Brand /><p>Built for the work nobody else sees.</p></footer>
    </main>
  );
}
