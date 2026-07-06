# CodeBots — World 1 Playable, Design Spec

July 6, 2026 · Companion to `PRODUCT_SPEC.md`, `CONTENT_SPEC.md`, and the CodeBots design
system (`projects/codebots/readme.md`, `tokens/`, `components/`). Builds on the merged sim-core
slice (`docs/superpowers/plans/2026-07-06-codebots-technical-plan.md`).

## Goal

World 1 playable end-to-end: BOOT → World 1 campaign map → Mission (BRIEF → CODE → RUN →
RESULT) → back to map, through all six W1 missions, with stars, coins, the AIR HORN unlock, and
the Captain Sprocket boss. Built on the existing deterministic sim core, with a Phaser 4 arena
view, a CodeMirror 6 editor, Web-Worker-sandboxed kid code, and Howler.js + jsfxr sound.

## Decisions locked in this brainstorm

- **Phaser 4.2.0** (npm `latest`), not Phaser 3. The spec text says "Phaser 3"; that's dated.
- **Event log is the sole execution path AND the sole test surface.** Kid code runs once, in the
  Worker, producing a deterministic event log. Phaser, sound, and the editor are dumb consumers
  of that log — they execute no game logic. Golden tests assert the event log + final state,
  never pixels. This is the contract that keeps the visual layer untestable-by-design and
  irrelevant to correctness, and it's what makes ghosts/replays free later.
- **DOM chrome reuses the actual design-system components** (Button, Chip, Panel, Meter,
  StatusChip, Coin, Stars) ported from `projects/codebots/components/`. Phaser owns **only** the
  arena canvas.
- **No kid-facing maze-building.** The remix/BUILD-A-MAZE beat is deferred to v2. All levels are
  author-made static JSON (deterministic, handcrafted — CONTENT_SPEC §9 rule 7). Because missions
  are data, a level generator could emit the same JSON later with no engine change; we hand-author
  now. World 1 M5 becomes a new authored "combine-it-all" practice mission (see below).
- **World 1 = 6 authored missions:** M1 guided · M2–M4 practices · **M5 new authored practice**
  (combine `back()` + honk-gates + mud as the on-ramp to the boss) · M6 Sprocket boss.
- **No tick-phase playback clock.** W1 has zero moving hazards (M6 is a *static* tank + pit +
  gate + mud). Playback is a straight event replay. The windmill-style timing clock is a W2M6
  need and is built then. (Same "don't build ahead of the world" discipline as the speed model.)
- **Screens this pass:** BOOT → W1 CAMPAIGN MAP → MISSION → RESULT. HQ hub / Garage / Bot Maker
  are build-step 5, deferred.
