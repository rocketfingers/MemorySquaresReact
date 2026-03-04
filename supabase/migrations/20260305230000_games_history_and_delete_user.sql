create table if not exists public.games_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  round integer not null,
  time integer not null,
  total_game_time integer not null,
  result integer not null check (result in (0, 1)),
  created_at timestamptz not null default now()
);

create index if not exists games_history_user_id_created_at_idx
  on public.games_history (user_id, created_at desc);

alter table public.games_history enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'games_history'
      and policyname = 'Users can view their own history'
  ) then
    create policy "Users can view their own history"
      on public.games_history
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'games_history'
      and policyname = 'Users can insert their own history'
  ) then
    create policy "Users can insert their own history"
      on public.games_history
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'games_history'
      and policyname = 'Users can delete their own history'
  ) then
    create policy "Users can delete their own history"
      on public.games_history
      for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end
$$;

grant select, insert, delete on table public.games_history to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'games_history'
  ) then
    alter publication supabase_realtime add table public.games_history;
  end if;
end
$$;

create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requesting_user uuid := auth.uid();
begin
  if requesting_user is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users where id = requesting_user;
end;
$$;

revoke all on function public.delete_user() from public;
grant execute on function public.delete_user() to authenticated;
