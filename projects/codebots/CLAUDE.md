# CLAUDE.md — CodeBots

Guidance for Claude Code working in `projects/codebots/`.

---

## The one rule that matters most

> **`docs/` is the source of truth. `../codebots-prototype/` is not.**

`../codebots-prototype/` is the v1 iteration. **It drifted from its own spec** and it is kept only as a read-only reference. Reading it will teach you things that are **not true of this project.**

### This has already caused real damage

At the start of the redesign, an agent was sent to "survey what CodeBots does." It read **the code** instead of **the specs**, and reported that the game has three loadout kits — SCOUT, TANK and LONGSHOT.

Those kits **appear nowhere in any spec.** They were invented during implementation, and they *replaced* a better design that was already written down (one body, five slots, weight as the budget, every part granting a **command**). An hour of design work was then spent solving problems that only existed in the drift.

**Do not repeat this.** When you need to know what CodeBots *is*, read `docs/`. When you need to know what the old code *did*, and only then, read `../codebots-prototype/`.

---

## Where to look

| Question | Read |
|---|---|
| What is this game? | [docs/game.md](docs/game.md) |
| What does it look and sound like? | `docs/design.md` |
| How is it built? | `docs/engine.md` |
| What does it teach? | `docs/curriculum.md` |
| What do we build next? | `docs/plan.md` |
| What are the missions? | [levels/](levels/) |
| Why should anyone care? | [docs/pitch.html](docs/pitch.html) |
| What's the shape of it? | [docs/map.html](docs/map.html) |

**Start at [README.md](README.md).**

---

## The prototype boundary

The v1 code lives in a **separate sibling project**, `projects/codebots-prototype/` — deliberately *outside* this folder, so that no glob, tsconfig include, or test config can sweep it into this project by accident.

It is **read-only**. Never fix a bug there. Never add a feature there. If you are editing two codebases, the rebuild has failed.

**The only legitimate reasons to open it:**

1. **Porting `src/sim/` or `src/sandbox/`** into `app/` — ~1,580 lines that are subtle, correct, and worth keeping. They are **copied in and renamed**, never imported.
2. **Answering a question faster by running it than by arguing about it.**

**When you port, you rename.** Themed nouns do not cross the boundary. `wrecked` → `disabled`. `blaster` → `emitter`. The old sim is full of words like `targetDestroyed` and comments reading *"3-hit kill"* — **in a game whose Law 4 is "nothing dies."** Do not carry them over.

**Never import across the boundary.** `app/` may not import from `codebots-prototype/`. No path aliases, no symlinks, no "just for now." A test enforces this.

---

## The six laws

These are not aspirations. Two of them are enforced by tests.

1. **A bot is a body plus parts.** Parts cost weight and add **commands** — never stats.
2. **Lessons unlock, coins build** — you can never buy what you haven't learned.
3. **Every trap has an exit you can code.**
4. **Nothing dies** — tagged bots reboot. *(Enforced: a test greps the sim for `wreck`, `kill`, `die`, `destroy`, `damage` and fails the build.)*
5. **A number never appears before the kid has felt what it does.**
6. **The engine knows no story.** *(Enforced: the same test. The core layer contains no themed noun, ever.)*

> **Why Law 6 exists:** the war vocabulary didn't leak into the v1 simulator through carelessness. It leaked in because **the simulator owned themed nouns.** Once fiction lives inside the engine, drift is not a mistake — it is inevitable, and find-and-replace only holds until the next commit. Keep the fiction out of the engine and the drift becomes structurally impossible.

---

## The premise, in one line

> **Write the code. Press RUN. Watch it go.**

She watches it run — **live**, in a bright world she can see. Never a report, never a summary, never footage after the fact.

**Any design that puts a layer of remove between her and her own running program is wrong**, however clever it sounds. (An earlier draft of this project proposed exactly that. It was a mistake.)

---

## Correctness

- **TDD.** No implementation code before a failing test.
- **The 24 author solutions in `levels/` are the golden suite.** Each mission already specifies its arena, the author's exact code, the par, and the expected outcome — so each is an integration test that writes itself. **This suite would have caught the v1 drift on day one:** a kit that exists nowhere in the spec cannot pass a spec-derived test.
- **Determinism is load-bearing.** Same program + same seed → byte-identical event log. `Math.random()`, `Date.now()` and `new Date()` appear **nowhere** in core. Replays, ghosts, fair battles and reproducible bugs all depend on this, and a single careless call silently breaks all four.
- **Every bug becomes a test.** Determinism means a bug is perfectly reproducible from `(program, seed)` — so a bug report *is* a failing test case. Nothing regresses twice.

---

## Conventions

- **Files are lowercase kebab-case.** Every folder's index is `README.md` (the one exception — GitHub renders it on open).
- **One mission, one file.** Adding a mission means adding a file, never editing a 400-line document.
- **Nothing lives in two places.** If a fact belongs in `game.md`, it is linked from elsewhere — never restated.
- **`app/` is an isolated pnpm package.** Install and test from that directory. The root vitest config excludes `projects/**`.
