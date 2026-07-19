# CodeBots — vendored CC0 **isometric** art (2.5D look)

Round 2 of asset vendoring. Target look: **"Age of 2048"** — a grid of *extruded* isometric tiles
with visible side faces, objects sitting on them with real height, a diorama island in clean sky.

Everything under `app/public/assets/iso/` is **CC0 / public domain**. Licenses were read on the source
page **and** in the license file shipped inside each zip, on 2026-07-14, before download. Exact wording
is quoted below. Nothing here is CC-BY. Nothing here is violent.

Total added: **3.4 MB, 355 files** (well under the 30 MB budget).
The pre-existing `tiles/ props/ ui/ sfx/ sfx-m4a/ music/` dirs (see `MANIFEST.md`) are untouched.

---

## 1. Sources & license verification

| # | Pack | Source page | License — page wording | License — wording shipped in the zip |
|---|------|-------------|------------------------|--------------------------------------|
| 1 | **Kenney — Isometric Blocks** (130 assets) | https://kenney.nl/assets/isometric-blocks | "License: Creative Commons CC0" | `License.txt`: *"License (Creative Commons Zero, CC0) — http://creativecommons.org/publicdomain/zero/1.0/ — You may use these assets in personal and commercial projects. Credit (Kenney or www.kenney.nl) would be nice but is not mandatory."* |
| 2 | **Kenney — Isometric Tiles Landscape** (128 assets) | https://kenney.nl/assets/isometric-tiles-landscape | "License: Creative Commons CC0" | `License.txt`: *"Isometric Landscape by Kenney Vleugels for Kenney (www.kenney.nl) — License (Creative Commons Zero, CC0) — http://creativecommons.org/publicdomain/zero/1.0/ — You may use these graphics in personal and commercial projects. Credit (Kenney or www.kenney.nl) would be nice but is not mandatory."* |
| 3 | **Kenney — Isometric Miniature Prototype** (60 shapes × 4 rotations) | https://kenney.nl/assets/isometric-miniature-prototype | "License: Creative Commons CC0" | `License.txt`: *"Prototype Pack (2.3) — License: (Creative Commons Zero, CC0) — http://creativecommons.org/publicdomain/zero/1.0/ — This content is free to use in personal, educational and commercial projects. Support us by crediting Kenney or www.kenney.nl (this is not mandatory)"* |

Zips fetched from the `Download` link on each page:
`https://kenney.nl/media/pages/assets/isometric-blocks/86a0152f5b-1677662261/kenney_isometric-blocks.zip`,
`.../isometric-tiles-landscape/37eb18a8d1-1677695072/kenney_isometric-landscape.zip`,
`.../isometric-miniature-prototype/8c46fe34a0-1674932174/kenney_isometric-miniature-prototype.zip`.
Each pack's `License.txt` is vendored next to its sprites.

### Evaluated and **rejected**

| Pack | Why not |
|---|---|
| **Isometric Roads** (`/assets/isometric-roads`) | Has the only iso trees I found — **but the shipped `readme.txt` contains no CC0 statement** ("Road tile graphics (NOVA) by Kenney Vleugels… Credit would be nice but is not mandatory"), only the web page claims CC0. Under a CC0-only rule we do not ship on a page-only claim. Also the wrong projection (100×48 footprint). **Not vendored.** |
| **Isometric Miniature Bases** | Wooden *tabletop miniature* bases (a model stands on them). Not ground tiles. |
| **Isometric Tiles City / Buildings / Roads Water** | City buildings and bridges; nothing our vocabulary needs. |
| **Isometric Tiles Vehicles** (540 files) | Vehicles only; would eat the size budget for reference value alone. |
| **Hexagon Kit, Tower Defense** | Hex is the wrong grid; Tower Defense is turrets/weapons — vocabulary forbids it. |

---

## 2. THE PROJECTION NUMBERS

**Measured from the actual pixels** (alpha silhouette + top-face/side-face colour boundary), then
**verified by rendering a 6×6 grid plus stacked walls and confirming zero gaps and zero overlap.**
These are the numbers Phaser needs. Do not guess them from the file size.

