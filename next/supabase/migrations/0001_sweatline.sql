begin;

create extension if not exists pgcrypto;

create table if not exists public.sweatline_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  theme_preference text not null default 'system' check (theme_preference in ('light', 'dark', 'system')),
  distance_unit text not null default 'km' check (distance_unit in ('km', 'mi')),
  weight_unit text not null default 'kg' check (weight_unit in ('kg', 'lb')),
  weekly_target integer not null default 4 check (weekly_target between 1 and 14),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sweatline_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('push', 'pull', 'legs', 'custom')),
  exercises jsonb not null default '[]'::jsonb check (jsonb_typeof(exercises) = 'array'),
  is_seed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists sweatline_seed_template_name_idx
  on public.sweatline_templates (name) where is_seed;
create index if not exists sweatline_templates_user_idx
  on public.sweatline_templates (user_id, updated_at desc);

create table if not exists public.sweatline_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.sweatline_templates(id) on delete set null,
  name text not null,
  performed_at timestamptz not null,
  exercises jsonb not null default '[]'::jsonb check (jsonb_typeof(exercises) = 'array'),
  notes text,
  client_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sweatline_workouts_user_date_idx
  on public.sweatline_workouts (user_id, performed_at desc);

create table if not exists public.sweatline_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  performed_at timestamptz not null,
  distance_km numeric(8, 3) not null check (distance_km > 0),
  duration_seconds integer not null check (duration_seconds > 0),
  strava_url text check (strava_url is null or strava_url ~* '^https?://(www\\.)?strava\\.com/activities/[0-9]+'),
  notes text,
  client_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sweatline_runs_user_date_idx
  on public.sweatline_runs (user_id, performed_at desc);

alter table public.sweatline_profiles enable row level security;
alter table public.sweatline_templates enable row level security;
alter table public.sweatline_workouts enable row level security;
alter table public.sweatline_runs enable row level security;

drop policy if exists "sweatline profiles own rows" on public.sweatline_profiles;
create policy "sweatline profiles own rows" on public.sweatline_profiles
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "sweatline templates read" on public.sweatline_templates;
create policy "sweatline templates read" on public.sweatline_templates
  for select using (is_seed or (select auth.uid()) = user_id);
drop policy if exists "sweatline templates insert own" on public.sweatline_templates;
create policy "sweatline templates insert own" on public.sweatline_templates
  for insert with check ((select auth.uid()) = user_id and not is_seed);
drop policy if exists "sweatline templates update own" on public.sweatline_templates;
create policy "sweatline templates update own" on public.sweatline_templates
  for update using ((select auth.uid()) = user_id and not is_seed)
  with check ((select auth.uid()) = user_id and not is_seed);
drop policy if exists "sweatline templates delete own" on public.sweatline_templates;
create policy "sweatline templates delete own" on public.sweatline_templates
  for delete using ((select auth.uid()) = user_id and not is_seed);

drop policy if exists "sweatline workouts own rows" on public.sweatline_workouts;
create policy "sweatline workouts own rows" on public.sweatline_workouts
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "sweatline runs own rows" on public.sweatline_runs;
create policy "sweatline runs own rows" on public.sweatline_runs
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

insert into public.sweatline_templates (name, category, exercises, is_seed)
values
  ('Push Day 1', 'push', '[{"group":"Chest","name":"Flat bench press","targetSets":3,"targetReps":"2×8, 3rd set ×12 (low weight)"},{"group":"Chest","name":"Incline bench press","targetSets":3,"targetReps":"8"},{"group":"Chest","name":"Dumbbell press","targetSets":3,"targetReps":"12"},{"group":"Shoulders","name":"Overhead press","targetSets":3,"targetReps":"12 (light)"},{"group":"Triceps","name":"Cable pushdowns (2 variations)","targetSets":3,"targetReps":"12 each"}]'::jsonb, true),
  ('Push Day 2', 'push', '[{"group":"Shoulders","name":"Overhead press","targetSets":3,"targetReps":"2×8, 3rd set ×12 (less weight)"},{"group":"Chest","name":"Flat bench press","targetSets":3,"targetReps":"12"},{"group":"Chest","name":"Incline press","targetSets":3,"targetReps":"8"},{"group":"Chest","name":"Cable flys","targetSets":3,"targetReps":"15"},{"group":"Triceps","name":"Pushdown (2–3 variations)","targetSets":3,"targetReps":"12"}]'::jsonb, true),
  ('Pull Day 1', 'pull', '[{"group":"Back","name":"Lat pulldown","targetSets":3,"targetReps":"12–16"},{"group":"Back","name":"Seated cable row","targetSets":3,"targetReps":"12–16"},{"group":"Back","name":"Dumbbell rows","targetSets":3,"targetReps":"8–12 each side"},{"group":"Back","name":"Shrugs (finisher)","targetSets":10,"targetReps":"to failure"},{"group":"Biceps","name":"Barbell curl","targetSets":3,"targetReps":"8"},{"group":"Biceps","name":"Hammer curl","targetSets":3,"targetReps":"10"},{"group":"Biceps","name":"Preacher curl","targetSets":3,"targetReps":"8–16"},{"group":"Rear Delts","name":"Bent-over rear delt fly","targetSets":3,"targetReps":"8–12"}]'::jsonb, true),
  ('Pull Day 2', 'pull', '[{"group":"Back","name":"Lat pulldown","targetSets":3,"targetReps":"8"},{"group":"Back","name":"Seated cable row","targetSets":3,"targetReps":"12"},{"group":"Back","name":"Lat pulldown (2nd variation/rep range)","targetSets":3,"targetReps":"12–16"},{"group":"Back","name":"Shrugs (finisher)","targetSets":10,"targetReps":"to failure"},{"group":"Biceps","name":"Barbell curl","targetSets":3,"targetReps":"12"},{"group":"Biceps","name":"Cable hammer curl","targetSets":3,"targetReps":"15"},{"group":"Biceps","name":"Preacher curl","targetSets":3,"targetReps":"8–16"},{"group":"Rear Delts","name":"Cable face pulls","targetSets":3,"targetReps":"15"}]'::jsonb, true),
  ('Leg Day 1', 'legs', '[{"group":"Legs","name":"Squats","targetSets":3,"targetReps":"2×8, 1×12"},{"group":"Legs","name":"Lunges","targetSets":3,"targetReps":"12 each side"},{"group":"Legs","name":"Machine leg extensions","targetSets":3,"targetReps":"12"},{"group":"Legs","name":"Romanian deadlift","targetSets":3,"targetReps":"12"},{"group":"Calves","name":"Calves","targetSets":1,"targetReps":"to failure"}]'::jsonb, true),
  ('Leg Day 2', 'legs', '[{"group":"Glutes","name":"Hip thrust","targetSets":3,"targetReps":"12"},{"group":"Glutes","name":"Cable glute kickbacks","targetSets":3,"targetReps":"12"},{"group":"Hamstrings","name":"Machine hamstring curls","targetSets":3,"targetReps":"12"},{"group":"Legs","name":"Machine leg press","targetSets":1,"targetReps":"to failure"},{"group":"Calves","name":"Calf raises","targetSets":1,"targetReps":"to failure"}]'::jsonb, true)
on conflict (name) where is_seed do update
set category = excluded.category, exercises = excluded.exercises, updated_at = now();

commit;
