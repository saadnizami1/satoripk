-- Satori — complete database schema (fresh project, Mumbai / ap-south-1).
--
-- Every table is private to its owner via RLS. Anonymous visitors have no
-- table access at all. Research exports go through service-role-only views.

begin;

drop extension if exists pg_graphql; -- the app only uses the REST API

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ── Tables ─────────────────────────────────────────────────────────────

create table public.profiles (
  id                   uuid primary key references auth.users (id) on delete cascade,
  name                 text,
  age                  integer check (age between 3 and 99),
  gender               text,
  religion             text,
  city                 text,
  location             text,
  family_status        text,
  school_type          text,
  school_name          text,
  education_board      text,
  education_level      text,
  hobbies              text[],
  personality_traits   text[],
  recent_mood          integer check (recent_mood between 1 and 5),
  academic_stress      integer check (academic_stress between 1 and 5),
  stress_is_academic   text,
  favorite_subject     text,
  favorite_subject_why text,
  worst_subject        text,
  worst_subject_why    text,
  report_card_average  text,
  has_tutoring         text,
  has_cheated          text,
  previous_research    text,
  language             text not null default 'en',
  avatar_path          text,
  -- Given during onboarding; can be withdrawn in Settings.
  research_consent     boolean not null default false,
  onboarding_completed boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table public.moods (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  mood_score integer not null check (mood_score between 1 and 5),
  note       text check (char_length(note) <= 2000),
  created_at timestamptz not null default now()
);

create table public.academic_stress (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  study_hours        numeric,
  performance_rating integer not null check (performance_rating between 1 and 5),
  stress_level       integer not null check (stress_level between 1 and 5),
  notes              text check (char_length(notes) <= 5000),
  created_at         timestamptz not null default now()
);

create table public.chat_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  messages   jsonb not null default '[]'::jsonb check (pg_column_size(messages) < 2000000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.journal_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title      text not null check (char_length(title) <= 300),
  content    text not null default '' check (char_length(content) <= 100000),
  mood       text,
  -- Id from the old localStorage journal; makes the one-time upload from
  -- a device idempotent.
  legacy_id  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, legacy_id)
);

create table public.chat_rate_limits (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  window_start  timestamptz not null,
  request_count integer not null
);

create trigger profiles_set_updated_at        before update on public.profiles        for each row execute function public.set_updated_at();
create trigger chat_sessions_set_updated_at   before update on public.chat_sessions   for each row execute function public.set_updated_at();
create trigger journal_entries_set_updated_at before update on public.journal_entries for each row execute function public.set_updated_at();

-- The app's queries are all "this user's rows, newest first".
create index moods_user_created_idx           on public.moods (user_id, created_at desc);
create index academic_stress_user_created_idx on public.academic_stress (user_id, created_at desc);
create index journal_entries_user_created_idx on public.journal_entries (user_id, created_at desc);
create index chat_sessions_user_updated_idx   on public.chat_sessions (user_id, updated_at desc);

-- ── Privileges + row level security ────────────────────────────────────

revoke all on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;

grant select, insert, update         on public.profiles        to authenticated;
grant select, insert                 on public.moods           to authenticated;
grant select, insert                 on public.academic_stress to authenticated;
grant select, insert, update, delete on public.chat_sessions   to authenticated;
grant select, insert, update, delete on public.journal_entries to authenticated;
grant all on all tables in schema public to service_role;

alter table public.profiles         enable row level security;
alter table public.moods            enable row level security;
alter table public.academic_stress  enable row level security;
alter table public.chat_sessions    enable row level security;
alter table public.journal_entries  enable row level security;
alter table public.chat_rate_limits enable row level security; -- no policies: definer function only

create policy "own profile: select" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "own profile: insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "own profile: update" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "own moods: select" on public.moods for select to authenticated using ((select auth.uid()) = user_id);
create policy "own moods: insert" on public.moods for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "own stress: select" on public.academic_stress for select to authenticated using ((select auth.uid()) = user_id);
create policy "own stress: insert" on public.academic_stress for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "own chats: select" on public.chat_sessions for select to authenticated using ((select auth.uid()) = user_id);
create policy "own chats: insert" on public.chat_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own chats: update" on public.chat_sessions for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own chats: delete" on public.chat_sessions for delete to authenticated using ((select auth.uid()) = user_id);

