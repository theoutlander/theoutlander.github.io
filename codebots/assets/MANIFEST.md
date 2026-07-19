# CodeBots vendored assets — provenance manifest

Milestone 16 prep (LOOK sprint). Every file under `app/public/assets/` is **CC0 / public domain**.
No attribution-required licenses are vendored. Licenses were verified on each source page on
2026-07-14 before download; exact wording quoted below.

Total: 946 files, ~10 MB (tiles 1.2M / props 1.0M / ui 1.7M / sfx 1.1M / music 5.0M).

## Sources & license verification

| # | Pack | Source URL | License (exact page wording) |
|---|------|-----------|------------------------------|
| 1 | Kenney — Racing Pack | https://kenney.nl/assets/racing-pack | "License: Creative Commons CC0" (page links creativecommons.org/publicdomain/zero/1.0/; page meta: "CC0 licensed!") |
| 2 | Kenney — Sokoban Pack | https://kenney.nl/assets/sokoban | "License: Creative Commons CC0" |
| 3 | Kenney — Foliage Pack | https://kenney.nl/assets/foliage-pack | "License: Creative Commons CC0" |
| 4 | Kenney — Map Pack | https://kenney.nl/assets/map-pack | "License: Creative Commons CC0" |
| 5 | Kenney — UI Pack (2.0) | https://kenney.nl/assets/ui-pack | "License: Creative Commons CC0" |
| 6 | Kenney — Interface Sounds | https://kenney.nl/assets/interface-sounds | "License: Creative Commons CC0" |
| 7 | Kenney — Digital Audio | https://kenney.nl/assets/digital-audio | "License: Creative Commons CC0" |
| 8 | Kenney — Impact Sounds | https://kenney.nl/assets/impact-sounds | "License: Creative Commons CC0" |
| 9 | Kenney — Sci-Fi Sounds | https://kenney.nl/assets/sci-fi-sounds | "License: Creative Commons CC0" |
| 10 | Kenney — Music Jingles | https://kenney.nl/assets/music-jingles | "License: Creative Commons CC0" |
| 11 | Juhani Junkala — 5 Chiptunes (Action) ("Retro Game Music Pack") | https://opengameart.org/content/5-chiptunes-action | OpenGameArt license label: "CC0". Shipped INFO.txt: "These music tracks have been released under CC0 creative commons license. You can do anything you want with these tunes." Author: Juhani Junkala (OGA user SubspaceAudio). |
| 12 | Juhani Junkala — 4 Chiptunes (Adventure) ("Chiptune Adventures") | https://opengameart.org/content/4-chiptunes-adventure | OpenGameArt license label: "CC0". Same CC0 INFO.txt shipped in the zip. |

Download URLs used (Kenney zips, fetched 2026-07-14): the `Download` link on each page above,
e.g. `https://kenney.nl/media/pages/assets/<slug>/<hash>/kenney_<slug>.zip`. Junkala zips fetched from
`https://opengameart.org/sites/default/files/...` as linked on the OGA pages.

CC0 = no attribution required, modification and redistribution allowed, including commercial use.
Re-encoding (see Music notes) is therefore unrestricted.

## tiles/ (244 files, 1.2 MB)

| Path | From | Maps to |
|------|------|---------|
| `tiles/kenney_racing-pack/grass/land_grass01–14.png` | Racing Pack, 128 px | base grass floor (bright flat green with leaf specks) |
| `tiles/kenney_racing-pack/dirt/land_dirt01–14.png` | Racing Pack, 128 px | dirt floor / dug areas |
| `tiles/kenney_racing-pack/sand/land_sand01–14.png` | Racing Pack, 128 px | sand floor variant |
| `tiles/kenney_map-pack/mapTile_001–188.png` | Map Pack, 64 px | terrain chunks with chunky rounded edges (grass/dirt/sand/snow plateaus), yellow path tiles → world-map / level-select map, numbered green markers → level badges, small decor (trees, cacti, mushrooms, bushes, castle) |
| `tiles/kenney_sokoban-pack/ground/ground_01–06.png` | Sokoban Pack (Retina), 128 px | neutral workshop/indoor floor |
| `tiles/kenney_sokoban-pack/blocks/block_01–08.png` | Sokoban Pack (Retina), 128 px | wall / blocker tiles |

