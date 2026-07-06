# CODEBOTS — Claude Code Handoff
July 6, 2026 · From the design project ("Battle bots programming game")

## Read these, in order
1. `PRODUCT_SPEC.md` — what the game is: five laws, language strategy, worlds, physics, HUD, elements, arenas/ghosts, screens/sound, engine choices, roadmap.
2. `CONTENT_SPEC.md` — the buildable content: complete v1 API surface, parts/economy tables, world-physics constants, Worlds 1–4 fully specified (grid-verified author solutions), Worlds 5–8 sketched. **§10 lists your OPEN TODOs (#2, #8, #9).**
3. `readme.md` + `SKILL.md` + `tokens/` + `guidelines/` + `components/` + `ui_kits/codebots/` — the design system. Source of truth for ALL UI: blueprint navy, 2px borders, Space Grotesk + IBM Plex Mono, amber-acts/cyan-informs/green-succeeds, geometric div iconography, kid-worded errors, no emoji. `SKILL.md` is written to be used as an agent skill.
4. `bot.json` — the kid-editable identity file (names, paint, paintbox). The game must read it; editing it by hand is a feature, not a bug.

## Architecture (non-negotiable, from PRODUCT_SPEC §11)
- **Pure sim core, renderer-free**: deterministic, fixed ticks, seeded; same code + same build = same result, always. All rules live here.
- **Phaser 3 is only the view** on top of the sim. This buys ghosts, replays, fair battles, and a later 2.5D skin.
- **CodeMirror 6** editor; kid-worded lint/errors that point at the line; errors never cost points.
- **Web Worker sandbox** for kid code, per-tick step budget.
- **Data-driven everything**: parts are cards `{name, slot, weight, grants, teaches, tradeoff}`; arenas and missions are JSON matching CONTENT_SPEC's mission format; new content must never require engine changes.
- Sound: Howler.js + jsfxr per the sound table (readme + PRODUCT_SPEC §10). Saves: localStorage + file export.
- Language: real JavaScript only; `repeat n { }` sugar in W1–2 (ceremony upgrades it to `for` at the W2 boss); `when <event> { }` blocks from W4.

## Build order (v1 vertical slice first)
1. Technical plan: propose repo structure, sim-core API, mission JSON schema, test strategy. Include a **trace mode** (logs tick,x,y,hazard-state) — needed for CONTENT_SPEC §10 #2.
2. Sim core + arena furniture (walls/crates/pits/mud/gates/coins/chests/bushes/night) + the W1 command set, with unit tests replaying CONTENT_SPEC's author solutions as golden tests (every W1–W4 solution must clear its mission).
3. Mission shell UI (BRIEF → CODE → RUN → RESULT) per design system + `ui_kits/codebots/index.html`; HUD meters (SCORE/ARMOR/SPEED/CHARGE debut per Law 5 schedule); sound.
4. World 1 playable end-to-end (M1–M6, stars, coins, AIR HORN unlock, Sprocket boss).
5. Boot/HQ/Campaign map/Garage/Bot Maker screens; bot.json read/write.
6. Worlds 2–4; remix-mission validator (§10 #8); time trials + ghosts (input-log replay).

## Rules of engagement
- Product/design decisions stay in the design project; if a spec conflict or gap blocks you, flag it back rather than inventing product behavior. UI drift from the design system is a bug.
- CONTENT_SPEC §10 #2/#8/#9 are yours. Playtest results (especially windmill timing and mission pars) go back as spec change requests.
- The player is a 10-year-old named Asha. When in doubt: kinder errors, louder feedback, fewer numbers.
