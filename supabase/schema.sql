-- DayByFit: database schema (Supabase / Postgres)
-- Run this in the Supabase SQL Editor on a fresh project.
-- Every table has Row Level Security: a user can only access their own rows.

-- ───────────── Workouts ─────────────
create table public.workouts (
  id            uuid primary key,
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date          date not null,
  time_of_day   text not null,          -- morning | day | evening | night
  duration_min  integer not null,
  type_id       text not null,          -- 'gym' (built-in) or the id of a custom workout type
  exercises     jsonb,                  -- [{ name, sets: [{ weight, reps }] }]
  note          text,
  created_at    timestamptz not null default now()
);

alter table public.workouts enable row level security;

create policy "own workouts" on public.workouts
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ───────────── Custom workout types ─────────────
create table public.workout_types (
  id             uuid primary key,
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name           text not null,
  color          text not null,
  has_exercises  boolean not null default false,
  created_at     timestamptz not null default now()
);

alter table public.workout_types enable row level security;

create policy "own types" on public.workout_types
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ───────────── AI coach: chat history ─────────────
-- Users can only READ their messages. Writes are done by the Edge Function with the
-- service role, so a client cannot reset the daily message limit by deleting rows.
create table public.coach_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now(),
  hidden      boolean not null default false   -- "clear chat" hides messages instead of deleting them
);

create index coach_messages_user_created_idx
  on public.coach_messages (user_id, created_at desc);

alter table public.coach_messages enable row level security;

create policy "read own coach messages" on public.coach_messages
  for select
  using ((select auth.uid()) = user_id);

-- ───────────── AI coach: long-term memory ─────────────
-- Short notes about the user, maintained by the Edge Function (service role only).
create table public.coach_memory (
  user_id           uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  summary           text not null default '',
  summarized_until  timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.coach_memory enable row level security;

create policy "own memory select" on public.coach_memory
  for select
  using ((select auth.uid()) = user_id);

-- ───────────── AI coach: "About me" ─────────────
-- Free text written by the user. Read by the Edge Function (through RLS) and added to the prompt.
create table public.coach_profile (
  user_id     uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  about       text not null default '',
  updated_at  timestamptz not null default now()
);

alter table public.coach_profile enable row level security;

create policy "own profile" on public.coach_profile
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);