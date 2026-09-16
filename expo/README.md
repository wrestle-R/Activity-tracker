# Sweatline Expo app

Offline-first React Native app built with Expo Router and SQLite. Development builds seed clearly labelled preview activity only when the local database is empty; production starts clean.

## Run

```bash
npm install
npx expo start --android
```

Copy `.env.example` to `.env` and add the existing Personal Supabase project's public URL and publishable key to enable Auth and sync. Local logging, score calculation, templates, theme selection, and history work without those variables.
