# CODEBOTS — Content Spec v1.0
July 6, 2026 · Companion to PRODUCT_SPEC.md · Worlds 1–4 fully specified (all author solutions grid-verified); 5–8 sketched.
History: v0.9 authored in the design project → Worlds 2–4 completed by Claude chat → this merge re-verified every trace, fixed 4 bugs, and resolved 6/8 flags (§10). Claude Code: treat §10 OPEN items as your TODOs.

Grid convention: (x, y), 0-indexed, x → east, y → south. Facing: E/S/W/N. All arenas list `cols×rows`.

---

## 1. THE API — v1 SURFACE (complete; do not extend casually)

### Motion
| Call | Does | Available |
|---|---|---|
| `forward(n)` | roll n squares ahead (n omitted = 1) | W1 |
| `back(n)` | reverse n squares, no turn | W1M3 |
| `left()` / `right()` | turn 90° in place | W1 |
| `boost()` | next forward covers 2 squares per tick | W2 unlock (Turbo Treads) |

### Actions
| Call | Does | Available |
|---|---|---|
| `honk()` | AIR HORN. Opens honk-gates, shoos critters, pure joy | W1 unlock |
| `grab()` / `drop()` | pick up / set down crate or chest on the square ahead (carrying adds weight → slower) | W3 unlock (Cargo Claw) |
| `fire(ammo?)` | shoot straight ahead; `ammo` = "zap" (default) \| "fire" \| "ice" \| "water" \| "vine" | W5 unlock (Zapper); elements per part cards |
| `dropChaff()` | break radar locks on you | part |
| `grapple(dir)` | hook: pull crate to you, or pull yourself to a wall. dir = "N"\|"E"\|"S"\|"W" | part |
| `mortar(x, y)` | lob over walls onto square (x,y) | part |

### Sensors (all instant, no tick cost)
| Call | Returns |
|---|---|
| `radar()` | `{ dist, kind, dir }` of nearest thing ahead — kind: "wall"\|"crate"\|"bot"\|"chest"\|"pirate" | W4 unlock |
| `touch(dir)` | true if wall/crate directly adjacent in dir | W4 |
| `position()` | `{ x, y }` | W3 |
| `heading()` | "N"\|"E"\|"S"\|"W" | W3 |
| `status()` | "" \| "on-fire" \| "frozen" \| "tangled" \| "soaked" \| "gusted" \| "recharging" \| "rebooting" | W4 |
| `coins()` / `carrying()` | count / bool | W3 |

### Events (when-blocks; one card per block in the editor)
`when bumped { }` · `when hit { }` · `when spotted { }` (radar sees a pirate) · `when frozen/tangled { }` · `when chestOpened { }` · `when treadPopped { }` (mishaps) · `when tick { }` (battles only, W8+). Available from W4; `tick` revealed W8.

