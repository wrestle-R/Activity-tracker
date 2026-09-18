begin;

alter table public.sweatline_profiles
  add column if not exists username text;

create unique index if not exists sweatline_profiles_username_unique
  on public.sweatline_profiles (lower(username))
  where username is not null;

alter table public.sweatline_templates
  add column if not exists client_updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

-- Copy the original shared starter days to every existing account before the
-- shared rows are removed. Existing personal templates are never touched.
insert into public.sweatline_templates (user_id, name, category, exercises, is_seed, client_updated_at)
select users.id, seeds.name, seeds.category, seeds.exercises, false, now()
from auth.users as users
cross join public.sweatline_templates as seeds
where seeds.is_seed
  and not exists (
    select 1 from public.sweatline_templates as personal
    where personal.user_id = users.id and personal.name = seeds.name
  );

delete from public.sweatline_templates where is_seed;
drop index if exists public.sweatline_seed_template_name_idx;
alter table public.sweatline_templates alter column user_id set not null;
alter table public.sweatline_templates drop column if exists is_seed;

drop policy if exists "sweatline templates read" on public.sweatline_templates;
drop policy if exists "sweatline templates insert own" on public.sweatline_templates;
drop policy if exists "sweatline templates update own" on public.sweatline_templates;
drop policy if exists "sweatline templates delete own" on public.sweatline_templates;
create policy "sweatline templates own rows" on public.sweatline_templates
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.sweatline_handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.sweatline_profiles (user_id, display_name, username)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'username', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'username', '')), '')
  )
  on conflict (user_id) do update
    set display_name = excluded.display_name,
        username = excluded.username,
        updated_at = now();

  insert into public.sweatline_templates (user_id, name, category, exercises, client_updated_at)
  values
    (new.id, 'Push Day 1', 'push', '[{"group":"Chest","name":"Flat bench press","targetSets":3,"targetReps":"2×8, 3rd set ×12 (low weight)"},{"group":"Chest","name":"Incline bench press","targetSets":3,"targetReps":"8"},{"group":"Chest","name":"Dumbbell press","targetSets":3,"targetReps":"12"},{"group":"Shoulders","name":"Overhead press","targetSets":3,"targetReps":"12 (light)"},{"group":"Triceps","name":"Cable pushdowns (2 variations)","targetSets":3,"targetReps":"12 each"}]'::jsonb, now()),
    (new.id, 'Push Day 2', 'push', '[{"group":"Shoulders","name":"Overhead press","targetSets":3,"targetReps":"2×8, 3rd set ×12 (less weight)"},{"group":"Chest","name":"Flat bench press","targetSets":3,"targetReps":"12"},{"group":"Chest","name":"Incline press","targetSets":3,"targetReps":"8"},{"group":"Chest","name":"Cable flys","targetSets":3,"targetReps":"15"},{"group":"Triceps","name":"Pushdown (2–3 variations)","targetSets":3,"targetReps":"12"}]'::jsonb, now()),
    (new.id, 'Pull Day 1', 'pull', '[{"group":"Back","name":"Lat pulldown","targetSets":3,"targetReps":"12–16"},{"group":"Back","name":"Seated cable row","targetSets":3,"targetReps":"12–16"},{"group":"Back","name":"Dumbbell rows","targetSets":3,"targetReps":"8–12 each side"},{"group":"Back","name":"Shrugs (finisher)","targetSets":10,"targetReps":"to failure"},{"group":"Biceps","name":"Barbell curl","targetSets":3,"targetReps":"8"}]'::jsonb, now()),
    (new.id, 'Pull Day 2', 'pull', '[{"group":"Back","name":"Lat pulldown","targetSets":3,"targetReps":"8"},{"group":"Back","name":"Seated cable row","targetSets":3,"targetReps":"12"},{"group":"Back","name":"Cable row","targetSets":3,"targetReps":"12–16"},{"group":"Biceps","name":"Barbell curl","targetSets":3,"targetReps":"12"},{"group":"Rear delts","name":"Cable face pulls","targetSets":3,"targetReps":"15"}]'::jsonb, now()),
    (new.id, 'Leg Day 1', 'legs', '[{"group":"Legs","name":"Squats","targetSets":3,"targetReps":"2×8, 1×12"},{"group":"Legs","name":"Lunges","targetSets":3,"targetReps":"12 each side"},{"group":"Legs","name":"Machine leg extensions","targetSets":3,"targetReps":"12"},{"group":"Hamstrings","name":"Romanian deadlift","targetSets":3,"targetReps":"12"},{"group":"Calves","name":"Calf raises","targetSets":1,"targetReps":"to failure"}]'::jsonb, now()),
    (new.id, 'Leg Day 2', 'legs', '[{"group":"Glutes","name":"Hip thrust","targetSets":3,"targetReps":"12"},{"group":"Glutes","name":"Cable glute kickbacks","targetSets":3,"targetReps":"12"},{"group":"Hamstrings","name":"Machine hamstring curls","targetSets":3,"targetReps":"12"},{"group":"Legs","name":"Machine leg press","targetSets":1,"targetReps":"to failure"},{"group":"Calves","name":"Calf raises","targetSets":1,"targetReps":"to failure"}]'::jsonb, now());

  return new;
end;
$$;

drop trigger if exists sweatline_after_auth_user_created on auth.users;
create trigger sweatline_after_auth_user_created
  after insert on auth.users
  for each row execute procedure public.sweatline_handle_new_user();

-- Profiles that predate the trigger receive a username-free profile safely.
insert into public.sweatline_profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

commit;
