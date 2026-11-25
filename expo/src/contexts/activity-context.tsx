import NetInfo from '@react-native-community/netinfo';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, claimGuestData, createId, deleteTemplate, ensureStarterTemplates, initDatabase, insertActivity, listActivities, listTemplates, LocalTemplate, pendingChanges, saveTemplate } from '@/lib/local-db';
import { calculateSweatScore } from '@/lib/fitness';
import { getSupabase, syncAccount } from '@/lib/supabase';

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
  const binding = useRef<{ id: string } | null>(null);
  const transition = useRef(Promise.resolve());
  const onlineRef = useRef(true);

  const loadUserData = useCallback(async (owner: { id: string }) => {
    const [nextActivities, nextTemplates, pending] = await Promise.all([
      listActivities(owner.id), listTemplates(owner.id), pendingChanges(owner.id),
    ]);
    if (binding.current !== owner) return;
    setActivities(nextActivities);
    setTemplates(nextTemplates);
    setPendingCount(pending);
    return pending;
  }, []);

  const refresh = useCallback(async () => {
    const owner = binding.current;
    if (owner?.id === userId) await loadUserData(owner);
  }, [loadUserData, userId]);

  const syncForUser = useCallback(async (id: string) => {
    const owner = binding.current;
    if (owner?.id !== id || id === 'guest') return;
    if (!onlineRef.current) { setSyncStatus('Offline'); return; }
    setSyncStatus('Syncing');
    try {
      const [localActivities, localTemplates] = await Promise.all([listActivities(id), listTemplates(id, true)]);
      if (binding.current !== owner) return;
      await syncAccount(id, localActivities, localTemplates);
      const pending = await loadUserData(owner);
      if (binding.current === owner) setSyncStatus(pending ? 'Ready' : 'Synced');
    } catch {
      if (binding.current === owner) setSyncStatus('Error');
    }
  }, [loadUserData]);
  const syncNow = useCallback(() => syncForUser(userId), [syncForUser, userId]);

  useEffect(() => {
    let active = true;
    const client = getSupabase();
    const initialized = initDatabase();
    function selectAccount(next: Account) {
      if (!active) return;
      const id = next?.id ?? 'guest';
      setAccount(next);
      if (binding.current?.id === id) return;

      const owner = { id };
      binding.current = owner;
      setUserId(id);
      setActivities([]);
      setTemplates([]);
      setPendingCount(0);
      setLoading(true);
      setSyncStatus(next ? (onlineRef.current ? 'Ready' : 'Offline') : 'Guest');

      transition.current = transition.current.then(async () => {
        await initialized;
        if (binding.current !== owner) return;
        if (next) await claimGuestData(id);
        else await ensureStarterTemplates('guest');
        if (binding.current !== owner) return;
        await loadUserData(owner);
      }).catch(() => {
        if (binding.current === owner) setSyncStatus('Error');
      }).finally(() => {
        if (binding.current === owner) setLoading(false);
      });
    }

    const subscription = client?.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      selectAccount(user ? { id: user.id, email: user.email } : null);
    });
    if (!client) selectAccount(null);
    const network = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      onlineRef.current = online;
      setIsOnline(online);
      if (!online) setSyncStatus(current => current === 'Guest' ? 'Guest' : 'Offline');
    });
    return () => {
      active = false;
      binding.current = null;
      subscription?.data.subscription.unsubscribe();
      network();
    };
  }, [loadUserData]);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = getSupabase();
    if (!client) return 'Account services are unavailable in this build.';
    const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return error.message;
    await transition.current;
    if (data.user) await syncForUser(data.user.id);
    return null;
  }, [syncForUser]);

  const signUp = useCallback(async (email: string, password: string) => {
    const client = getSupabase();
    if (!client) return 'Account services are unavailable in this build.';
    const { data, error } = await client.auth.signUp({ email: email.trim(), password });
    if (error) return error.message;
    if (!data.session) return 'Check your email to confirm your account, then sign in here.';
    await transition.current;
    if (data.user) await syncForUser(data.user.id);
    return null;
  }, [syncForUser]);
  const signOut = useCallback(async () => { await getSupabase()?.auth.signOut(); }, []);

  const addWorkout: ActivityValue['addWorkout'] = async ({ title, entries }) => { const volumeKg = entries.reduce((sum, entry) => sum + entry.weight * entry.reps * entry.sets, 0); await insertActivity({ userId, kind: 'workout', title, occurredAt: new Date().toISOString(), payload: { volumeKg, exercises: entries } }); await refresh(); };
  const addRun: ActivityValue['addRun'] = async ({ title, distanceKm, durationSeconds, stravaUrl }) => { await insertActivity({ userId, kind: 'run', title, occurredAt: new Date().toISOString(), payload: { distanceKm, durationSeconds, ...(stravaUrl ? { stravaUrl } : {}) } }); await refresh(); };
  const persistTemplate: ActivityValue['saveTemplate'] = async (input) => { await saveTemplate({ id: input.id ?? createId(), userId, name: input.name.trim(), category: input.category, exercises: input.exercises }); await refresh(); };
  const removeTemplate = async (id: string) => { await deleteTemplate(id, userId); await refresh(); };
  const score = useMemo(() => calculateSweatScore(activities), [activities]);
  return <ActivityContext.Provider value={{ activities, templates, loading, score, account, syncStatus, pendingCount, isOnline, refresh, syncNow, signIn, signUp, signOut, addWorkout, addRun, saveTemplate: persistTemplate, removeTemplate }}>{children}</ActivityContext.Provider>;
}

export function useActivities() { const value = useContext(ActivityContext); if (!value) throw new Error('useActivities must be used inside ActivityProvider'); return value; }
