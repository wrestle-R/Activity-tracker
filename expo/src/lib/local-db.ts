import * as SQLite from 'expo-sqlite';

export type Exercise = { group: string; name: string; targetSets: number; targetReps: string };
export type LocalTemplate = { id: string; userId: string; name: string; category: 'push' | 'pull' | 'legs' | 'custom'; exercises: Exercise[]; clientUpdatedAt: string; deletedAt?: string | null; synced: boolean };
export type Activity = { id: string; userId: string; kind: 'workout' | 'run'; title: string; occurredAt: string; payload: Record<string, unknown>; synced: boolean; isPreview: false; clientUpdatedAt: string; deletedAt?: string | null };

const dbPromise = SQLite.openDatabaseAsync('sweatline.db');
const id = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => { const value = Math.floor(Math.random() * 16); return (token === 'x' ? value : (value & 0x3) | 0x8).toString(16); });

export async function initDatabase() {
  const db = await dbPromise;
  await db.execAsync(`pragma journal_mode = WAL;
    create table if not exists sweatline_local_activities (id text primary key not null, user_id text not null default 'guest', kind text not null check (kind in ('workout','run')), title text not null, occurred_at text not null, payload text not null, synced integer not null default 0, is_preview integer not null default 0, client_updated_at text not null default '', deleted_at text);
    create table if not exists sweatline_local_templates (id text primary key not null, user_id text not null, name text not null, category text not null, exercises text not null, client_updated_at text not null, deleted_at text, synced integer not null default 0);
    create table if not exists sweatline_outbox (id integer primary key autoincrement, entity text not null, entity_id text not null, user_id text not null, queued_at text not null, unique(entity, entity_id));
    create index if not exists sweatline_local_activity_date on sweatline_local_activities(occurred_at desc);
    create index if not exists sweatline_local_template_user on sweatline_local_templates(user_id, client_updated_at desc);`);
  const columns = await db.getAllAsync<{ name: string }>('pragma table_info(sweatline_local_activities)'); const names = new Set(columns.map((column) => column.name));
  if (!names.has('user_id')) await db.execAsync("alter table sweatline_local_activities add column user_id text not null default 'guest'");
  if (!names.has('client_updated_at')) await db.execAsync("alter table sweatline_local_activities add column client_updated_at text not null default ''");
  if (!names.has('deleted_at')) await db.execAsync('alter table sweatline_local_activities add column deleted_at text');
}

async function queue(entity: 'activity' | 'template', entityId: string, userId: string) { const db = await dbPromise; await db.runAsync('insert into sweatline_outbox (entity, entity_id, user_id, queued_at) values (?, ?, ?, ?) on conflict(entity, entity_id) do update set queued_at = excluded.queued_at', entity, entityId, userId, new Date().toISOString()); }

export async function listActivities(userId = 'guest'): Promise<Activity[]> { const db = await dbPromise; const rows = await db.getAllAsync<{ id: string; user_id: string; kind: 'workout' | 'run'; title: string; occurred_at: string; payload: string; synced: number; client_updated_at: string; deleted_at: string | null }>('select * from sweatline_local_activities where user_id = ? and deleted_at is null order by occurred_at desc', userId); return rows.map((row) => ({ id: row.id, userId: row.user_id, kind: row.kind, title: row.title, occurredAt: row.occurred_at, payload: JSON.parse(row.payload), synced: !!row.synced, isPreview: false, clientUpdatedAt: row.client_updated_at, deletedAt: row.deleted_at })); }

export async function insertActivity(input: Omit<Activity, 'id' | 'synced' | 'isPreview' | 'clientUpdatedAt'>) { const db = await dbPromise; const activityId = id(); const updated = new Date().toISOString(); await db.runAsync('insert into sweatline_local_activities (id, user_id, kind, title, occurred_at, payload, synced, is_preview, client_updated_at, deleted_at) values (?, ?, ?, ?, ?, ?, 0, 0, ?, ?)', activityId, input.userId, input.kind, input.title, input.occurredAt, JSON.stringify(input.payload), updated, input.deletedAt ?? null); await queue('activity', activityId, input.userId); return activityId; }
export async function markActivitySynced(activityId: string) { const db = await dbPromise; await db.runAsync('update sweatline_local_activities set synced = 1 where id = ?', activityId); }
export async function markTemplateSynced(templateId: string) { const db = await dbPromise; await db.runAsync('update sweatline_local_templates set synced = 1 where id = ?', templateId); }

export async function listTemplates(userId: string): Promise<LocalTemplate[]> { const db = await dbPromise; const rows = await db.getAllAsync<{ id: string; user_id: string; name: string; category: LocalTemplate['category']; exercises: string; client_updated_at: string; deleted_at: string | null; synced: number }>('select * from sweatline_local_templates where user_id = ? and deleted_at is null order by client_updated_at desc', userId); return rows.map((row) => ({ id: row.id, userId: row.user_id, name: row.name, category: row.category, exercises: JSON.parse(row.exercises), clientUpdatedAt: row.client_updated_at, deletedAt: row.deleted_at, synced: !!row.synced })); }
export async function saveTemplate(template: Omit<LocalTemplate, 'synced' | 'clientUpdatedAt'> & { clientUpdatedAt?: string }) { const db = await dbPromise; const updated = template.clientUpdatedAt ?? new Date().toISOString(); await db.runAsync('insert into sweatline_local_templates (id,user_id,name,category,exercises,client_updated_at,deleted_at,synced) values (?,?,?,?,?,?,?,0) on conflict(id) do update set name=excluded.name,category=excluded.category,exercises=excluded.exercises,client_updated_at=excluded.client_updated_at,deleted_at=excluded.deleted_at,synced=0', template.id, template.userId, template.name, template.category, JSON.stringify(template.exercises), updated, template.deletedAt ?? null); await queue('template', template.id, template.userId); }
export async function replaceTemplateFromServer(template: LocalTemplate) { const db = await dbPromise; await db.runAsync('insert into sweatline_local_templates (id,user_id,name,category,exercises,client_updated_at,deleted_at,synced) values (?,?,?,?,?,?,?,1) on conflict(id) do update set name=excluded.name,category=excluded.category,exercises=excluded.exercises,client_updated_at=excluded.client_updated_at,deleted_at=excluded.deleted_at,synced=1 where excluded.client_updated_at >= sweatline_local_templates.client_updated_at', template.id, template.userId, template.name, template.category, JSON.stringify(template.exercises), template.clientUpdatedAt, template.deletedAt ?? null); }
export const createId = id;
