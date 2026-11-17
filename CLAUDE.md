# Satori — guide for Claude Code

Satori is a mental-wellness web app for students in Pakistan, and also a research
project on academic stress (principal investigator: Saad Nizami). Students
track their mood and academic stress, journal, use focus and breathing tools,
and chat with **Kokoro**, an AI companion. Their logs (with consent) feed a
research dataset that is exported as CSV.

Live: **https://satoripk.vercel.app** · Repo: `saadnizami1/satoripk` · Production deploys from `main`.

The project owner mostly asks for UI changes and new features. Your job is to
make those changes in the existing design language **and** keep code, the
Supabase database, and Vercel in sync. The workflows below do that.

---

## Golden rules

1. **Never print, log, commit or hard-code a secret.** Tokens and keys live only in
   `.env.local` (git-ignored via `.env*`). Read them through `scripts/ops.mjs`.
   Never add a secret to a `NEXT_PUBLIC_*` variable: those are shipped to the browser.
2. **Any schema change is a migration file**, applied to the live DB, followed by
   regenerating types, all in the same change. See *Changing the database*.
3. **Every table needs RLS** that scopes rows to `auth.uid()`. Anonymous visitors
   have no table access at all, and that must stay true.
4. **Keep the design system.** Build pages from `components/ui` and the tokens in
   `app/globals.css`; don't invent new buttons, cards or colours. Kokoro, Help and
   Breathing stay calm (no stickers, tilt or decorative motion). See *Design system*.
5. **Verify before you ship:** `npm run typecheck` and `npm run build` must pass.
   Run `npm run e2e` for anything touching auth, data or APIs.
6. **`main` is production.** Pushing to `main` deploys to real users. Do larger work
   on a branch (which gets a preview deploy), verify it, then merge.
7. Crisis helpline numbers live in `lib/helplines.ts` (used by the Help page, the
   landing page, the dashboard and Kokoro) and are repeated in Kokoro's system prompt
   in `app/api/chat/route.ts`. Keep them accurate and in sync; don't change them casually.
8. **Never claim what the product doesn't do.** No invented stats, testimonials or
   features. Verified figures: 200+ students, 7 schools, 4 cities. Research exports are
   identifiable (name, email), so never describe them as anonymised.

---

## Stack

| Layer | What |
|---|---|
| Framework | Next.js **16** (App Router, Turbopack), React 19, TypeScript (strict) |
| Styling | Class-based design system in `app/globals.css` (tokens + component classes), shared React kit in `components/ui`, page-specific CSS in a `<style>` block at the bottom of each page. Tailwind v4 is loaded but barely used |
| Motion | `framer-motion` |
| Charts | `recharts` (mood graph, insights) |
| Icons | `lucide-react` at 1.5–2px stroke, plus hand-drawn SVG stickers and weather glyphs in `components/ui` |
| Backend | Supabase project **"Satori PK"**, ref `ooiddphmbwyepuacjpoz`, region **ap-south-1 (Mumbai)**, free plan |
| Auth | Supabase Auth: email/password (auto-confirmed, min 8 chars) and Google OAuth. ES256 JWT signing keys |
| AI | Groq, model `openai/gpt-oss-120b` (reasoning effort low, reasoning hidden), streamed |
| Hosting | Vercel project **`satoripk`**, functions in **bom1 (Mumbai)**, Node 24 |
| Node | **≥ 22 required** (supabase-js needs native WebSocket) |

---

## Repo map

