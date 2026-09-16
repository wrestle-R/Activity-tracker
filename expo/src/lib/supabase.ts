import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Activity } from '@/lib/local-db';
import { markActivitySynced } from '@/lib/local-db';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(url && key);

const secureStorage = { getItem: (name: string) => SecureStore.getItemAsync(name), setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value), removeItem: (name: string) => SecureStore.deleteItemAsync(name) };
let instance: SupabaseClient | null = null;

export function getSupabase() {
  if (!url || !key) return null;
  instance ??= createClient(url, key, { auth: { storage: secureStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } });
  return instance;
}

export async function syncActivities(activities: Activity[]) {
  const client = getSupabase();
  if (!client) throw new Error('Add the Supabase public URL and publishable key first.');
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error('Sign in before syncing.');
  for (const item of activities.filter((activity) => !activity.synced && !activity.isPreview)) {
    if (item.kind === 'workout') {
      const { error } = await client.from('sweatline_workouts').upsert({ id: item.id, user_id: user.id, name: item.title, performed_at: item.occurredAt, exercises: item.payload.exercises ?? [], client_updated_at: new Date().toISOString() });
      if (error) throw error;
    } else {
      const { error } = await client.from('sweatline_runs').upsert({ id: item.id, user_id: user.id, title: item.title, performed_at: item.occurredAt, distance_km: item.payload.distanceKm, duration_seconds: item.payload.durationSeconds, strava_url: item.payload.stravaUrl ?? null, client_updated_at: new Date().toISOString() });
      if (error) throw error;
    }
    await markActivitySynced(item.id);
  }
}