### 2a. Isometric Blocks — **PRIMARY** (true isometric)

| Fact | Value |
|---|---|
| Sprite canvas | **111 × 128 px**, every single file, untrimmed, uniform |
| **Top-face diamond (the grid footprint)** | **111 × 64 px** — apex `(55.5, 0)`, right `(111, 32)`, bottom `(55.5, 64)`, left `(0, 32)` |
| **Projection** | **TRUE ISOMETRIC (~30°)**, *not* 2:1 dimetric. Ratio 111 : 64 = 1.734 ≈ √3; edge angle `atan(32 / 55.5)` = **29.96°** |
| **Block height (extrusion / side face)** | **64 px** — sprite = 64 (diamond) + 64 (skirt) = 128 |
| Bottom face | diamond spanning y 64…128, centre `(55.5, 96)` |
| **Grid step** | `screenX = (col − row) × 55.5`  ·  `screenY = (col + row) × 32` |
| **Stacking (height!)** | one level up = **`y − 64`**. A cube stacked on a cube is seamless — verified. This is how a wall reads TALL: **draw the same wall block twice, at level 1 and level 2.** |
| **Anchor / origin** | Top-face centre is at `(55.5, 32)` in the sprite → **Phaser `setOrigin(0.5, 0.25)`** (32 / 128). With that origin, `sprite.setPosition(ox + (col−row)*55.5, oy + (col+row)*32 − 64*level)` puts the block's *walkable top surface* exactly on the grid point — so a bot at `(col,row,level)` uses the identical formula. If you prefer bottom-centre: `setOrigin(0.5, 1.0)`, and the grid point is then **96 px above the sprite's bottom edge**. |
| **Depth sort** | draw ascending by `(col + row)`, ties by `level` ascending. Verified against the render. |
| Seams | `55.5` is a half-pixel. **Do not `Math.round()` the x** — rounding produces 1 px seams. Use float positions (Phaser is fine with this), or run the whole scene at 2× scale where every step is an integer (111, 64). |
| Atlas | `ground/kenney_isometric-blocks/spritesheet/allTiles_sheet.png` + `.xml` (Kenney/Starling XML — `this.load.atlasXML()`). Per-tile PNGs are also vendored. |

### 2b. Isometric Landscape — secondary (2:1 dimetric) — **DIFFERENT PROJECTION**

| Fact | Value |
|---|---|
| Sprite canvas | 132 px wide; height **varies with elevation**: 83 (flat) / 99 / 131 |
| Footprint diamond | **132 × 66 px** — exactly 2:1 → **DIMETRIC, 26.57°** |
| Skirt on a flat tile | 16 px (so a flat tile is 66 + 16 ≈ 83 tall) |
| Elevation step | +16 px of sprite height per level |
| Grid step | `x = (col − row) × 66` · `y = (col + row) × 33` |
| Anchor | **bottom-centre `setOrigin(0.5, 1.0)`** — every sprite is bottom-aligned, the base's bottom vertex sits on the sprite's bottom edge. Grid point (top surface of a *flat* tile) = **49 px above the bottom edge** (16 skirt + 33 half-diamond). |

### 2c. Isometric Miniature Prototype — reference only (2:1 dimetric)

| Fact | Value |
|---|---|
| Sprite canvas | **256 × 512 px**, all files, untrimmed — so one global anchor works for the whole kit |
| Footprint diamond | **256 × 128 px** — exactly 2:1 → **DIMETRIC, 26.57°** |
| Anchor | the floor diamond's centre is at `(128, 447.5)` → **`setOrigin(0.5, 0.874)`** (447.5 / 512) |
| Grid step | `x = (col − row) × 128` · `y = (col + row) × 64` |
| Block lift | a full `block_*` raises the surface by **≈158 px** |
| Rotations | every shape ships as `_N / _E / _S / _W` |
| Look | untextured **orange greybox**. Ship-quality art it is not. |

### 2d. ⚠️ THE COMPATIBILITY RULE (the #1 way this goes wrong)

**These three packs are three different projections. Never mix them in one scene.**

