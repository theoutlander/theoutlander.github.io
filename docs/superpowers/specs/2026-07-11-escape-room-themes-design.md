# Escape Room Themes — Design

**Goal:** Make Maya's Escape Room feel new each time she plays, by letting her pick from several fully reskinned themes (or roll a random one), instead of always playing the same Haunted Mansion.

## Why this shape

The game already has five proven, tested puzzle mechanics forming the room flow:
1. **Find-the-key-among-5** (Chair Parlor: 5 chairs, one hides a key, 4 hide clues, only 3 sits allowed)
2. **Brew/mix puzzle** (Potion Kitchen: tap the cauldron, follow a recipe)
3. **Word-lock + hidden-key puzzle** (Spooky Library: spell a magic word, find a key behind one of 12 books, owl gives hints)
4. **Find-the-true-spot + minigame** (Mirror Room: 6 objects, one is the real hiding spot per the collected riddle-scrolls, ghost demands a piano song)
5. **Exit puzzle** (Inside the Mirror: step through to win)

Rather than invent new puzzle types per theme (5x the engineering and testing risk for the same "feels new" payoff), each theme **reskins these same five mechanics**: different room names, different objects standing in for chairs/cauldron/books/spots, different riddles, different jokes, and a different exit prop instead of the mirror. The underlying state machine, door-gating logic, gem system, and puzzle mini-games (`escape-room-puzzles.js`) are unchanged and fully reused.

**Visual palette stays as-is for this pass.** The theme identity comes from what she reads and interacts with (names, objects, riddles, jokes) — not from new CSS per theme. Re-theming the color palette per scene (6 themes × ~6 scenes of wall gradients) is real effort for a payoff a kid mostly won't consciously register next to brand-new jokes and objects. Flagged as a future enhancement, not built now.

## Themes (6 total, pulling from Maya's actual interests + her existing games)

| Theme | Ties to | Room 1 (find key) | Room 2 (brew) | Room 3 (word+key) | Room 4 (find spot) | Room 5 (exit) |
|---|---|---|---|---|---|---|
| **Haunted Mansion** (existing) | spooky/ghosts | Chair Parlor | Potion Kitchen | Spooky Library | Mirror Room | Inside the Mirror |
| **Pirate Ship** (new) | pirates | Captain's Cabin (5 barrels) | Ship's Galley (grog pot) | Map Room (parrot, not owl) | Crow's Nest (spyglass) | Through the Porthole |
| **Critter Burrow** (new) | animals | Bunny Burrow (5 tunnels) | Honey Kitchen | Reading Den (a wise tortoise) | Treehouse Lookout | Through the Hollow Log |
| **Yarn Attic** (new) | knitting → Sewing Museum/Shop | Basket Row (5 yarn baskets) | Dye Pot Corner | Pattern Library (a cat in yarn) | Sewing Mirror Alcove | Through the Looking-Glass |
| **Blueprint Workshop** (new) | building → Build On! | Toolbox Row (5 toolboxes) | Mixing Station | Blueprint Library (a helper robot) | Periscope Bay | Through the Hatch |
| **Greenhouse Garden** (new) | gardening → Garden Work! | Flowerpot Row (5 pots) | Compost Mixer | Seed Catalog Room (a ladybug) | Garden Pond | Through the Garden Gate |

Each new theme needs the same shape of content the Mansion already has: 6 object riddles + fail lines (find-the-spot room), 5 decoy clue lines, 3 chair/tunnel/basket-sit fail lines, 4 wrong-book/wrong-container fail lines, and door-lock messages. All in the game's existing joke voice: silly, self-contained one-liners, no explaining the punchline.

## Selection UI

Title screen gets a theme picker: a row/grid of theme cards (icon + name), plus a **"🎲 Surprise Me"** button that picks one at random. Tapping a theme (or Surprise Me) starts the game with that theme active. This was chosen over theme-only-random or menu-only so she gets both a favorite she can return to and genuine variety.

## Architecture

- A new `THEMES` data structure (one entry per theme) holding: id, display name/icon, the 5 room display names, the `SPOTS` array (6 objects), `FAKE_CLUES` (5), `DUSTY_LINES` (3), `WRONG_BOOK_LINES` (4), the owl/hint-animal's name+emoji, and the exit prop's emoji/label (replacing "mirror" text/icons in messages).
- `setupRound()`/`newState()` takes the active theme id and pulls content from `THEMES[id]` instead of the current hardcoded top-level constants.
- All message strings that currently hardcode "mirror" (e.g. "tap the mirror!", room name "The Mirror Room") become theme-driven via the exit-prop/room-name fields.
- Existing per-room CSS classes, door-gating logic (`doorClick`, `doorKClick`, `doorLClick`), gem system, and `Puzzles.wordSpell`/`Puzzles.pianoSong` are untouched.
- `mayaEscapeBest` best-time record stays global across themes (not per-theme) — simplest, and consistent with "one escape room, different looks."

## Suggested phasing

This is a large content build (5 new theme packs × ~20 written lines each, plus the engine refactor to make content theme-driven). To de-risk it: first refactor the engine to pull from `THEMES` and stand up **one** new theme (Pirate Ship) end-to-end — verify the whole flow plays correctly with a non-Mansion theme before mass-producing the same shape four more times. Then the remaining four themes are a content-only pass (no more engine changes), which can go faster and even be parallelized across themes since they don't depend on each other.

## Explicitly out of scope for this pass

- Randomizing the room *order* within a playthrough (rooms stay in the same 5-step sequence; only their theme/skin changes) — a separate, riskier change to the door-gating chain.
- New puzzle mechanics beyond the existing 5.
- Per-theme color palettes / wall art.
- Per-theme best-time tracking.

These can be revisited as a fast-follow once Maya's played the themes.
