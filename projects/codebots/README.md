# CodeBots

**A game where kids 9–13 learn to really code by programming a little robot.**

She writes real JavaScript, presses **RUN**, and watches her bot come alive and do exactly what she told it — brilliantly, or hilariously wrong. Watching your own machine obey you is the most reliably delightful thing in computing, and almost every "learn to code" product buries it under a curriculum. Here it *is* the game.

The bot grows more capable, the programs grow more powerful, the world pushes back harder — all three rise together.

> **The rule everything else serves:** the code is not the price of the fun. **The code is the fun.**

---

## Start here

| Doc | Answers |
|---|---|
| **[docs/pitch.html](docs/pitch.html)** | *Why should anyone care?* — the sell, in one page |
| **[docs/map.html](docs/map.html)** | *What's the shape of it?* — site map, core loop, learning ladder |
| **[docs/game.md](docs/game.md)** | *What is this game?* — the loop, the bot, parts, elements, scoring |
| **[docs/design.md](docs/design.md)** | *What does it look and sound like?* — palette, type, the two zones, juice, the chirp language, audio sourcing |
| **[docs/engine.md](docs/engine.md)** | *How is it built?* — the three layers, determinism, the stack, the testing strategy |
| **[docs/curriculum.md](docs/curriculum.md)** | *What does it teach, and how does the design force the lesson?* |
| **[docs/plan.md](docs/plan.md)** | *What do we build, and in what order?* |
| **[levels/](levels/)** | *The missions.* One folder per world, one file per mission |

---

## In sixty seconds

**One bot.** Named, painted, and above all *programmed*. Every upgrade is **a new command to master, not a stat to buy** — if a part doesn't add one new word or one new decision, it doesn't ship.

**Eight worlds, six missions each.** One guided → three practices → one remix she builds herself → one boss. Each mission teaches **exactly one idea**, and **par** is what forces her to actually learn it: a solution that ignores the lesson doesn't fit in the line budget. World 2's staircase has a par of 4 lines; the same route written out longhand is 28. The loop isn't suggested — it's the only thing that fits.

**Real JavaScript, shown to the kid as just "code."** No invented language: nothing she learns should ever need unlearning, and we never own a compiler. `forward(3)` is already a real function call.

**Competitive, never violent.** Bots get tagged, dented, towed and rebooted. **Nothing dies.** It's a law, and a test enforces the vocabulary.

**Nothing to moderate.** The only thing a kid ever publishes is a program. No bio, no message, no chat. There is nothing to say, so there is nothing to police.

---

## The six laws

1. **A bot is a body plus parts.** Parts cost weight and add commands.
2. **Lessons unlock, coins build** — you can never buy what you haven't learned.
3. **Every trap has an exit you can code.**
4. **Nothing dies** — tagged bots reboot.
5. **A number never appears before the kid has felt what it does.**
6. **The engine knows no story** — so a new world is a content drop, not a sequel.

---

## Repo layout

```
codebots/
├── README.md      ← you are here
├── docs/          ← the specs (one doc per question)
├── levels/        ← the missions (one file per mission)
├── app/           ← the game
└── prototype/     ← the v1 code. Read-only reference. Not maintained, not refactored.
```

---

## Status

| | |
|---|---|
| **Design** | Settled. See `docs/`. |
| **Missions** | Worlds 1–4 authored and hand-verified on the grid. Worlds 5–8 sketched — **the largest remaining job.** |
| **Code** | Being rebuilt from the first line against these docs. |
| **Design system** | Claude Design project `41e196e7-28e3-43ef-b7d2-74af999644cd` — created, empty. |

Chief creative consultant: **Asha, age 10.**

---

## Conventions

- **Files are lowercase kebab-case.** Every folder's index is `README.md` — the one exception, because GitHub renders it when you open the folder, so navigation is free.
- **One mission, one file.** A mission is a unit of work: one arena, one author solution, one par, one test. Adding a mission means *adding a file*, never editing a 400-line document.
- **Docs are split by the question they answer**, so you never have to guess which one to open.
- **Nothing lives in two places.** If a fact belongs in `game.md`, it is not restated in `engine.md` — it is linked.
