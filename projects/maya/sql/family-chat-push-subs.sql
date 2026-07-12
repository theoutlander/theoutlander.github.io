-- Web-push subscription store. One row per subscribed device.
-- Endpoints are sensitive, so this table is service-role only: the public web
-- keys (anon/authenticated) get no access. Devices register via the
-- family-chat-subscribe Edge Function (service role upsert); chat-notify reads
-- these rows to push "Dad sent you a message" to Maya's iPad.
create table if not exists public.maya_push_subs (
  id         bigint generated always as identity primary key,
  role       text not null check (role in ('maya','dad')),
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.maya_push_subs enable row level security;
alter table public.maya_push_subs force row level security;
revoke all on public.maya_push_subs from anon, authenticated;