```
proxy.ts                    Next 16 "proxy" (formerly middleware): auth + onboarding routing
app/
  layout.tsx                Root layout, fonts (Gloock display + Inter), OG metadata, sticker filter defs
  globals.css               Design tokens + utility classes (read this before UI work)
  page.tsx                  Public landing page (server component; header + hero phone hydrate)
  auth/page.tsx             Sign in / sign up (email + Google)
  auth/callback/route.ts    OAuth code exchange → /onboarding or `next`
  onboarding/page.tsx       5 quick questions + privacy choice → writes profile, seeds a mood, sets onboarding_completed
  dashboard/layout.tsx      Pill top bar, menu sheet (NAV_GROUPS), phone tab bar, "today pending" dot
  dashboard/*/page.tsx      Feature pages (see Page map)
  api/chat/route.ts         Kokoro: auth, rate limit, server-built prompt, Groq stream
  api/research-export/      Password-gated CSV export of research views (service role)
  api/account/route.ts      DELETE = delete the signed-in user's account + all data
  api/health/route.ts       Daily Vercel cron keep-alive (needs CRON_SECRET)
components/
  ui/kit.tsx                Logo, TapeHeading, Pill, TornPaper, Polaroid, Scene, PhoneMockup, ZigzagDivider, Skeleton…
  ui/controls.tsx           Client controls: MoodPicker, ScalePicker, OptionRows, ChipGroup, Switch, Accordion, TextField
  ui/stickers.tsx           Cut-out SVG stickers (<Sticker name="chai" />) + the global die-cut filter
  ui/MoodGlyph.tsx          Weather glyph per mood score (1 rain … 5 sun)
  ui/school-scenes.tsx      Illustrated film-strip frames (no people)
  app/PageHeader.tsx        Inner-page header: painted band + tape title + sticker, or `calm`
  landing/                  Landing header and the interactive hero phone
lib/
  moods.ts                  The 5-step mood scale (labels, replies, next step), greeting, firstName()
  helplines.ts              Single source of crisis numbers
  profile-options.ts        Answer options for profile/survey questions (stored values are research data)
  focus.ts                  Focus minutes + pomodoro_total in localStorage
  supabase.ts               Browser client (singleton, typed)
  supabase/server.ts        Server client for route handlers (cookies)
  supabase/admin.ts         Service-role client (bypasses RLS: server only!)
  database.types.ts         GENERATED from the live DB. Don't hand-edit
  dates.ts                  Local-timezone date helpers + check-in event
  avatar.ts                 Avatar resize/upload/signed-URL helpers (Storage)
supabase/migrations/        SQL migrations (the source of truth for the schema)
scripts/ops.mjs             Supabase + Vercel ops CLI (see below)
scripts/paint-art.py        Paints public/art/*.webp (Lahore skyline scenes); deterministic, needs numpy + Pillow
scripts/e2e.mjs             End-to-end test suite (32 checks)
vercel.json                 Function region (bom1) + daily cron
```

---

## How auth and routing work

- **`proxy.ts`** runs on `/dashboard/*`, `/onboarding/*` and `/auth` only.
  - It calls `supabase.auth.getClaims()`. This verifies the JWT **locally** against
    the project's ES256 JWKS, so there is no database or auth round-trip. Keep it that way.
  - Signed out on a protected route → `/auth?next=<path>`.
  - Onboarding status comes from the token: `claims.app_metadata.onboarding_completed`.
    Only `true` is trusted. Otherwise the proxy confirms against `profiles`.
    Not onboarded → `/onboarding`. Onboarded users are redirected away from
    `/onboarding` and `/auth` to `/dashboard`.
- **DB triggers keep this in sync:**
  - `on_auth_user_created` inserts a `profiles` row for every new auth user.
  - `profiles_sync_onboarding_claim` copies `profiles.onboarding_completed` into
    `auth.users.raw_app_meta_data`. That's why onboarding calls
    `supabase.auth.refreshSession()` after saving: the new token carries the flag.
- **Client pages do not gate auth themselves.** The dashboard layout only listens
  for `SIGNED_OUT`. Don't add blocking auth checks or skeleton gates to layouts.
- In client components, get the user with **`supabase.auth.getSession()`**, which is
  local. Avoid `getUser()` in the browser: it's a network call. In route handlers, use
  `createClient()` from `lib/supabase/server` then `auth.getClaims()` (`claims.sub` is the user id).
- Sessions are stored in **cookies** (`@supabase/ssr`), not localStorage.

---

## Data access patterns

- Dashboard pages are `'use client'` components. They fetch with the typed browser
  client inside `useEffect`, run independent queries in **one `Promise.all`**, and
  select only the columns they render.
