# Becoming

Becoming is a mobile-first community habit tracker for founder circles. Users commit to a focused daily habit, stay accountable inside a small group, and see shared completion through a team-based progress dashboard.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Supabase auth, Postgres, RPCs, and RLS
- Vercel-ready deployment

## Project Structure

```text
app/
  api/auth/callback/route.ts   Supabase magic-link callback
  auth/page.tsx                Auth screen
  onboarding/page.tsx          Join/create tribe, habits, integrations
  today/page.tsx               Daily logging screen
  tribe/page.tsx               Circle dashboard and group accountability flow
  profile/page.tsx             Profile and settings
components/
  auth/                        Auth UI
  onboarding/                  Onboarding flow
  today/                       Today screen
  tribe/                       Circle dashboard and interaction sheet
  profile/                     Profile screen
  ui/                          Reusable design-system primitives
lib/
  data/                        App bootstrap and actions
  demo/                        Demo-mode fallback data
  supabase/                    Browser/server Supabase clients
  score.ts                     Weekly scoring logic
  types.ts                     Shared app types
supabase/
  migrations/                  Schema, triggers, RLS, RPCs
  seed.sql                     Seed organizations and habit templates
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env vars:

```bash
cp .env.example .env.local
```

3. Fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

4. Start Supabase locally if you use the CLI:

```bash
supabase start
supabase db reset
```

5. Run the app:

```bash
npm run dev
```

If Supabase env vars are missing, the app falls back to demo content so the UI still renders.

## Supabase Setup

1. Create a new Supabase project.
2. Enable Email auth and magic links in Authentication settings.
3. Set the site URL to your local or production app URL.
4. Run the SQL in [supabase/migrations/20260320120000_init_becoming.sql](/Users/markmcdermott/Code/foundrs-prototype/supabase/migrations/20260320120000_init_becoming.sql).
5. Run [supabase/seed.sql](/Users/markmcdermott/Code/foundrs-prototype/supabase/seed.sql).

The migration includes:

- Core tables for profiles, tribes, memberships, habits, logs, reactions, comments, integrations, and notification preferences
- RLS policies
- Membership guardrails for one-circle-per-user and max 8 tribe members
- RPCs for tribe search, tribe join, tribe creation, and organization rankings
- Triggers for auth-user profile creation and `updated_at` maintenance

## Product Notes

- The current shared-progress direction is a team completion ring plus weekly recovery grid.
- The earlier constellation system is retained only as deprecated historical context.
- Notification preferences are stored now; actual reminder delivery is scaffolded for a later cron or edge-function pass.
- Brand voice guidance lives in [BRAND.md](/Users/markmcdermott/Code/foundrs-prototype/BRAND.md).
- Visual design guidance lives in [VISUAL_IDENTITY.md](/Users/markmcdermott/Code/foundrs-prototype/VISUAL_IDENTITY.md) and [UI_COMPONENT_LIBRARY.md](/Users/markmcdermott/Code/foundrs-prototype/UI_COMPONENT_LIBRARY.md).
- Team-ring behavior guidance lives in [TEAM_RING_SYSTEM.md](/Users/markmcdermott/Code/foundrs-prototype/TEAM_RING_SYSTEM.md).
- Deprecated constellation guidance remains in [CONSTELLATION_SYSTEM.md](/Users/markmcdermott/Code/foundrs-prototype/CONSTELLATION_SYSTEM.md) for historical reference only.
- Feedback templates for screen-by-screen review are in [FEEDBACK.md](/Users/markmcdermott/Code/foundrs-prototype/FEEDBACK.md) and the in-app `/feedback` route.

## Deployment

### Vercel

1. Import the repo into Vercel.
2. Add the four environment variables from `.env.example`.
3. Set the production site URL in Supabase auth redirect settings.
4. Deploy.

### Supabase

1. Apply the migration.
2. Seed the organizations and habit templates.
3. Verify auth redirect URLs:
   - Local: `http://localhost:3000/api/auth/callback`
   - Production: `https://your-domain.com/api/auth/callback`

## Notification Hook Next Step

The schema is ready for reminder preferences. The next clean implementation is:

1. Create a Supabase Edge Function that reads `notification_preferences`.
2. Trigger it with a scheduled job or external cron.
3. Send reminders with Resend, Postmark, or Supabase Auth hooks.

## Future Enhancements

- Wearable sync for Apple Health, Garmin, Oura, Whoop, and Fitbit
- Push notifications and richer reminder delivery
- Organization-level analytics and historical trends
- Native wrapper or dedicated mobile apps
