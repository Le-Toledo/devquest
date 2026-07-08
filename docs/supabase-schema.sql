-- CodeQuest Academy - Supabase base schema
-- Run this file in the Supabase SQL Editor after creating a project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default 'Dev Explorer',
  avatar text not null default 'CQ',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.player_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  player_name text,
  xp int4 not null default 0,
  coins int4 not null default 0,
  level int4 not null default 1,
  progress jsonb not null default '{}'::jsonb,
  streak jsonb not null default '{}'::jsonb,
  achievements jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null default 'Dev Explorer',
  avatar text not null default 'CQ',
  xp integer not null default 0,
  level integer not null default 1,
  favorite_language text,
  period text not null check (period in ('global', 'weekly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, period)
);

create table if not exists public.feedback_reports (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('bug', 'idea', 'content', 'ux', 'other')),
  message text not null check (char_length(message) between 10 and 1500),
  contact_email text,
  app_version text,
  platform text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.leaderboard_entries
  drop column if exists coins;

create index if not exists leaderboard_entries_period_xp_idx
  on public.leaderboard_entries (period, xp desc);

create index if not exists leaderboard_entries_language_idx
  on public.leaderboard_entries (favorite_language);

alter table public.profiles enable row level security;
alter table public.player_progress enable row level security;
alter table public.leaderboard_entries enable row level security;
alter table public.feedback_reports enable row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Player progress is readable by owner" on public.player_progress;
create policy "Player progress is readable by owner"
  on public.player_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Player progress is insertable by owner" on public.player_progress;
create policy "Player progress is insertable by owner"
  on public.player_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Player progress is updatable by owner" on public.player_progress;
create policy "Player progress is updatable by owner"
  on public.player_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Leaderboard is publicly readable" on public.leaderboard_entries;
create policy "Leaderboard is publicly readable"
  on public.leaderboard_entries for select
  using (true);

revoke select on public.leaderboard_entries from anon, authenticated;
grant select (id, display_name, avatar, xp, level, favorite_language, period, updated_at)
  on public.leaderboard_entries to anon, authenticated;
grant insert (user_id, display_name, avatar, xp, level, favorite_language, period, updated_at)
  on public.leaderboard_entries to authenticated;
grant update (display_name, avatar, xp, level, favorite_language, period, updated_at)
  on public.leaderboard_entries to authenticated;
grant insert (id, user_id, category, message, contact_email, app_version, platform, metadata, created_at)
  on public.feedback_reports to authenticated;
grant select (id, user_id, category, message, contact_email, app_version, platform, metadata, created_at)
  on public.feedback_reports to authenticated;

drop policy if exists "Leaderboard entries are insertable by owner" on public.leaderboard_entries;
create policy "Leaderboard entries are insertable by owner"
  on public.leaderboard_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Leaderboard entries are updatable by owner" on public.leaderboard_entries;
create policy "Leaderboard entries are updatable by owner"
  on public.leaderboard_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Feedback reports are insertable by owner" on public.feedback_reports;
create policy "Feedback reports are insertable by owner"
  on public.feedback_reports for insert
  with check (auth.uid() = user_id);

drop policy if exists "Feedback reports are readable by owner" on public.feedback_reports;
create policy "Feedback reports are readable by owner"
  on public.feedback_reports for select
  using (auth.uid() = user_id);