- **bot.json is the import/export format; localStorage is the live store** (PRODUCT_SPEC §11 —
  a deployed static site can't have the kid edit the served file and reload). We read a bundled
  default `bot.json` for paint now; the Bot Maker editor comes later.

## Design-system reconciliation (needs design-project sign-off at review)

The design system states: *"the bot IS the mascot… drawn in divs… never redraw it differently;
use the `BotAvatar` component,"* and it renders the arena as a DOM grid. **Rendering the arena +
bot in Phaser diverges from that written instruction.** The user chose Phaser knowingly. Per
HANDOFF ("UI drift is a bug; flag rather than invent"), this is a named reconciliation:
**reproduce `BotAvatar`'s exact construction** — treads, hull, dome, barrel, eyes, antenna,
design tokens, 2px borders — in Phaser graphics so it is visually identical to the DOM component.
The design owner may veto this at spec review.

## Architecture

```
projects/codebots/app/
  index.html                 # SPA entry (NEW)
  src/
    main.tsx                 # React mount (NEW)
    App.tsx                  # screen state machine: boot | map | mission (NEW)
    sim/                     # existing sim core — extended with an event log (see below)
      events.ts              # SimEvent union + type guards (NEW)
      engine.ts              # createSim now also records SimEvent[] alongside the trace
    sandbox/
      driver.ts              # existing runInSandbox — now returns { log, result }
      sandbox.worker.ts      # Web Worker entry: {code, mission} in, {log, result|error} out (NEW)
      sandboxClient.ts       # main-thread Promise wrapper around the Worker (NEW)
    view/                    # Phaser — dumb consumer of the event log (NEW)
      ArenaScene.ts          # grid + furniture + bot; plays back a SimEvent[] with tweens
      botGraphics.ts         # BotAvatar reproduced in Phaser graphics (design-system flag)
      furniture.ts           # crate/steel/pit/mud/gate/beacon/coin draw helpers
    editor/                  # CodeMirror 6 (NEW)
      Editor.tsx             # CM6 React wrapper, repeat-sugar highlight
      lint.ts                # parse errors -> kid-worded, line-pointed messages
    sound/                   # Howler + jsfxr (NEW)
      sfx.ts                 # jsfxr-generated buffers; play(eventType)
    ui/                      # React chrome, design-system components (NEW)
      MissionScreen.tsx      # 3-column BRIEF/CODE/RUN/RESULT layout (matches ui_kits mockup)
      CampaignMap.tsx        # W1 map: 6 dots, stars, coins, unlock tease
      BootScreen.tsx
      Hud.tsx                # SCORE/ARMOR/SPEED/CHARGE meters (debut per Law 5 schedule)
      ResultOverlay.tsx      # stars earned, coins, cutscene text
      components/            # ported design-system: Button, Chip, Panel, Meter, Coin, Stars...
    state/
      save.ts                # localStorage: cleared, stars, coins, unlocked, bot paint (NEW)
    styles/                  # ported design-system tokens (NEW)
      tokens.css             # colors/typography/spacing/effects from projects/codebots/tokens
  content/
    missions/world1/m1..m6.json
    bot.default.json         # bundled default paint (copy of projects/codebots/bot.json)
```

### Sim event log

`createSim` gains an event recorder. Each `execute(cmd)` appends zero or more `SimEvent`s:

```ts
type SimEvent =
  | { tick: number; type: "move";     from: Vec2; to: Vec2; facing: Facing }
  | { tick: number; type: "turn";     facing: Facing }
  | { tick: number; type: "bump";     at: Vec2 }            // wall/crate; -15/-8 already applied
  | { tick: number; type: "honk";     at: Vec2 }
  | { tick: number; type: "gateOpen"; pad: Vec2; gateCells: Vec2[] }
  | { tick: number; type: "coin";     at: Vec2 }
  | { tick: number; type: "score";    delta: number; total: number; at: Vec2 }
  | { tick: number; type: "clear";    at: Vec2 }
  | { tick: number; type: "error";    line: number; message: string };
```

The log is authored to be extensible (a future `hazard` event for W2M6) without reshaping W1.

### Execution flow (RUN)

1. Editor text → `sandboxClient.run(code, mission)` → posts to `sandbox.worker.ts`.
2. Worker desugars `repeat`, transforms to a generator, steps it against `createSim`, and returns
   `{ log: SimEvent[], result: SimResult }` (or `{ error: {line, message} }` for a parse error).
3. `ArenaScene` plays the log back: one event → one tween/animation step, firing `sfx.play(type)`
   per event; HUD meters update from `score` events; the tank-radio log prints friendly lines.
4. On the terminal `clear` event → `ResultOverlay` (stars from `result.stars`, coins, cutscene).

Errors never cost points: a `parse error` shows a kid-worded message pinned to the line and no
run happens; a runtime step-budget overflow shows the existing "ran for a very long time" toast.

## Testing

- **Golden tests (headless, existing harness):** every W1 author solution replays through the
  Worker-less driver path, asserting `result.cleared`, `result.stars`, final position, and now
  the **event log** (e.g. M1 emits the expected `move/turn/honk/clear` sequence). Pixels are never
  asserted. One golden test per mission (M1–M6).
- **Sandbox client test:** the Worker protocol is exercised with a stubbed worker (message in →
  log out) so the client's Promise wrapper is covered without a browser.
- **Lint test:** malformed kid code (`forwrd(2)`, unbalanced brace) → the expected kid-worded,
  line-numbered message.
- **Phaser / DOM chrome:** not unit-tested (dumb consumers, per the contract). Verified by running
  the dev server and inspecting the rendered Mission screen.

## Integration

- Sub-app is now a real SPA: `index.html` + `main.tsx`; `vite build` produces a real `dist`
  (Phaser ≈1 MB — acceptable).
- Root build must build the sub-app **before** `ssr-renderer` copies `projects/codebots/app/dist`
  → `dist/codebots`. Wire the ordering in the root build step (not `deploy.sh` — CI on push).
- Dev: the sub-app's own `vite dev` (HMR) on its own port is the game-dev loop; the parent's
  static plugin serves the built `dist` at `/codebots` for integration checks. Surfacing a link
  from the `/lab` index is a one-line addition once it's live.

## Implementation decomposition (three sequential plans)

- **Plan A — M1 vertical slice (this deliverable):** everything above, wired end-to-end, but only
  Mission 1 content and a minimal 1-dot campaign entry. Proves Phaser + CM + sound + Worker + save
  integration on one mission. Ends with a runnable local dev URL.
- **Plan B — content fan-out:** author M2–M4 + new M5; full 6-dot W1 campaign map + progression,
  stars, coins; golden test per mission.
- **Plan C — boss & polish:** M6 Sprocket boss, AIR HORN unlock, cutscenes, BOOT screen, root
  build-order wiring, `/lab` link.

## Out of scope (named)

Kid maze-building (v2) · HQ / Garage / Bot Maker (step 5) · events/sensors and the rest of the
`CommandName` union beyond W1's forward/back/left/right/honk (Worlds 3–4) · tick-phase playback
clock (W2M6) · ghosts/time-trials (W2) · multiplayer (v1.5+).
