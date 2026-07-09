-- CodeBots — accounts + cloud save schema.
-- Paste this whole file into the Supabase SQL editor (Dashboard → SQL Editor → New query → Run).

-- One row per account.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  recovery_email text,
  created_at timestamptz default now()
);

-- The game save blob, one row per user.
create table if not exists public.saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.saves enable row level security;

-- Everyone can only read/write THEIR OWN rows.
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles self write" on public.profiles;
create policy "profiles self write" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

drop policy if exists "saves self read" on public.saves;
create policy "saves self read" on public.saves for select using (auth.uid() = user_id);
drop policy if exists "saves self insert" on public.saves;
create policy "saves self insert" on public.saves for insert with check (auth.uid() = user_id);
drop policy if exists "saves self update" on public.saves;
create policy "saves self update" on public.saves for update using (auth.uid() = user_id);
