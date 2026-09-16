import { ArrowRightIcon, DumbbellIcon, PlusIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { templates } from "@/lib/fitness";

export default function WorkoutsPage() {
  return <div className="flex flex-col gap-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-pulse">Gym log</p><h1 className="display text-5xl font-bold uppercase">Choose the work.</h1><p className="mt-2 text-muted-foreground">Start from your split, then change anything for today.</p></div><Button variant="outline"><PlusIcon data-icon="inline-start" /> Blank session</Button></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{templates.map((template, index) => <Card key={template.name} className="lift"><CardHeader><span className="display text-sm font-bold text-pulse">0{index + 1}</span><CardTitle className="display text-3xl uppercase">{template.name}</CardTitle><CardDescription>{template.detail}</CardDescription><CardAction><Badge variant="outline">{template.category}</Badge></CardAction></CardHeader><CardContent><div className="flex items-center gap-2 text-sm text-muted-foreground"><DumbbellIcon className="size-4" /><span>{template.exercises} exercises · Fully editable</span></div></CardContent><CardFooter className="justify-end"><Button variant="ghost">Start session <ArrowRightIcon data-icon="inline-end" /></Button></CardFooter></Card>)}</div></div>;
}

