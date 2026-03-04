# Supabase Migrations

## Applied migration

- `supabase/migrations/20260305230000_games_history_and_delete_user.sql`

This migration creates:

- `public.games_history` table
- index on `(user_id, created_at desc)`
- RLS policies for authenticated users (select/insert/delete own rows)
- realtime publication membership for `games_history`
- `public.delete_user()` RPC for account deletion

## Rollout

Apply migration through Supabase (MCP/CLI) to the target project.

After rollout, verify:

1. `games_history` exists and RLS is enabled.
2. Policies allow only own-row access.
3. `public.delete_user()` is executable by `authenticated`.
4. Realtime subscription receives events for `games_history`.

## Rollback

Run the following SQL only if a rollback is required:

```sql
drop function if exists public.delete_user();

do $$
begin
  if exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'games_history'
  ) then
    alter publication supabase_realtime drop table public.games_history;
  end if;
end
$$;

drop table if exists public.games_history;
```
