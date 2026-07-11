# CodeBots — North Star (how the whole thing works, e2e)

**Date:** 2026-07-11
**Status:** Agreed direction. The reference we stop re-deciding from.

## What this is

A **learn-to-code platform for kids** (~9–13), where they write real JavaScript to program a
robot — and, once they've learned, **compete** with their bots against other kids. Not a game for
one child; a system for many. But the whole thing lives or dies on one thing: **does it actually
teach?** So we prove the LEARN core before layering the rest.

## The one loop everything serves

> **Learn a concept → clear levels with it → earn coins + unlock abilities → build a loadout in the
> Garage → take your bot + your code into the Arena → lose to someone smarter → go learn the thing
> that beats them.**

Every room feeds the next and pulls the player back to *learning*, because you climb the ladder by
**getting better at code, not by grinding.**

## The make-or-break principle

**Code skill beats parts. Always.** The moment a bought/maxed bot auto-wins, it stops being a coding
game. So progress splits into two ladders that never collapse into pay-to-win:

- **Capabilities — what your bot can DO (`shoot()`, `while`, `function`, sensors) — are earned ONLY
  by learning.** You cannot buy an ability. Learning is the single road to power.
- **Coins (earned by playing) buy Garage gear** — a better **chassis** (base model = more part
  slots) and **parts** (armor, speed, range, firepower) that **trade off** against each other
  (weight is destiny). The loadout is a *puzzle*, not a paywall. Some parts are cosmetic
  (self-expression). None make a worse programmer win.

## Tracks (top-level structure) + cross-cutting rooms

Three tracks, one identity:

1. **LEARN** — the campaign. Concepts one at a time. All learned commands available (pure learning,
   no loadout limits). **This unlocks capabilities.** *(Built: 24 levels. Priority: prove it teaches.)*
2. **PLAY** — Open Field + daily challenges. Free practice; **earns coins**; sharpens skill. *(Built.)*
3. **COMPETE** — the Arena. Publish your bot; **async deterministic replays** against other kids'
   saved bots; leaderboards + weekly seasons. *(Phase-1 vs presets built; PvP is next-after-Garage.)*

Cross-cutting, reachable anywhere: **Garage** (build/loadout), **Profile** (progress, badges, rank),
**Account** (identity, cloud save).

Future tracks — **only once LEARN is proven**: **CREATE** (kids build & publish their own levels/
arenas — the Scratch/Roblox engagement multiplier) and **CLASSROOM** (teacher assigns; class
leaderboards) if schools are a target.

## The Garage (the missing room)

- **Chassis / base model:** sets part-slot count + weight capacity + base stats. Buy/unlock better
  ones with coins (and/or milestones). This is why coins matter.
- **Parts** fill slots. Three kinds, "a bit of everything," sorted to avoid pay-to-win:
  - *Capability parts* — unlock a command/sensor. Earned by **learning**, then equipped.
  - *Stat parts* — armor / speed / range / firepower, each with a **weight cost** (trade-off).
  - *Cosmetic parts* — colors, skins, decals. Pure self-expression.
- **Loadout limits** (slots + weight) make it a strategy choice. Campaign play is unrestricted;
  loadout constraints bite in the **Arena**, where code + loadout + abilities all combine.

## The Arena (competition, kid-safe)

- **Async, not live:** publish your bot → it fights others' *saved* bots as deterministic replays
  (the engine already guarantees identical fights). Leaderboards, weekly seasons, maybe class codes.
- **Safety for a public kids product:** usernames only (no real names), **no free-text chat between
  strangers**, async so no live contact, parental email + minimal data (COPPA-aware). Gate the Arena
  behind finishing early worlds so it's a *coding* arena, not a spam-bot arena.

## How we prove LEARN teaches (the current priority)

We've been building blind — no data on how a real kid plays. Fix that, then let the data + a real
kid drive the teaching:

- **Instrument** (mostly done: `cb_*` GA4 events): level open/clear/retry, **`cb_stuck`** (repeated
  fails = "too hard here"), commands used, hints used, "was this fun?" ratings, run errors.
- **Watch a real kid** (Asha, and a few of her friends). The case-sensitivity miss surfaced because
  she *hit* it — that signal beats any feature guess.
- **The bar:** a beginner can get through the first hour (Worlds 1–2) without an adult, understands
  *why* each new idea exists, and can apply a concept in a **novel** situation (the transfer level).
- **Audit the first hour** through a total-beginner's eyes: every place a kid could be confused
  (naming, capitals, brackets, "it does exactly what I wrote," autonomy) has an answer *in the UI*.

## Sequence (do NOT reorder)

1. **Harden LEARN** — first hour airtight; close teaching gaps found by watching real kids +
   analytics. Prove it teaches. *(Now.)*
2. **Garage** — chassis + slots + trade-off/capability/cosmetic parts; close the coin loop.
3. **Arena PvP** — publish + async replays + leaderboards + seasons on the accounts we built.
4. **Later:** Create (UGC), Classroom.

## Non-negotiables

- Real JavaScript, taught one concept at a time.
- Code skill > parts, forever.
- Deterministic engine (fair fights, replays, testable).
- Kid-safe by construction (async, usernames, no stranger chat, COPPA-aware).
- Don't add a track until the one before it is proven.
