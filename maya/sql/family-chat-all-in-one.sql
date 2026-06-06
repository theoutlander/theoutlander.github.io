-- Maya family chat — paste this ONCE in Supabase SQL Editor (new projects).

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
drop policy if exists "chat_jwt_select" on public.maya_chat_messages;
drop policy if exists "chat_jwt_insert" on public.maya_chat_messages;

create policy "chat_jwt_select"
  on public.maya_chat_messages for select to authenticated
  using (coalesce(auth.jwt() ->> 'chat_role', '') in ('maya', 'dad'));

create policy "chat_jwt_insert"
  on public.maya_chat_messages for insert to authenticated
  with check (
    coalesce(auth.jwt() ->> 'chat_role', '') in ('maya', 'dad')
    and author = (auth.jwt() ->> 'chat_role')
    and char_length(body) > 0 and char_length(body) <= 500
  );

alter publication supabase_realtime add table public.maya_chat_messages;
