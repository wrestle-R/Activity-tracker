# Sweatline web

Next.js 16 app containing the public homepage, Supabase Auth forms, and the responsive Sweatline dashboard. The dashboard uses shadcn/ui’s Base UI sidebar and components, with the supplied sidebar guide reflected in the provider → sidebar → inset/header layout.

## Run

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add the existing Personal Supabase project’s public URL and publishable key to enable Auth. The dashboard intentionally renders a local preview before sign-in so the product and score remain testable without credentials.

## Checks

```bash
npm run lint
npm run build
```

The schema is in `supabase/migrations/0001_sweatline.sql`. It creates only four `sweatline_` tables, enables row-level security, and seeds all six workout templates.
