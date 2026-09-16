export type ScoreBreakdown = { total: number; consistency: number; momentum: number; recency: number; label: string };

export function calculateSweatScore(input: { sessionsLast7: number; currentLoad: number; trailingAverageLoad: number; daysSinceLastActivity: number; weeklyTarget?: number }): ScoreBreakdown {
  const consistency = Math.min(input.sessionsLast7 / (input.weeklyTarget ?? 4), 1) * 40;
  const ratio = input.trailingAverageLoad > 0 ? input.currentLoad / input.trailingAverageLoad : input.currentLoad > 0 ? 1 : 0;
  const momentum = Math.min(Math.max(ratio, 0), 1) * 30;
  const recency = input.daysSinceLastActivity <= 2 ? 30 : input.daysSinceLastActivity >= 7 ? 0 : 30 * (1 - (input.daysSinceLastActivity - 2) / 5);
  const total = Math.round(consistency + momentum + recency);
  const label = total >= 80 ? "Locked in" : total >= 60 ? "Building" : total >= 35 ? "Finding rhythm" : "Cooling off";
  return { total, consistency: Math.round(consistency), momentum: Math.round(momentum), recency: Math.round(recency), label };
}

export const demoScore = calculateSweatScore({ sessionsLast7: 4, currentLoad: 118, trailingAverageLoad: 126, daysSinceLastActivity: 1 });

export const trend = [
  { day: "M", load: 42, baseline: 44 }, { day: "T", load: 56, baseline: 48 }, { day: "W", load: 54, baseline: 50 },
  { day: "T", load: 71, baseline: 55 }, { day: "F", load: 68, baseline: 58 }, { day: "S", load: 84, baseline: 62 }, { day: "S", load: 82, baseline: 64 },
];

export const templates = [
  { name: "Push Day 1", category: "Push", exercises: 5, detail: "Chest · shoulders · triceps" },
  { name: "Push Day 2", category: "Push", exercises: 5, detail: "Shoulders · chest · triceps" },
  { name: "Pull Day 1", category: "Pull", exercises: 8, detail: "Back · biceps · rear delts" },
  { name: "Pull Day 2", category: "Pull", exercises: 8, detail: "Back · biceps · rear delts" },
  { name: "Leg Day 1", category: "Legs", exercises: 5, detail: "Quads · hamstrings · calves" },
  { name: "Leg Day 2", category: "Legs", exercises: 5, detail: "Glutes · hamstrings · calves" },
];

