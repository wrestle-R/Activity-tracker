import { TemplateManager } from "@/components/template-manager";
import { getAppData } from "@/lib/data";

export default async function WorkoutsPage() {
  const { templates } = await getAppData();
  return <div className="flex flex-col gap-7"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-pulse">Gym log</p><h1 className="display text-5xl font-bold uppercase">Your split.</h1><p className="mt-2 text-muted-foreground">Every training day belongs to you and can be changed completely.</p></div><TemplateManager initialTemplates={templates} /></div>;
}