- Blocks is **true isometric (30°)** with a **111 × 64** footprint.
- Landscape and Miniature are **2:1 dimetric (26.57°)** — and even *they* disagree with each other
  (132 × 66 vs 256 × 128), so they are not interchangeable either.
- A Landscape tile dropped into a Blocks scene will visibly shear: its edges run at a different angle.
  No amount of scaling fixes an angle mismatch.

Pick one family. Everything else in this folder is **reference / fallback only**.

---

## 3. Recommendation — ONE primary family

> ### Primary: **Kenney Isometric Blocks** (`iso/ground/kenney_isometric-blocks/`, `iso/props/kenney_isometric-blocks/`)

Honest reasoning:

- **It *is* the reference look.** Flat-shaded extruded cubes with clearly lit top / left / right faces on a
  clean sky background — the Age-of-2048 diorama, exactly.
- **Height is free and exact.** The block body is 64 px, the diamond is 64 px tall, so `level → y − 64`
  stacks perfectly. Walls read TALL by drawing two. A pit is one level down and a crate dropped in it
  ends **flush with the floor** — the fillable-pit mechanic is geometrically free.
- **Uniform 111 × 128 canvases** mean one origin for every sprite in the game. No per-sprite offset table.
- **135 tiles, 2 MB.** Cheap.
- **What it costs us:** the pack is *only* cubes. It has **no ramps, no trees, no rocks, no characters,
  no props that aren't cubes, and no UI.** Everything in §5 has to be drawn.

The alternative (Landscape family) has water, hills and ramps out of the box — but its tiles are thin
slabs, so **walls cannot read as tall**, which is the one thing the brief insists on. Rejected as primary.

Miniature Prototype is kept purely as a **shape reference** for the art we must draw ourselves: it shows
the ramp, the stairs, the door, the floor switch, the fence and the ladder as clean iso geometry.

---

## 4. "Maps to" — the primary family

All paths relative to `app/public/assets/iso/`.

| Game concept | File | Notes |
|---|---|---|
| **Floor (grass)** | `ground/…/voxel/voxelTile_55.png` | grass top on dirt body — the default floor |
| Floor (grass, alt) | `ground/…/platformer/platformerTile_48.png`, `voxel/voxelTile_10.png` | 10 = grass on stone |
| Floor (dirt / path) | `ground/…/voxel/voxelTile_53.png`, `voxelTile_28.png` | |
| Floor (sand) | `ground/…/voxel/voxelTile_20.png`, `voxelTile_25.png` | |
| Floor (snow / ice) | `ground/…/voxel/voxelTile_21.png`, `voxelTile_47.png` | |
| Floor (stone) | `ground/…/voxel/voxelTile_29.png` (cobble), `voxelTile_50.png` | |
| **Steel wall (TALL)** | `ground/…/platformer/platformerTile_35.png` (plain slate), `_30`, `_31` (riveted metal), `_34` | **draw twice: level 1 + level 2.** That is the whole trick. |
| Brick wall | `ground/…/voxel/voxelTile_19.png`, `_22`, `_27` | warmer alternative |
| **Crate (carryable)** | `props/…/platformerTile_38.png`, `_39.png` | wooden, bolted corners. `_44` / `_45` are the same crate, darker |
| **Water terrain** | `ground/…/abstract/abstractTile_26.png` (wavy blue block) | best water; `abstractTile_08` has a white foam rim (good island edge); `voxel/voxelTile_24` is flat blue |
| **Hole / pit** | *draw nothing* → the sky shows through (diorama edge), **or** sink a dark cube one level: `ground/…/abstract/abstractTile_09/_10/_11` | |
| **Fillable pit** | pit at `level −1` + drop a crate → crate top lands **flush** with the floor (both are 64 px) | free, no art needed |
| **Gate / locked block** | `props/…/platformerTile_40.png` (yellow keyhole), `_41` (green), `_46` (orange), `_47` (blue); `abstractTile_16/_17` | 4 colours = 4 keyed gates. Static only — no open animation |
| **Beacon / goal marker** | `props/…/platformerTile_36.png`, `_37`, `_42`, `_43` | glowing `!` and `o` boxes |
| Hazard / no-go tile | `props/…/abstractTile_04.png`, `abstractTile_32.png`; `ground/…/voxel/voxelTile_51/_52` | molten-top and red-veined cubes. Non-violent, just "don't stand here" |
| Wood platform | `props/…/voxelTile_26.png` (planks), `voxelTile_18.png` | |
| **Ramp** | ❌ **not in this pack** | shape reference: `props/kenney_isometric-miniature-prototype/slope_*.png`, `stairs_*.png` |
| **Tree / rock skirt decor** | ❌ **not in this pack** | must be drawn in the cube idiom |
| **UI / frames** | ❌ **no Kenney iso pack ships UI** | keep using the existing `assets/ui/kenney_ui-pack` — HUD is screen-space, so projection doesn't apply to it |

