-- CodeBots — cloud save table (reuses the family's existing Supabase project).
-- Namespaced `codebots_` so it won't touch Maya's chat tables.
-- Paste into the Supabase SQL editor (Dashboard → SQL Editor → New query → Run).

-- The game save blob, one row per account. Username + optional recovery email live in the auth
-- user's metadata, so no separate profiles table is needed.
create table if not exists public.codebots_saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table public.codebots_saves enable row level security;

-- Each user can only read/write THEIR OWN save row.
drop policy if exists "codebots_saves self read" on public.codebots_saves;
create policy "codebots_saves self read" on public.codebots_saves
  for select using (auth.uid() = user_id);

drop policy if exists "codebots_saves self insert" on public.codebots_saves;
create policy "codebots_saves self insert" on public.codebots_saves
  for insert with check (auth.uid() = user_id);

drop policy if exists "codebots_saves self update" on public.codebots_saves;
create policy "codebots_saves self update" on public.codebots_saves
  for update using (auth.uid() = user_id);
