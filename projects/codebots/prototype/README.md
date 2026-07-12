# Prototype — the v1 iteration

> **This is a read-only reference. It is not maintained, not refactored, and not the product.**
> The game is being rebuilt from the first line in `../app/` against the docs in `../docs/`.

Do not fix bugs here. Do not add features here. If you find yourself editing two codebases, the rebuild has failed.

---

## What this is

The first attempt at CodeBots — a working prototype that proved the hard parts and then drifted away from its own spec. It runs. You can play it. It is genuinely useful as a reference, and worth keeping for exactly two reasons:

1. **`src/sim/` and `src/sandbox/` (~1,580 lines) are the good parts.** The deterministic simulator and the worker sandbox with a per-tick step budget are subtle, fiddly, and correct. They get **ported by copy** into the new app, renaming themed nouns as they cross the boundary.
2. **It's a live thing to try ideas against** when a design question is faster to answer by playing than by arguing.

---

## Why we restarted rather than refactored

**10,684 lines, and roughly 60% of it was being rewritten or shelved regardless:**

| Area | LOC | Fate |
|---|---|---|
| `src/ui` | 4,075 | Rewritten anyway — the whole visual system changed |
| `src/content` | 1,619 | Rewritten anyway — this *is* the theme layer |
| `src/sim` | 994 | **Ported**, renaming themed nouns |
| `src/view` | 984 | Ported mostly (the Phaser mount) |
| `src/rivals` | 836 | **Shelved.** A v1.5 feature built early, which had been quietly distorting the project's centre of gravity |
| `src/state` | 716 | Ported mostly |
| `src/sandbox` | 586 | **Ported.** Genuinely fiddly, genuinely works |

The part actually worth preserving is small, and it comes across by copy — not by refactor.

---

## The drift, and what it taught us

The code wandered from its own spec, and it's worth naming how, because the new architecture exists specifically to prevent it:

- **Three kits (SCOUT / TANK / LONGSHOT)** — stat sliders that appear **nowhere in the spec**. The spec says *one body, five slots, weight as the budget*, and every part grants a **command**. The kits were a strictly worse design that nobody chose.
- **War vocabulary throughout the simulator** — `wrecked`, `targetDestroyed`, and comments reading *"3-hit kill"* and *"kill each other on the same tick"* — in a game whose own **Law 4 is "nothing dies."**
- **The mascot is a tank**, with a barrel, because a rule said icons must be built from `div`s, and a character made of rectangles can only be a tank.
- **Zero sound**, in a game whose spec says *"every command has a sound — she should be able to close her eyes and hear her program run."*
- **The League, seasons, standings and publishing were fully built** — all of them v1.5 features — while **Worlds 5–8 of the actual campaign were never written.**

> **The lesson, and the reason for Law 6 ("the engine knows no story"):** the war words didn't leak in through carelessness. They leaked in because **the simulator owned themed nouns.** Once fiction lives inside the engine, drift isn't a mistake — it's inevitable, and find-and-replace only holds until the next commit.
>
> The rebuild fixes this structurally: the sim contains no themed noun, and **a test greps for them and fails the build.** The architecture defends itself.

---

## Also in here

- **`design-system/`** — the original *blueprint room* design system: tokens, components (Button, Chip, Panel, Meter, StatusChip, BotAvatar, PartCard), guidelines, UI kits, and the Claude Design `.dc.html` exports. Retired: its one-line brief was *"playful-military — cadet, mission"*, which was in direct conflict with the game it was designed for. Kept because the component inventory and the token structure are still instructive.
- **`design-system/skill.md`** — a Claude Code skill wired to that retired design system. Do not invoke it for new work; it will confidently produce the old look.
- **`handoff.md`** — the original handoff notes.

---

## Running it, if you need to

```bash
cd prototype
pnpm install
pnpm dev
```

It's an isolated pnpm package. The root vitest config excludes `projects/**`, so it doesn't participate in the site's test run.
