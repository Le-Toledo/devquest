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

create table if not exists public.cloud_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
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

alter table public.leaderboard_entries
  drop column if exists coins;

create index if not exists leaderboard_entries_period_xp_idx
  on public.leaderboard_entries (period, xp desc);

create index if not exists leaderboard_entries_language_idx
  on public.leaderboard_entries (favorite_language);

alter table public.profiles enable row level security;
alter table public.cloud_progress enable row level security;
alter table public.leaderboard_entries enable row level security;

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

drop policy if exists "Cloud progress is readable by owner" on public.cloud_progress;
create policy "Cloud progress is readable by owner"
  on public.cloud_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Cloud progress is insertable by owner" on public.cloud_progress;
create policy "Cloud progress is insertable by owner"
  on public.cloud_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Cloud progress is updatable by owner" on public.cloud_progress;
create policy "Cloud progress is updatable by owner"
  on public.cloud_progress for update
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

drop policy if exists "Leaderboard entries are insertable by owner" on public.leaderboard_entries;
create policy "Leaderboard entries are insertable by owner"
  on public.leaderboard_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Leaderboard entries are updatable by owner" on public.leaderboard_entries;
create policy "Leaderboard entries are updatable by owner"
  on public.leaderboard_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
