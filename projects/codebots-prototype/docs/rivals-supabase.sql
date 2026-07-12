-- CodeBots — PLAYER VS PLAYER.
--
-- Run this ONCE in the Supabase SQL editor (same project as codebots_saves).
--
-- The whole feature rests on one fact: the battle sim is DETERMINISTIC. The same two programs in the
-- same arena produce a byte-identical event log, every single time (pinned in tests/sim/battle.test.ts).
-- So we never need live networking, matchmaking, or a game server. We store one thing — the kid's
-- PROGRAM TEXT — and anyone can replay the fight later and get exactly the same result.
--
-- That's what makes this the right retention hook: her bot keeps fighting while she's asleep, and she
-- comes back to "Maya's bot beat yours — watch the replay." Losing hands her code she can learn from.
--
-- KID SAFETY, and this is not negotiable:
--   * The ONLY thing published is a program. There is no description field, no bio, no message, no
--     chat — nowhere for a child to type free text that another child will read. We are not building
--     an unmoderated channel between kids, and the way you don't build one is by not having a column
--     for it.
--   * bot_name is chosen by the kid and shown to others, so it IS user-authored text. Keep it short,
--     and treat it as the one surface that would ever need moderation.
--   * We display the username she already chose. No real names, no emails, no ages, no locations.

create table if not exists codebots_bots (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  username   text not null,
  bot_name   text not null,
  source     text not null,
  wins       int  not null default 0,
  losses     int  not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists codebots_bots_wins_idx on codebots_bots (wins desc);

alter table codebots_bots enable row level security;

-- Anyone may READ published bots — that's the point; you need opponents to fight.
drop policy if exists "published bots are public" on codebots_bots;
create policy "published bots are public"
  on codebots_bots for select
  using (true);

-- ...but you may only publish or change YOUR OWN bot. Without this, one kid could overwrite another
-- kid's bot, or quietly award herself a thousand wins.
drop policy if exists "publish only your own bot" on codebots_bots;
create policy "publish only your own bot"
  on codebots_bots for insert
  with check (auth.uid() = user_id);

drop policy if exists "update only your own bot" on codebots_bots;
create policy "update only your own bot"
  on codebots_bots for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- The win/loss tallies are the one thing a player must be able to change on SOMEONE ELSE'S row: when
-- your bot beats Maya's, Maya isn't online to record her own loss. A blanket UPDATE policy would let
-- anyone rewrite anyone's bot, so instead we expose exactly one operation, and it can only ever
-- increment a counter by one.
create or replace function codebots_record_result(target uuid, won boolean)
returns void
language sql
security definer
set search_path = public
as $$
  update codebots_bots
     set wins   = wins   + (case when won then 1 else 0 end),
         losses = losses + (case when won then 0 else 1 end)
   where user_id = target;
$$;

grant execute on function codebots_record_result(uuid, boolean) to anon, authenticated;