create policy "own journals: select" on public.journal_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "own journals: insert" on public.journal_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own journals: update" on public.journal_entries for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own journals: delete" on public.journal_entries for delete to authenticated using ((select auth.uid()) = user_id);

-- ── Research views (service role only, via /api/research-export) ──────
-- Identifiable (name, email) — kept server-side behind the export password.
-- Rows from participants who withdrew consent are excluded.

create view public.research_mood_complete as
select
  'P-' || left(md5(m.user_id::text), 10) as participant_id,
  p.name,
  u.email,
  m.created_at          as date_logged,
  m.mood_score,
  m.note,
  p.age,
  p.gender,
  p.education_level     as class,
  p.school_type         as school_type_private_or_public,
  p.school_name,
  p.favorite_subject    as best_subject,
  p.worst_subject,
  p.report_card_average as grades,
  p.has_tutoring        as home_tutoring,
  p.city
from public.moods m
join public.profiles p on p.id = m.user_id
join auth.users u      on u.id = m.user_id
where p.research_consent;

create view public.research_stress_complete as
select
  'P-' || left(md5(s.user_id::text), 10) as participant_id,
  p.name,
  u.email,
  s.created_at          as date_logged,
  s.stress_level,
  s.study_hours,
  s.performance_rating,
  s.notes,
  p.age,
  p.gender,
  p.education_level     as class,
  p.school_type         as school_type_private_or_public,
  p.school_name,
  p.education_board,
  p.favorite_subject    as best_subject,
  p.worst_subject,
  p.report_card_average as grades,
  p.has_tutoring        as home_tutoring,
  p.has_cheated,
  p.city,
  p.religion,
  p.hobbies,
  p.personality_traits
from public.academic_stress s
join public.profiles p on p.id = s.user_id
join auth.users u      on u.id = s.user_id
where p.research_consent;

revoke all on public.research_mood_complete, public.research_stress_complete from public, anon, authenticated;
grant select on public.research_mood_complete, public.research_stress_complete to service_role;

-- ── Auth helpers ───────────────────────────────────────────────────────

-- Every new auth user gets a profile row.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mirror onboarding_completed into app_metadata so it is in the JWT and the
-- proxy can route without a database query. Users cannot edit app_metadata.
create or replace function public.sync_onboarding_claim()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                             || jsonb_build_object('onboarding_completed', new.onboarding_completed)
   where id = new.id;
  return new;
end $$;

create trigger profiles_sync_onboarding_claim
  after insert or update of onboarding_completed on public.profiles
  for each row execute function public.sync_onboarding_claim();

-- Fixed-window rate limit for /api/chat. Limits are constants, not
-- parameters, so a client calling the RPC directly cannot raise them.
create or replace function public.check_chat_rate_limit()
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  max_requests constant integer  := 30;
  window_len   constant interval := interval '10 minutes';
  uid     uuid := auth.uid();
  allowed boolean;
begin
  if uid is null then return false; end if;
  insert into public.chat_rate_limits as r (user_id, window_start, request_count)
  values (uid, now(), 1)
  on conflict (user_id) do update set
    window_start  = case when r.window_start < now() - window_len then now() else r.window_start end,
    request_count = case when r.window_start < now() - window_len then 1 else r.request_count + 1 end
  returning request_count <= max_requests into allowed;
  return allowed;
end $$;

revoke execute on function public.set_updated_at()        from public, anon, authenticated;
revoke execute on function public.handle_new_user()       from public, anon, authenticated;
revoke execute on function public.sync_onboarding_claim() from public, anon, authenticated;
revoke execute on function public.check_chat_rate_limit() from public, anon;
grant  execute on function public.check_chat_rate_limit() to authenticated;
alter default privileges in schema public revoke execute on functions from public, anon;

-- ── Avatars storage (private; each user only touches their own folder) ─

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "own avatar: select" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own avatar: insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own avatar: update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own avatar: delete" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;
