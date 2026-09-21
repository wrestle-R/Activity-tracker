export type Exercise = { group: string; name: string; targetSets: number; targetReps: string };
export type Template = { id: string; name: string; category: "push" | "pull" | "legs" | "custom"; exercises: Exercise[]; client_updated_at: string; deleted_at?: string | null };
export type Workout = { id: string; name: string; performed_at: string; exercises: { name: string; weight?: number; reps?: number; sets?: number }[]; notes?: string | null };
export type Run = { id: string; title: string | null; performed_at: string; distance_km: number; duration_seconds: number; strava_url?: string | null; notes?: string | null };
export type ScoreBreakdown = { total: number; consistency: number; rhythm: number; recency: number; label: string };

export function calculateSweatScore(items: Array<{ performed_at: string }>, weeklyTarget = 4): ScoreBreakdown {
  const now = Date.now();
  const age = (date: string) => now - new Date(date).getTime();
  const window = (olderDays: number, newerDays = 0) => items.filter((item) => age(item.performed_at) <= olderDays * 86400000 && age(item.performed_at) > newerDays * 86400000);
  const current = window(7);
  // Lifting volume and running distance are different measurements. This is a
  // transparent habit signal, not a readiness or injury-risk calculation.
  const activeDays = new Set(current.map((item) => new Date(item.performed_at).toDateString())).size;
  const consistency = Math.min(activeDays / weeklyTarget, 1) * 40;
  const activeWeeks = [0, 1, 2, 3].filter((week) => window((week + 1) * 7, week * 7).length > 0).length;
  const rhythm = activeWeeks / 4 * 30;
  const newest = [...items].sort((a, b) => +new Date(b.performed_at) - +new Date(a.performed_at))[0];
  const days = newest ? Math.max(0, age(newest.performed_at) / 86400000) : 8;
  const recency = days <= 2 ? 30 : days >= 7 ? 0 : 30 * (1 - (days - 2) / 5);
  const total = Math.round(consistency + rhythm + recency);
  return { total, consistency: Math.round(consistency), rhythm: Math.round(rhythm), recency: Math.round(recency), label: total >= 80 ? "Locked in" : total >= 60 ? "Building rhythm" : total >= 35 ? "Restarting well" : total ? "Due a session" : "Start your line" };
}

export function workoutLoad(workout: Workout) {
  return workout.exercises.reduce((sum, item) => sum + Number(item.weight ?? 0) * Number(item.reps ?? 0) * Number(item.sets ?? 0), 0) / 100;
}

export function formatPace(distanceKm: number, durationSeconds: number) {
  if (!distanceKm || !durationSeconds) return "—";
  const seconds = Math.round(durationSeconds / distanceKm);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")} /km`;
}
