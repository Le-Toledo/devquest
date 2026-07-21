do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.player_progress'::regclass
      and conname = 'player_progress_user_id_fkey'
      and pg_get_constraintdef(oid) not like 'FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE%'
  ) then
    raise exception 'Constraint player_progress_user_id_fkey already exists with a different definition.';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.player_progress'::regclass
      and contype = 'f'
      and confrelid = 'auth.users'::regclass
      and pg_get_constraintdef(oid) like 'FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE%'
  ) then
    alter table public.player_progress
      add constraint player_progress_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete cascade
      not valid;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.player_progress'::regclass
      and conname = 'player_progress_user_id_fkey'
      and not convalidated
  ) then
    alter table public.player_progress
      validate constraint player_progress_user_id_fkey;
  end if;
end $$;