Excluded on purpose: all Racing Pack road tiles, barriers, tribunes, cars, skidmarks (race-specific);
Top-down Tanks Redux was evaluated and **rejected** entirely — its terrain is inseparable in spirit from
the tank/weapon content and our vocabulary forbids weapons.

## props/ (203 files, 1.0 MB)

| Path | From | Maps to |
|------|------|---------|
| `props/kenney_racing-pack/tree_large.png, tree_small.png` | Racing Pack | trees (obstacles/decor) |
| `props/kenney_racing-pack/rock1–3.png` | Racing Pack | rocks (obstacles) |
| `props/kenney_racing-pack/barrel_blue.png, barrel_red.png` | Racing Pack | crate/barrel candidates (carryable) |
| `props/kenney_racing-pack/cone_straight.png, cone_down.png` | Racing Pack | markers / knockable decor |
| `props/kenney_racing-pack/arrow_yellow.png, arrow_white.png` | Racing Pack | direction hints on the floor |
| `props/kenney_racing-pack/oil.png` | Racing Pack | slick/spill decal |
| `props/kenney_sokoban-pack/crates/crate_01–45.png` | Sokoban Pack (Retina, 128 px) | THE crate candidates (many colors/labels — pick 2–3) |
| `props/kenney_sokoban-pack/environment/environment_01–12.png` | Sokoban Pack (Retina) | bushes/trees/decor in the same chunky style |
| `props/kenney_sokoban-pack/player/player_01–24.png` | Sokoban Pack (Retina) | placeholder character, 4 directions × walk frames (cute kid w/ cap — NOT the bot, see gaps) |
| `props/kenney_foliage-pack/foliagePack_0xx.png` | Foliage Pack (Retina) | flowers, bushes, plants — bright flat decor |
| `props/kenney_foliage-pack/leaves/foliagePack_leaves_0xx.png` | Foliage Pack (Retina) | single leaves → particles/confetti-adjacent decals |

## ui/ (434 files, 1.7 MB)

Kenney UI Pack 2.0, `Default` resolution only (Double/2x omitted for size; re-fetch if needed).

| Path | Maps to |
|------|---------|
| `ui/kenney_ui-pack/{blue,green,grey,red,yellow}/button_*.png` | chunky glossy buttons (rect/round/square, with depth) → run/stop/step buttons |
| `ui/kenney_ui-pack/{...}/star.png, star_outline.png, star_outline_depth.png` | 1–3 star level rating |
| `ui/kenney_ui-pack/{...}/check_*, slide_*, icon_checkmark/cross/circle` | toggles, sliders, pass/fail marks |
| `ui/kenney_ui-pack/extra/input_*, divider*, icon_play/repeat/arrow_*` | panels, inputs, play/replay icons |

## sfx/ (60 files, 1.1 MB — shortlist, prune after listening)

