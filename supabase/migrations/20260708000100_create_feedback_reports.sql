-- CodeQuest Academy - Feedback Center
-- Safe, isolated migration. Does not modify existing app tables.

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

alter table public.feedback_reports enable row level security;

grant insert (id, user_id, category, message, contact_email, app_version, platform, metadata, created_at)
  on public.feedback_reports to authenticated;

grant select (id, user_id, category, message, contact_email, app_version, platform, metadata, created_at)
  on public.feedback_reports to authenticated;

drop policy if exists "Feedback reports are insertable by owner" on public.feedback_reports;
create policy "Feedback reports are insertable by owner"
  on public.feedback_reports for insert
  with check (auth.uid() = user_id);

drop policy if exists "Feedback reports are readable by owner" on public.feedback_reports;
create policy "Feedback reports are readable by owner"
  on public.feedback_reports for select
  using (auth.uid() = user_id);
