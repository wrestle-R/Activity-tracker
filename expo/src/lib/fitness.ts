import type { Activity } from '@/lib/local-db';

export type SweatScore = { total: number; consistency: number; momentum: number; recency: number; label: string };

export function calculateSweatScore(activities: Activity[], weeklyTarget = 4): SweatScore {
  const now = Date.now();
  const week = activities.filter((item) => now - new Date(item.occurredAt).getTime() <= 7 * 86400000);
  const consistency = Math.min(week.length / weeklyTarget, 1) * 40;
  const activityLoad = (items: Activity[]) => items.reduce((sum, item) => sum + (item.kind === 'run' ? Number(item.payload.distanceKm ?? 0) * 10 : Number(item.payload.volumeKg ?? 0) / 100), 0);
  const currentLoad = activityLoad(week);
  const previous = activities.filter((item) => { const age = now - new Date(item.occurredAt).getTime(); return age > 7 * 86400000 && age <= 35 * 86400000; });
  const baseline = previous.length ? activityLoad(previous) / 4 : currentLoad;
  const momentum = baseline > 0 ? Math.min(currentLoad / baseline, 1) * 30 : 0;
  const newest = activities[0];
  const days = newest ? Math.max(0, (now - new Date(newest.occurredAt).getTime()) / 86400000) : 8;
  const recency = days <= 2 ? 30 : days >= 7 ? 0 : 30 * (1 - (days - 2) / 5);
  const total = Math.round(consistency + momentum + recency);
  const label = total >= 80 ? 'Locked in' : total >= 60 ? 'Building' : total >= 35 ? 'Finding rhythm' : total > 0 ? 'Cooling off' : 'Start your line';
  return { total, consistency: Math.round(consistency), momentum: Math.round(momentum), recency: Math.round(recency), label };
}

export function formatPace(distanceKm: number, durationSeconds: number) {
  if (!distanceKm || !durationSeconds) return '—';
  const seconds = Math.round(durationSeconds / distanceKm);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} /km`;
}

