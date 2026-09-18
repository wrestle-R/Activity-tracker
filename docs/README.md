# Sweatline project context

This ignored directory keeps the original product brief, the supplied sidebar architecture guide, database notes, and QA artifacts. The build itself lives only in `next/` and `expo/`.

## Source documents

- `ActivityTracker_BUILD_SPEC.md` — original end-to-end product specification (the product name was superseded by **Sweatline** and the requested root layout was superseded by `docs/`, `next/`, and `expo/`).
- `SIDEBAR_ARCHITECTURE.md` — supplied shadcn sidebar and layout reference.

## Data choice

Sweatline uses the existing Personal Supabase/Postgres project already configured in `Personal/Run_blog/next`. It is isolated using four tables whose names begin with `sweatline_`. The SQL source of truth is also copied into `next/supabase/migrations/0001_sweatline.sql` so it travels with the application even though this context directory is ignored.

The existing database connection does not expose the Supabase public client key. Both clients therefore support an offline/demo path and accept the public URL/key through environment variables for production Auth and sync.

