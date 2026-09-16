import * as SQLite from 'expo-sqlite';

export type Activity = { id: string; kind: 'workout' | 'run'; title: string; occurredAt: string; payload: Record<string, unknown>; synced: boolean; isPreview: boolean };

const dbPromise = SQLite.openDatabaseAsync('sweatline.db');

export async function initDatabase() {
  const db = await dbPromise;
  await db.execAsync(`
    pragma journal_mode = WAL;
    create table if not exists sweatline_local_activities (
      id text primary key not null,
      kind text not null check (kind in ('workout','run')),
      title text not null,
      occurred_at text not null,
      payload text not null,
      synced integer not null default 0,
      is_preview integer not null default 0
    );
    create index if not exists sweatline_local_activity_date on sweatline_local_activities(occurred_at desc);
  `);
  if (__DEV__) {
    const row = await db.getFirstAsync<{ count: number }>('select count(*) as count from sweatline_local_activities');
    if (!row?.count) {
      const now = Date.now();
      const samples = [
        ['workout', 'Push Day 1', new Date(now - 86400000).toISOString(), { volumeKg: 4820, durationMinutes: 52 }],
        ['run', 'Easy 5K', new Date(now - 3 * 86400000).toISOString(), { distanceKm: 5.02, durationSeconds: 1694 }],
        ['workout', 'Pull Day 2', new Date(now - 5 * 86400000).toISOString(), { volumeKg: 5460, durationMinutes: 61 }],
        ['workout', 'Leg Day 1', new Date(now - 10 * 86400000).toISOString(), { volumeKg: 6120, durationMinutes: 58 }],
      ] as const;
      for (const [kind, title, occurredAt, payload] of samples) await insertActivity({ kind, title, occurredAt, payload, isPreview: true });
    }
  }
}

export async function listActivities(): Promise<Activity[]> {
  const db = await dbPromise;
  const rows = await db.getAllAsync<{ id: string; kind: 'workout' | 'run'; title: string; occurred_at: string; payload: string; synced: number; is_preview: number }>('select * from sweatline_local_activities order by occurred_at desc');
  return rows.map((row) => ({ id: row.id, kind: row.kind, title: row.title, occurredAt: row.occurred_at, payload: JSON.parse(row.payload), synced: !!row.synced, isPreview: !!row.is_preview }));
}

export async function insertActivity(input: Omit<Activity, 'id' | 'synced'>) {
  const db = await dbPromise;
  const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => { const value = Math.floor(Math.random() * 16); return (token === 'x' ? value : (value & 0x3) | 0x8).toString(16); });
  await db.runAsync('insert into sweatline_local_activities (id, kind, title, occurred_at, payload, synced, is_preview) values (?, ?, ?, ?, ?, 0, ?)', id, input.kind, input.title, input.occurredAt, JSON.stringify(input.payload), input.isPreview ? 1 : 0);
  return id;
}

export async function markActivitySynced(id: string) {
  const db = await dbPromise;
  await db.runAsync('update sweatline_local_activities set synced = 1 where id = ?', id);
}
