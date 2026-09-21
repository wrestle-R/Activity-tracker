import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PreferencesForm } from "@/components/preferences-form";
import { getAppData } from "@/lib/data";

export default async function SettingsPage() {
  const { profile } = await getAppData();
  return <div className="mx-auto flex max-w-3xl flex-col gap-7"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-pulse">Settings</p><h1 className="display text-5xl font-bold uppercase">Make it yours.</h1></div><Card><CardHeader><CardTitle className="display text-2xl uppercase">Preferences</CardTitle><CardDescription>These settings are stored privately in your profile.</CardDescription></CardHeader><CardContent><PreferencesForm profile={profile} /></CardContent></Card><Card><CardHeader><CardTitle className="display text-2xl uppercase">Your account</CardTitle><CardDescription>Your web dashboard is private and always reflects your signed-in training history.</CardDescription></CardHeader><CardContent><Badge variant="outline">Private training record</Badge></CardContent></Card></div>;
}
