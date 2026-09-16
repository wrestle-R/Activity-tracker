import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const rows = [["Follow system theme", "Sweatline adapts to this device", true], ["Use kilometres", "Run distance and pace use metric units", true], ["Use kilograms", "Weights are stored and shown in kg", true], ["Background sync", "Push local changes when a connection returns", true]] as const;

export default function SettingsPage() {
  return <div className="mx-auto flex max-w-3xl flex-col gap-7"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-pulse">Settings</p><h1 className="display text-5xl font-bold uppercase">Make it yours.</h1></div><Card><CardHeader><CardTitle className="display text-2xl uppercase">Preferences</CardTitle><CardDescription>Saved locally first, then synced to your profile.</CardDescription></CardHeader><CardContent className="flex flex-col">{rows.map(([label, description, checked], index) => <div key={label}>{index > 0 && <Separator />}<label className="flex min-h-20 cursor-pointer items-center gap-4 py-4"><span className="flex-1"><span className="block font-semibold">{label}</span><span className="block text-sm text-muted-foreground">{description}</span></span><Switch defaultChecked={checked} aria-label={label} /></label></div>)}</CardContent></Card><Card><CardHeader><CardTitle className="display text-2xl uppercase">Sync status</CardTitle><CardDescription>Supabase is ready once a public client key is configured.</CardDescription></CardHeader><CardContent><Badge variant="outline">Offline mode · all local features available</Badge></CardContent></Card></div>;
}