- RLS enforces ownership, but still filter `.eq('user_id', session.user.id)`
  so indexes are used and the intent is clear.
- After an insert, use `.insert(...).select().single()` to get the row back.
  Don't re-query.
- Dates: always use `lib/dates.ts`.
  - `startOfToday()` for "today" filters.
  - `localDateKey()` for grouping by day.
  - Never derive a day from `toISOString()`: in Pakistan (UTC+5) that's the wrong day before 5am.
- After a mood or stress check-in, call `notifyCheckin()` so the nav badge refreshes.
- Anything that needs a secret, cross-user data or third-party APIs goes in a
  **route handler** under `app/api/`, never in client code.

---

## Database

The schema is defined in `supabase/migrations/20261117000000_initial_schema.sql`.

| Table | Purpose | Client grants |
|---|---|---|
| `profiles` | 1 row per user (id = auth user id). Onboarding answers, `name`, `age`, `gender`, `city`/`location`, school fields, `hobbies[]`, `personality_traits[]`, `avatar_path`, `research_consent`, `onboarding_completed` | select / insert / update own |
| `moods` | `mood_score` 1–5 (1 = TERRIBLE … 5 = GREAT), optional `note` ≤ 2000 chars | select / insert own |
| `academic_stress` | `stress_level` 1–5, `performance_rating` 1–5, `study_hours`, `notes` (JSON string of extra answers) | select / insert own |
| `journal_entries` | `title` (≤300), `content` (≤100k), `mood`, `legacy_id` (old localStorage id), `updated_at` | full CRUD own |
| `chat_sessions` | Kokoro transcript as `messages jsonb` (capped at 200 messages client-side) | full CRUD own |
| `chat_rate_limits` | Used only by `check_chat_rate_limit()` (30 req / 10 min) | none |

- **Views:** `research_mood_complete` and `research_stress_complete`.
  - They're **identifiable**: participant_id, name, email, demographics.
  - Readable only by the service role, through `/api/research-export`
    (password = `RESEARCH_DATA_PASSWORD`).
  - They only include rows where `profiles.research_consent` is true. Users can
    withdraw in Settings.
- **Storage:** private bucket `avatars`, path `<user_id>/avatar.jpg`. Users can only
  touch their own folder. The app displays images through signed URLs.
- **Functions:** `handle_new_user`, `sync_onboarding_claim`, `check_chat_rate_limit`,
  `set_updated_at` (all `search_path = ''`).
- **Data that intentionally stays in localStorage:** `pomodoro_total`, `satori:focus-today`
  and `satori:tool-order` (per-device conveniences). Onboarding progress and a mood picked
  on the landing page live in sessionStorage until onboarding saves.

### Changing the database (always all of these steps)

1. Write a new file: `supabase/migrations/<YYYYMMDDHHMMSS>_<what>.sql`.
   - Wrap it in `begin; … commit;`.
   - New tables need RLS, policies scoped `to authenticated` using `(select auth.uid())`,
     explicit `grant`s to `authenticated`, and an index on `(user_id, created_at desc)` if listed per user.
   - New `security definer` functions need `set search_path = ''`, and their execute
     must be revoked from `public, anon`.
2. Apply it: `node scripts/ops.mjs migrate supabase/migrations/<file>.sql`.
3. Regenerate the types: `node scripts/ops.mjs types` (rewrites `lib/database.types.ts`).
4. `npm run typecheck`, then update the code.
5. Run `node scripts/ops.mjs advisors`. Expected and fine:
   - the `chat_rate_limits` no-policy notice;
   - `check_chat_rate_limit` being executable by authenticated users;
   - leaked-password protection (needs the Pro plan).

   Fix anything else.
6. Commit the migration, the types and the code together.

**Order matters for deploys:** the live database is shared by production and every
preview. Make schema changes **additive and backward-compatible** (new nullable
columns or new tables) so the currently deployed code keeps working. Apply the
migration, then deploy. For a destructive change (dropping or renaming a column),
first deploy code that no longer uses it, then migrate.

