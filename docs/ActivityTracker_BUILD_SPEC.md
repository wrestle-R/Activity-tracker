# ActivityTracker — Full Build Specification

> **Purpose of this document:** This is a complete engineering brief for an AI coding agent (Codex / Claude Code / similar) to build **ActivityTracker** end-to-end: a React Native (Expo) mobile app for manual gym + run tracking, and a Next.js marketing website. Follow this document top to bottom. Where a decision was made by the product owner, it is marked **[DECIDED]**. Where the agent must make a reasonable call, it is marked **[AGENT DISCRETION]**. Do not skip the Git/commit section — commit history quality is graded.

---

## 1. Product Summary

**Name:** ActivityTracker **[DECIDED]**

**One-liner:** A dead-simple, fully offline-capable manual fitness tracker. No auto-tracking, no GPS recording, no wearable sync — the user logs what they did, after they did it, in seconds.

**Two things get built:**
1. **Mobile app** (`apps/mobile`) — Expo / React Native / TypeScript. This is the actual product.
2. **Marketing website** (`apps/web`) — Next.js / TypeScript, deployed to Vercel. Landing page only, no live user data. **[DECIDED]**

**Repo:** `https://github.com/wrestle-R/Activity-tracker` — initialize this repo properly as a monorepo (see §9).

---

## 2. Core User Stories

- As a user, I can register and log in so my data is tied to my account.
- As a user, I can use the app **fully offline** — log workouts and runs with no internet connection, and see previously synced data. Sync happens opportunistically when back online.
- As a user, I can log a gym session by picking a **template** (Push 1, Push 2, Pull 1, Pull 2, Leg 1, Leg 2 — see §4) or starting a blank session, and I can freely **edit** the template (add/remove exercises, change target sets).
- As a user, for each exercise I can log **weight, reps, and number of sets** performed (not just planned).
- As a user, I can log a run either by:
  - Pasting a **Strava activity link**, which is stored as a clickable reference, OR
  - Manually entering **distance** and **time elapsed** (pace auto-calculated).
- As a user, I can view my history/progress on a **Home** dashboard.
- As a user, I can switch between **light and dark mode** (or follow system).

---

## 3. IMPORTANT — Strava Link Limitation (must be respected in implementation)

I tested `https://www.strava.com/activities/20169630113` directly. **Strava activity pages require the viewer to be logged in to see any stats** (distance, pace, time, map). The public page only exposes an Open Graph title like `"<Activity Name> | Strava"` and a description like `"View <Athlete>'s Run on <date> | Strava"` — no distance/duration data is accessible without the user's own Strava OAuth token and the real Strava API.

**Therefore, do not build a "scrape the link for stats" feature.** Implement it honestly as:
- User pastes a Strava URL → app validates it looks like a Strava activity URL (regex: `strava\.com\/activities\/\d+`) → stores it as a **reference link** (opens in browser/Strava app on tap).
- The user **separately and manually** fills in distance + time elapsed for that run (same fields as a fully-manual run entry).
- Optionally (**[AGENT DISCRETION]**, nice-to-have, not required): attempt a `fetch` of the OG tags for a title/date to prefill a "name" field, wrapped in a try/catch — if it fails (CORS, no login, etc.) fall back gracefully to a blank title. Do not block the save flow on this.
- Do **not** claim or imply real Strava API integration anywhere in UI copy. A small caption under the field like *"Strava link is stored as a reference — enter your distance/time manually"* is required.

---

## 4. Gym Templates (source data — use exactly as given, but fully editable per-session)

These six templates come directly from the user's real training log. Seed them as default/starter templates. Every field (sets, reps, weight) must be editable in-app per logged session — the template is just a starting point, not a lock.

### Push Day 1
| Group | Exercise | Sets × Reps |
|---|---|---|
| Chest | Flat bench press | 2×8, 3rd set ×12 (low weight) |
| Chest | Incline bench press | 3×8 |
| Chest | Dumbbell press | 3×12 |
| Shoulders | Overhead press | 3×12 (light) |
| Triceps | Cable pushdowns (2 variations) | 3×12 each |

