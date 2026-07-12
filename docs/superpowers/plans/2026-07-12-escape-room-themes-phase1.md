# Escape Room Themes — Phase 1 (Engine + Pirate Ship + Picker) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing Haunted Mansion content theme-driven and add one brand-new theme (Pirate Ship), with a title-screen picker (theme cards + "Surprise Me") so Maya can choose or randomize which version of the escape room she plays.

**Architecture:** A new `escape-room-themes.js` file holds a `THEMES` data object (one entry per theme: room names, messages, puzzle-object riddles/jokes, hint-animal, exit-prop name). `escape-room-game.js` is refactored so its existing `SPOTS`/`FAKE_CLUES`/`DUSTY_LINES`/`WRONG_BOOK_LINES` module variables are *assigned* from the active theme (via a new `applyTheme(id)` function) instead of being hardcoded constants — every function that already reads those variables (chair logic, book logic, room2 spot logic) needs **zero changes**, because they keep reading the same variable names. Only the ~15 call sites that hardcode theme-specific prose ("mirror", "owl", "Potion Kitchen", etc.) get swapped to read from the active theme. The title screen becomes a picker (one card per theme + a Surprise Me button) instead of a single "Enter the Mansion" button.

**Tech Stack:** Vanilla JS, no build step, no test framework for this game — verify with `node --check <file>.js` for syntax and live browser testing (load the game, play through both themes) per this project's established pattern.

## Global Constraints

- Emoji-only graphics — no external image assets (projects/maya/CLAUDE.md).
- All touch targets stay at least 44px (existing `.theme-card`/`.big-btn` sizing must respect this).
- No build step — plain `<script>` tags, load order matters.
- Per the approved design spec (`docs/superpowers/specs/2026-07-11-escape-room-themes-design.md`): **no new CSS palette per theme this pass** — only text/content changes. The exit-prop element keeps its existing mirror-shaped CSS in every theme; Pirate's flavor text explicitly lampshades this ("an enchanted porthole, shaped just like an old mirror...") rather than hiding it.
- `BOOK_EMOJI`, `BOOK_NAMES`, `SHELF_NAMES`, `CHAIR_COLORS`, `COLOR_RIDDLES`, and all ambient decor (ghost swoop, bats, spiders, lightning/thunder, dust motes) and the Secret Room's Lottie storybook stay **global, not themed** — deliberate scope boundary, see the design spec.
- `mayaEscapeBest` best-time record stays global across themes (not per-theme).
- **Do not run `git commit` as part of executing this plan.** This session has a standing instruction to leave all changes uncommitted in the working tree for the user to review and commit when ready. Every task below ends with a verification step, not a commit step — stop there and let the reviewer/user decide when to commit.
- **Task boundaries matter for this plan specifically:** each task below must leave the game in a fully playable state when finished — no task may depend on a *later* task's edits to avoid a broken intermediate state (this plan originally split the engine refactor and the picker UI into two tasks; they were merged into Task 2 below because splitting them left the title screen's "Enter the Mansion" button wired to nothing in between, which throws on page load and blocks every other listener in the file from binding).

---

### Task 1: Add the `THEMES` data module (Haunted Mansion extracted + Pirate Ship new)

**Files:**
- Create: `projects/maya/games/mayas-escape-room/escape-room-themes.js`
- Modify: `projects/maya/games/mayas-escape-room/index.html:470-472` (add script tag before `escape-room-game.js`)

**Interfaces:**
- Produces: `window.THEMES` — object keyed by theme id (`'mansion'`, `'pirate'`), each value shaped exactly as shown below. `window.THEME_ORDER` — array of theme ids controlling picker card order and the Surprise Me pool: `['mansion','pirate']`.
- Consumes: nothing (pure data file, no dependencies).

- [ ] **Step 1: Create `escape-room-themes.js` with both themes**

