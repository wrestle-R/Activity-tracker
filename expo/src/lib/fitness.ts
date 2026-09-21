import type { Activity } from '@/lib/local-db';

export type SweatScore = { total: number; consistency: number; rhythm: number; recency: number; label: string };

export function calculateSweatScore(activities: Activity[], weeklyTarget = 4): SweatScore {
  const now = Date.now();
  const inWindow = (olderDays: number, newerDays = 0) => activities.filter((item) => { const age = now - new Date(item.occurredAt).getTime(); return age <= olderDays * 86400000 && age > newerDays * 86400000; });
  const week = inWindow(7);
  // A kilo lifted and a kilometre run are not comparable training-load units.
  // This is intentionally a transparent adherence signal, not an injury-risk
  // score: it uses distinct active days, four-week repeatability, and recency.
  const activeDays = new Set(week.map((item) => new Date(item.occurredAt).toDateString())).size;
  const consistency = Math.min(activeDays / weeklyTarget, 1) * 40;
  const activeWeeks = [0, 1, 2, 3].filter((weekIndex) => inWindow((weekIndex + 1) * 7, weekIndex * 7).length > 0).length;
  const rhythm = activeWeeks / 4 * 30;
  const newest = activities[0];
  const sinceLast = newest ? Math.max(0, (now - new Date(newest.occurredAt).getTime()) / 86400000) : 8;
  const recency = sinceLast <= 2 ? 30 : sinceLast >= 7 ? 0 : 30 * (1 - (sinceLast - 2) / 5);
  const total = Math.round(consistency + rhythm + recency);
  const label = total >= 80 ? 'Locked in' : total >= 60 ? 'Building rhythm' : total >= 35 ? 'Restarting well' : total > 0 ? 'Due a session' : 'Start your line';
  return { total, consistency: Math.round(consistency), rhythm: Math.round(rhythm), recency: Math.round(recency), label };
}

export function formatPace(distanceKm: number, durationSeconds: number) {
  if (!distanceKm || !durationSeconds) return '—';
  const seconds = Math.round(durationSeconds / distanceKm);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} /km`;
}
