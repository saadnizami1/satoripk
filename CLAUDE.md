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
4. **Keep the design system.** No border-radius, no soft shadows or gradients,
   1.5px black borders, at most 3 uses of the accent per page. See *Design system*.
5. **Verify before you ship:** `npm run typecheck` and `npm run build` must pass.
   Run `npm run e2e` for anything touching auth, data or APIs.
6. **`main` is production.** Pushing to `main` deploys to real users. Do larger work
   on a branch (which gets a preview deploy), verify it, then merge.
7. Crisis helpline numbers (`/dashboard/helpline`, Kokoro's emergency strip and
   system prompt) must stay accurate and consistent. Don't change them casually.

---

## Stack

| Layer | What |
|---|---|
| Framework | Next.js **16** (App Router, Turbopack), React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 (sparingly), mostly **inline `style={{}}` objects + CSS variables** from `app/globals.css` |
| Motion | `framer-motion` |
| Charts | `recharts` (mood graph, insights) |
| Icons | `lucide-react` (used sparingly; the UI is mostly typographic) |
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
  layout.tsx                Root layout, fonts (Inter / Syne / JetBrains Mono), OG metadata
  globals.css               Design tokens + utility classes (read this before UI work)
  page.tsx                  Public landing page (editorial "research dossier")
  auth/page.tsx             Sign in / sign up (email + Google)
  auth/callback/route.ts    OAuth code exchange → /onboarding or `next`
  onboarding/page.tsx       25-step questionnaire → writes profile, sets onboarding_completed
  dashboard/layout.tsx      Floating menu, mobile bottom tabs, "today pending" badge
  dashboard/*/page.tsx      Feature pages (see Page map)
  api/chat/route.ts         Kokoro: auth, rate limit, server-built prompt, Groq stream
  api/research-export/      Password-gated CSV export of research views (service role)
  api/account/route.ts      DELETE = delete the signed-in user's account + all data
  api/health/route.ts       Daily Vercel cron keep-alive (needs CRON_SECRET)
lib/
  supabase.ts               Browser client (singleton, typed)
  supabase/server.ts        Server client for route handlers (cookies)
  supabase/admin.ts         Service-role client (bypasses RLS: server only!)
  database.types.ts         GENERATED from the live DB. Don't hand-edit
  dates.ts                  Local-timezone date helpers + check-in event
  avatar.ts                 Avatar resize/upload/signed-URL helpers (Storage)
supabase/migrations/        SQL migrations (the source of truth for the schema)
scripts/ops.mjs             Supabase + Vercel ops CLI (see below)
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
- **Data that intentionally stays in localStorage:** `pomodoro_total` only.

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

## Design system ("editorial print / brutalist")

Read `app/globals.css` first. The look is a printed research dossier: raw paper,
black ink, one red accent, stark typography.

- **Colour tokens (always use the variables):**
  - surfaces: `--bg` #F4F2EE paper, `--bg-card` #EDEBE6, `--bg-invert` #0C0C0C;
  - text: `--ink`, `--ink-2` #4A4A44, `--ink-3` #8A8880, `--ink-invert`;
  - borders: `--border` (black), `--border-2` #C8C6C0 (hairline);
  - accent: `--accent` #C13B2A with `--accent-bg`. **Max 3 uses per page**: errors,
    destructive actions, the "pending" dot.
- **Typography:**
  - `--font-display` (Syne 700/800): headings, labels, buttons, ALL CAPS, tight
    negative letter-spacing on big headings.
  - `--font-body` (Inter): paragraphs.
  - `--font-mono` (JetBrains Mono): metadata, dates, counts, small caps labels at
    9–11px with 0.06–0.14em tracking.
  - Utility classes: `.t-hero`, `.t-h1`, `.t-h2`, `.t-label`, `.t-body`, `.t-mono`.
- **Shape:**
  - **border-radius 0 everywhere**. The only circles are the 6–7px status dots.
  - Borders are `1.5px solid var(--border)`; hairlines are `1px solid var(--border-2)`.
  - Shadows are only hard offsets: `--shadow-sm/md/lg` (e.g. `4px 4px 0 var(--border)`).
- **Components:**
  - `.br-btn` / `.br-btn-inv` (buttons that lift on hover), `.br-input`, `.br-card`,
    `.br-lift` (hover lift for cards), `.skeleton` (loading bars).
  - Use `.grid-2col` / `.grid-2fr1fr` for responsive grids (single column ≤ 640px).
- **Page anatomy:**
  1. A big ALL-CAPS display `h1`, `clamp(36px, 5vw, 56px)`, letter-spacing −0.03em.
  2. A 1.5px rule underneath.
  3. Mono metadata lines, then bordered sections.
  4. Cards sit in bordered grids sharing edges (right/bottom borders), not floating.
- **Motion:**
  - Short and mechanical: 80–160ms, ease `cubic-bezier(0.25,0,0,1)` (`--ease-brutal`).
  - framer-motion for modals, menus and masked reveals.
  - Respect `prefers-reduced-motion`.
  - Don't drive animations from scroll-event React state: use framer `useScroll` /
    motion values.
- **Loading state:** three `.skeleton` bars (widths 120/80/48), as existing pages do.
- **Mobile:**
  - The dashboard layout adds `pb-28` for the fixed bottom tab bar.
  - Test at ~375px width. No horizontal scroll.
  - Touch devices disable card dragging (`pointer: coarse`).
- **Voice:** direct, warm, a little editorial; labels in caps ("RECORD TODAY",
  "TALK TO KOKORO"). No emojis in the UI.
- **Existing style:** mostly inline style objects with CSS variables, plus a few
  Tailwind layout classes (`sm:`, `lg:`). Match the file you're editing.
- **Navigation:** new dashboard pages must be added to `NAV_ITEMS` in
  `app/dashboard/layout.tsx` (and `MOBILE_TABS` if they're core).

---

## Page map

| Route | What it does | Data |
|---|---|---|
| `/` | Landing page: hero wordmark, tool index, study info | static |
| `/auth` | Sign in / sign up, Google | Supabase Auth |
| `/onboarding` | 25 steps: consent, demographics, school, mood/stress baseline | `profiles`, seeds `moods`/`academic_stress` |
| `/dashboard` | Home: greeting, today's mood, 8 tool cards (draggable on desktop) | `profiles.name`, today's mood |
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
