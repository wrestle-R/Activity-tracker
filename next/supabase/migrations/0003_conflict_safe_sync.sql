-- Forward-only follow-up: mobile clients may replay edits after being offline.
-- Keep the complete newest template rather than allowing an older upsert to win.
begin;

create or replace function public.sweatline_upsert_template(
  template_id uuid,
  template_name text,
  template_category text,
  template_exercises jsonb,
  template_client_updated_at timestamptz,
  template_deleted_at timestamptz default null
) returns public.sweatline_templates
language plpgsql
security invoker
set search_path = public
as $$
declare result public.sweatline_templates;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.sweatline_templates (id, user_id, name, category, exercises, client_updated_at, deleted_at)
  values (template_id, auth.uid(), template_name, template_category, template_exercises, template_client_updated_at, template_deleted_at)
  on conflict (id) do update set
    name = excluded.name,
    category = excluded.category,
    exercises = excluded.exercises,
    client_updated_at = excluded.client_updated_at,
    deleted_at = excluded.deleted_at,
    updated_at = now()
  where public.sweatline_templates.user_id = auth.uid()
    and excluded.client_updated_at >= public.sweatline_templates.client_updated_at
  returning * into result;

  if result.id is null then
    select * into result from public.sweatline_templates where id = template_id and user_id = auth.uid();
  end if;
  return result;
end;
$$;

grant execute on function public.sweatline_upsert_template(uuid, text, text, jsonb, timestamptz, timestamptz) to authenticated;
commit;
