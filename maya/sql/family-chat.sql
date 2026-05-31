-- Maya's Game Lab — family chat (run in Supabase SQL Editor)
-- 1. Replace MAYA_PIN and DAD_PIN with mayaPin and dadPin in maya/family-chat.js
-- 2. Enable Realtime for this table: Database → Replication → supabase_realtime → maya_chat_messages

create table if not exists public.maya_chat_messages (
  id uuid primary key default gen_random_uuid(),
  author text not null check (author in ('maya', 'dad')),
  body text not null check (char_length(body) > 0 and char_length(body) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists maya_chat_messages_created_at_idx
  on public.maya_chat_messages (created_at asc);

alter table public.maya_chat_messages enable row level security;

drop policy if exists "family_pin_select" on public.maya_chat_messages;
drop policy if exists "family_pin_insert" on public.maya_chat_messages;

create policy "family_pin_select"
  on public.maya_chat_messages
  for select
  to anon
  using (
    coalesce(
      (current_setting('request.headers', true)::json ->> 'x-family-pin'),
      ''
    ) in ('MAYA_PIN', 'DAD_PIN')
  );

create policy "family_pin_insert"
  on public.maya_chat_messages
  for insert
  to anon
  with check (
    coalesce(
      (current_setting('request.headers', true)::json ->> 'x-family-pin'),
      ''
    ) in ('MAYA_PIN', 'DAD_PIN')
    and author in ('maya', 'dad')
    and char_length(body) > 0
    and char_length(body) <= 500
  );

-- Realtime (if not already on publication)
alter publication supabase_realtime add table public.maya_chat_messages;
