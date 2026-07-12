-- CodeBots — our own copy of the funnel.
--
-- Run this ONCE in the Supabase SQL editor (same project as codebots_saves).
--
-- Why this exists alongside Google Analytics: the question that decides this product is
--
--     "Of the kids who opened FIRST STEPS, how many made it past BRACKETS MEAN GO?"
--
-- That's a per-beat drop-off on a nine-step funnel. GA can be coaxed into it; SQL just answers it.
-- And nobody is sitting next to these kids, so this table is the only way we will ever see the moment
-- a child decides coding isn't for her.
--
-- WHAT THIS STORES ABOUT A CHILD: nothing that identifies her. No name, no email, no age, no
-- location. `session` is a random per-tab string we never persist anywhere else and cannot link to a
-- person — it exists solely to tell "one kid stuck eleven times" apart from "eleven kids stuck once",
-- which are opposite problems with opposite fixes. `user_id` appears only if she chose to log in.

create table if not exists codebots_events (
  id         bigserial primary key,
  created_at timestamptz not null default now(),
  session    text not null,
  user_id    uuid,
  name       text not null,
  params     jsonb
);

create index if not exists codebots_events_name_idx on codebots_events (name, created_at desc);
create index if not exists codebots_events_session_idx on codebots_events (session);

alter table codebots_events enable row level security;

-- Anyone (including a logged-out kid) may write an event. Nobody may read them back through the
-- anon key — reading is for us, in the dashboard, with a real key. An analytics table that the
-- public can SELECT is an analytics table that leaks every other kid's progress.
drop policy if exists "anyone can log an event" on codebots_events;
create policy "anyone can log an event"
  on codebots_events for insert
  with check (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- THE QUERIES THAT ACTUALLY ANSWER SOMETHING. Run these in the SQL editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. THE ONE THAT MATTERS: where do beginners fall out of FIRST STEPS?
--    Each row is a beat. Watch for the cliff — that's the screen that's failing.
--
-- select
--   params->>'id'                    as beat,
--   min((params->>'n')::int)         as step_no,
--   count(distinct session) filter (where name = 'cb_first_step')      as reached,
--   count(distinct session) filter (where name = 'cb_first_step_done') as completed
-- from codebots_events
-- where name in ('cb_first_step', 'cb_first_step_done')
-- group by 1
-- order by 2;

-- 2. Did the on-ramp actually work? Of the kids who START, how many reach Level 1 — and clear it?
--
-- select
--   count(distinct session) filter (where name = 'cb_first_step')          as started_first_steps,
--   count(distinct session) filter (where name = 'cb_first_steps_complete') as finished_first_steps,
--   count(distinct session) filter (where name = 'cb_level_clear')          as cleared_a_level
-- from codebots_events;

-- 3. WHICH LEVEL BEATS THEM. A high SHOW-ME rate means the hints failed. A high SOLUTION rate means
--    the level itself is out of reach. Watch these per level, never in aggregate.
--
-- select
--   (params->>'level')::int as level,
--   count(*) filter (where name = 'cb_hint_used')       as hints,
--   count(*) filter (where name = 'cb_show_me')         as show_me,
--   count(*) filter (where name = 'cb_solution_shown')  as gave_up,
--   count(*) filter (where name = 'cb_stuck')           as stuck
-- from codebots_events
-- where params ? 'level'
-- group by 1
-- order by gave_up desc, stuck desc;

-- 4. PROOF OF LEARNING. A drill is passed by writing code that works on fields the kid has never
--    seen — that is TRANSFER, and transfer is the definition of having learned the concept.
--    This is the only table on this page that is evidence rather than symptom.
--
-- select params->>'drill' as drill, count(distinct session) as kids_who_proved_it
-- from codebots_events
-- where name = 'cb_drill_passed'
-- group by 1
-- order by 2 desc;

-- 5. WHAT THE KIDS THEMSELVES SAID IS WRONG. The only signal that carries a REASON.
--
-- select (params->>'level')::int as level, params->>'reason' as reason, count(*)
-- from codebots_events
-- where name = 'cb_problem'
-- group by 1, 2
-- order by 3 desc;
