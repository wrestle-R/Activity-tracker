import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Activity, LocalTemplate } from '@/lib/local-db';
import { markActivitySynced, markTemplateSynced, replaceTemplateFromServer } from '@/lib/local-db';

const extra = Constants.expoConfig?.extra as { supabaseUrl?: string; supabasePublishableKey?: string } | undefined;
const url = extra?.supabaseUrl;
const key = extra?.supabasePublishableKey;
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
  for (const item of activities.filter((activity) => !activity.synced)) {
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

export async function syncTemplates(templates: LocalTemplate[]) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase is not configured.');
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error('Sign in before syncing.');
  for (const template of templates.filter((item) => !item.synced)) {
    const { error } = await client.rpc('sweatline_upsert_template', { template_id: template.id, template_name: template.name, template_category: template.category, template_exercises: template.exercises, template_client_updated_at: template.clientUpdatedAt, template_deleted_at: template.deletedAt ?? null });
    if (error) throw error;
    await markTemplateSynced(template.id);
  }
  const { data, error } = await client.from('sweatline_templates').select('id,user_id,name,category,exercises,client_updated_at,deleted_at').order('client_updated_at', { ascending: false });
  if (error) throw error;
  for (const serverTemplate of data ?? []) {
    await replaceTemplateFromServer({ id: serverTemplate.id, userId: serverTemplate.user_id, name: serverTemplate.name, category: serverTemplate.category, exercises: serverTemplate.exercises, clientUpdatedAt: serverTemplate.client_updated_at, deletedAt: serverTemplate.deleted_at, synced: true });
  }
}
