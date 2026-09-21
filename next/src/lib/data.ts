import { redirect } from "next/navigation";
import { calculateSweatScore, type Run, type Template, type Workout } from "@/lib/fitness";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function requireUser() {
  const client = await getSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  return { client, user };
}

export async function getAppData() {
  const now = Date.now();
  const { client, user } = await requireUser();
  const [profileResult, templatesResult, workoutsResult, runsResult] = await Promise.all([
    client.from("sweatline_profiles").select("display_name, username, weekly_target, distance_unit, weight_unit, theme_preference").single(),
    client.from("sweatline_templates").select("id,name,category,exercises,client_updated_at,deleted_at").is("deleted_at", null).order("updated_at", { ascending: false }),
    client.from("sweatline_workouts").select("id,name,performed_at,exercises,notes").order("performed_at", { ascending: false }),
    client.from("sweatline_runs").select("id,title,performed_at,distance_km,duration_seconds,strava_url,notes").order("performed_at", { ascending: false }),
  ]);
  if (templatesResult.error || workoutsResult.error || runsResult.error) throw new Error("Could not load your training data.");
  const workouts = (workoutsResult.data ?? []) as Workout[];
  const runs = (runsResult.data ?? []) as Run[];
  const score = calculateSweatScore([
    ...workouts.map((item) => ({ performed_at: item.performed_at })),
    ...runs.map((item) => ({ performed_at: item.performed_at })),
  ], profileResult.data?.weekly_target ?? 4);
  return { now, user, profile: profileResult.data, templates: (templatesResult.data ?? []) as Template[], workouts, runs, score };
}
