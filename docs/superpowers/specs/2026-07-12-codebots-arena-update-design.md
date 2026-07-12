# CodeBots Arena Update — design

Milestone 1 from the Arena redesign handoff (design refs: `CodeBots Redesign — Round 1.dc.html`,
screens 1d/2a/1e). Scope: split the Battle screen into Hub → Fight → Debrief, replace the raw-wins
leaderboard with the league-table ladder, and close the lose→learn loop. No changes to the campaign
sim engine (`src/sim/`) — everything here reuses the existing deterministic battle code.

## Why

Today `BattleScreen.tsx` is one screen doing five jobs at once (opponent picker, publishing, command
reference, editor, arena) and a loss just shows a toast — there's no path from losing a fight to
learning the thing that would have won it. The ladder is also ordered by a raw win counter that one
bot's matchup luck (which boards, which seat) can skew, when the engine already has an honest,
derivable standings function (`league.ts`) sitting unused for ranking.

## Data layer additions

### `src/rivals/constructs.ts` (new)

A regex pass over a bot's source (capped at the existing 4000-char `MAX_SOURCE`) that detects:
`while`, `for`, `if`, `else`, `function`, and the battle sensors `enemyAhead`, `enemyNear`,
`closerAhead`, `enemyLeft`, `enemyRight`, `hurt`. Returns the set of constructs present. This runs
against the **opponent's** published source after a fight, to build the Debrief chip row.

### Known-construct lookup

A helper that, given a `SaveData`, determines which constructs the player has been taught. Each
construct maps to the `commandDocs.ts` entry that introduces it (e.g. `while` → `{world: 3, since: 1}`,
which is mission `w3m1`). "Known" = the mission that introduces it is cleared. Reuses
`commandDocs.ts` and `save.missions`; no new content authoring.

If the opponent used a construct the player hasn't learned, the Debrief CTA deep-links to the first
uncleared mission that teaches it. If the player already knows every construct the opponent used, the
CTA is replaced by a "what almost beat you" callout instead (see Debrief section).

### `src/rivals/leagueCache.ts` (new)

Wraps `league.ts#standings()` with a localStorage cache:

- **Cache key:** `(season token, sorted list of "botId:sourceHash")`. Season token is an ISO week
  string (e.g. `2026-W29`); source hash is a cheap non-crypto hash (same style as `matchSeed`'s FNV
  loop) so an edited-and-republished bot invalidates correctly.
- **Cache value:** the computed `Standing[]`, plus the *previous* cached `Standing[]` (kept one level
  deep) so the Hub can diff current vs. previous for trend arrows and the away-record delta.
