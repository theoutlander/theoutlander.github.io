# CodeBots Design System

The design system for **CodeBots** — a game where kids (9–13) learn to really code by programming a little robot through a pirate-themed campaign, then battling friends. This project is the source of truth for product design; implementation lives in a Claude Code repo (see `PRODUCT_SPEC.md` at project root).

Sources: designed from scratch in this project (exploration canvas: `CodeBots Product Explorations.dc.html`; live prototype: `CodeBots.dc.html`; spec: `CodeBots Spec.dc.html` / `PRODUCT_SPEC.md`). No external brand or codebase was provided. **There is no logo asset** — the wordmark is set in type (CODE in ink + BOTS in amber, Space Grotesk 700), and the bot mascot (see Brand cards) is the visual mark.

## The one-line brief
Blueprint-room for kids: deep navy, 2px outlines, mono type, amber signal — playful-military ("cadet", "mission"), never violent, never babyish.

## CONTENT FUNDAMENTALS
- **Voice:** playful mission-control. The game talks to the kid as a capable pilot: "Tank online. Awaiting program." Second person, present tense, short sentences.
- **Casing:** UI labels are ALL-CAPS mono with letter-spacing (`--label-tracking`). Body copy is sentence case. Code words (`function`, `radar()`) are never renamed and always set in mono.
- **Kid words in game, real words in code:** chassis→BOT BODY, hardpoint→SLOT, telemetry→BLACK BOX — but `function`, `variable`, `loop` stay real. That's the knowledge that transfers.
- **Errors are friendly and specific:** "LINE 4 — I don't know 'forwrd' — did you mean forward?" Errors never cost points. Tone: a helpful co-pilot, never a red X.
- **Numbers appear only after they're felt** (Law 5). Copy explains what she already noticed: "Armor is heavy — that's why you slowed down."
- **Comments in starter code** teach: `// forward(1) rolls 1 square.`
- **Emoji: never.** Excitement comes from words, color, motion and sound.
- Examples of brand copy: "READ THE BRIEFING · WRITE COMMANDS · RUN & WATCH" · "CLUNK! Your tank hit the wall on line 3. Fix the program and RUN again." · "★ MISSION 02 CLEAR ★"

## VISUAL FOUNDATIONS
- **Themes:** BLUEPRINT (default, dark navy `--bg`) for all game UI; PAPER (`--paper-*`) only for documents/specs/print.
- **Color roles:** amber = action/score/unlocks; cyan = info/beacons/next-up; green = success/ready; red/pink = crash/hazard/penalty. Element FX have their own tokens (`--fx-*`). The 12-color paintbox is bot paint ONLY — style, never UI meaning.
- **Type:** two families total. Space Grotesk 700 for display/titles; IBM Plex Mono for everything else — labels, body, numbers, code. The mono voice is the brand.
- **Borders:** the 2px solid border (`--border`) is the signature — panels, buttons, chips all outline. Dashed borders mean locked / future / hint. No borderless cards.
- **Backgrounds:** flat navy surfaces; the arena uses a repeating-linear-gradient grid (`--grid-line`, `--cell`). No photos, no gradients as decoration (one exception: subtle two-color tint on banner strips).
- **Corners:** chips are pills; buttons `--radius-md`; cards `--radius-lg`; arena `--radius-xl`.
- **Shadows:** rare. `--shadow-pop` for toasts/modals, `--glow-amber` to spotlight the active card. Depth comes from borders and surface steps (`--bg` → `--surface-deep` → `--surface-panel`), not shadow stacks.
- **Motion:** snappy and physical. Hovers lift 3px + amber border in `--speed-fast`; tanks move with `--ease-snap`; wins pop (`cbPop`) + confetti (`cbFall`); crashes shake (`cbShake`); beacons pulse (`cbPulse`); score floaters rise (`cbFloatUp`). Nothing floats dreamily; everything snaps.
- **Hover:** border-color → amber (ghost elements) or brightness(1.08) (filled). **Press:** scale(0.98).
- **Feedback is loud:** every event has color + motion + sound together (see Sound card). Points fly off the bot as floaters at the moment they happen.
- **Transparency/blur:** none. Overlays use solid `rgba(5,10,24,.62)` scrims.
- **Locked/disabled:** opacity .55–.72 + dashed border + a reason chip ("CLEAR CH 02") — never grayed-out mystery.

## ICONOGRAPHY
- **No icon font, no SVG icon set.** Icons are built from geometric primitives (divs): squares, circles, diamonds (rotated squares), triangles (border tricks), bars. See the Brand cards.
- Unicode glyphs used as icons: ★ (stars/earned) ✓ (clear) → (flow) · (separators) ▶ ■ (run/stop) ▮ (weight cells).
- **The bot IS the mascot**: treads + hull + dome + barrel + eyes + antenna, drawn in divs, painted via bot.json. Never redraw it differently; use the `BotAvatar` component.
- C-coins are amber rounded squares with a "C" (Asha's spec). Never circles.
- If a real icon set is ever needed, use a geometric, chunky-stroke set and flag the substitution — but prefer primitives.

## UX RULES (kid ergonomics)
- Hit targets ≥ `--hit-target` (44px). UI text never below `--text-floor` (11px).
- One idea per screen; progressive disclosure (garage slots/weights appear world by world).
- Reading level ~grade 4; briefings are short stories (she reads for fun — reward that).
- Sound pairs with every command & event (close your eyes and hear the program run).
- Errors: point at the line, suggest the fix, cost nothing.
- Everything reversible: RESET always visible; nothing destructive without a toast.

## INDEX
- `styles.css` — global entry (imports all tokens).
- `tokens/` — colors, typography, spacing, effects, fonts.
- `guidelines/` — foundation specimen cards (rendered in the Design System tab).
- `components/core/` — Button, Chip, Panel, Toast.
- `components/hud/` — Meter, StatusChip, Coin, Stars.
- `components/game/` — BotAvatar, PartCard.
- `ui_kits/codebots/` — HQ + Mission screen recreations.
- `SKILL.md` — agent skill wrapper for Claude Code handoff.
- Root: `PRODUCT_SPEC.md` (product), `CodeBots Spec.dc.html` (printable spec), `CodeBots Product Explorations.dc.html` (decision history), `CodeBots.dc.html` (live prototype), `bot.json` (kid-editable bot identity).

## Intentional additions
No source component inventory existed, so the set was authored from the prototype + spec: Meter, StatusChip, Coin, Stars, BotAvatar, PartCard are game-specific by design.

## Caveats
- Fonts load from Google Fonts (`tokens/fonts.css` @import). Self-host and switch to @font-face for offline builds.
- Component `.jsx` files compile when this project is marked as a Design System (Share menu → File type); specimen cards are static HTML so they render regardless.
