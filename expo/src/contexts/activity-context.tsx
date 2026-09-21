import NetInfo from '@react-native-community/netinfo';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Activity, claimGuestData, createId, deleteTemplate, ensureStarterTemplates, initDatabase, insertActivity, listActivities, listTemplates, LocalTemplate, pendingChanges, saveTemplate } from '@/lib/local-db';
import { calculateSweatScore } from '@/lib/fitness';
import { getSupabase, syncActivities, syncTemplates } from '@/lib/supabase';

type SyncStatus = 'Guest' | 'Offline' | 'Ready' | 'Syncing' | 'Synced' | 'Error';
type Account = { id: string; email?: string | null } | null;
type ExerciseInput = { group: string; name: string; targetSets: number; targetReps: string };
type ActivityValue = {
  activities: Activity[]; templates: LocalTemplate[]; loading: boolean; score: ReturnType<typeof calculateSweatScore>;
  account: Account; syncStatus: SyncStatus; pendingCount: number; isOnline: boolean;
  refresh: () => Promise<void>; syncNow: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>; signUp: (email: string, password: string) => Promise<string | null>; signOut: () => Promise<void>;
  addWorkout: (input: { title: string; entries: { name: string; weight: number; reps: number; sets: number }[] }) => Promise<void>;
  addRun: (input: { title: string; distanceKm: number; durationSeconds: number; stravaUrl?: string }) => Promise<void>;
  saveTemplate: (input: { id?: string; name: string; category: LocalTemplate['category']; exercises: ExerciseInput[] }) => Promise<void>;
  removeTemplate: (id: string) => Promise<void>;
};
const ActivityContext = createContext<ActivityValue | null>(null);

export function ActivityProvider({ children }: PropsWithChildren) {
  const [activities, setActivities] = useState<Activity[]>([]); const [templates, setTemplates] = useState<LocalTemplate[]>([]);
  const [account, setAccount] = useState<Account>(null); const [userId, setUserId] = useState('guest');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('Guest'); const [pendingCount, setPendingCount] = useState(0); const [isOnline, setIsOnline] = useState(true); const [loading, setLoading] = useState(true);
  const loadUserData = useCallback(async (id: string) => {
    const [nextActivities, nextTemplates, pending] = await Promise.all([listActivities(id), listTemplates(id), pendingChanges(id)]);
    setActivities(nextActivities); setTemplates(nextTemplates); setPendingCount(pending);
    if (id === 'guest') setSyncStatus('Guest'); else if (pending > 0 && isOnline) setSyncStatus('Ready');
  }, [isOnline]);
  const refresh = useCallback(() => loadUserData(userId), [loadUserData, userId]);
  const syncForUser = useCallback(async (id: string) => {
    const client = getSupabase();
    if (!client || id === 'guest') { setSyncStatus('Guest'); return; }
    if (!isOnline) { setSyncStatus('Offline'); return; }
    setSyncStatus('Syncing');
    try {
      await syncActivities(await listActivities(id)); await syncTemplates(await listTemplates(id, true));
      const pending = await pendingChanges(id); setPendingCount(pending); setSyncStatus(pending ? 'Ready' : 'Synced');
      setActivities(await listActivities(id)); setTemplates(await listTemplates(id));
    } catch { setSyncStatus('Error'); }
  }, [isOnline]);
  const syncNow = useCallback(() => syncForUser(userId), [syncForUser, userId]);

  useEffect(() => {
    let active = true; const client = getSupabase();
    const boot = async () => { await initDatabase(); const user = (await client?.auth.getUser())?.data.user ?? null; if (user) await claimGuestData(user.id); else await ensureStarterTemplates('guest'); await loadUserData(user?.id ?? 'guest'); if (!active) return; setAccount(user ? { id: user.id, email: user.email } : null); setUserId(user?.id ?? 'guest'); setLoading(false); };
    void boot();
    const subscription = client?.auth.onAuthStateChange(async (_event, session) => { const user = session?.user ?? null; if (user) await claimGuestData(user.id); else await ensureStarterTemplates('guest'); await loadUserData(user?.id ?? 'guest'); if (!active) return; setAccount(user ? { id: user.id, email: user.email } : null); setUserId(user?.id ?? 'guest'); });
    const network = NetInfo.addEventListener((state) => { const online = Boolean(state.isConnected && state.isInternetReachable !== false); setIsOnline(online); if (!online) setSyncStatus((current) => current === 'Guest' ? 'Guest' : 'Offline'); });
    return () => { active = false; subscription?.data.subscription.unsubscribe(); network(); };
  }, [loadUserData]);

  const signIn = useCallback(async (email: string, password: string) => { const client = getSupabase(); if (!client) return 'Account services are unavailable in this build.'; const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password }); if (error) return error.message; if (data.user) { await claimGuestData(data.user.id); setAccount({ id: data.user.id, email: data.user.email }); setUserId(data.user.id); await syncForUser(data.user.id); } return null; }, [syncForUser]);
  const signUp = useCallback(async (email: string, password: string) => { const client = getSupabase(); if (!client) return 'Account services are unavailable in this build.'; const { data, error } = await client.auth.signUp({ email: email.trim(), password }); if (error) return error.message; if (!data.session) return 'Check your email to confirm your account, then sign in here.'; if (data.user) { await claimGuestData(data.user.id); setAccount({ id: data.user.id, email: data.user.email }); setUserId(data.user.id); await syncForUser(data.user.id); } return null; }, [syncForUser]);
  const signOut = useCallback(async () => { await getSupabase()?.auth.signOut(); }, []);
  const addWorkout: ActivityValue['addWorkout'] = async ({ title, entries }) => { const volumeKg = entries.reduce((sum, entry) => sum + entry.weight * entry.reps * entry.sets, 0); await insertActivity({ userId, kind: 'workout', title, occurredAt: new Date().toISOString(), payload: { volumeKg, exercises: entries } }); await refresh(); };
  const addRun: ActivityValue['addRun'] = async ({ title, distanceKm, durationSeconds, stravaUrl }) => { await insertActivity({ userId, kind: 'run', title, occurredAt: new Date().toISOString(), payload: { distanceKm, durationSeconds, ...(stravaUrl ? { stravaUrl } : {}) } }); await refresh(); };
  const persistTemplate: ActivityValue['saveTemplate'] = async (input) => { await saveTemplate({ id: input.id ?? createId(), userId, name: input.name.trim(), category: input.category, exercises: input.exercises }); await refresh(); };
  const removeTemplate = async (id: string) => { await deleteTemplate(id, userId); await refresh(); };
  const score = useMemo(() => calculateSweatScore(activities), [activities]);
  return <ActivityContext.Provider value={{ activities, templates, loading, score, account, syncStatus, pendingCount, isOnline, refresh, syncNow, signIn, signUp, signOut, addWorkout, addRun, saveTemplate: persistTemplate, removeTemplate }}>{children}</ActivityContext.Provider>;
}

export function useActivities() { const value = useContext(ActivityContext); if (!value) throw new Error('useActivities must be used inside ActivityProvider'); return value; }