```js
/* Maya's Escape Room — theme packs. Each theme reskins the same 5 puzzle
   mechanics (find-the-key, brew, word+key, find-the-spot, exit) with
   different room names, objects, riddles, and jokes. See
   docs/superpowers/specs/2026-07-11-escape-room-themes-design.md. */
(function(){
'use strict';

window.THEMES = {

  mansion: {
    id: 'mansion',
    name: 'Haunted Mansion',
    icon: '👻',
    cardTeaser: 'Ghosts, chairs, and a magic mirror 👻',
    roomNames: {
      room1: 'The Chair Parlor',
      secret: 'The Secret Room 🤫',
      kitchen: 'The Potion Kitchen',
      library: 'The Spooky Library',
      room2: 'The Mirror Room',
      room3: 'Inside the Mirror',
    },
    welcomeMsg: '👻 Welcome to the Chair Parlor... Five chairs. One hides a key. You may only sit on <b>THREE!</b> Look around for help...',
    door1LockedMsg: '🔒 Locked! <i>Rattle rattle...</i> You need a key. Maybe try a chair? But be careful — only 3 sits!',
    doorSealedMsg: '🔒 Not yet! The mirror ahead needs those <b>scrolls</b> — go tap every popped chair lid first! 📜',
    kitchenEnterMsg: '🍯 The Potion Kitchen! The next door is stuck shut with magic goo. Brew the <b>Goo-B-Gone potion</b> — tap the cauldron! 🫧',
    kitchenLockedMsg: '🍯 Stuck tight with sticky goo! The <b>cauldron</b> knows the recipe — tap it! ⚗️',
    kitchenAlreadyDoneMsg: '🫧 The potion bubbles happily. The door is unstuck — go through! 🚪',
    kitchenDoneMsg: '🫧✨ <b>SPLOOSH!</b> The potion melts the goo — the door is free! 🚪',
    libraryEnterMsg: '📚 The Spooky Library! The door needs a <b>hidden key</b> AND a <b>magic word</b>. The owl 🦉 saw everything...',
    room2EnterMsg: '🪞 A giant mirror... with a <b>tiny keyhole!</b> Your scrolls know where the key hides — but some scrolls LIE! 🤥',
    exitPropName: 'mirror',
    winSub: 'You outsmarted the chairs, brewed a potion, cast a spell, played the ghost’s song, and walked right through a mirror. The mansion is VERY impressed. 👻',
    hintAnimal: { emoji: '🦉', name: 'owl', call: 'Hoo! Hoo!', foundGemLine: 'The owl was sitting on it! Hoo knew?' },
    SPOTS: [
      {id:'fireplace', emoji:'🔥', name:'Fireplace', wall:false,
        riddle:'Crackle crackle! Look where the logs glow bright —\nthe key sleeps by the FIRE tonight!',
        fail:'You poke around the fireplace... ash goes POOF in your face! 💨 Nothing here.'},
      {id:'clock', emoji:'🕰️', name:'Old Clock', wall:false,
        riddle:'Tick tock! Tick tock!\nThe key hides INSIDE the old CLOCK!',
        fail:'You open the clock... CUCKOO! 🐦 A dusty bird boops your nose. No key.'},
      {id:'books', emoji:'📚', name:'Bookshelf', wall:false,
        riddle:'Shhh! Where the spooky stories stay —\nthe key is tucked between the BOOKS away!',
        fail:'You flip through the books... a moth flies out! 🦋 Just old stories.'},
      {id:'plant', emoji:'🪴', name:'Creepy Plant', wall:false,
        riddle:'Dig dig dig where the green leaves grow —\nthe key is in the PLANT, down below!',
        fail:'You dig in the plant... eww, a worm! 🪱 It waves at you. No key.'},
      {id:'painting', emoji:'🖼️', name:'Painting', wall:true,
        riddle:'Peek BEHIND the picture on the wall —\nthat’s where the key waits after all!',
        fail:'You peek behind the painting... a spider says hi! 🕷️ EEK! Nothing else.'},
      {id:'piano', emoji:'🎹', name:'Piano', wall:false,
        riddle:'Plink plonk! Lift the PIANO lid —\nthat’s where the little key is hid!',
        fail:'You press a key... PLONK! 🎵 A mouse scurries out. 🐭 Not that kind of key.'},
    ],
    FAKE_CLUES: [
      'The key is on the MOON. Good luck getting there! 🌝',
      'Lottie’s pet hamster guards it fiercely. He is very small. 🐹⚔️',
      'Lottie tucked it inside her teapot — mind the steam! 🫖👻',
      'The key hitched a ride on one of Lottie’s bats. 🦇',
      'A goose swallowed it. Lottie says the goose is fine. 🪿',
    ],
    DUSTY_LINES: [
      'Pfffft! 💨 Just a dusty old chair — Lottie sneezes somewhere nearby.',
      'Creeeak... nothing in this one. The chair giggles at you. 🪑',
      'You sit down... a spring goes BOING! Lottie laughs from behind a wall. 🫣',
    ],
    WRONG_BOOK_LINES: [
      'Just pictures of cats — must be Lottie’s. 🐱 No key.',
      'ACHOO! 🤧 Lottie hasn’t dusted in a hundred years. No key here.',
      'A moth flies out! 🦋 Keep looking...',
      'This one’s glued shut with... jam? 🍓 Ew. No key.',
    ],
  },

  pirate: {
    id: 'pirate',
    name: 'Pirate Ship',
    icon: '🏴‍☠️',
    cardTeaser: 'Barrels, grog, and a haunted porthole 🏴‍☠️',
    roomNames: {
      room1: 'The Captain’s Cabin',
      secret: 'The Secret Hold 🤫',
      kitchen: 'The Ship’s Galley',
      library: 'The Map Room',
      room2: 'The Crow’s Nest',
      room3: 'Through the Porthole',
    },
    welcomeMsg: '⚓ Welcome to the Captain’s Cabin... Five barrels. One hides a key. You may only sit on <b>THREE!</b> Look around for help...',
    door1LockedMsg: '🔒 Locked! <i>Creeeak...</i> You need a key. Maybe try a barrel? But be careful — only 3 sits!',
    doorSealedMsg: '🔒 Not yet! The porthole ahead needs those <b>scrolls</b> — go tap every popped barrel lid first! 📜',
    kitchenEnterMsg: '🍯 The Ship’s Galley! The next door is rusted shut. Brew the <b>Rust-Be-Gone grog</b> — tap the cauldron! 🫧',
    kitchenLockedMsg: '🍯 Stuck tight with rust! The <b>cauldron</b> knows the recipe — tap it! ⚗️',
    kitchenAlreadyDoneMsg: '🫧 The grog bubbles happily. The door is unstuck — go through! 🚪',
    kitchenDoneMsg: '🫧✨ <b>SPLOOSH!</b> The grog melts the rust — the door is free! 🚪',
    libraryEnterMsg: '🗺️ The Map Room! The door needs a <b>hidden key</b> AND a <b>magic word</b>. The parrot 🦜 saw everything...',
    room2EnterMsg: '🔮 A giant enchanted porthole, shaped just like an old mirror... with a <b>tiny keyhole!</b> Your scrolls know where the key hides — but some scrolls LIE! 🤥',
    exitPropName: 'porthole',
    winSub: 'You outsmarted the barrels, brewed grog, cracked the map room’s lock, played the parrot’s shanty, and swam right through the porthole. The ship is VERY impressed. 🏴‍☠️',
    hintAnimal: { emoji: '🦜', name: 'parrot', call: 'Squawk! Squawk!', foundGemLine: 'The parrot was sitting on it! Squawk knew?' },
    SPOTS: [
      {id:'chest', emoji:'📦', name:'Treasure Chest', wall:false,
        riddle:'Yo ho ho! Where gold doubloons hide tight —\nthe key sleeps in the CHEST tonight!',
        fail:'You creak open the chest... just old rope and a rubber duck! 🦆 No key.'},
      {id:'compass', emoji:'🧭', name:'Old Compass', wall:false,
        riddle:'Spin spin spin! It points true north —\nthe key hides INSIDE the compass, henceforth!',
        fail:'You crack open the compass... it just spins in circles. 🌀 No key.'},
      {id:'barrel', emoji:'🛢️', name:'Rum Barrel', wall:false,
        riddle:'Glug glug glug! Where the grog is stored —\nthe key is tucked inside the BARREL, aboard!',
        fail:'You dunk your hand in the barrel... a fish jumps out! 🐟 Splashy, but no key.'},
      {id:'hammock', emoji:'🛏️', name:'Hammock', wall:false,
        riddle:'Swing swing swing where sailors sleep and snore —\nthe key is hiding in the HAMMOCK, for sure!',
        fail:'You dig through the hammock... just a sleepy sock. 🧦 No key.'},
      {id:'flag', emoji:'🏴‍☠️', name:'Ship’s Flag', wall:true,
        riddle:'Peek BEHIND the flag up on the mast —\nthat’s where the key waits, hidden at last!',
        fail:'You peek behind the flag... a seagull squawks and flies off! 🐦 Nothing else.'},
      {id:'telescope', emoji:'🔭', name:'Telescope', wall:false,
        riddle:'Look look look through the spyglass eye —\nthe key is hidden INSIDE, way up high!',
        fail:'You peer through the telescope... just clouds and sky. ☁️ Not that kind of key.'},
    ],
    FAKE_CLUES: [
      'Salty buried it on a DIFFERENT island entirely. Oops. 🏝️',
      'Salty’s pet parrot swallowed it. The parrot is fine. 🦜',
      'Salty tucked it inside his eye patch. It’s very itchy. 🏴‍☠️',
      'The key hitched a ride on a flying fish and jumped overboard. 🐟',
      'Salty traded it to a mermaid for a shiny shell. 🧜‍♀️',
    ],
    DUSTY_LINES: [
      'Splash! 💦 Just an empty old barrel. That’s one sit used!',
      'Creeeak... nothing in this one. The barrel burps a bubble at you. 🫧',
      'You sit down... the barrel WOBBLES! But no key here.',
    ],
    WRONG_BOOK_LINES: [
      'Just a doodle of a sea monster. 🐙 Cute, but no key!',
      'ACHOO! 🤧 So much sea salt dust. Nothing behind this one.',
      'A crab scuttles out! 🦀 Keep looking...',
      'This one’s glued shut with... old jam? 🍓 Ew. No key.',
    ],
  },

};

window.THEME_ORDER = ['mansion', 'pirate'];

})();
```

