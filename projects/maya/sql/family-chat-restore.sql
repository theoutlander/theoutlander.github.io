-- ============================================================================
-- Restore helper for the family chat. Pairs with family-chat-auto-backup.sql.
-- Usage in the Supabase SQL editor or CLI:
--   select public.restore_maya_chat();          -- restore missing rows from the latest snapshot
--   select public.restore_maya_chat(<backup_id>); -- ...from a specific snapshot
-- Idempotent: only re-inserts messages whose id is missing from the live table.
-- ============================================================================

-- Restore any messages that exist in a snapshot but are missing from the live
-- table. Idempotent: never duplicates a message that's still there (matches on id),
-- only re-inserts ones that were deleted. Defaults to the most recent snapshot.
-- Returns how many rows it put back.
create or replace function public.restore_maya_chat(backup_id bigint default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  snap jsonb;
  restored integer;
begin
  select snapshot into snap
  from public.maya_chat_backups
  where (backup_id is null) or (id = backup_id)
  order by taken_at desc
  limit 1;

  if snap is null then
    raise exception 'no backup found%', case when backup_id is null then '' else ' with id '||backup_id end;
  end if;

  with rows as (
    select * from jsonb_to_recordset(snap)
      as x(id uuid, author text, body text, created_at timestamptz)
  )
  insert into public.maya_chat_messages (id, author, body, created_at)
  select r.id, r.author, r.body, r.created_at
  from rows r
  where not exists (select 1 from public.maya_chat_messages m where m.id = r.id);

  get diagnostics restored = row_count;
  return restored;
end;
$$;