Ad-hoc read: `node scripts/ops.mjs sql "select count(*) from profiles"`.
Be careful with writes: there is one database and it holds real participants' data.

---

## Design system ("a scrapbook kept on a Lahore rooftop")

Read `app/globals.css` and `components/ui` first. The look borrows the *language* of
hand-made scrapbook sites (painted scenes, label tape, cut-out stickers, torn paper,
polaroids) with Satori's own art and content. It is loud on the landing page and
onboarding, quieter inside the app, and plain wherever a student may be in distress.

- **Colour tokens (always use the variables):**
  - sky + paper: `--sky` #7FA3A0, `--sky-2`, `--dusk` #2E4A6B, `--night` #0F1E2E,
    `--fog` #ECF1EC (app background), `--paper` #FFFDF7 (cards, inputs), `--tape` #0B0B0B;
  - ink: `--ink` #111, `--ink-2`, `--ink-3` (smallest allowed grey), `--on-dark`, `--on-dark-2`;
  - accents: `--marigold` #F5C542 leads (accent word on tape, focus ring on dark);
    `--rose` #EC4E8B and `--mint` #9ED9C3 are sticker colours. Rose **as text** must be
    `--rose-ink` (contrast). `--danger` is only for crisis and destructive actions;
  - moods: `--mood-1` … `--mood-5`, always paired with the weather glyph, never colour alone.
- **Typography:** `--font-display` is **Gloock** (one weight; size does the hierarchy),
  body is **Inter**. Classes `.t-hero .t-h1 .t-h2 .t-h3 .t-h4 .t-lead .t-body .t-small .t-label .t-num`.
  Nothing below 13px. Display headings are lowercase on scrapbook surfaces, sentence
  case on calm pages. No all-caps labels, no monospace labels.