- [ ] **Step 2: Verify syntax**

Run: `node --check projects/maya/games/mayas-escape-room/escape-room-themes.js`
Expected: no output (exit code 0).

- [ ] **Step 3: Load the new file in `index.html`**

In `projects/maya/games/mayas-escape-room/index.html`, find this block near the end of the file (currently lines 470-472):

```html
<script src="escape-room-audio.js"></script>
<script src="escape-room-puzzles.js"></script>
<script src="escape-room-game.js"></script>
```

Replace it with:

```html
<script src="escape-room-audio.js"></script>
<script src="escape-room-puzzles.js"></script>
<script src="escape-room-themes.js"></script>
<script src="escape-room-game.js"></script>
```

- [ ] **Step 4: Verify `index.html` still parses**

Run:
```bash
node -e "
const fs=require('fs');
const html=fs.readFileSync('projects/maya/games/mayas-escape-room/index.html','utf8');
const scripts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
let ok=true;
scripts.forEach((s,i)=>{ try{ new Function(s); }catch(e){ ok=false; console.log('inline #'+i+' ERROR:', e.message); } });
console.log(ok?'OK':'FAILED');
"
```
Expected: `OK`

**Do not commit.** Leave these changes in the working tree — Task 2 depends on this file existing but the game is not playable yet (the title screen still shows the old single button, unaffected by this task).

---

### Task 2: Refactor `escape-room-game.js` to be theme-driven, and replace the title screen with a theme picker

**Why one task:** the engine refactor (making content theme-driven) and the picker UI (letting Maya pick which theme) are tightly coupled — the picker's cards call `startGame(themeId)`, a signature that only exists after the refactor. Splitting these into two tasks would leave an intermediate state where the title screen's old "Enter the Mansion" button has no click handler (removed by the refactor, not yet replaced by the picker), which throws `TypeError: Cannot read properties of null` on page load and prevents every other button handler in the file from binding. This task's steps are ordered so the game is fully playable again only once *all* of them are done — do not stop partway through and consider it shippable.

**Files:**
- Modify: `projects/maya/games/mayas-escape-room/escape-room-game.js`
- Modify: `projects/maya/games/mayas-escape-room/index.html`

**Interfaces:**
- Consumes: `window.THEMES`, `window.THEME_ORDER` (from Task 1).
- Produces: `applyTheme(id)`, `startGame(themeId)`, `backToPicker()`, `updateBestTimeDisplay()`, `buildThemePicker()` — all in `escape-room-game.js`. `#theme-picker` and `#surprise-btn` — new elements in `index.html`.