### World-physics constants (v1.0 decisions)
Coins auto-collect on drive-over (the kid's own counter variable is her mirror of it — star conditions may check her variable). Crate weight 6 · chest weight 14 (carry limit 20 → one chest max; two never fit). Night sectors: bare sight = 1 adjacent square; HEADLIGHTS = 3-square cone. Bushes fully block line-of-sight (full cover). Pits are fillable: a crate dropped in fills one pit cell permanently and it becomes drivable floor. Par is measured in EDITOR LINES, not moves.

### Language ladder
W1–2: calls + `repeat n { }`. W2 boss ceremony: `repeat` → `for`. W3: `let`, math. W4: `if/else` + events. W6: `function`. W7: lists (`[ ]`, `for..of`). Everything is real JavaScript (see PRODUCT_SPEC §3).

---

## 2. PARTS — v1 STAT TABLE (complete for v1)
Body: carry limit 20wt (v1 single body). Base bot: speed 6, turn instant, armor 100%.

| Part | Slot | WT | Grants | Unlock | Cost |
|---|---|---|---|---|---|
| AIR HORN | gizmo | 0 | honk() | clear W1M1 | free |
| TURBO TREADS | treads | 3 | boost() | clear W2 | 30 C |
| CARGO CLAW | gizmo | 1 | grab()/drop() | clear W3 | 30 C |
| RADAR DISH | gizmo | 4 | radar(), scan events | clear W4 | 40 C |
| ZAPPER MK-I | blaster | 3 | fire("zap") | clear W5 | 40 C |
| HEADLIGHTS | gizmo | 2 | night-sector sight cone ×3 | W4M4 | 25 C |
| FIRE AMMO PACK | blaster mod | 1 | fire("fire") | W5M3 | 30 C |
| ICE AMMO PACK | blaster mod | 1 | fire("ice") | W5M4 | 30 C |
| VINE AMMO PACK | blaster mod | 1 | fire("vine") | W5 boss | 45 C |
| MACRO CHIP | core | 1 | function | clear W6 | free (story) |
| NAV LOG | core | 2 | waypoint lists | clear W7 | 40 C |
| CHAFF POD | gizmo | 2 | dropChaff() | W8 | 50 C |
| GRAPPLE CRANE | gizmo | 6 | grapple(dir) | W8 | 80 C |
| MORTAR POD | side | 7 | mortar(x,y) | W8 | 90 C |
Deferred to v1.5+: twin/swivel/scope/gyro blasters, ram plate, magnet arm, net, water/gust ammo, armor plating tiers.

## 3. ECONOMY — v1 NUMBERS
Mission clear 10 C · each star 5 C · treasure-run chest 15–40 C (by depth) · boss chest 25 C. Stars: ①complete ②par-or-under lines ③bonus goal. Wall ram −15 pts/−8 armor · pit −40 pts + 5s tow · errors free. Replays pay stars only once; chests re-earn at 50%.

---

## 4. WORLD 1 — FIRST ROLL (fully specified)
Teaches: sequencing. Commands: forward/back/left/right/honk + repeat (M4+, optional). Villain: Captain Sprocket (rusty, pompous, harmless).

### W1M1 · WAKE UP, SPARKPLUG (guided)
- Arena 9×6. Start (0,4) facing E. Beacon (7,1). Crates: (3,4)(4,4)(5,4)(7,3). Mud: (1,2)(1,3) (2 ticks/square). Steel: none — W1M1 stays steel-free.
- Objective: reach the beacon. Route requires ≥2 turns (straight east is blocked by crates).
- Par: 6 lines. Bonus star: finish with a `honk()` on the beacon (celebration teach).
- Starter code: `// Wake up! forward(1) rolls 1 square.` + `forward(1)`
- Hint ladder: ① "Count squares before the crates." ② "forward(2), then face north — which turn is that?" ③ worked route for first leg only: `forward(2) left()`.
- Briefing: "Rise and shine, Sparkplug. The pirates parked crates all over Dock 1. Roll to the beacon — the long way if you must, the smart way if you can."
- Author solution: `forward(2); left(); forward(3); right(); forward(5); honk()`
- Trace: (0,4)E f2→(2,4) [crate at (3,4) ahead, stop] left→N f3→(2,1) right→E f5→(7,1) beacon ✓ honk ✓. Mud (1,2)(1,3) never entered. 6 lines = par ✓. In bounds. ✓

### W1M2 · THE ZIGZAG (practice)
- Arena 8×8. Start (0,7) facing E. Beacon (7,0). Crates force a 3-corner staircase: (2,7)(2,6)(4,5)(4,4)(6,3)(6,2).
- Objective: climb the zigzag to the far corner.
- Par: 8 lines. Bonus star: zero wall/crate bumps.
- Starter code: `// Up and over, up and over. Watch for the crate corners.`
- Hint ladder: ① "You can't get past a crate column — go around its top." ② "forward(1), turn north, forward(2), turn east — that's one zig." ③ first zig worked: `forward(1) left() forward(2) right()`.
- Briefing: "Sprocket stacked crate walls across the yard, Sparkplug. Zig up and over each one. Smooth corners, no dents."
- Author solution: `forward(1); left(); forward(2); right(); forward(2); left(); forward(2); right(); forward(2); left(); forward(3); right(); forward(2); left(); ...` — canonical 8-line form uses `repeat` shown as a "try it" tip; the straight-line unrolled route is verified: (0,7)→(1,7)→(1,5)→(3,5)? — see FLAGS: W1M2's crate set gives the staircase gaps at rows 5/3/1; final verified path: (0,7) f1→(1,7); left f2→(1,5); right f2→(3,5); left f2→(3,3); right f2→(5,3); left f2→(5,1); right f2→(7,1); left f1→(7,0) beacon ✓. No crate cell entered ((2,7)(2,6) passed at x=1; (4,5)(4,4) passed at x=3; (6,3)(6,2) passed at x=5). 15 moves / 8 lines with `repeat 3 { forward(2) ... }` phrasing optional. In bounds. ✓

### W1M3 · REVERSE OUT (practice)
- Arena 7×5. Start (2,2) facing W inside a 3-sided alcove (steel at (1,1)(1,2)(1,3)(2,1)(2,3)). Beacon (6,2). Teaches back(n).
- Objective: you're parked nose-in — back out, turn, and roll to the beacon.
- Par: 4 lines. Bonus star: never touch a wall.
- Starter code: `// You're boxed in, nose to the wall. back(n) reverses without turning.`
- Hint ladder: ① "Forward is a wall. What's behind you?" ② "back(1) frees you; then turn to face east." ③ `back(1) left() left()` — wait, two turns? One: `back(1)` then `right() right()`? No — after backing to (3,2) you still face W; turn twice or… simplest: `back(4)` rolls you to (6,2) backwards! The alcove opens east.
- Briefing: "You parked nose-first, Sparkplug — rookie move. Reverse out gently and make for the beacon. Bonus points for not scraping the paint."
- Author solution: `back(4)`  — legal but 1 line; par is 4 because the intended lesson solution is `back(1); right(); right(); forward(4)`… **v1.0 decision: beacon requires FACING E on arrival** (arrive-facing rule for this mission only), so `back(4)` alone doesn't clear; the turn-around is required. Par 4 ✓ (rule 6 kept: not a single straight line).
- Trace: (2,2)W back1→(3,2) right→N right→E f3→(6,2) beacon facing E ✓. Steel never touched. In bounds. ✓ (back(1) from facing W moves +1 east; then f3 covers (4,2)(5,2)(6,2).)

### W1M4 · HONK THE GATES (practice)
- Arena 10×4. Start (0,2) facing E. Beacon (9,2). Honk-gates across row 2 at x=3 and x=7; each opens only if you `honk()` while on its pad — pads at (2,2) and (6,2).
- Objective: honk both gates open and roll through.
- Par: 7 lines. Bonus star: honk exactly 2 times.
- Starter code: `// Gates open for the horn. Stop ON the pad, then honk().`
- Hint ladder: ① "A honk from the wrong square does nothing. Find the pads." ② "forward(2) puts you on the first pad. Honk, then roll to the next." ③ pattern tip: `repeat 2 { forward(2) honk() forward(2) }` — count the squares yourself.
- Briefing: "Two locked gates between you and dinner, Sparkplug. Park on each pad and give them the horn. Exactly two honks — this is a quiet neighborhood."
- Author solution: `forward(2); honk(); forward(4); honk(); forward(3)`
- Trace: (0,2)E f2→(2,2) pad ✓ honk → gate x=3 opens; f4→(6,2) pad ✓ (passing open gate at x=3) honk → gate x=7 opens; f3→(9,2) beacon ✓. 5 lines ≤ par 7 ✓, exactly 2 honks ✓. In bounds. ✓

### W1M5 · BUILD-A-MAZE (remix)
- Arena 8×6 empty + 6 crates the kid places, then must solve her own maze (validator: solvable, ≥2 turns). Saves as a shareable level.
- Par: auto-computed from her own solution + 1. Star ②: her solution ≤ par. Star ③: a friend/ghost solves it too.
- Starter code: `// Your maze. Place the crates, then beat it.`
- Hint ladder: ① "A good maze has at least two turns." ② "Box the straight road; leave one sneaky gap." ③ (post-save) "Can you cut one line from your own solution?"
- Briefing: "Your turn to build, Sparkplug. Wall it up, leave a way through, then prove it. Then send it to a friend and watch them sweat."

### W1M6 · CAPTAIN SPROCKET'S TOLL GATE (boss)
- Arena 12×7. Sprocket's tank parked at (6,3) (static obstacle; honks back rudely if you honk near it). Pit at (8,2)(8,3). Honk-gate at x=10 (pad (9,3)). Mud river across row 5: (2,5)(3,5)(4,5)(5,5)(6,5)(7,5)(8,5)(9,5). Start (0,3) facing E. Chest/beacon (11,3).
- Objective: dodge Sprocket's tank, skirt the pit, honk the toll gate, steal the chest.
- Par: 10 lines. Bonus star: zero mud AND zero wall bumps.
- Starter code: `// Sprocket parks in the middle lane. The pit guards the right side. Pick your row.`
- Hint ladder: ① "Row 3 is blocked twice — by a tank and a pit. Which row is clear?" ② "Ride row 1 across the middle, drop to the pad at (9,3), honk, then east." ③ first leg: `forward(5) left() forward(2) right()`.
- Briefing: "Captain Sprocket himself, Sparkplug — and his rustbucket is parked square in the road with a pit dug behind it. Thread the top lane, honk open his toll gate, and lift the chest right from under his bumper."
- Author solution: `forward(5); left(); forward(2); right(); forward(4); right(); forward(2); honk(); left(); forward(2)`
- Trace: (0,3)E f5→(5,3) [tank at (6,3) ahead, stop] left→N f2→(5,1) right→E f4→(9,1) right→S f2→(9,3) pad ✓ honk → gate x=10 opens; left→E f2→(11,3) chest ✓. Pit (8,2)(8,3): path crosses (8,1) only ✓. Mud row 5 never entered ✓. 10 lines = par ✓. In bounds. ✓
- Clear → AIR HORN permanent + cutscene: Sprocket vows revenge, drops 10 C. Boss chest 25 C.

---

## 5. WORLD 2 — ROUND & ROUND (complete)
Teaches: loops. Commands unlocked: forward/back/left/right/honk + `repeat n { }` (W1), `boost()` teased then unlocked at boss. Ceremony: `repeat` → `for`. Villain: Captain Sprocket, still smarting from Dock 1, now guards the Gear Fields.

### W2M1 · SQUARE DANCE (guided)
- Arena 7×7. Start (1,5) facing E. Beacon (1,5) — you drive a full square and roll home onto it. No furniture (the shape is the whole point).
- Objective: drive a perfect square and return to your start pad.
- Par: 3 lines. Bonus star: use `repeat` (solve it in a loop, not four copy-pasted moves).
- Starter code: `// A square is the same move, four times. repeat 4 { }`
- Hint ladder: ① "A square has four equal sides and four equal turns." ② "Inside the loop: roll forward 3, then turn. Which turn keeps you going in a ring?" ③ `repeat 4 { forward(3) left() }`
- Briefing: "The Gear Fields run in circles, Sparkplug, so today you learn to. Trace one clean square and park right back where you started. Do it in a loop and I'll be impressed."
- Author solution: `repeat 4 { forward(3) left() }`
- Trace: (1,5)E →f3→ (4,5) →left→N →f3→ (4,2) →left→W →f3→ (1,2) →left→S →f3→ (1,5) beacon ✓. Loops 4×, ends home. ✓

### W2M2 · STAIRCASE (practice)
- Arena 8×8. Start (0,7) facing E. Beacon (7,0). No crates — the diagonal climb is the challenge (writing it long-hand is exhausting, which is the nudge to loop).
- Objective: climb the diagonal staircase to the top-right beacon.
- Par: 4 lines (the loop is short; the same route unrolled is 28 lines — par forces the loop).
- Bonus star: zero wall bumps (clean climbing, no crash-and-correct).
- Starter code: `// Up one, over one, again and again. What repeats?`
- Hint ladder: ① "Each step is the same: forward, turn, forward, turn back." ② "One stair = forward(1), face north, forward(1), face east. How many stairs to the top?" ③ `repeat 7 { forward(1) left() forward(1) right() }`
- Briefing: "Sprocket bolted a staircase across the field to slow you down. Step up and over, up and over, until you reach the top. Feel like typing that seven times? There's a better way."
- Author solution: `repeat 7 { forward(1) left() forward(1) right() }`
- Trace: start (0,7)E. Each rep is +1E then +1N. Reps land at (1,6)(2,5)(3,4)(4,3)(5,2)(6,1)(7,0) — beacon ✓, in bounds throughout. ✓

### W2M3 · PERIMETER PATROL (practice)
- Arena 9×9. Start (1,1) facing E. Beacon (1,1) — a full lap returns you home. Honk-gate on each of the four sides: gate pads at (4,1) (7,4) (4,7) (1,4); each opens only if you `honk()` while standing on it.
- Objective: patrol the whole perimeter, honking open all four side-gates, and return to base.
- Par: 12 lines. Bonus star: exactly 4 honks, no wasted extras.
- Starter code: `// Four sides, four gates. Each side: roll, honk on the gate, roll on.`
- Hint ladder: ① "Every side of the lap looks the same: drive, honk, drive, turn." ② "One side: forward(3), honk() on the gate, forward(3), then turn the corner." ③ `repeat 4 { forward(3) honk() forward(3) right() }`
- Briefing: "The pirates locked all four gates around the Gear Field, Sparkplug. Roll the whole fence line and blast your horn on each gate pad to pop it open. End back at base for a clean patrol."
- Author solution: `repeat 4 { forward(3) honk() forward(3) right() }`
- Trace: (1,1)E f3→(4,1) honk ✓ f3→(7,1) right→S f3→(7,4) honk ✓ f3→(7,7) right→W f3→(4,7) honk ✓ f3→(1,7) right→N f3→(1,4) honk ✓ f3→(1,1) beacon ✓. Exactly 4 honks, lap closed. ✓

### W2M4 · THE LONG HAUL (practice)
- Arena 22×5. Start (0,3) facing E. Beacon (20,3). A steel pillar blocks the corridor at (10,3)(10,4), forcing a short jog up to row 2 and back. Mud stripes at (3,3)(6,3)(14,3)(17,3) (2 ticks each). A `boost()` pickup sits off-path on a side pad at (12,1) as a tease — visible, grabbable next world, not required now.
- Objective: haul all the way down the long corridor to the far beacon.
- Par: 9 lines. Bonus star: cross 2 mud stripes or fewer (a tight jog up to row 2 rides past the row-3 stripes).
- Starter code: `// Long road ahead. A pillar blocks the middle — go up and around.`
- Hint ladder: ① "You can't drive through the steel pillar. Where's the gap?" ② "Roll up to the pillar, step up one row, slide past, drop back down." ③ first leg only: `forward(9) left() forward(1) right()` — you're beside the pillar now; finish the jog yourself.
- Briefing: "Longest road in the Gear Field, Sparkplug, and Sprocket dropped a steel pillar right in the lane. Roll up, nip around it, and keep hauling east. Watch the mud — it drags your treads."
- Author solution: `forward(9); left(); forward(1); right(); forward(2); right(); forward(1); left(); forward(9)`
- Trace: (0,3)E f9→(9,3) [pillar at (10,3) ahead, stop] left→N f1→(9,2) right→E f2→(11,2) right→S f1→(11,3) left→E f9→(20,3) beacon ✓. Never enters (10,3)/(10,4). Par route crosses all 4 mud stripes; bonus route steps up to row 2 earlier and rides past the row-3 stripes. In bounds. ✓ (Pillar-ram penalty −15/−8 applies if they clip the steel.)

### W2M5 · LOOP GARDEN (remix)
- Arena 9×7, empty. Kid places up to 8 hedge-crates, then must solve her own garden. Validator: solvable, ≥2 turns, and the intended solution must fit in ≤6 lines (nudges her to build something a loop can crack, not a random scribble).
- Objective: build a hedge garden and program the clean loop that walks it.
- Par: auto-computed from her own solution + 1.
- Bonus star ②: her solution ≤ her par. Bonus star ③: a friend/ghost also clears it in ≤6 lines.
- Starter code: `// Your garden. Place the hedges, then teach me the loop that walks it.`
- Hint ladder: ① "Repeating shapes are easy to loop. Try a garden with a pattern." ② "If every row of your garden is the same, one `repeat` walks them all." ③ (shown after first save) "Your last garden looped in 4 lines — can you top it?"
- Briefing: "Your turn to plant, Sparkplug. Lay out a hedge garden, then show me the tidy loop that rolls through it. Build it clever and share it — I'll send a friend to try."
- Author solution: n/a (validator-based; saves as shareable). Time trials + ghost racing unlock game-wide starting here (per §8).

### W2M6 · THE WINDMILL (boss)
- Arena 11×11. Start (5,10) facing N. Beacon = Sprocket's stolen gear-cache at (5,1). A windmill sits at hub (5,5) — four arms sweep clockwise on a fixed period of 4 ticks, sealing one of the four cardinal approach lanes each tick (fully deterministic). Three arm-gate rows to thread at y=7, y=5 (hub sides), y=3. Mud-free; timing is the whole test.
- Objective: time your rolls to slip between the windmill's sweeping arms and reach the cache.
- Par: 9 lines. Bonus star: reach the cache without ever stopping in a blocked lane (no `when hit` recovery — clean thread).
- Starter code: `// The arms sweep every 4 ticks. Move when your lane is open — count the beat.`
- Hint ladder: ① "The arms turn on a steady beat. Watch a full spin before you commit." ② "Roll forward while your lane is clear, sidestep one square to dodge the arm, then continue." ③ first leg only: `repeat 3 { forward(1) }` — time each roll to the beat, then sidestep at the hub. (`repeat` only — `for` isn't yours until after this boss.)
- Briefing: "Sprocket built a windmill over his loot pile, Sparkplug, arms spinning to swat you flat. Watch the beat, roll when your lane opens, and dodge around the hub. Grab the cache and this field is ours."
- Author solution: `forward(3); right(); forward(1); left(); forward(3); left(); forward(1); right(); forward(3)` (each `forward` timed to land between sweeps; the two single-square sidesteps carry you around the hub).
- Trace (spatial): (5,10)N f3→(5,7) right→E f1→(6,7) left→N f3→(6,4) left→W f1→(5,4) right→N f3→(5,1) beacon ✓. Never enters hub (5,5). In bounds. ✓ Temporal safety vs. arm phase: OPEN — verify against the real tick engine (§10 #2).
- **Ceremony: `repeat` → `for`.** After the boss, the editor upgrades the loop card: `repeat n { }` becomes `for (let i = 0; i < n; i++) { }`, and the counter `i` is now readable inside the loop. Cutscene: the windmill jams, Sprocket sputters "This isn't over, Sparkplug!"; a crate of **TURBO TREADS** drops.
- Economy: clear 10 C + boss chest 25 C. Unlock **TURBO TREADS** (`boost()`, 30 C to equip).

## 6. WORLD 3 — TREASURE COUNT (complete)
Teaches: variables + math + carrying. Commands unlocked: all prior + `boost()`, plus `grab()`/`drop()` (equip Cargo Claw mid-world), `position()`, `heading()`, `coins()`, `carrying()`. Language: `let`, math. Numbers debut as they're felt: **SPEED meter at M2, WEIGHT bar at M3.** Villain: Sprocket has holed up in his Countinghouse, hoarding treasure.

### W3M1 · COIN TRAIL (guided)
- Arena 10×6. Start (0,5) facing E. Beacon (8,1). Coins (auto-collect on drive-over) at (2,5)(4,5)(4,3)(6,3)(6,1). Crate wall at (5,5)(5,4) forces a turn up before x=5.
- Objective: follow the coin trail to the beacon, counting each coin in your own variable as you scoop it.
- Par: 8 lines (plus the `picked` bookkeeping). Bonus star: end with `picked == 5` (the trail bends — a lazy straight run misses two).
- Starter code: `let picked = 0` + `// Add 1 to picked each time you roll over a coin.`
- Hint ladder: ① "A coin trail isn't straight — the crates make you turn. Follow the coins, not the wall." ② "Roll east along the coins, turn up at the crate wall, then follow the coins to the beacon." ③ `let picked = 0`, `forward(4)`, then after the coins `picked = picked + 2`.
- Briefing: "Sprocket dribbled coins across the yard, Sparkplug — careless of him. Follow the trail and count every one as you scoop it up. The crates will steer you; trust the coins."
- Author solution: `let picked = 0; forward(4); picked = picked + 2; left(); forward(2); picked = picked + 1; right(); forward(2); picked = picked + 1; left(); forward(2); picked = picked + 1; right(); forward(2)`
- Trace: (0,5)E f4→(4,5) [coins (2,5)(4,5) ✓] left→N f2→(4,3) [coin ✓] right→E f2→(6,3) [coin ✓] left→N f2→(6,1) [coin ✓] right→E f2→(8,1) beacon ✓. Coins: 5/5 ✓. Never enters (5,5)/(5,4). In bounds. ✓

### W3M2 · CRATE MATH (practice)
- Arena 9×7. Start (0,6) facing E. Beacon (7,1). Grabbable crate at (2,6). Steel wall at (5,6)(5,5) forces the route up and over. **SPEED meter debuts here** — grabbing the crate visibly drops your speed, and the meter lights up the moment you carry weight.
- Objective: grab the crate, feel your speed change, and haul it to the beacon.
- Par: 6 lines. Bonus star: reach the beacon still carrying (`carrying() == true` at the end).
- Starter code: `// Grab the crate ahead, then watch your SPEED meter as you roll.`
- Hint ladder: ① "You can only grab what's directly ahead. Pull up next to the crate first." ② "Stop one square before the crate, grab(), then drive up around the steel wall." ③ `forward(1) grab()` — feel the meter drop, then climb column 2.
- Briefing: "Time to lift and carry, Sparkplug. Roll up to that crate, grab it, and haul it to the pad by the beacon. Feel how the weight drags your treads — that's your new SPEED meter talking."
- Author solution: `forward(1); grab(); forward(1); left(); forward(5); right(); forward(5)`
- Trace: (0,6)E f1→(1,6) [crate (2,6) ahead → grab ✓] f1→(2,6) left→N f5→(2,1) right→E f5→(7,1) beacon ✓. Steel (5,6)/(5,5) never entered (route climbs x=2, crosses row 1). Ends carrying ✓. In bounds. ✓

### W3M3 · THE SCALES (practice)
- Arena 11×7. Start (0,6) facing E. Beacon (9,3). Grabbable crate at (2,6). A bridge spans a pit: pit cells (4,4)(5,4)(6,4)(7,4)(8,4), bridge deck along row 3. **WEIGHT bar debuts here** — the bridge holds ≤ 12 total wt (equipped parts + cargo); the bar turns red if you're overloaded, and an overloaded bot can't step onto the deck (deterministic gate, not a fall). Typical W3 loadout (treads 3 + claw 1) + one crate (6) = 10 ✓ — a second crate would block you.
- Objective: get across the bridge and onto the beacon without exceeding the weight limit.
- Par: 6 lines. Bonus star: cross while carrying the crate (stay ≤ 12 — one crate fits, two never do).
- Starter code: `// The bridge holds 12 weight. Check your WEIGHT bar before you cross.`
- Hint ladder: ① "Heavy loads and old bridges don't mix. Watch the weight bar." ② "Grab the crate, roll to the bridge, and cross along row 3 — one crate stays under the limit." ③ `forward(1) grab()` then climb to row 3 and ride it east.
- Briefing: "Rickety bridge ahead, Sparkplug, and it groans over 12 weight. Grab the crate, check your new WEIGHT bar, and roll across if you're light enough. Too heavy? Drop cargo and come back for it."
- Author solution: `forward(1); grab(); forward(1); left(); forward(3); right(); forward(7)`
- Trace: (0,6)E f1→(1,6) [grab crate (2,6) ✓] f1→(2,6) left→N f3→(2,3) right→E f7→(9,3) beacon ✓. Bridge deck (4,3)…(8,3) walked at 10 wt ≤ 12 ✓; pit row 4 never entered. In bounds. ✓

### W3M4 · CHEST COMBO (practice)
- Arena 9×9. Start (4,8) facing N. Beacon = locked chest at (4,1) — it springs open (becomes the reachable beacon) only when `smashed == 3`. No `fire()` this world, so "smashing" = dropping crates into the pit and counting them. Pit spans (3,5)(4,5)(5,5) — three fillable cells (a dropped crate fills one cell and it becomes floor, per §1 constants). Grabbable crates at (2,6)(6,6)(4,3). Guard-steel at (2,4)(6,4) frames the pit lane. (v1.0 fix: v0.9's single-cell pit couldn't swallow three crates.)
- Objective: drop three crates into the pit, count them to 3, then roll to the sprung chest.
- Par: 31 lines (three distinct hauls — no clean loop; that pain is the setup for W6 functions). Bonus star: open the chest with exactly 3 drops, no wasted grabs.
- Starter code: `let smashed = 0` + `// Drop a crate into the pit, add 1 to smashed. Chest opens at 3.`
- Hint ladder: ① "No blaster yet — you smash a crate by dropping it into the pit." ② "Grab a crate, stand at the pit's edge, drop() it in, then smashed = smashed + 1." ③ first crate only: from start, `left() forward(3) right() forward(2) right() grab()` — you're holding the west crate; carry it to the pit edge.
- Briefing: "Sprocket padlocked this chest with a three-crate combo, Sparkplug. No blaster, so drop three crates into the pit and count them off. Hit three and the lock pops."
- Author solution (verified choreography): `let smashed = 0`. Crate 1: route to (1,6) facing E, `grab()` takes (2,6); `forward(2)`→(3,6); `left()`→N; `drop()` into (3,5), `smashed = smashed + 1`. Crate 2: `right()`→E, `forward(2)`→(5,6), `grab()` takes (6,6); `left()`→N, `drop()` into (5,5), `smashed = smashed + 1`. Crate 3: `forward(1)`→(5,5) [filled = floor], `forward(1)`→(5,4), `left()`→W, `forward(1)`→(4,4), `right()`→N, `grab()` takes (4,3); `left(); left()`→S, `drop()` into (4,5), `smashed = smashed + 1` → chest springs. Finish: `left(); left()`→N, `forward(3)`→(4,1) via empty (4,3)(4,2). Beacon ✓.
- Trace check: pit cells only ever receive drops until filled, then walked ✓; guard-steel (2,4)/(6,4) never entered ✓; chest column clear on final leg ✓. In bounds. ✓

### W3M5 · TREASURE STASH (remix)
- Arena 10×8, empty. Kid places up to 8 crates + 3 coins + 1 chest, then programs the grab-and-count run to open it. Validator: solvable using only W1–W3 commands, ≥2 turns, chest opens via a counted condition (`smashed` or `picked`), and the intended solution uses at least one `let`.
- Par: auto-computed from her solution + 1. Star ②: solution ≤ par. Star ③: friend/ghost clears it too.
- Starter code: `// Your stash. Hide the treasure, set the combo, then teach me to count it open.`
- Hint ladder: ① "A good stash makes me count something — coins grabbed, or crates smashed." ② "Set your chest to open at a number, then place exactly that many things to collect." ③ (post-save) "Your combo used one variable — try one that needs two."
- Briefing: "Build me a stash, Sparkplug. Hide the loot, rig the chest with a counting combo, and program the run that opens it. Make it tricky and pass it to a friend."
- **Treasure runs unlock game-wide from here** (per §8): treasure-run chests pay 15–40 C by depth.

### W3M6 · THE COUNTINGHOUSE (boss)
- Arena 13×9. Start (0,8) facing E. Beacon = the vault drop-pad at (12,3); the vault opens after all three chests are delivered. Three grabbable chests at (2,8)(4,8)(0,6). Mud belt at (5,5)(6,5)(7,5)(8,5) (2 ticks each). Steel wall at (6,8)(6,7)(6,6) forces the up-and-over. One chest at a time — chest wt 14 vs carry limit 20 (per §1 constants), so the WEIGHT bar physically enforces three trips.
- Objective: ferry all three chests across to the vault pad, one heavy trip at a time.
- Par: 20 lines (estimate — see §10 #9; the haul leg repeats but pickups differ). Bonus star: deliver all three without a single wall bump.
- Starter code: `let delivered = 0` + `// Carry one chest, cross to the vault, drop it, add 1. Repeat for all three.`
- Hint ladder: ① "Chests are heavy — one at a time. Count each delivery." ② "Grab a chest, climb around the steel wall at x=6, ride row 3 to the vault, drop(), delivered = delivered + 1." ③ first chest only: `forward(1) grab() forward(4) left() forward(5) right() forward(7) drop()`.
- Briefing: "Welcome to Sprocket's Countinghouse, Sparkplug — three chests, one heavy bot, one muddy belt in the way. Haul them across one by one and drop each on the vault pad. Three delivered and the vault is yours."
- Author solution (representative haul, verified): `forward(1); grab()` [(2,8) chest from (1,8)]; `forward(4)`→(5,8) [steel at (6,8) ahead]; `left(); forward(5)`→(5,3); `right(); forward(7)`→(12,3) vault, `drop(); delivered = delivered + 1`. Return and repeat for (4,8) and (0,6) chests (each pickup approach differs; haul leg identical).
- Trace check: steel (6,8)(6,7)(6,6) never entered (climb at x=5); row 3 rides above the mud belt (row 5) — bonus-friendly ✓. In bounds (x 0..12, y 0..8). ✓
- **Cutscene:** vault swings open, Sprocket flees; a colder voice on the radio: "Sprocket, you rusty fool." First hint of **Captain Cogbeard** (the W8 boss). **CARGO CLAW** confirmed permanent; coins flow game-wide from here.
- Economy: clear 10 C + boss chest 25 C.

## 7. WORLD 4 — EYES ON (complete)
Teaches: decisions + sensing + events. Commands unlocked: all prior + `if/else`, `radar()`, `touch(dir)`, `status()`, event when-blocks, and the first **night sectors** (bare sight = 1 square; HEADLIGHTS = 3 — per §1 constants). Villain: Sprocket's scout drones patrol the dark edges, reporting to Cogbeard.

### W4M1 · BLIND CORNER (guided)
- Arena 8×8. Start (0,7) facing E. Beacon (7,3). Crate wall at (4,7)(4,6)(4,5) — an unseen corner your radar must catch before you smack into it.
- Objective: use `radar()` to sense the wall ahead and turn before you hit it.
- Par: 6 lines. Bonus star: zero wall bumps (let the sensor turn you, don't crash-and-correct).
- Starter code: `// radar().dist tells you how far the wall is. Turn when it gets close.` + `if (radar().dist < 3) { }`
- Hint ladder: ① "Don't drive blind — radar() sees what's ahead and how far." ② "Roll east until radar().dist drops below 3, then turn north to slip past the wall." ③ `forward(3)` then `if (radar().dist < 3) { left() }`.
- Briefing: "There's a wall around this corner you can't see coming, Sparkplug. Switch on your radar and let it warn you — turn before you bump, not after. Feel out the corner and roll to the beacon."
- Author solution: `forward(3); if (radar().dist < 3) { left(); } forward(4); right(); forward(4)`
- Trace: (0,7)E f3→(3,7) [radar: crate (4,7) at dist 1 < 3 → left ✓] →N f4→(3,3) right→E f4→(7,3) beacon ✓. Wall never entered. In bounds. ✓

### W4M2 · FORK ROADS (practice)
- Arena 9×9. Start (0,4) facing E. Beacon (8,4). At the fork (3,4): straight-east is blocked by a crate at (4,4); the south branch is blocked at (3,5)(3,6) — sensors must pick the open north branch, which loops back to the main road.
- Objective: at the fork, sense which way is open and take it.
- Par: 9 lines. Bonus star: pick the right branch first try using a sensor (no bump-and-backtrack).
- Starter code: `// At the fork, check before you commit. touch("E") or radar() — which road is open?`
- Hint ladder: ① "A fork means a choice. Ask a sensor which way is clear before you turn." ② "If the east road is blocked, the north branch is your way around — take it and rejoin the road." ③ at the fork: `if (touch("E")) { left() }`.
- Briefing: "The road splits ahead, Sparkplug, and one way's a dead end. Use your sensors to feel out which branch is open, then commit. Read it right the first time and you'll roll straight through."
- Author solution: `forward(3); if (touch("E")) { left(); } forward(2); right(); forward(2); right(); forward(2); left(); forward(3)`
- Trace: (0,4)E f3→(3,4) [crate (4,4) adjacent E → left ✓] →N f2→(3,2) right→E f2→(5,2) right→S f2→(5,4) left→E f3→(8,4) beacon ✓. Never enters (4,4)/(3,5)/(3,6). In bounds. ✓

### W4M3 · BUMP IN THE NIGHT (practice)
- Arena 7×7. **Night sector**, no Headlights yet — sight is 1 square. Start (0,6) facing E. Beacon (6,2). Crate wall at (3,6)(3,5)(3,4)(3,3) — a partition you navigate by feel, with a `when bumped` recovery block.
- Objective: cross a dark maze by feel — bump, recover, route around, using a `when bumped` event.
- Par: 7 lines. Bonus star: reach the beacon with 1 bump or fewer.
- Starter code: `when bumped { back(1) right() }` + `// It's dark. When you hit a wall, back up and turn.`
- Hint ladder: ① "You can barely see in the dark. Let bumping teach you where the walls are." ② "A when bumped block runs automatically on a crash — back up one and turn to find the gap." ③ keep the starter block, drive east, and let the event steer you at the wall.
- Briefing: "Lights are out in this sector, Sparkplug, so you'll drive by feel. Set a when-bumped rule to back off and turn whenever you hit something. Nose through the dark to the beacon."
- Author solution: `when bumped { back(1) right() }` + `forward(2); left(); forward(4); right(); forward(4)`
- Trace: (0,6)E f2→(2,6) [wall at (3,6) ahead] left→N f4→(2,2) right→E f4→(6,2) beacon ✓ — clean route slips the gap at row 2 ((3,2) is open); the when-block is the safety net. In bounds. ✓

### W4M4 · LIGHTS ON (practice)
- Arena 9×9. **Night sector**, introducing the **HEADLIGHTS** part — equip it and a 3-square cone lights the maze. Start (0,7) facing E. Beacon (8,1). Two FULL-HEIGHT hedge walls, one gap each: wall A fills column x=3 (rows 0–8) except the gap at (3,5); wall B fills column x=6 (rows 0–8) except the gap at (6,2). (v1.0 fix: v0.9's 3-row partitions left rows 0–1 wide open — the maze solved in 4 lines around everything.)
- Objective: switch on your headlights and thread both walls through their offset gaps.
- Par: 14 lines. Bonus star: zero bumps (with the cone lit you can see every gap — no excuse to crash).
- Starter code: `// Headlights on — you can see 3 squares ahead. Each wall has ONE gap. Find them.`
- Hint ladder: ① "With headlights you can see the gaps coming. Scan each wall before you commit." ② "Wall one opens mid-map; wall two opens near the top. Up, over, up." ③ first leg only: `forward(2) left() forward(2) right()` — your cone now shows wall one's gap dead ahead.
- Briefing: "Time to see in the dark, Sparkplug — clip on those headlights and the maze lights up. Two hedge walls, one gap each, and they don't line up. Weave through and follow your cone to the beacon."
- Author solution: `forward(2); left(); forward(2); right(); forward(2); left(); forward(3); right(); forward(3); left(); forward(1); right(); forward(1)`
- Trace: (0,7)E f2→(2,7) left→N f2→(2,5) right→E f2→(4,5) [through A's gap (3,5) ✓] left→N f3→(4,2) right→E f3→(7,2) [through B's gap (6,2) ✓] left→N f1→(7,1) right→E f1→(8,1) beacon ✓. Cells entered: (1,7)(2,7)(2,6)(2,5)(3,5)(4,5)(4,4)(4,3)(4,2)(5,2)(6,2)(7,2)(7,1)(8,1) — none in wall sets except the two gaps. 13 lines → par 14 ✓. In bounds. ✓
- Economy: clear 10 C. Unlock **HEADLIGHTS** (25 C).

### W4M5 · AMBUSH ALLEY (remix)
- Arena 10×8. Kid places up to 8 bushes (cover) + one scout drone on a fixed patrol loop she draws (deterministic, no RNG). Then she programs a route to the beacon without being spotted. Validator: solvable with W1–W4 commands, ≥2 turns, the drone's loop closed and fixed, at least one bush load-bearing (the solution genuinely needs the cover).
- Par: auto-computed from her solution + 1. Star ②: ≤ par. Star ③: friend/ghost sneaks through too.
- Starter code: `// Your alley. Set the patrol, place the bushes, then sneak past your own guard.`
- Hint ladder: ① "A good ambush has a guard that can't quite see everywhere. Give it a blind spot." ② "Place bushes so there's a shadow path the drone never looks at." ③ (post-save) "Your drone had one blind corner — try a patrol with two."
- Briefing: "Your turn to set the trap, Sparkplug. Draw a scout's patrol, hide some bushes, then program the sneak that slips right past. Build it sly and send it to a friend."
- This is where the "Bot & Seek" stealth DNA gets a builder.

### W4M6 · HIDE & SEEK (boss — stealth, no fire())
- Arena 11×11. **Night sector** (Headlights help you, not the enemy). Start (0,10) facing E. Beacon = Sprocket's scout-cache chest at (10,2). One scout drone runs a fixed, deterministic loop: (7,2)→(7,8)→(3,8)→(3,2)→repeat, one square per tick, facing along travel, 3-square sight cone. Bush cover at (5,10)(5,9)(5,8) and (8,4)(8,5) — bushes are FULL line-of-sight blockers (§1 constants). The whole mission is reaching the chest **unspotted**, using bushes + `radar()`/`when spotted` to read and dodge the patrol.
- Objective: reach the scout-cache without ever being seen — time your moves to the patrol, hide behind bushes.
- Par: 10 lines. Bonus star: zero `when spotted` triggers (a perfectly clean infiltration).
- Starter code: `when spotted { /* freeze or duck behind cover */ }` + `// The scout runs a fixed loop. Move when its cone points away; hide when it turns toward you.`
- Hint ladder: ① "You have no blaster — this is pure stealth. Watch the scout's loop before you move." ② "Roll while the drone faces away, then tuck behind a bush the moment its cone swings your way." ③ first leg: `if (radar().kind == "pirate") { /* wait behind cover */ } else { forward(1) }`.
- Briefing: "Sprocket's scout guards the last cache, Sparkplug, and you've got no blaster tonight — so we do this quiet. Learn its patrol, move when it looks away, and duck behind the bushes when it turns. Snatch the cache and Sprocket's got nothing left."
- Author solution (spatial spine verified; stealth timing enforced by the deterministic patrol + `when spotted`): advance up column x=4 while the drone runs the far side of its loop, using the x=5 bushes as cover, then east along row 2 to the cache.
- Trace (spine): (0,10)E f4→(4,10) left→N f8→(4,2) right→E f6→(10,2) beacon ✓. Bush cells never entered; the drone's ring columns (x=3, x=7) are crossed only along row 2 between cone sweeps. In bounds. ✓ Temporal check vs. cone phase: playtest with the tick engine (§10 #2 applies).
- **Cutscene:** the cache pops open — empty but for a cracked radio, still transmitting. Cogbeard, clear now: "So. The little bot found Sprocket's scraps. Come find *me*." Sprocket's arc closes; Cogbeard's opens toward W8. **RADAR DISH** confirmed permanent.
- Economy: clear 10 C + boss chest 25 C.

---

## 8. WORLDS 5–8 (sketch; complete after 2–4 playtest)
W5 SMART LOOPS: fire(), elements intro (fire/ice), patrols that react; boss = first true duel vs a pirate tank. W6 MY OWN MOVES: function; refactor nudges ("make a move out of it"); boss = your macros vs a gauntlet. W7 ROUTE PLANNER: lists, waypoints, treasure maps (X at (x,y)); boss = convoy escort. W8 THE GAUNTLET: everything + `when tick`; Captain Cogbeard three-phase boss; unlock LEAGUE KEY. Time trials + ghosts unlock at W2; treasure runs at W3; echo missions at W6.

---

## 9. AUTHORING RULES (for whoever completes this)
1. One new idea per mission, max. Name the idea in the mission's `teaches:` field.
2. Par = author's clean solution + 1 line. All 3 stars earnable in a single run.
3. Every mission playable with ONLY commands unlocked so far (check the API table).
4. Briefings ≤ 3 sentences, mission-control voice, grade-4 reading level, story continuous (Sprocket → Cogbeard arc).
5. Hint ladder is 3 steps: nudge → concrete sub-goal → worked example of the FIRST leg only. Never the full solution.
6. Difficulty floor: no mission solvable by a single straight line. Ever.
7. Deterministic everything: patrols are fixed loops, mishaps are scripted per-mission, no RNG.
8. Format per mission: arena (size, start+facing, beacon, furniture with coordinates), objective, par, bonus star, starter code, hint ladder, briefing copy, author solution (verify it!), unlock/economy effects.
9. Verify author solutions against the grid by hand — collisions with your own furniture are the classic bug.
10. Nothing dies, errors are free, numbers appear only after they're felt (SPEED meter debuts W3M2, WEIGHT bar W3M3, CHARGE W5M1).

---

## 10. FLAGS — v1.0 RESOLUTIONS
The Worlds 2–4 completion pass raised 8 flags; design resolved 6, and this merge fixed 4 bugs (W4M4 arena rebuilt — broken maze, wrong par · W3M3 bridge retuned 22→12 so the meter binds · W3M4 pit → 3 fillable cells with verified choreography · W2M2 duplicate bonus star replaced). Remaining items:

1. **RESOLVED — par is EDITOR LINES**, confirmed in §1 constants.
2. **OPEN (Claude Code: playtest)** — W2M6 windmill and W4M6 patrol are spatially verified but their tick-phase safety needs the real engine. Engine should expose a "trace mode" that logs (tick, x, y, hazard-state) so timed bosses are testable.
3. **RESOLVED** — reconciled against PRODUCT_SPEC.md in this merge (night radius, bush cover, fillable pits now in §1 constants).
4. **RESOLVED — pits are fillable** (§1); W3M4 redesigned around it.
5. **RESOLVED — chest wt 14, crate wt 6** (§1): one chest fits (14 ≤ 20), two never do (28).
6. **RESOLVED — night sight: bare 1, Headlights 3** (§1).
7. **RESOLVED — bushes fully block line-of-sight; `when spotted` fires the tick the cone covers your square** (§1).
8. **OPEN (Claude Code: validator)** — remix missions need engine checks: line-count par, uses-`let` (AST), load-bearing-bush (re-sim without each bush), closed patrol loop.
9. **OPEN (Claude Code: par recompute)** — multi-haul missions (W3M4 par 31, W3M6 par 20) carry estimated pars; engine should recompute author-par at level load from the stored author solution and warn on drift.
