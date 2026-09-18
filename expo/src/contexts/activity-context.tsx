import NetInfo from '@react-native-community/netinfo';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Activity, initDatabase, insertActivity, listActivities } from '@/lib/local-db';
import { calculateSweatScore } from '@/lib/fitness';
import { getSupabase, syncActivities } from '@/lib/supabase';

type ActivityValue = {
  activities: Activity[]; loading: boolean; score: ReturnType<typeof calculateSweatScore>; syncStatus: 'Offline' | 'Syncing' | 'Synced' | 'Error'; refresh: () => Promise<void>; syncNow: () => Promise<void>;
  addWorkout: (input: { title: string; entries: { name: string; weight: number; reps: number; sets: number }[] }) => Promise<void>;
  addRun: (input: { title: string; distanceKm: number; durationSeconds: number; stravaUrl?: string }) => Promise<void>;
};
const ActivityContext = createContext<ActivityValue | null>(null);

export function ActivityProvider({ children }: PropsWithChildren) {
  const [activities, setActivities] = useState<Activity[]>([]); const [userId, setUserId] = useState('guest'); const [syncStatus, setSyncStatus] = useState<ActivityValue['syncStatus']>('Offline');
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => setActivities(await listActivities(userId)), [userId]);
  const syncNow = useCallback(async () => { const client = getSupabase(); if (!client || userId === 'guest') return setSyncStatus('Offline'); setSyncStatus('Syncing'); try { await syncActivities(await listActivities(userId)); await refresh(); setSyncStatus('Synced'); } catch { setSyncStatus('Error'); } }, [refresh, userId]);
  useEffect(() => { let active = true; const client = getSupabase(); initDatabase().then(async () => { const user = (await client?.auth.getUser())?.data.user; if (active) setUserId(user?.id ?? 'guest'); }).finally(() => active && setLoading(false)); const subscription = client?.auth.onAuthStateChange((_event, session) => setUserId(session?.user.id ?? 'guest')); const network = NetInfo.addEventListener((state) => { if (state.isConnected) void syncNow(); else setSyncStatus('Offline'); }); return () => { active = false; subscription?.data.subscription.unsubscribe(); network(); }; }, [syncNow]);
  useEffect(() => { listActivities(userId).then((items) => setActivities(items)); }, [userId]);
  const addWorkout: ActivityValue['addWorkout'] = async ({ title, entries }) => { const volumeKg = entries.reduce((sum, entry) => sum + entry.weight * entry.reps * entry.sets, 0); await insertActivity({ userId, kind: 'workout', title, occurredAt: new Date().toISOString(), payload: { volumeKg, exercises: entries } }); await refresh(); void syncNow(); };
  const addRun: ActivityValue['addRun'] = async ({ title, distanceKm, durationSeconds, stravaUrl }) => { await insertActivity({ userId, kind: 'run', title, occurredAt: new Date().toISOString(), payload: { distanceKm, durationSeconds, ...(stravaUrl ? { stravaUrl } : {}) } }); await refresh(); void syncNow(); };
  const score = useMemo(() => calculateSweatScore(activities), [activities]);
  return <ActivityContext.Provider value={{ activities, loading, score, syncStatus, refresh, syncNow, addWorkout, addRun }}>{children}</ActivityContext.Provider>;
}

export function useActivities() {
  const value = useContext(ActivityContext);
  if (!value) throw new Error('useActivities must be used inside ActivityProvider');
  return value;
}