### Push Day 2
| Group | Exercise | Sets × Reps |
|---|---|---|
| Shoulders | Overhead press | 2×8, 3rd set ×12 (less weight) |
| Chest | Flat bench press | 3×12 |
| Chest | Incline press | 3×8 |
| Chest | Cable flys | 3×15 |
| Triceps | Pushdown (2–3 variations) | 3×12 |

### Pull Day 1
| Group | Exercise | Sets × Reps |
|---|---|---|
| Back | Lat pulldown | 3×12–16 |
| Back | Seated cable row | 3×12–16 |
| Back | Dumbbell rows | 3×8–12 each side |
| Back | Shrugs (finisher) | 10 sets |
| Biceps | Barbell curl | 3×8 |
| Biceps | Hammer curl | 3×10 |
| Biceps | Preacher curl | 3×8–16 |
| Rear Delts | Bent-over rear delt fly | 3×8–12 |

### Pull Day 2
| Group | Exercise | Sets × Reps |
|---|---|---|
| Back | Lat pulldown | 3×8 |
| Back | Seated cable row | 3×12 |
| Back | Lat pulldown (2nd variation/rep range) | 3×12–16 |
| Back | Shrugs (finisher) | 10 sets |
| Biceps | Barbell curl | 3×12 |
| Biceps | Cable hammer curl | 3×15 |
| Biceps | Preacher curl | 3×8–16 |
| Rear Delts | Cable face pulls | 3×15 |

### Leg Day 1
| Exercise | Sets × Reps |
|---|---|
| Squats | 2×8, 1×12 |
| Lunges | 3×12 each side |
| Machine leg extensions | 3×12 |
| Romanian deadlift | 3×12 |
| Calves | To failure |

### Leg Day 2
| Exercise | Sets × Reps |
|---|---|
| Hip thrust | 3×12 |
| Cable glute kickbacks | 3×12 |
| Machine hamstring curls | 3×12 |
| Machine leg press | To failure |
| Calf raises | To failure |

Store these as seed data (JSON or DB seed), not hardcoded UI — the "start from template" flow should read from this same structure a user's custom templates would use, so users can also create/save their own templates identically.

---

## 5. Architecture & Tech Stack **[DECIDED]**

### Backend / Data
- **Supabase** (Postgres + Auth) is the single backend for both auth and data sync.
- **A Supabase project URL/anon key will be provided later** by the product owner. Do NOT hardcode any keys. Build against `.env` / `app.config.ts` extra fields:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - Provide `.env.example` with placeholders and clear comments.
- Until real credentials exist, the agent should build against a local/mock Supabase config or a docker-compose local Supabase (if feasible) so the app is demoable without live credentials — but the **production path must be real Supabase**, not a permanent mock.