- **Signature pieces** (use these, don't re-create them):
  - `<TapeHeading lines={[…]} accent="word" />`: a real h1/h2 on strips of black tape,
    one accent word in marigold, tilted at most 1.5°.
  - `<Sticker name="…" />`: cut-out SVG with a white die-cut edge. Decorative only. On
    inner pages use at most one, inside `<PageHeader>`.
  - `<TornPaper>`, `<Polaroid>`, `<FilmStrip>`, `<ZigzagDivider>`, `<PhoneMockup>`, `<Scene>`.
  - Buttons are `<Pill variant="tape|white|marigold|glass|ghost|danger">`; add `knob` for
    the primary call to action on a page.
  - Mood input is always `<MoodPicker>` (weather tiles, arrow-key radiogroup).
- **Shape:** pills for buttons (999px), 20–28px radius for sheets and scenes, 4px for
  polaroids. One soft lift shadow on hover; a deeper "pinned" shadow for paper things.
- **Art:** `public/art/{dusk,dawn,day,night}.webp` plus `blur-*.webp`, painted by
  `scripts/paint-art.py`. Always `alt=""`. No photos of students, ever (most users are minors).
  The dashboard greeting uses the scene for the student's local time of day.
  Images are served with a one-year immutable cache, so give changed art a new filename.
- **Page anatomy (inner pages):** `<PageHeader lines accent art sticker lead>`, then
  content on `.sheet` panels. Calm pages use `<PageHeader calm>`.
- **Motion:** small and purposeful: the hero phone bob, the kite sway, step fades in
  onboarding, the breathing circle. Everything stops under `prefers-reduced-motion`
  (handled globally in `globals.css`).
- **Accessibility:** every action is a real `<a>`/`<button>`; one h1 per page; selected
  states use `aria-checked`/`aria-pressed` plus a visual change beyond colour; touch
  targets at least 44px; text over art sits on a scrim or glass panel.
- **Hydration:** anything that depends on the clock, locale or browser storage renders
  after mount (see the dashboard greeting) or uses `useSyncExternalStore`. Round any
  trig-derived SVG coordinates (`rnd()` in the sticker files).
- **Mobile:** test at 375px with no horizontal scroll. The dashboard has a fixed tab bar
  (Home, Today, Kokoro, Journal, Menu); `.app-main` already pads for it.
- **Voice:** plain, warm, specific to students in Pakistan (Matric, FSc, A-Levels,
  mocks). Never clinical, never forced-cheerful, never guilt about streaks. Say exactly
  what happens with data. Errors say what went wrong and what to do next.
- **Navigation:** new dashboard pages go in `NAV_GROUPS` in `app/dashboard/layout.tsx`
  (and `TOP_NAV` / `MOBILE_TABS` only if they're core).

---

## Page map

| Route | What it does | Data |
|---|---|---|
| `/` | Landing page: hero wordmark, tool index, study info | static |
| `/auth` | Sign in / sign up, Google | Supabase Auth |
| `/onboarding` | Name, age, study stage, mood, privacy (explicit yes/no to research) | `profiles`, seeds `moods` |
| `/dashboard` | Home: time-of-day greeting, inline check-in, Kokoro starters, week/streak/focus, 8 tool polaroids (reorderable), journal prompt, help | `profiles`, `moods` (90 days) |
| `/dashboard/survey` | Optional study questionnaire in 4 chapters (the research questions that used to be in onboarding) | `profiles`, seeds `academic_stress` |
| `/dashboard/today` | Daily check-in: mood + academic stress | `moods`, `academic_stress` |
| `/dashboard/mood` | Mood check-in + last 7 | `moods` |
| `/dashboard/research` | Academic stress log (extra answers in `notes` JSON) | `academic_stress` |
| `/dashboard/research/insights` | Stress trends | `academic_stress` |
| `/dashboard/graph` | Mood chart 7/30/90 days, streak, trend | `moods` |
| `/dashboard/history` | Per-day history of mood + stress | `moods`, `academic_stress` |
| `/dashboard/journal` | Journal grid + full-screen editor, autosave (queued, 2s debounce) | `journal_entries` |
| `/dashboard/kokoro` | AI chat, streamed; emergency numbers strip | `chat_sessions`, `/api/chat` |
| `/dashboard/pomodoro` | Focus timer | localStorage `pomodoro_total` |
| `/dashboard/breathing` | Breathing exercises | none |
| `/dashboard/helpline` | Pakistan crisis lines | static |
| `/dashboard/profile` | Profile view/edit, avatar upload, stats | `profiles`, Storage, counts |
| `/dashboard/settings` | Password, research consent, export JSON, delete journals/account | various, `/api/account` |
| `/dashboard/research-data` | Researcher CSV download (password) | `/api/research-export` |
| `/dashboard/creator` | About the researcher | static |

---

## Environment variables

Names only. The values live in `.env.local` locally and in Vercel.

| Name | Where it's used | In Vercel |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | all Supabase clients | ✔ (plain) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser/server clients. This is a **publishable key** (`sb_publishable_…`). Legacy JWT anon/service keys are **disabled** | ✔ (plain) |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/admin.ts` only. A **secret key** (`sb_secret_…`) | ✔ (sensitive) |
| `GROQ_API_KEY` | `/api/chat` | ✔ (sensitive) |
| `RESEARCH_DATA_PASSWORD` | `/api/research-export` | ✔ (sensitive) |
| `CRON_SECRET` | `/api/health` (Vercel cron sends it automatically) | ✔ (sensitive) |
| `SUPABASE_ACCESS_TOKEN` | `scripts/ops.mjs` (Management API) | local only |
| `VERCEL_TOKEN` | `scripts/ops.mjs` (team-scoped) | local only |
| `SUPABASE_MUMBAI_DB_PASSWORD` | direct Postgres access if ever needed | local only |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | already configured in Supabase Auth; kept for reference | local only |
| `VERCEL_BYPASS_SECRET` | created/removed by `ops.mjs bypass:*` for testing previews | local only |

`.env.local` also has old unused `NEXT_PUBLIC_GEMINI/OPENAI/HUGGINGFACE` keys. Don't use
them. If a feature needs one of those providers, add a server-only variable without the
`NEXT_PUBLIC_` prefix.

**Adding a new env var:** add it to `.env.local`, then run
`node scripts/ops.mjs env:push NAME`. That sets production and preview: sensitive
type, or plain for `NEXT_PUBLIC_*`. Redeploy for it to take effect. Confirm with
`node scripts/ops.mjs env:list`.

---

## Local development

- This machine has **Node 20**, but supabase-js needs Node 22. Use
  **`npm run dev:22`**: plain `npm run dev` renders pages, but route handlers that
  create a Supabase client crash.
- The local app talks to the **live** Supabase project (there is no local DB). Test
  with throwaway accounts and clean them up.
- `npm run typecheck` checks types. `npm run build` runs a production build (on Node
  20 it prints a deprecation warning but succeeds).
- **e2e tests** (`npm run e2e -- <baseUrl>`) run 32 checks:
  - auth routing, onboarding claim, RLS isolation between two users;
  - anon lockout, journal upload idempotency, avatar storage permissions;
  - chat (auth, prompt-injection rejection, streaming), research export;
  - health, account deletion.

  Run them against a local server or a deployment. They create and delete their own
  test users.
  - Local: `npm run build`, then
    `npx -y node@22 node_modules/next/dist/bin/next start -p 3123`, then
    `npm run e2e -- http://localhost:3123`.
- `npm run lint` reports many pre-existing `no-explicit-any` and React-compiler style
  warnings. Don't add new ones, but don't mass-refactor unprompted.

## Deploying and keeping everything in sync

Vercel is connected to GitHub: **push to `main` → production; push any other branch
→ protected preview**. There's no separate deploy command.

**Small UI change:**
1. `npm run typecheck && npm run build`.
2. Commit and push to `main`.
3. `node scripts/ops.mjs wait` waits for the deploy of HEAD and prints READY/ERROR + URL.

**Feature or anything touching data/auth:**
1. Create a branch.
2. Migrate the DB if needed (additive) and regenerate types.
3. Push any new env vars with `env:push`.
4. Push the branch, then run `node scripts/ops.mjs wait`.
5. Test the preview: `node scripts/ops.mjs bypass:create`, then
   `npm run e2e -- https://<preview-url>`, then `node scripts/ops.mjs bypass:revoke`.
6. Merge to `main` (fast-forward), push, `node scripts/ops.mjs wait`.
7. Run `npm run e2e -- https://satoripk.vercel.app` to confirm production.

**If a deploy fails:**
- `node scripts/ops.mjs deploys` lists recent deployments.
- Build logs are in the Vercel dashboard.
- To roll back, revert the commit and push.

**Vercel facts:**
- Function region comes from `vercel.json` (`bom1`). Keep it next to the database.
- Cron: `/api/health` daily at 06:00 UTC. It keeps the free Supabase project from pausing.

The `.vercel/project.json` link points at `satoripk`. The claude.ai Vercel connector
is signed into a different account and **can't see this project**. Use
`scripts/ops.mjs` (token in `.env.local`) instead.

---

## Gotchas

- **Groq models get retired.** If Kokoro breaks, check `/api/chat` logs, then list
  available models: `GET https://api.groq.com/openai/v1/models`.
- **Free Supabase plan:**
  - 2 active projects per account. The other one is "Themis": never touch it.
  - The old Sydney project `zajhxwmecgbepxiyjizs` is paused and empty. Ignore it.
  - Leaked-password protection and other Pro features aren't available.
- **Research data is sensitive.** Children's names, emails, religion, academic
  dishonesty answers. Never expose views or profile data to the client or to other
  users. Never add `anon` grants.
- `chat_sessions.messages` timestamps are stored as ISO strings. Convert to `Date`
  when loading.
- `profiles.city` and `profiles.location` both exist. Onboarding sets both and the
  profile editor writes both; the research views use `city`.
- Signed avatar URLs expire after 1 hour. Re-request them, don't store them.
- `next.config.ts` sets security headers (`X-Frame-Options: DENY`, HSTS, etc.). An
  embed or iframe feature would need them adjusted.
- Keep the proxy matcher narrow. Public pages and APIs must not hit Supabase in the proxy.
