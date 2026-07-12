-- ============================================================================
-- Automated daily backups of the family chat.
-- Protects against accidental deletion/corruption of maya_chat_messages:
-- a full snapshot is taken every day and kept for 30 days, so any message that
-- existed yesterday can be restored even if it's deleted from the live table.
-- ============================================================================

create extension if not exists pg_cron;

-- Snapshot store. Each row is one day's complete copy of the chat as JSONB.
create table if not exists public.maya_chat_backups (
  id            bigint generated always as identity primary key,
  taken_at      timestamptz not null default now(),
  message_count integer     not null,
  snapshot      jsonb       not null
);

-- Lock it down: only the admin/service role touches backups. anon/authenticated
-- (the public web keys) get nothing — they can't read, write, or delete backups.
alter table public.maya_chat_backups enable row level security;
alter table public.maya_chat_backups force row level security;
revoke all on public.maya_chat_backups from anon, authenticated;

-- Take one snapshot, then prune to the most recent 30.
create or replace function public.snapshot_maya_chat()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.maya_chat_backups (message_count, snapshot)
  select
    (select count(*) from public.maya_chat_messages),
    coalesce(
      (select jsonb_agg(to_jsonb(m) order by m.created_at) from public.maya_chat_messages m),
      '[]'::jsonb
    );

  delete from public.maya_chat_backups
  where id not in (
    select id from public.maya_chat_backups order by taken_at desc limit 30
  );
end;
$$;

-- Schedule: every day at 09:00 UTC. Unschedule any prior job of the same name first.
select cron.unschedule('maya-chat-daily-backup')
  where exists (select 1 from cron.job where jobname = 'maya-chat-daily-backup');

select cron.schedule('maya-chat-daily-backup', '0 9 * * *', $$select public.snapshot_maya_chat()$$);