### Mobile App (`apps/mobile`)
- **Expo (SDK latest stable)**, **Expo Router** (file-based navigation, 4 tabs: Home, Gym, Run, Settings + auth stack).
- **TypeScript**, strict mode on.
- **Offline-first**: local persistence via `expo-sqlite` (preferred) or `WatermelonDB` **[AGENT DISCRETION on which]** — all writes go to local DB first, UI never blocks on network. A background sync module pushes/pulls to Supabase when connectivity is available (`@react-native-community/netinfo` to detect connectivity changes).
- **Auth**: Supabase email/password register + login. Session persisted locally (`expo-secure-store` for tokens) so the user stays logged in offline. Auth screens must clearly handle "no internet" (can't register/login without connectivity — show a clear message; but once logged in once, app stays usable offline).
- **Styling/theme**: NativeWind (Tailwind for RN) or StyleSheet + a shared design-tokens file **[AGENT DISCRETION]**, but must implement:
  - Full **light and dark theme**, following system preference by default, with a manual override in Settings.
  - Consistent spacing/typography/color tokens — no ad hoc inline colors scattered through screens.
- **State**: React Context or Zustand for auth/session + theme; local DB is source of truth for workout/run data.

### Website (`apps/web`)
- **Next.js (App Router)**, TypeScript, TailwindCSS.
- **Deployed target: Vercel** **[DECIDED]**.
- **Scope: marketing/landing only, no live user data or dashboard** **[DECIDED]**. Pages:
  - `/` — Landing (hero, feature highlights, screenshots/mockups of the app, download CTA).
  - `/features` — Feature breakdown (Gym templates, Run tracking, Offline-first, Privacy).
  - `/download` or CTA linking to app stores (use placeholder links until app is published — `TODO` comment).
  - `/login` and `/register` — **[AGENT DISCRETION, recommended]**: build these as real Supabase-auth-wired pages so the brand feels cohesive and the auth flow is testable from web too, but they do **not** need to show or manage any workout/run data — post-login they should just show a simple "You're logged in — open the ActivityTracker app to continue" confirmation screen, not a dashboard. If this feels like scope creep, an acceptable fallback is static/non-functional login/register pages that just link to "get the app." Pick one and note the choice in the README.
- No native mobile code, no offline requirements on web — it's a normal server/static-rendered marketing site.

### Repo Structure
```
Activity-tracker/
├── apps/
│   ├── mobile/          # Expo app
│   └── web/              # Next.js site
├── packages/
│   └── shared/           # shared TS types (DB schema types, template seed data, Strava URL validator, etc.)
├── supabase/
│   └── migrations/       # SQL migration files (see §6)
├── .github/
│   └── workflows/        # optional CI (lint/typecheck) — nice to have
├── README.md
└── ActivityTracker_BUILD_SPEC.md   # this file, kept in repo root for reference
```
Use a workspace tool (pnpm workspaces or turborepo) **[AGENT DISCRETION]** to manage the monorepo cleanly.

---

## 6. Data Model (Supabase / Postgres)

```sql
-- users handled by Supabase Auth (auth.users) — do not duplicate

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  theme_preference text default 'system', -- 'light' | 'dark' | 'system'
  created_at timestamptz default now()
);

create table workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade, -- null = global seed template
  name text not null,                -- e.g. "Push Day 1"
  category text,                     -- 'push' | 'pull' | 'legs' | 'custom'
  is_seed boolean default false,
  created_at timestamptz default now()
);

create table template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references workout_templates(id) on delete cascade,
  exercise_name text not null,
  muscle_group text,                 -- 'chest' | 'shoulders' | 'triceps' | 'back' | 'biceps' | 'legs' etc
  target_sets int,
  target_reps text,                  -- text because ranges like "8-12" or "to failure" occur
  sort_order int
);

create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  template_id uuid references workout_templates(id),  -- nullable, freeform session allowed
  name text not null,                -- e.g. "Push Day 1" or custom
  performed_at timestamptz not null,
  notes text,
  created_at timestamptz default now()
);

create table session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references workout_sessions(id) on delete cascade,
  exercise_name text not null,
  muscle_group text,
  sort_order int
);

create table exercise_sets (
  id uuid primary key default gen_random_uuid(),
  session_exercise_id uuid references session_exercises(id) on delete cascade,
  set_number int not null,
  weight numeric,          -- nullable (bodyweight exercises)
  weight_unit text default 'kg', -- 'kg' | 'lb'
  reps int,
  to_failure boolean default false
);

create table runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  performed_at timestamptz not null,
  distance_km numeric,             -- store canonical in km, display can convert
  duration_seconds int,
  strava_url text,                 -- nullable reference link, see §3
  title text,
  notes text,
  created_at timestamptz default now()
);
```

- Enable **Row Level Security** on every table; policies restrict all reads/writes to `auth.uid() = user_id` (except `workout_templates` where `is_seed = true` rows are readable by everyone, writable by no one but the seed script).
- Pace (`min/km` or `min/mile`) is a derived/display value — compute client-side, don't store it.
- Put these as versioned files in `supabase/migrations/0001_init.sql` etc.

---

## 7. Screens

### Mobile App — Auth Stack
- **Welcome/Onboarding** (optional, brief) → Login / Register choice
- **Register** — email, password, display name
- **Login** — email, password, "forgot password" (Supabase built-in flow)

### Mobile App — Main Tabs
1. **Home**
   - Quick stats: this week's gym sessions, this week's run distance/time, a simple streak or recent-activity feed.
   - "Log Gym Session" and "Log Run" quick-action buttons.
2. **Gym**
   - List/grid of templates (6 seeded + any user-created), each showing muscle groups and exercise count.
   - Tap a template → prefilled session logging screen: for each exercise, enter sets performed with weight + reps per set (add/remove sets). Fully editable — can add extra exercises or delete ones from the template for this session only, without altering the saved template.
   - "Start Blank Session" option.
   - History list of past gym sessions (filter by date/template).
   - Template editor: create/edit/delete custom templates (name, category, exercise list with target sets/reps).
3. **Run**
   - "Add Run" → choose **Strava Link** or **Manual Entry** (see §3 for exact behavior).
   - Manual entry fields: date, distance (with km/mi toggle), time elapsed (hh:mm:ss picker), optional title/notes. Auto-computed pace shown live.
   - History list of past runs with distance/pace/date, tap to edit.
4. **Settings**
   - Theme: Light / Dark / System.
   - Units: km/mi, kg/lb.
   - Account: display name, email, log out, delete account.
   - Sync status indicator (last synced time, manual "sync now" button, offline indicator).
   - About / app version.

### Website
- **Landing (`/`)** — hero with app name/logo, tagline, feature highlights (Gym templates, Run tracking, Offline-first, Dark mode), app screenshots/mockups, download CTA (store badges, placeholder links).
- **Features (`/features`)** — expanded breakdown of each feature.
- **Login / Register** — per §5 decision (real Supabase-auth pages with a simple "go to the app" confirmation, or static CTA pages — agent picks and documents which).
- Footer with links (GitHub repo, privacy note, contact placeholder).

---

## 8. Branding / Logo / Theming

- Design a simple, modern **logo mark** representing "gym + run" — e.g., a minimal dumbbell merging into a running/heartbeat line, or an abstract "A" monogram (for ActivityTracker) built from a barbell + a forward-motion chevron. Keep it to **2 colors max** so it works cleanly in both light and dark contexts (a version with a light-mode fill and a dark-mode fill, or a single-color mark that just flips between a dark-on-light and light-on-dark background).
- Deliverables:
  - App icon (Expo `icon.png` / adaptive icon for Android) — square, no text, simple enough to read at 48px.
  - Splash screen mark.
  - Wordmark/logo for the website header (mark + "ActivityTracker" text), in both a light-mode and dark-mode SVG variant.
  - Favicon for the website.
- Implement as **SVG** where possible (scales cleanly, themeable via currentColor/CSS variables) rather than a raster export, so both light/dark variants can share one file.
- Full **dark mode and light mode** are a hard requirement on both the app and the website — not just "dark background," but a proper token system (background, surface, text-primary, text-secondary, border, accent, success/error) defined once and consumed everywhere. Respect system preference by default; allow manual override (app: in Settings; website: a theme toggle in the header is a nice-to-have **[AGENT DISCRETION]**).

---

## 9. Git / Repo Setup & Commit Discipline

- Initialize the project **inside the existing GitHub repo**: `https://github.com/wrestle-R/Activity-tracker` (currently empty aside from possible README). Use the "push an existing repository" flow — do not create a separate new repo.
- **Commit in ~20 logically-scoped commits across the build**, not one giant commit. Use clear, conventional-style messages. Suggested milestone breakdown (adapt as needed, but keep granularity similar):
  1. `chore: initialize monorepo structure (pnpm/turborepo, apps/, packages/)`
  2. `chore: add Supabase project config, env examples, migrations folder`
  3. `feat(db): add initial Supabase schema + RLS policies`
  4. `feat(db): seed gym templates (Push/Pull/Leg 1&2)`
  5. `chore(mobile): scaffold Expo app with Expo Router + TypeScript`
  6. `feat(mobile): implement theme system (light/dark/system + tokens)`
  7. `feat(mobile): auth screens (login/register) wired to Supabase`
  8. `feat(mobile): local offline DB layer (expo-sqlite/WatermelonDB) + sync engine`
  9. `feat(mobile): Home tab with quick stats + shortcuts`
  10. `feat(mobile): Gym tab — template list + template detail`
  11. `feat(mobile): Gym session logging flow (sets/reps/weight editable)`
  12. `feat(mobile): Gym history + template editor (create/edit custom templates)`
  13. `feat(mobile): Run tab — manual entry flow + pace calculation`
  14. `feat(mobile): Run tab — Strava link reference flow`
  15. `feat(mobile): Settings tab (theme, units, account, sync status)`
  16. `feat(mobile): app icon, splash screen, branding assets`
  17. `chore(web): scaffold Next.js app with Tailwind + deploy config for Vercel`
  18. `feat(web): landing page (hero, features, CTA)`
  19. `feat(web): features page + auth pages`
  20. `feat(web): branding, favicon, responsive polish, dark/light theme`
  21. `docs: README with setup, architecture, env vars, screenshots`
  22. `test/fix: bugfixes from full offline/online QA pass (see §11)`
- Each commit should represent a real, working increment — don't split arbitrarily just to hit a count, and don't dump everything into 2–3 commits either.
- `README.md` at repo root must document: setup steps for both apps, required env vars, how to run the Supabase migrations, how to run the mobile app (`expo start`), and how to run/deploy the web app.

---

## 10. Non-Functional Requirements

- **TypeScript strict mode** across all packages.
- **Offline resilience**: every mutation (new session, new run, edited template) must succeed instantly against local storage even with airplane mode on, and sync silently in the background when connectivity returns. Never block a save on network.
- **Loading/empty/error states** for every list and form — no blank white screens.
- **Accessibility**: sensible touch target sizes, labels on form inputs, color contrast that holds up in both themes.
- **No hardcoded secrets** anywhere in the codebase — Supabase keys only via env vars, `.env` gitignored, `.env.example` committed.
- Keep components small and reusable; share types/constants (including the template seed data from §4) via `packages/shared` so mobile and any future web dashboard don't diverge.

---

## 11. QA Checklist (run before calling it done)

- [ ] Register → log out → log back in works.
- [ ] Airplane mode: can still log a full gym session and a manual run, and both appear in history immediately.
- [ ] Reconnect after airplane mode: offline-created data syncs to Supabase without duplication.
- [ ] All 6 seed templates appear correctly with the exact sets/reps from §4, and are editable per-session without mutating the saved template.
- [ ] Strava link field: valid Strava URL is accepted and stored as a tappable reference; invalid URL is rejected with a clear message; distance/time must still be entered manually per §3.
- [ ] Theme toggle (light/dark/system) is instant and consistent across every screen, both app and website.
- [ ] Website builds and deploys cleanly on Vercel with no server-only secrets required at build time for the marketing pages.
- [ ] No console errors/warnings on a clean run of either app.

---

## 12. Open Items / Things the Agent Must Ask About or Flag, Not Guess

- **Supabase project URL + anon key** — not available yet; build against `.env.example` placeholders and flag clearly in the PR/README that these must be supplied before the app can hit a real backend.
- Whether web `/login` and `/register` get real Supabase wiring or stay static — agent decides per §5 and documents the choice in the README.
- App store / Play Store links on the website are placeholders (`#` or `TODO`) until the app is actually published — do not fabricate real store URLs.
- Exact package choice for local offline storage (`expo-sqlite` vs `WatermelonDB`) and monorepo tool (`pnpm workspaces` vs `turborepo`) are left to agent discretion — pick one, note the reasoning briefly in the README, don't ask about it further.

---

## 13. Definition of Done

- Repo `wrestle-R/Activity-tracker` contains both `apps/mobile` and `apps/web`, buildable independently, with ~20+ meaningful commits reflecting the milestones in §9.
- Mobile app runs in Expo Go / dev build, works fully offline for all core flows, has light + dark theme, and implements Home/Gym/Run/Settings exactly as specified.
- All 6 gym templates from §4 are present and match the source numbers exactly.
- Run logging supports both Strava-link-as-reference and full manual entry, with the limitation from §3 honestly reflected in the UI copy.
- Website is a polished marketing site deployable to Vercel, on-brand, dark/light themed, with no fake data or fabricated integrations.
- README fully documents setup, env vars, and the discretionary decisions made.