### Shape reference kit (`props/kenney_isometric-miniature-prototype/`, 80 files, N/E/S/W)

`block`, `blockHalf`, `blockAngle`, `crate`, `doorClosed`, `doorOpen`, `doorway`, `fence`, `ladder`,
`slope`, `slopeSmall`, `stairs`, `stairsOpen`, `switchFloorOff`, `switchFloorOn`, `wall`, `wallCorner`,
`wallHalf`, `floor`, `arrow`. **Orange greybox, 2:1 dimetric — do not ship these into a Blocks scene.**
They exist so the artist can see what a correct iso ramp / door / floor-switch / fence *looks like*.

---

## 5. GAP LIST — iso art we still do not have

CC0 does not cover the things that make this game *ours*. All of these must be drawn, in the
**111 × 64 true-isometric, 64-px-cube** idiom (a bot occupies one 111×64 footprint):

1. **The bot herself, in isometric** — 4 facings (N/E/S/W) × idle + walk + carry, plus a turn. Nothing in
   any CC0 iso pack is a robot; the `props/…/miniature-prototype` human is a greybox, wrong projection.
2. **Carry pose** — bot + crate held above her head (the crate is 111×128; she must read *under* it).
3. **The rival / the drone** — no CC0 equivalent at all.
4. **Gates that open** — we have 4 static keyhole cubes; an open/closed pair and the opening frames are ours.
5. **The beacon** — the `!` cube is a stand-in, not a beacon. Needs a glow / pulse / light shaft.
6. **Status FX** — scan pulse, reboot shimmer, sparks, the "tagged" flash, the trail behind a moving bot.
7. **Soft drop shadow** — the reference look has one under every object; Kenney blocks have none baked in.
   Cheap: one 111×64 dark ellipse at 25% alpha, drawn on the tile beneath the object.
8. **Animated water** — `abstractTile_26` is a static wave. Needs 3–4 frames or a shader wobble.
9. **A ramp block** — the one true geometry hole in the primary pack (see the slope reference above).
10. **Trees / rocks / skirt decor** — for the island edge. Must be cube-idiom, not the Landscape lollipops.
11. **Iso UI framing** — none exists as CC0. HUD stays screen-space (existing `ui/kenney_ui-pack`).

---

## 6. Directory layout

```
iso/
├── ground/
│   ├── kenney_isometric-blocks/     ← PRIMARY. 111×128, true iso. License.txt
│   │   ├── voxel/       (53 terrain cubes: grass, dirt, sand, snow, stone, brick, ore)
│   │   ├── abstract/    (26 cubes: water, dark, molten, coloured)
│   │   ├── platformer/  (36 cubes: metal, stone brick, grass)
│   │   └── spritesheet/ (allTiles_sheet.png + .xml, and per-family sheets)
│   └── kenney_isometric-landscape/  ← SECONDARY, 2:1 dimetric. DO NOT MIX. License.txt
└── props/
    ├── kenney_isometric-blocks/     ← crates, gates, markers, hazards. License.txt
    └── kenney_isometric-miniature-prototype/  ← REFERENCE greybox shapes. License.txt
```

CC0 = no attribution required; modification, redistribution and commercial use all permitted.
Recolouring / re-cutting these tiles is unrestricted.
