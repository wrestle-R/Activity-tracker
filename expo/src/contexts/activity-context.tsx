import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Activity, initDatabase, insertActivity, listActivities } from '@/lib/local-db';
import { calculateSweatScore } from '@/lib/fitness';

type ActivityValue = {
  activities: Activity[]; loading: boolean; score: ReturnType<typeof calculateSweatScore>;
  addWorkout: (input: { title: string; entries: { name: string; weight: number; reps: number; sets: number }[] }) => Promise<void>;
  addRun: (input: { title: string; distanceKm: number; durationSeconds: number; stravaUrl?: string }) => Promise<void>;
};
const ActivityContext = createContext<ActivityValue | null>(null);

export function ActivityProvider({ children }: PropsWithChildren) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => setActivities(await listActivities()), []);
  useEffect(() => { initDatabase().then(refresh).finally(() => setLoading(false)); }, [refresh]);
  const addWorkout: ActivityValue['addWorkout'] = async ({ title, entries }) => { const volumeKg = entries.reduce((sum, entry) => sum + entry.weight * entry.reps * entry.sets, 0); await insertActivity({ kind: 'workout', title, occurredAt: new Date().toISOString(), payload: { volumeKg, exercises: entries }, isPreview: false }); await refresh(); };
  const addRun: ActivityValue['addRun'] = async ({ title, distanceKm, durationSeconds, stravaUrl }) => { await insertActivity({ kind: 'run', title, occurredAt: new Date().toISOString(), payload: { distanceKm, durationSeconds, ...(stravaUrl ? { stravaUrl } : {}) }, isPreview: false }); await refresh(); };
  const score = useMemo(() => calculateSweatScore(activities), [activities]);
  return <ActivityContext.Provider value={{ activities, loading, score, addWorkout, addRun }}>{children}</ActivityContext.Provider>;
}

export function useActivities() {
  const value = useContext(ActivityContext);
  if (!value) throw new Error('useActivities must be used inside ActivityProvider');
  return value;
}