#### Part A — engine refactor (escape-room-game.js content plumbing)

- [ ] **Step 1: Turn the per-theme constants into module-level `let`s, remove the hardcoded content**

In `escape-room-game.js`, replace lines 7-63 (from `const CHAIR_COLORS` through `const TOTAL_GEMS = 6;`) — **copy this block exactly, including the `’` escapes**, since that's the file's existing convention for apostrophes inside single-quoted strings and the Edit tool needs a byte-exact match:

```js
const CHAIR_COLORS = ['#5a2d6e','#6e2d3a','#2d4a6e','#2d6e4a','#6e5a2d'];
const COLOR_RIDDLES = [
  'a wizard’s magic hat 🧙',
  'a yummy strawberry 🍓',
  'the deep night sea 🌊',
  'a sneaky little frog 🐸',
  'a pirate’s shiny gold 🪙',
];

const SPOTS = [
  {id:'fireplace', emoji:'🔥', name:'Fireplace', wall:false,
    riddle:'Crackle crackle! Look where the logs glow bright —\nthe key sleeps by the FIRE tonight!',
    fail:'You poke around the fireplace... ash goes POOF in your face! 💨 Nothing here.'},
  {id:'clock', emoji:'🕰️', name:'Old Clock', wall:false,
    riddle:'Tick tock! Tick tock!\nThe key hides INSIDE the old CLOCK!',
    fail:'You open the clock... CUCKOO! 🐦 A dusty bird boops your nose. No key.'},
  {id:'books', emoji:'📚', name:'Bookshelf', wall:false,
    riddle:'Shhh! Where the spooky stories stay —\nthe key is tucked between the BOOKS away!',
    fail:'You flip through the books... a moth flies out! 🦋 Just old stories.'},
  {id:'plant', emoji:'🪴', name:'Creepy Plant', wall:false,
    riddle:'Dig dig dig where the green leaves grow —\nthe key is in the PLANT, down below!',
    fail:'You dig in the plant... eww, a worm! 🪱 It waves at you. No key.'},
  {id:'painting', emoji:'🖼️', name:'Painting', wall:true,
    riddle:'Peek BEHIND the picture on the wall —\nthat’s where the key waits after all!',
    fail:'You peek behind the painting... a spider says hi! 🕷️ EEK! Nothing else.'},
  {id:'piano', emoji:'🎹', name:'Piano', wall:false,
    riddle:'Plink plonk! Lift the PIANO lid —\nthat’s where the little key is hid!',
    fail:'You press a key... PLONK! 🎵 A mouse scurries out. 🐭 Not that kind of key.'},
];

const FAKE_CLUES = [
  'The key is on the MOON. Good luck getting there! 🌝',
  'The key is guarded by a very small, very fierce hamster. 🐹⚔️',
  'The key is in the fridge. (This mansion has no fridge.) 🤭',
  'The key hitched a ride on a bat and flew out the window. 🦇',
  'The key was swallowed by a goose. The goose is fine. 🪿',
];

const DUSTY_LINES = [
  'Pfffft! 💨 Just a dusty old chair. That’s one sit used!',
  'Creeeak... nothing in this one. The chair giggles at you. 🪑',
  'You sit down... a spring goes BOING! But no key here.',
];

const BOOK_EMOJI = ['📕','📗','📘','📙'];
const BOOK_NAMES = ['RED','GREEN','BLUE','ORANGE'];
const SHELF_NAMES = ['TOP','MIDDLE','BOTTOM'];
const WRONG_BOOK_LINES = [
  'Just pictures of cats. 🐱 Cute, but no key!',
  'ACHOO! 🤧 So much dust. Nothing behind this one.',
  'A moth flies out! 🦋 Keep looking...',
  'This one’s glued shut with... jam? 🍓 Ew. No key.',
];

const TOTAL_GEMS = 6;
```

**Note:** this is the content currently on disk. The `FAKE_CLUES`/`DUSTY_LINES`/`WRONG_BOOK_LINES` in Task 1's `escape-room-themes.js` (Lottie-cohesion rewrite, tying the decoy clues/jokes to the Secret Room's ghost character) are the *upgraded* replacement content — Task 1 already carries that forward, so nothing is lost by deleting the plain versions here.

Replace the whole block above with:

```js
const CHAIR_COLORS = ['#5a2d6e','#6e2d3a','#2d4a6e','#2d6e4a','#6e5a2d'];
const COLOR_RIDDLES = [
  'a wizard’s magic hat 🧙',
  'a yummy strawberry 🍓',
  'the deep night sea 🌊',
  'a sneaky little frog 🐸',
  'a pirate’s shiny gold 🪙',
];

const BOOK_EMOJI = ['📕','📗','📘','📙'];
const BOOK_NAMES = ['RED','GREEN','BLUE','ORANGE'];
const SHELF_NAMES = ['TOP','MIDDLE','BOTTOM'];
const TOTAL_GEMS = 6;

// Theme-driven content — populated by applyTheme() before each round.
let THEME = null;
let SPOTS, FAKE_CLUES, DUSTY_LINES, WRONG_BOOK_LINES;

function applyTheme(id){
  THEME = window.THEMES[id];
  SPOTS = THEME.SPOTS;
  FAKE_CLUES = THEME.FAKE_CLUES;
  DUSTY_LINES = THEME.DUSTY_LINES;
  WRONG_BOOK_LINES = THEME.WRONG_BOOK_LINES;
  $('#owl').textContent = THEME.hintAnimal.emoji;
}
```

