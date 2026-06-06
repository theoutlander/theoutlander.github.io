-- Run after deploying the family-chat-auth Edge Function.
-- Passwords live only in Supabase secrets (MAYA_CHAT_PIN, DAD_CHAT_PIN), not in the website.

alter table public.maya_chat_messages enable row level security;

drop policy if exists "family_pin_select" on public.maya_chat_messages;
drop policy if exists "family_pin_insert" on public.maya_chat_messages;
drop policy if exists "chat_jwt_select" on public.maya_chat_messages;
drop policy if exists "chat_jwt_insert" on public.maya_chat_messages;

create policy "chat_jwt_select"
  on public.maya_chat_messages
  for select
  to authenticated
  using (
    coalesce(auth.jwt() ->> 'chat_role', '') in ('maya', 'dad')
  );

create policy "chat_jwt_insert"
  on public.maya_chat_messages
  for insert
  to authenticated
  with check (
    coalesce(auth.jwt() ->> 'chat_role', '') in ('maya', 'dad')
    and author = (auth.jwt() ->> 'chat_role')
    and char_length(body) > 0
    and char_length(body) <= 500
  );
