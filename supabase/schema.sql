-- ============================================================
-- À TABLE! — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Sessions ────────────────────────────────────────────────
create table if not exists public.sessions (
  code             text        primary key,
  type             text        not null default 'private' check (type in ('public', 'private')),
  organizer_name   text        not null,
  organizer_id     uuid        not null,
  created_at       timestamptz not null default now(),
  status           text        not null default 'waiting' check (status in ('waiting', 'done')),
  searching_out    boolean     not null default false,
  searching_takeout boolean    not null default false,
  searched_out     boolean     not null default false,
  searched_takeout boolean     not null default false,
  result_out       jsonb,
  result_takeout   jsonb
);

-- ─── Participants ─────────────────────────────────────────────
create table if not exists public.participants (
  id             uuid        primary key,
  session_code   text        not null references public.sessions(code) on delete cascade,
  name           text        not null,
  is_organizer   boolean     not null default false,
  meal_mode      text        check (meal_mode in ('out', 'homemade', 'takeout')),
  cuisines       text[]      not null default '{}',
  budget         text,
  allergies      text[]      not null default '{}',
  prefs_complete boolean     not null default false,
  joined_at      timestamptz not null default now()
);

-- ─── Row Level Security (open access — prototype without auth) ─
alter table public.sessions     enable row level security;
alter table public.participants  enable row level security;

-- Allow all operations for anonymous users
create policy "anon_all_sessions"
  on public.sessions for all
  to anon using (true) with check (true);

create policy "anon_all_participants"
  on public.participants for all
  to anon using (true) with check (true);

-- ─── Realtime ─────────────────────────────────────────────────
-- Required for postgres_changes subscriptions
alter table public.sessions     replica identity full;
alter table public.participants  replica identity full;

-- Enable Realtime for both tables in Supabase Dashboard:
-- Database → Replication → Enable "sessions" and "participants"
-- (or run the two lines below if using CLI)
-- insert into supabase_realtime.subscription (entity) values ('public.sessions');
-- insert into supabase_realtime.subscription (entity) values ('public.participants');
