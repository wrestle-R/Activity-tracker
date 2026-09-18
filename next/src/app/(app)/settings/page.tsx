import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PreferencesForm } from "@/components/preferences-form";
import { getAppData } from "@/lib/data";

export default async function SettingsPage() {
  const { profile } = await getAppData();
  return <div className="mx-auto flex max-w-3xl flex-col gap-7"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-pulse">Settings</p><h1 className="display text-5xl font-bold uppercase">Make it yours.</h1></div><Card><CardHeader><CardTitle className="display text-2xl uppercase">Preferences</CardTitle><CardDescription>These settings are stored privately in your profile.</CardDescription></CardHeader><CardContent><PreferencesForm profile={profile} /></CardContent></Card><Card><CardHeader><CardTitle className="display text-2xl uppercase">Sync status</CardTitle><CardDescription>Your website is connected directly to your Supabase account.</CardDescription></CardHeader><CardContent><Badge variant="outline">Cloud-backed · private by RLS</Badge></CardContent></Card></div>;
}
