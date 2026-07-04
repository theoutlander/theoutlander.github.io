-- Run this if you already created the table with a single PIN.
-- Replace MAYA_PIN and DAD_PIN with mayaPin and dadPin from maya/family-chat.js

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