| File(s) | From | Maps to |
|---------|------|---------|
| `kenney_digital-audio/twoTone1, threeTone1` | Digital Audio | **honk** candidates (beepy robot honk) |
| `kenney_interface-sounds/bong_001` | Interface Sounds | honk (softer) candidate |
| `kenney_impact-sounds/impactSoft_*, impactWood_*, impactTin_medium_000, impactGeneric_light_000` | Impact Sounds | **clunk** — bot bumps wall / crate set down |
| `kenney_impact-sounds/impactMetal_light_000` | Impact Sounds | metallic bot tap |
| `kenney_impact-sounds/impactBell_heavy_000` | Impact Sounds | gate bell / checkpoint |
| `kenney_impact-sounds/footstep_grass_000, footstep_concrete_000` | Impact Sounds | movement ticks per terrain |
| `kenney_digital-audio/powerUp1, powerUp5, powerUp7` | Digital Audio | **coin/pickup** + power-up candidates |
| `kenney_digital-audio/phaserUp1, phaserUp3, zap1, zapThreeToneUp` | Digital Audio | **zap/launch** (non-weapon energy zap) |
| `kenney_digital-audio/phaserDown1, lowDown` | Digital Audio | **freeze** / power-down candidates |
| `kenney_digital-audio/highUp, pepSound1` | Digital Audio | small positive blips |
| `kenney_sci-fi-sounds/forceField_000, forceField_001` | Sci-Fi Sounds | **freeze**/shield shimmer |
| `kenney_sci-fi-sounds/thrusterFire_000` | Sci-Fi Sounds | **whoosh**/launch |
| `kenney_sci-fi-sounds/slime_000, slime_001` | Sci-Fi Sounds | **splash**-ish (goopy) — real water splash is a gap |
| `kenney_sci-fi-sounds/doorOpen_000, doorClose_000` | Sci-Fi Sounds | **gate** open/close |
| `kenney_sci-fi-sounds/computerNoise_000` | Sci-Fi Sounds | bot "thinking" chatter |
| `kenney_interface-sounds/click_001–2, select_001, switch_001, toggle_001, tick-adjacent` | Interface Sounds | **UI clicks**, block snap |
| `kenney_interface-sounds/confirmation_001–2, question_001` | Interface Sounds | success blip / prompt |
| `kenney_interface-sounds/error_004` | Interface Sounds | gentle "nope" |
| `kenney_interface-sounds/drop_001–2` | Interface Sounds | pick up / put down |
| `kenney_interface-sounds/open_001, close_001` | Interface Sounds | panel open/close |
| `kenney_interface-sounds/glass_002` | Interface Sounds | freeze-crystal tink |
| `kenney_music-jingles/jingles_NES00–03, 08–10, 13` | Music Jingles (8-bit set) | **celebration** / win-lose / 3-star sting candidates (needs listening triage) |
| `kenney_ui-pack-sounds/click-a/b, switch-a/b, tap-a/b` | UI Pack (bundled sounds) | UI click set matched to the UI art |

Deliberately NOT vendored: all `laser*`, `explosion*`, `impactPunch_*` (weapon/violence adjacent —
vocabulary forbids them; celebration "explosions" will be confetti VFX instead).

## music/ (5 tracks, 5.0 MB) — all Juhani Junkala, CC0

| File | Source track | Maps to |
|------|--------------|---------|
| `juhani-junkala/chiptune-adventures-4-stage-select.ogg` | Chiptune Adventures #4 "Stage Select" | calm / workshop / level-select loop |
| `juhani-junkala/chiptune-adventures-1-stage-1.ogg` | Chiptune Adventures #1 "Stage 1" | driving / run-energy loop |
| `juhani-junkala/retro-game-music-title-screen.m4a` | 5 Chiptunes (Action) "Title Screen" | title/menu loop |
| `juhani-junkala/retro-game-music-level-1.m4a` | 5 Chiptunes (Action) "Level 1" | run-energy loop (alt) |
| `juhani-junkala/retro-game-music-ending.m4a` | 5 Chiptunes (Action) "Ending" | **victory** / world-clear |

Notes: the Action pack ships WAV-only (49.6 MB zip); the three tracks were transcoded to AAC
(.m4a, 160 kbps) locally — permitted by CC0. The two Adventures tracks are the artist's own OGG encodes.
**Format caveat:** Safari/iPadOS does not play Ogg Vorbis. Before shipping, transcode the .ogg sfx/music
to .m4a (or dual-format load) — CC0 allows it; keep this manifest as provenance.

## Best-fit assessment (honest)