(`SPOTS`/`FAKE_CLUES`/`DUSTY_LINES`/`WRONG_BOOK_LINES` no longer exist as top-level constants — every other function in this file that already reads those variable names (`chairClick`, `bookClick`, `buildRoom2`, `setupRound`, etc.) needs **no changes**, because `applyTheme()` assigns the active theme's arrays into those same variable names before each round starts.)

- [ ] **Step 2: Verify syntax after Step 1**

Run: `node --check projects/maya/games/mayas-escape-room/escape-room-game.js`
Expected: no output (exit code 0) — note this file references `window.THEMES` which doesn't exist at `node --check` parse time; that's fine, `--check` only parses, it doesn't execute.

- [ ] **Step 3: Point `updateHUD()`'s room-name lookup at the active theme**

Find (currently line 171):
```js
  $('#room-name').textContent = {room1:'The Chair Parlor',secret:'The Secret Room 🤫',kitchen:'The Potion Kitchen',library:'The Spooky Library',room2:'The Mirror Room',room3:'Inside the Mirror'}[S.phase]||'';
```
Replace with:
```js
  $('#room-name').textContent = THEME.roomNames[S.phase] || '';
```

- [ ] **Step 4: Theme the room1/kitchen messages**

In `doorClick()` (currently lines 311-337), replace the two hardcoded messages:

Find:
```js
    sfx('bad'); msg('🔒 Locked! <i>Rattle rattle...</i> You need a key. Maybe try a chair? But be careful — only 3 sits!');
```
Replace with:
```js
    sfx('bad'); msg(THEME.door1LockedMsg);
```

Find:
```js
    sfx('bad'); msg('🔒 Not yet! The mirror ahead needs those <b>scrolls</b> — go tap every popped chair lid first! 📜', 4000);
```
Replace with:
```js
    sfx('bad'); msg(THEME.doorSealedMsg, 4000);
```

In `enterKitchen()` (currently lines 386-390), find:
```js
  msg('🍯 The Potion Kitchen! The next door is stuck shut with magic goo. Brew the <b>Goo-B-Gone potion</b> — tap the cauldron! 🫧', 4500);
```
Replace with:
```js
  msg(THEME.kitchenEnterMsg, 4500);
```

In `cauldronClick()` (currently lines 391-399), find:
```js
  if(S.potionDone){ msg('🫧 The potion bubbles happily. The door is unstuck — go through! 🚪'); return; }
  Puzzles.potionMix(()=>{
    S.potionDone=true; sfx('magic'); updateHUD();
    $('#door-k-lock').textContent='🔓';
    msg('🫧✨ <b>SPLOOSH!</b> The potion melts the goo — the door is free! 🚪', 3500);
  });
```
Replace with:
```js
  if(S.potionDone){ msg(THEME.kitchenAlreadyDoneMsg); return; }
  Puzzles.potionMix(()=>{
    S.potionDone=true; sfx('magic'); updateHUD();
    $('#door-k-lock').textContent='🔓';
    msg(THEME.kitchenDoneMsg, 3500);
  });
```

In `doorKClick()` (currently lines 400-410), find:
```js
    sfx('bad'); msg('🍯 Stuck tight with sticky goo! The <b>cauldron</b> knows the recipe — tap it! ⚗️');
```
Replace with:
```js
    sfx('bad'); msg(THEME.kitchenLockedMsg);
```

- [ ] **Step 5: Theme the library hint-animal**

Rename `owlRiddle()` to `hintAnimalRiddle()` and read from the active theme. Find (currently lines 433-435):
```js
function owlRiddle(){
  return '🦉 “Hoo! Hoo! The key sleeps behind the <b>'+BOOK_NAMES[S.bookTarget.color]+'</b> book on the <b>'+SHELF_NAMES[S.bookTarget.shelf]+'</b> shelf!”';
}
```
Replace with:
```js
function hintAnimalRiddle(){
  const a = THEME.hintAnimal;
  return a.emoji+' “'+a.call+' The key sleeps behind the <b>'+BOOK_NAMES[S.bookTarget.color]+'</b> book on the <b>'+SHELF_NAMES[S.bookTarget.shelf]+'</b> shelf!”';
}
```

Find (currently lines 436-446, `owlClick()`), the two calls to `owlRiddle()`:
```js
function owlClick(){
  if(S.phase!=='library') return;
  S.owlTaps++;
  sfx('hoot');
  if(S.owlTaps===3 && !S.gems.includes('owl')){
    addGem('owl','The owl was sitting on it! Hoo knew?');
    setTimeout(()=>msg(owlRiddle(), 4500), 4200);
    return;
  }
  msg(owlRiddle(), 4500);
}
```
Replace with:
```js
function owlClick(){
  if(S.phase!=='library') return;
  S.owlTaps++;
  sfx('hoot');
  if(S.owlTaps===3 && !S.gems.includes('owl')){
    addGem('owl', THEME.hintAnimal.foundGemLine);
    setTimeout(()=>msg(hintAnimalRiddle(), 4500), 4200);
    return;
  }
  msg(hintAnimalRiddle(), 4500);
}
```

In `enterLibrary()` (currently lines 460-464), find:
```js
  msg('📚 The Spooky Library! The door needs a <b>hidden key</b> AND a <b>magic word</b>. The owl 🦉 saw everything...', 4500);
```
Replace with:
```js
  msg(THEME.libraryEnterMsg, 4500);
```

In `hintFor()` (currently lines 213-215), find:
```js
  if(p==='library'){
    if(!S.key3) return '“The owl 🦉 saw where the key went. Tap it and LISTEN!”';
    return '“Read the backwards word from RIGHT to LEFT... and dodge the 2 trick letters!”';
  }
```
Replace with:
```js
  if(p==='library'){
    if(!S.key3) return '“The '+THEME.hintAnimal.name+' '+THEME.hintAnimal.emoji+' saw where the key went. Tap it and LISTEN!”';
    return '“Read the backwards word from RIGHT to LEFT... and dodge the 2 trick letters!”';
  }
```

- [ ] **Step 6: Theme the Room 2 / exit-prop messages**

In `enterRoom2()` (currently lines 512-516), find:
```js
  msg('🪞 A giant mirror... with a <b>tiny keyhole!</b> Your scrolls know where the key hides — but some scrolls LIE! 🤥', 4500);
```
Replace with:
```js
  msg(THEME.room2EnterMsg, 4500);
```

In `goalText()` (currently lines 196-197), find:
```js
    if(!S.mirrorUnlocked) return 'You have the mirror key — tap the mirror! 🪞';
    return 'Tap the mirror again to step through! ✨';
```
Replace with:
```js
    if(!S.mirrorUnlocked) return 'You have the '+THEME.exitPropName+' key — tap the '+THEME.exitPropName+'! 🪞';
    return 'Tap the '+THEME.exitPropName+' again to step through! ✨';
```

In `mirrorClick()` (currently lines 544-565), find:
```js
    if(S.spotFound) msg('🔒 The ghost still has the mirror key! Tap the glowing '+S.trueSpot.name.toLowerCase()+' and play its song! 🎹', 4000);
```
Replace with:
```js
    if(S.spotFound) msg('🔒 The ghost still has the '+THEME.exitPropName+' key! Tap the glowing '+S.trueSpot.name.toLowerCase()+' and play its song! 🎹', 4000);
```

Find:
```js
    msg('🔓 The mirror <b>ripples like water...</b> Tap it again to step through!', 3500);
```
Replace with:
```js
    msg('🔓 The '+THEME.exitPropName+' <b>ripples like water...</b> Tap it again to step through!', 3500);
```

In the mirror-ghost gem handler (currently line 665), find:
```js
  if(S.phase==='room2' && $('#mghost').classList.contains('boo')) addGem('mghost','You tapped the mirror ghost mid-haunt! So brave!');
```
Replace with:
```js
  if(S.phase==='room2' && $('#mghost').classList.contains('boo')) addGem('mghost','You tapped the ghost near the '+THEME.exitPropName+' mid-haunt! So brave!');
```

- [ ] **Step 7: Theme the win screen**

In `winGame()` (currently lines 582-596), find:
```js
function winGame(){
  S.phase='win'; S.elapsed=Date.now()-S.start;
  clearInterval(timerInt);
  $('#hud').classList.remove('show'); $('#goal').classList.remove('show'); $('#hint-ghost').classList.remove('show');
  show('#s-win');
  $('#win-time').textContent='⏱️ You escaped in '+fmt(S.elapsed)+'!';
```
Replace with:
```js
function winGame(){
  S.phase='win'; S.elapsed=Date.now()-S.start;
  clearInterval(timerInt);
  $('#hud').classList.remove('show'); $('#goal').classList.remove('show'); $('#hint-ghost').classList.remove('show');
  show('#s-win');
  $('#win-sub').textContent = THEME.winSub;
  $('#win-time').textContent='⏱️ You escaped in '+fmt(S.elapsed)+'!';
```

(`#win-sub` is currently static HTML text that JS never touches — this adds the first line that sets it, so it now reflects the theme just finished.)

- [ ] **Step 8: Make `startGame()` take a theme id, add `backToPicker()` and `updateBestTimeDisplay()`**

Find (currently lines 614-633):
```js
/* ---------------- Flow ---------------- */
function startGame(){
  setupRound();
  S.phase='room1';
  buildChairs(); buildRoom2(); buildLibrary();
  // reset visuals
  $('#door1').classList.remove('open-anim'); $('#door1-lock').textContent='🔒';
  $('#door-k').classList.remove('open-anim'); $('#door-k-lock').textContent='🔒';
  $('#door-l').classList.remove('open-anim'); $('#door-l-lock').textContent='🔒';
  $('#portrait').classList.remove('swung');
  $('#secret-btn').classList.remove('show');
  $('#chest').classList.remove('open');
  const m=$('#mirror'); m.classList.remove('unlocked','enter-anim');
  $('#m-keyhole').textContent='🔒';
  $('#hud').classList.add('show'); $('#goal').classList.add('show'); $('#hint-ghost').classList.add('show');
  updateHUD(); startTimer(); $('#timer').textContent='0:00';
  if(window.Snd) Snd.ambient('mansion');
  show('#s-room1');
  msg('👻 Welcome to the Chair Parlor... Five chairs. One hides a key. You may only sit on <b>THREE!</b> Look around for help...', 4500);
}
```
Replace with:
```js
/* ---------------- Flow ---------------- */
function startGame(themeId){
  applyTheme(themeId);
  setupRound();
  S.phase='room1';
  buildChairs(); buildRoom2(); buildLibrary();
  // reset visuals
  $('#door1').classList.remove('open-anim'); $('#door1-lock').textContent='🔒';
  $('#door-k').classList.remove('open-anim'); $('#door-k-lock').textContent='🔒';
  $('#door-l').classList.remove('open-anim'); $('#door-l-lock').textContent='🔒';
  $('#portrait').classList.remove('swung');
  $('#secret-btn').classList.remove('show');
  $('#chest').classList.remove('open');
  const m=$('#mirror'); m.classList.remove('unlocked','enter-anim');
  $('#m-keyhole').textContent='🔒';
  $('#hud').classList.add('show'); $('#goal').classList.add('show'); $('#hint-ghost').classList.add('show');
  updateHUD(); startTimer(); $('#timer').textContent='0:00';
  if(window.Snd) Snd.ambient('mansion');
  show('#s-room1');
  msg(THEME.welcomeMsg, 4500);
}

function updateBestTimeDisplay(){
  const best=Number(localStorage.getItem('mayaEscapeBest')||0);
  $('#best-time').textContent = best ? '🏆 Best escape: '+fmt(best) : '';
}

function backToPicker(){
  show('#s-title');
  updateBestTimeDisplay();
}
```

- [ ] **Step 9: Verify syntax after Steps 3-8**

Run: `node --check projects/maya/games/mayas-escape-room/escape-room-game.js`
Expected: no output (exit code 0).

#### Part B — title-screen picker (do not stop between Part A and Part B; the game is broken until Part B's Step 13 is done)

- [ ] **Step 10: Replace the title screen's single button with a picker container + Surprise Me button (in `index.html`)**

Find (currently lines 316-323):
```html
    <div class="scene on" id="s-title">
      <div class="t-moon">🌕</div>
      <h1 class="t-title">Maya's<br>Escape Room</h1>
      <p class="t-sub">You're locked inside a spooky old mansion! 👻 Outsmart the chairs, brew a potion, cast a spell, play the ghost's song, and escape through the magic mirror. But choose wisely — you only get <b>3 sits!</b> 🤫 Psst: <b>6 secret gems</b> are hidden inside...</p>
      <button class="big-btn" id="start-btn">Enter the Mansion 🕯️</button>
      <div class="t-ghosts"><span>👻</span><span>🦇</span><span>🕷️</span></div>
      <div id="best-time"></div>
    </div>
```
Replace with:
```html
    <div class="scene on" id="s-title">
      <div class="t-moon">🌕</div>
      <h1 class="t-title">Maya's<br>Escape Room</h1>
      <p class="t-sub">Pick a place to explore! Every room has hidden gems, sneaky clues, and a locked door between you and escape. 🔑</p>
      <div id="theme-picker"></div>
      <button class="big-btn" id="surprise-btn">🎲 Surprise Me!</button>
      <div class="t-ghosts"><span>👻</span><span>🦇</span><span>🕷️</span></div>
      <div id="best-time"></div>
    </div>
```

(`#start-btn` is gone — no other step in this task re-adds a listener for it. It's fine that it's briefly absent from the HTML mid-edit; both this HTML change and the JS listener change in Step 12 land before this task's final verification, so the built artifact never actually references a missing element.)

- [ ] **Step 11: Add CSS for the picker cards (in `index.html`)**

In the `<style>` block, find the `/* ---------- Title ---------- */` section (currently lines 52-65), and add the following right after the existing `#best-time{...}` rule (currently line 65):

```css
#theme-picker{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;max-width:480px;margin-bottom:18px}
.theme-card{all:unset;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:14px 12px;width:140px;cursor:pointer;transition:transform .12s,background .12s;min-height:44px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;text-align:center;touch-action:manipulation}
.theme-card:hover{transform:translateY(-3px);background:rgba(255,255,255,.09)}
.theme-card:active{transform:translateY(1px)}
.theme-card .tc-icon{font-size:34px;display:block;margin-bottom:6px}
.theme-card .tc-name{font-family:'Fredoka One',cursive;font-size:14px;color:var(--text);display:block;margin-bottom:4px}
.theme-card .tc-teaser{font-size:10.5px;color:var(--muted);line-height:1.4;display:block}
```

(`all:unset` on `.theme-card` is needed because it's a `<button>` — the file's global `button{...}` rule only sets font-family and touch-action, so without `all:unset` the browser's native button chrome (default border, background, padding) would show through. Every visual property the card actually needs is re-declared explicitly right after `all:unset` in the same rule.)

- [ ] **Step 12: Update the win screen's "Play Again" button label (in `index.html`)**

Find (currently line 437):
```html
      <button class="big-btn" id="again-btn">Play Again 🔄</button>
```
Replace with:
```html
      <button class="big-btn" id="again-btn">Choose Again 🔄</button>
```

(This button now returns to the theme picker instead of instantly replaying — Step 14 below rewires its click handler to `backToPicker()`. The label change keeps the button honest about what it does.)

- [ ] **Step 13: Verify `index.html` still parses**

Run:
```bash
node -e "
const fs=require('fs');
const html=fs.readFileSync('projects/maya/games/mayas-escape-room/index.html','utf8');
const scripts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
let ok=true;
scripts.forEach((s,i)=>{ try{ new Function(s); }catch(e){ ok=false; console.log('inline #'+i+' ERROR:', e.message); } });
console.log(ok?'OK':'FAILED');
"
```
Expected: `OK`

- [ ] **Step 14: Rewire the start/again/retry buttons and wire up the picker (in `escape-room-game.js`)**

Find (currently lines 635-641):
```js
$('#start-btn').addEventListener('click', startGame);
$('#again-btn').addEventListener('click', startGame);
$('#retry-btn').addEventListener('click', ()=>{
  $('#net').classList.remove('show');
  startGame();
  msg('The net lets you go... this time. 😤 New round — everything moved! Only <b>3 sits!</b>', 4000);
});
```
Replace with:
```js
function buildThemePicker(){
  const box = $('#theme-picker'); box.innerHTML='';
  window.THEME_ORDER.forEach(id=>{
    const t = window.THEMES[id];
    const el = document.createElement('button');
    el.className='theme-card';
    el.innerHTML = `<span class="tc-icon">${t.icon}</span><span class="tc-name">${t.name}</span><span class="tc-teaser">${t.cardTeaser}</span>`;
    el.addEventListener('click', ()=>startGame(id));
    box.appendChild(el);
  });
}
buildThemePicker();
$('#surprise-btn').addEventListener('click', ()=>{
  const ids = window.THEME_ORDER;
  startGame(ids[Math.floor(Math.random()*ids.length)]);
});
$('#again-btn').addEventListener('click', backToPicker);
$('#retry-btn').addEventListener('click', ()=>{
  $('#net').classList.remove('show');
  startGame(THEME.id);
  msg('The net lets you go... this time. 😤 New round — everything moved! Only <b>3 sits!</b>', 4000);
});
```

(This is the step that removes the last reference to `#start-btn` — after this, nothing in the file queries for an element that no longer exists.)

- [ ] **Step 15: Replace the page-load best-time IIFE with a call to the new helper**

Find (currently lines 756-760):
```js
// show best time on title
(function(){
  const best=Number(localStorage.getItem('mayaEscapeBest')||0);
  if(best) $('#best-time').textContent='🏆 Best escape: '+fmt(best);
})();
```
Replace with:
```js
// show best time on title
updateBestTimeDisplay();
```

- [ ] **Step 16: Verify syntax**

Run: `node --check projects/maya/games/mayas-escape-room/escape-room-game.js`
Expected: no output (exit code 0).

**Do not commit.** The task's own state is now complete and playable — verify it live in Task 3 before considering this task done.

---

### Task 3: End-to-end live verification (both themes)

**Files:** none (verification only — no test framework exists for this game; this task is the substitute for automated tests, per this project's established pattern this session).

**Interfaces:**
- Consumes: everything from Tasks 1-2.

- [ ] **Step 1: Serve the game locally**

```bash
cd projects/maya && python3 -m http.server 8934 > /tmp/maya-http.log 2>&1 &
```

- [ ] **Step 2: Load the title screen and confirm the picker renders with no console errors**

Open `http://localhost:8934/games/mayas-escape-room/index.html?standalone=1` in a browser (or via the browser automation tool). Confirm:
- No JavaScript error in the console on load (this is the specific failure mode Task 2's Part A/Part B split would have caused if left unmerged — confirm it's actually gone).
- Two theme cards show: "👻 Haunted Mansion" and "🏴‍☠️ Pirate Ship", each with icon, name, and teaser text.
- A "🎲 Surprise Me!" button is present below the cards.
- No leftover "Enter the Mansion" button.

- [ ] **Step 3: Play the Haunted Mansion theme through to a win, confirm it behaves exactly as before**

Tap the Haunted Mansion card. Confirm:
- Room name reads "The Chair Parlor"; welcome message is the original Lottie/chair text.
- Progress through Room 1 (find key among 5 chairs), Kitchen (brew potion), Library (word+key), Room 2 (find spot, play ghost's song, unlock+step through the mirror), Room 3 (exit puzzle) exactly as before this change — no regressions in puzzle logic, since Task 2 only changed which strings are displayed, not the underlying state machine.
- Win screen shows the mansion-flavored `win-sub` text ("You outsmarted the chairs, brewed a potion...").
- "Choose Again 🔄" returns to the title screen's theme picker (not an instant restart).
- No console errors during the full playthrough.

- [ ] **Step 4: Play the Pirate Ship theme through to a win**

From the picker, tap the Pirate Ship card. Confirm:
- Room name reads "The Captain's Cabin"; welcome message references barrels, not chairs.
- The `#owl` element now shows 🦜 (parrot), and its hint text says "parrot" / "Squawk! Squawk!" instead of "owl" / "Hoo! Hoo!".
- Room 2's find-the-spot objects are the 6 pirate objects (Treasure Chest, Old Compass, Rum Barrel, Hammock, Ship's Flag, Telescope) — confirm exactly 5 render on the floor and 1 (Ship's Flag) renders on the wall, with their pirate riddles/fail lines.
- The exit-prop messages say "porthole" throughout (goal text, mirror-click messages, mghost gem line) instead of "mirror".
- Win screen shows the pirate-flavored `win-sub` text ("You outsmarted the barrels, brewed grog...").
- No console errors during the full playthrough.

- [ ] **Step 5: Verify Surprise Me picks a theme and starts immediately**

From the title screen, tap "🎲 Surprise Me!" a few times (reloading between taps). Confirm each tap starts a playable game immediately (either theme), with no dead clicks or console errors.

- [ ] **Step 6: Verify the net-trap retry keeps the same theme**

Start the Pirate Ship theme, sit on 3 wrong barrels in Room 1 to trigger the net trap, tap "Try Again 💪". Confirm the retry restarts in the Pirate Ship theme (not the Mansion) — room name still reads "The Captain's Cabin".

- [ ] **Step 7: Stop the local server**

```bash
kill %1 2>/dev/null || pkill -f "http.server 8934"
```

**Do not commit.** Report the verification results; leave all changes from Tasks 1-2 in the working tree for the user to review and commit when ready.

---

## Follow-up (not in this plan)

Before writing Phase 2 (the remaining 4 themes), get this Phase 1 build in front of Maya on the actual deployed site (not just this local server) — the whole point is whether reused furniture + new words genuinely reads as "new" to her, which nothing in Task 3 can confirm on its own. If it does, Phase 2 is a content-only pass: add Critter Burrow, Yarn Attic, Blueprint Workshop, and Greenhouse Garden to `escape-room-themes.js` and `THEME_ORDER` — no further `escape-room-game.js` or `index.html` changes needed, since Task 2's refactor already generalized everything. If reused furniture doesn't read as "new" to her, that's worth knowing before writing four more text-only themes — per-theme visual touches might matter more than more themes.
