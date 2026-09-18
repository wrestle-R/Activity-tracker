# Sweatline QA Report

Date: 2026-09-16  
Device: A001 physical Android phone, Android 16, 1080 × 2392  
Expo Go: 57.0.9

## Database

- Reused the existing Personal/Articula Supabase PostgreSQL project.
- Applied `next/supabase/migrations/0001_sweatline.sql` successfully.
- Created four minimal, RLS-protected tables only:
  - `sweatline_profiles`
  - `sweatline_templates`
  - `sweatline_workouts`
  - `sweatline_runs`
- Verified the six requested workout templates and their exercise counts.

## Web checks

- `npm run lint`: passed.
- `npm run build`: passed with all 11 routes generated.
- Production dashboard checked at desktop and mobile widths.
- Sidebar expansion/collapse and mobile off-canvas layout verified.
- Dashboard chart, Sweat Score, navigation, landing, login, and registration views inspected.
- Production dependency audit: zero high-severity vulnerabilities.

Screenshots:

- `qa/web-landing.png`
- `qa/web-dashboard-final.png`
- `qa/web-dashboard-mobile.png`

## Mobile checks

- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `npx expo-doctor`: 21/21 checks passed.
- Installed and launched through USB debugging with Metro forwarded over ADB.
- Verified Home, Gym, Run, and Settings tabs with Android UI hierarchy inspection.
- Verified System, Light, and Dark theme controls; restored System mode.
- Functional run test entered `3.2 km` and `18 min`; pace calculated as `5:38 /km`.
- Saving the test run changed run history from 1 to 2 entries and Sweat Score from 90 to 100.
- Development preview records are tagged in code and production starts with clean local storage.

Screenshots:

- `qa/expo-home.png`
- `qa/expo-gym.png`
- `qa/expo-run.png`
- `qa/expo-run-saved.png`
- `qa/expo-settings.png`
- `qa/expo-settings-light.png`

## Configuration note

The existing database connection was sufficient to apply and verify the schema. Client-side Supabase Auth and sync require the project's public URL and publishable/anon key in each app's local environment file. Both apps remain fully usable in offline/local mode until those public values are supplied.