**Winner: Kenney Map Pack + Sokoban (Retina) + Foliage Pack.** They share one language — flat,
bright, chunky rounded shapes, soft outlines, cute proportions — exactly the Mario-ish look we want,
and the Map Pack's plateau tiles + yellow paths + numbered markers are a ready-made world/level-select
map. Sokoban's 128 px retina crates/ground/blocks are the right scale for gameplay tiles. Racing Pack's
grass/dirt/sand washes are clean seamless base terrain under those props but are texture-flat (no
outlines) — usable as ground, not as hero art. UI Pack 2.0's glossy rounded buttons + stars fit the
chunky-friendly direction well enough for the LOOK sprint, though its gloss is slightly different from
the flat-matte sprite style.

## Gap list — nothing CC0 covers these (commission / AI-gen list)

1. **The bot itself** — top priority. No CC0 pack has a cute, top-down, 4-direction robot with
   idle/drive/carry/honk/frozen states. Sokoban "player" kid is only a stand-in.
2. **Water** — Racing Pack has none; Map Pack has only a small water/ice-textured tile. Need proper
   water tiles + shoreline transitions + splash animation (and a real splash SFX — the slime is a stand-in).
3. **Game-specific objects in one style**: launch pad, gate/door, pit (open + filled), pressure plate,
   goal pad, coin/gear pickup (UI star exists, but no in-world coin sprite).
4. **Effect animations**: confetti/celebration burst, freeze-over (ice encasing), zap arc, dust puff,
   sparkle trail.
5. **A real honk** — nothing CC0 sounded like a friendly vehicle honk; twoTone/threeTone/bong are
   approximations. Commission or synthesize.
6. **Matching tree/bush set at 128 px with outlines** — foliage/map decor is 64-ish px; upscaling is
   passable but a drawn 128 px set in the bot's final style will read better.
7. **Custom jingle set** — the NES jingles work as stings, but a 3-note "CodeBots" motif (win / 3-star /
   gentle-fail) should eventually be commissioned.

## Milestone 17 usage record (THE LOOK)

What actually shipped into the game, out of the shortlists above:

- **Tiles/props in play** (per-world slice in `world/art.ts`): Racing grass
  `land_grass04/11` (W1, W4 dusk-tinted), Racing sand `land_sand05/12` (W2),
  Sokoban `ground_04` (W3); walls `block_05/08/07/03` per world; crates
  `crate_09` (immovable, every world) and `crate_42` (carryable, every world);
  Racing `tree_small` as the cover bush, `tree_large` + Foliage `017/041` as
  diorama trees; Foliage `021/001/053` as skirt tufts/flowers/bushes.
- **SFX winners** (slot table + runners-up in `world/sfx-map.ts`): transcoded
  to `sfx-m4a/*.m4a` (AAC 96k, loudnorm −18 LUFS; zap/freeze/whoosh trimmed).
  Safari/iPadOS plays no ogg — a test (`tests/unit/sfx-map.test.ts`) pins that
  no source references an .ogg path.
- **Music**: the three Junkala tracks (Stage Select = calm, Stage 1 = run,
  Ending = the 3-star lap) via `world/music.ts`; the two artist .ogg encodes
  gained local .m4a transcodes alongside (CC0 permits it).
- **Still synth on purpose**: the bot's voice (chirp/boop/honk), the 3-note
  motif, and the comic whistles (tow, spinout) — her voice, not stock sound.
- The .ogg/.wav originals stay vendored as provenance; the app never loads them.

## Not fetched / follow-ups

- Nothing was blocked; all sources downloaded successfully.
- UI Pack `Double` (2x) resolution and the packs' vector sources were not vendored (size); re-fetch
  from the URLs above if needed — same CC0 license.
- Junkala's Adventures "Stage 2" and "Boss Fight" tracks and the full 45-crate sokoban set beyond what
  we keep can be pruned/expanded later from the same CC0 sources.