- Recomputes only on a cache miss (new/changed roster, or Friday's season rollover). This bounds the
  pairwise `standings()` cost (O(n²) matchups × `BOARDS_PER_MATCH`) to "once per roster change" instead
  of "every time the Hub mounts."

### Season rotation

`matchSeed(a, b)` itself is untouched (existing tests call it directly and assert its
order-independence). Instead, `playMatch`/`standings` gain an optional `seasonSalt` parameter
(default `0`, so existing 2-arg calls are byte-identical to today) that's added at the `board()` call
site: `board(matchSeed(a, b) + seasonSalt + i * BOARDS_PER_MATCH_OFFSET)`. `leagueCache` computes the
salt from the ISO week token and passes it through. Boards rotate Fridays, standings recompute
automatically because the cache key changes, and there is no separate "reset" code path.

## Screens

### ARENA HUB (`src/ui/ArenaHub.tsx`, new)

Replaces the opponent-picker portion of today's `BattleScreen`. Contents:

- **Featured match:** auto-plays on entry with no interaction — the current top-2 seeds from
  `leagueCache`, board 1 of their matchup, replayed via the same scene/event-log playback
  `mountBattle`/`BattleScene` already provide.
- **Ladder:** `leagueCache` standings, rendered as points + W-L-D + a trend arrow (vs. the cached
  previous snapshot). Every row has a WATCH button that replays board 1 of that pairing. The fighter
  pool is `publish.ts#leaderboard()` (not `fetchOpponents()` — that excludes the caller's own bot,
  which would mean a kid never appears on her own ladder) with a generously high limit so the pool
  reads as "every published bot," not an order-dependent slice that could differ between two kids'
  browsers.
- **Your-bot panel:** publish state, away-record delta (this bot's points/W-L-D now vs. the last
  cached snapshot the player saw), REPUBLISH and TEST FIGHT actions.
- **"How the ladder works"** — 3 kid-worded lines (fixed copy, not derived).
- **Fresh-results ticker** — most recent matchups pulled from the standings computation, each a watch
  link.
- Presets remain listed here too, for a kid with no rivals yet.
- Safety line in the header: "BOTS FIGHT · KIDS NEVER CHAT."

### FIGHT (`src/ui/FightScreen.tsx`, new)

Editor + arena + HP bars + status line + STOP. That's the whole screen — no opponent panel, no
publish panel, no leaderboard. Header names the opponent and shows "BOARD N OF 4." Command docs
(today's always-visible `CommandList`/`ArenaKey`/battle-sensor panel) collapse into a single
MOVES / SENSORS / BATTLE drawer above the editor, closed by default. On fight end, routes to Debrief
instead of showing the inline result overlay.

### DEBRIEF (`src/ui/Debrief.tsx`, new)

Shown after every fight, win or lose:

- **Construct chips:** the opponent's source run through `constructs.ts`; each chip solid green if the
  player knows it, dashed red if not.
- **CTA:** if any chip is dashed red, one amber "LEARN `<construct>` — WORLD `<n>`" button deep-linking
  to that mission. If every chip is green, show "what almost beat you" instead — the closest key
  moment (see below), no CTA.
- **Replay scrubber:** derived from the existing `BattleEvent` log (`src/sim/battle.ts` — battles use
  this, not the campaign's `SimEvent`/`tick` log). Amber diamonds at wasted shots (`shoot` events
  where `hit === null`) and the first `hit` event against the player (`hit.target === playerIndex`);
  a red diamond at `wreck`. (The handoff's fourth moment type, "charge exhausted," has no matching game
  mechanic — there's no charge/cooldown/energy system anywhere in the sim — so it's dropped rather than
  faked.)
- **Stats row:** rounds survived, hits landed/attempted, wasted shots, damage dealt — all computed by
  reducing the event log, no new tracking needed.
- **Construct chips beyond the campaign-taught five** (`while`/`for`/`if`/`else`/`function`): the six
  battle-only sensors (`enemyAhead`, `enemyNear`, `closerAhead`, `enemyLeft`, `enemyRight`, `hurt`)
  aren't gated behind any campaign mission — they're introduced directly in the Fight drawer, available
  from the first fight. So they can never be "unlearned" in the badge/mission sense. Sensor chips are
  shown in a neutral style (not green/not dashed-red) reading "the opponent used this" rather than
  implying mastery; only the five campaign-taught control constructs participate in the
  known/unlearned + CTA logic.
- Copy tone: "WRECKED — BUT LOOK WHY" on a loss. **Losses never cost points or coins** — this screen
  only ever adds information, never takes anything away.

### `App.tsx` routing

`Screen` union: `"battle"` is replaced by `"arenaHub" | "fight" | "debrief"`. `toBattle` becomes
`toArenaHub`. The Hub is the only entry point that picks an opponent; Fight and Debrief carry the
chosen opponent/result forward via screen params (mirrors how `{ name: "mission", index }` already
works).

## Non-negotiables (carried from the handoff / north star)

- Async + deterministic only. No live networking, no chat fields anywhere.
- Debrief CTAs point at learning (a world/mission), never at buying (Garage/coins).
- `src/sim/` and its existing tests are untouched.

## Testing

- `constructs.ts`: unit tests — given a source string, correct construct set. A plain keyword/identifier
  regex is sufficient here (source is trusted kid code, same assumption `commandDocs.ts` and the
  existing linter already make — not adversarial input, so no need to guard against `while` appearing
  inside a string or comment).
- Known-construct lookup: given a `SaveData`, correct known set and correct "first uncleared mission
  teaching X" resolution.
- `leagueCache`: cache hit on unchanged roster+season, cache miss (recompute) on roster change and on
  season-token change; mirror-match-draws property continues to hold through the cache (delegates to
  the already-tested `standings()`).
- Debrief stats/moments: given a fixed `SimEvent[]` fixture, correct wasted-shot count, correct
  first-hit index, correct wreck flag.
- Existing `src/sim/` test suite (145+ tests) — untouched, must still pass.

## Out of scope (later milestones per the handoff, not this spec)

HQ simplification (1c), Map → road (1f). Both are separate, independent pieces the handoff already
calls out as later items.
