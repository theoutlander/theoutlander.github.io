/* Castle Defenders v2 — config + state */
(function(){
'use strict';

/* ===== Per-player saves (window.CDStore) =====
   Ari (14) and Asha (10) play on Maya's iPad. Every game used to keep its progress under one
   shared key, so whoever played last overwrote her stars — "Dad, my stars are gone."
   So: key every save by WHO is playing. The visitor is derived exactly the way
   shared/ga-analytics.js derives it (a ?who= override persisted in `maya_visitor`, else the
   family-chat role in `maya_family_chat_v3`), so both agree on who this is.

   MIGRATION: on the first read for a player, an un-namespaced legacy value is adopted into the
   namespaced key. Maya has real saved progress; losing it while "fixing" this would be worse
   than the bug. The legacy key is left in place as a safety net.

   EVERY access is guarded. A bare localStorage read THROWS on her iPad with site data blocked
   (Block All Cookies / Private Browsing) and aborts the whole script — that is how Dust Chasers
   ended up with a dead start button. cd-audio.js used to do exactly that on line 5. */
var CDStore = (function(){
  function raw(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function put(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
  var who = (function(){
    try {
      var q = new URLSearchParams(location.search).get('who');
      if (q === 'nick' || q === 'maya') put('maya_visitor', q);
      var tagged = raw('maya_visitor');
      if (tagged === 'nick' || tagged === 'maya') return tagged;
      var sess = raw('maya_family_chat_v3');
      if (sess) {
        var role = JSON.parse(sess).role;
        if (role === 'dad') return 'nick';
        if (role === 'maya') return 'maya';
      }
    } catch(e){}
    return 'unknown';
  })();
  function nk(k){ return k + ':' + who; }
  return {
    visitor: who,
    get: function(k){
      var v = raw(nk(k));
      if (v !== null) return v;
      var legacy = raw(k);              // her existing save, from before saves were per-player
      if (legacy !== null) { put(nk(k), legacy); return legacy; }
      return null;
    },
    set: function(k,v){ put(nk(k), v); },
    remove: function(k){ try { localStorage.removeItem(nk(k)); } catch(e){} },
    // Device-level preferences (mute) stay shared — they are not progress and nobody loses
    // anything if a sibling flips them. Still guarded.
    getPref: raw,
    setPref: put
  };
})();
window.CDStore = CDStore;

window.CD = {
  W: 960, H: 600, GROUND: 522,
  scene: null, game: null,

  /* Back row = the original 5 (free). Front row = the 4 buyable plots; they sit lower on the
     screen (dy) so they read as "closer to you", and they cap at stage 2 so a bought tree can
     never hide Grandpa Tree behind it. */
  TREE_SPOTS: [
    { x: 305, max: 1, dy: 0,  cost: 0 },
    { x: 415, max: 2, dy: 0,  cost: 0 },
    { x: 525, max: 1, dy: 0,  cost: 0 },
    { x: 650, max: 2, dy: 0,  cost: 0 },
    { x: 830, max: 3, dy: 0,  cost: 0 },   // Grandpa Tree — the GIANT
    /* dy is deliberately small (12-18, not 38-46). The tool belt is a DOM bar pinned to the bottom
       of the canvas, and it covered the dy:38 plots outright — Maya could not tap the 🪵12 plot at
       all. Verified in the browser. Keep the front row above the belt band. */
    { x: 360, max: 2, dy: 12, cost: 12 },
    { x: 480, max: 2, dy: 18, cost: 20 },
    { x: 600, max: 2, dy: 12, cost: 30 },
    { x: 740, max: 2, dy: 18, cost: 45 }
  ],
  BASE_PLOTS: 5,

  // stage: 0 sprout, 1 small, 2 big, 3 giant
  TREE_STAGES: {
    0: { name: 'Sprout',  chops: 0,  wood: 0,  h: 46,  canopy: 26 },
    1: { name: 'Tree',    chops: 3,  wood: 2,  h: 130, canopy: 52 },
    2: { name: 'Big Tree',chops: 6,  wood: 5,  h: 215, canopy: 82 },
    3: { name: 'Grandpa Tree', chops: 12, wood: 14, h: 330, canopy: 120 }
  },

  /* Species MULTIPLY the stage table above; they never replace it.
     grow  — multiplier on GROW_MS (lower = faster)
     wood  — multiplier on the stage's wood payout (rounded up, min 1)
     maxStage — species cap, ANDed with the spot's own max
     Payout is always WOOD. There is no second currency. Candy is simply the big-wood tree. */
  TREE_SPECIES: {
    oak:     { emoji: '🌳', name: 'Oak',            seedCost: 0,  grow: 1.0, wood: 1.0, maxStage: 3,
               leaf: 0x58A14E, leaf2: 0x6FBF61, leafHi: 0x8ED97F,
               blurb: 'Big, strong, reliable. Lots of wood!' },
    cherry:  { emoji: '🌸', name: 'Cherry Blossom', seedCost: 6,  grow: 0.5, wood: 0.5, maxStage: 2,
               leaf: 0xFF9EC7, leaf2: 0xFFC2DC, leafHi: 0xFFE1EE,
               blurb: 'Grows SUPER fast — chop it again and again!' },
    apple:   { emoji: '🍎', name: 'Apple Tree',     seedCost: 12, grow: 1.6, wood: 0.6, maxStage: 3,
               leaf: 0x4E9E4A, leaf2: 0x6FBF61, leafHi: 0x8ED97F, fruit: 0xFF5C5C, apples: true,
               blurb: 'Apples make the gate EXTRA strong tonight!' },
    candy:   { emoji: '🍭', name: 'Candy Tree',     seedCost: 18, grow: 2.0, wood: 2.5, maxStage: 3,
               leaf: 0xC77DFF, leaf2: 0xFFB3E6, leafHi: 0xFFD9F2,
               blurb: 'Slow… but a HUGE pile of wood!' },
    rainbow: { emoji: '🌈', name: 'Rainbow Tree',   seedCost: 28, grow: 2.4, wood: 1.0, maxStage: 3,
               leaf: 0x6FD3FF, leaf2: 0xFFD24D, leafHi: 0xFFFFFF, rainbow: true,
               blurb: 'A SURPRISE every time you chop it!' }
  },
  SEED_ORDER: ['oak', 'cherry', 'apple', 'candy', 'rainbow'],

  /* ---------- TREE ANIMALS ----------
     Every species grows its OWN friend, and only once the tree is big enough to live in
     (stage >= ANIMAL_MIN_STAGE). That is the whole point: a tree you let grow up gives you a
     helper, so NOT chopping something immediately is finally worth doing.
     Tap the animal to call it — it does its trick, then naps for a bit. No shop, no unlock:
     she just grows a big tree and a friend shows up. */
  TREE_ANIMALS: {
    oak:     { emoji: '🐒', name: 'Monkey',  call: 'Bananas away! 🍌', help: 'bananas', icon: '🍌',
               desc: 'Throws bananas and chops your other trees!' },
    cherry:  { emoji: '🐦', name: 'Birdie',  call: 'Tweet tweet! 🎵',  help: 'grow', icon: '🎵',
               desc: 'Sings to the garden — everything grows faster!' },
    apple:   { emoji: '🐝', name: 'Buzzy',   call: 'Bzzzz! 🍎',        help: 'apple', icon: '🍎',
               desc: 'Makes an extra apple — a bonus heart tonight!' },
    candy:   { emoji: '🦜', name: 'Polly',   call: 'Squawk! 🪵',       help: 'wood', icon: '🪵',
               desc: 'Drops a beakful of wood!' },
    rainbow: { emoji: '🦄', name: 'Sparkle', call: 'MAGIC! ✨',        help: 'surprise', icon: '✨',
               desc: 'A magical surprise, every single time!' }
  },
  ANIMAL_MIN_STAGE: 2,      // must be a Big Tree before anyone moves in
  ANIMAL_COOLDOWN: 6000,    // then they nap 😴
  MONKEY_BANANAS: 3,

  GROW_MS: 9000,          // base time per growth stage (× species.grow)
  REGROW_DELAY: 5000,     // stump -> sprout
  WATER_BOOST: 0.5,       // watering completes the current stage in half the REMAINING time
  MAX_BONUS_HEARTS: 3,    // apples can add at most this many hearts to a night

  /* Shop helpers. These are BOUGHT WITH WOOD and are a SEPARATE system from TOOLS above
     (TOOLS unlock automatically by day and are chop enhancers — do not conflate them). */
  HELPERS: [
    { id: 'sprinkler',  emoji: '💦', name: 'Sprinkler',      cost: 18, desc: 'Waters your trees all by itself!' },
    { id: 'gardener',   emoji: '🌻', name: 'Gardener Gus',   cost: 26, desc: 'Plants seeds in your empty plots!' },
    { id: 'beaver2',    emoji: '🦫', name: 'Chomp the Beaver',cost: 22, desc: 'Chip brings his cousin along!' },
    { id: 'squirrels2', emoji: '🐿️', name: 'Squirrel Squad+', cost: 20, desc: 'DOUBLE the acorn rain!' }
  ],

  TOOLS: [
    { day: 1, id: 'axe',       emoji: '🪓', name: 'Trusty Axe',     desc: 'Tap a tree to chop it!' },
    { day: 2, id: 'throw',     emoji: '🎯', name: 'Throwing Axe',   desc: 'Tap faraway trees — WHOOSH!' },
    { day: 3, id: 'beaver',    emoji: '🦫', name: 'Beaver Buddy',   desc: 'Chip chops trees all by himself!' },
    { day: 4, id: 'golden',    emoji: '✨', name: 'Golden Axe',     desc: 'Every chop gives DOUBLE wood!' },
    { day: 5, id: 'squirrels', emoji: '🐿️', name: 'Squirrel Squad', desc: 'Acorn rain chops the trees!' }
  ],

  WEAPONS: [
    { id: 'sword',    emoji: '⚔️', name: 'Sparkle Sword',        cost: 0,  cd: 0,  desc: 'Tap zombies to BONK them!' },
    { id: 'chicken',  emoji: '🐔', name: 'Chicken Launcher',     cost: 10, cd: 6,  desc: 'HONK! Bowls right through the horde!' },
    { id: 'marsh',    emoji: '🍡', name: 'Marshmallow Catapult', cost: 14, cd: 8,  desc: 'SPLAT! Sticky goo slows them down!' },
    { id: 'bubble',   emoji: '🫧', name: 'Bubble Blaster',       cost: 18, cd: 12, desc: 'Trap zombies and float them away!' },
    { id: 'banana',   emoji: '🍌', name: 'Banana-rang',          cost: 24, cd: 10, desc: 'Sweeps EVERY zombie — and comes back!' },
    { id: 'confetti', emoji: '🎉', name: 'Confetti Cannon',      cost: 30, cd: 0, once: true, desc: 'MEGA party blast! Once a night!' }
  ],

  ZOMBIES: {
    zombo:  { hp: 2,  speed: 21, scale: 1.0,  bite: 1 },
    speedy: { hp: 1,  speed: 46, scale: 0.85, bite: 1, cone: true },
    chonko: { hp: 6,  speed: 12, scale: 1.5,  bite: 2, heavy: true },
    bouncy: { hp: 3,  speed: 25, scale: 0.95, bite: 1, hops: true },
    king:   { hp: 26, speed: 8,  scale: 2.0,  bite: 3, heavy: true, king: true }
  },

  /* GEAR — a modifier on top of a zombie kind, never a new kind. Each is a small puzzle:
     a gear must change HOW you beat him, not just how long it takes.
     The full gear × counter matrix lives in the design doc; cd-night.js implements it. */
  GEAR: {
    shield:  { emoji: '🛡️', name: 'Shield Zombie',  blocks: 3,   hint: 'Bonks bounce off! Try the chicken 🐔' },
    helmet:  { emoji: '⛑️', name: 'Helmet Zombie',  taps: 2,     hint: 'Knock the helmet off first!' },
    ladder:  { emoji: '🪜', name: 'Ladder Zombie',  biteMul: 2,  hint: 'He climbs OVER! Slow him down 🍡' },
    balloon: { emoji: '🎈', name: 'Balloon Zombie', lift: 74,    hint: 'Too high to bonk! Pop him 🍌🫧' }
  },
  GEAR_IDS: ['shield', 'helmet', 'ladder', 'balloon'],

  // Gear starts on night 2 and gets commoner. The King never wears gear — he IS the King.
  gearChance(day){ return day < 2 ? 0 : Math.min(0.55, 0.15 + (day - 2) * 0.10); },
  rollGear(type, day){
    if (type === 'king') return null;
    if (Math.random() >= CD.gearChance(day)) return null;
    return CD.pick(CD.GEAR_IDS);
  },

  WAVES: {
    1: { list: [['zombo',5]], gap: [2200, 3400] },
    2: { list: [['zombo',6],['speedy',2]], gap: [1900, 3000] },
    3: { list: [['zombo',7],['speedy',3],['chonko',1]], gap: [1700, 2700] },
    4: { list: [['zombo',8],['speedy',4],['chonko',2],['bouncy',2]], gap: [1500, 2400] },
    5: { list: [['zombo',9],['speedy',5],['chonko',2],['bouncy',3],['king',1]], gap: [1300, 2200] }
  },
  // endless nights past 5
  makeWave(n){
    if (CD.WAVES[n]) return CD.WAVES[n];
    const k = n - 5;
    return {
      list: [['zombo', 9 + k*2], ['speedy', 5 + k], ['chonko', 2 + Math.ceil(k/2)], ['bouncy', 3 + k], ['king', Math.ceil(k/2)]],
      gap: [Math.max(700, 1300 - k*100), Math.max(1200, 2200 - k*150)]
    };
  },

  DAY_SECONDS: 75,
  MAX_HEARTS: 5,
  LAST_NIGHT: 5,

  state: null,

  freshState(){
    return {
      day: 1, wood: 0, weapons: ['sword'],
      seeds: ['oak'],          // owned seed species (oak is free forever)
      helpers: [],             // owned shop helper ids
      plots: CD.BASE_PLOTS,    // how many TREE_SPOTS are unlocked
      apples: 0,               // banked apples -> bonus hearts at NIGHT START only
      garden: CD.freshGarden(),// species planted per plot index
      hearts: CD.MAX_HEARTS, heartCap: CD.MAX_HEARTS, phase: 'title',
      chopped: 0, bonked: 0, won: false
    };
  },
  freshGarden(){ return CD.TREE_SPOTS.map(() => 'oak'); },

  save(){
    const s = CD.state;
    CDStore.set('cdSaveV2', JSON.stringify({
      day: s.day, wood: s.wood, weapons: s.weapons,
      seeds: s.seeds, helpers: s.helpers, plots: s.plots,
      apples: s.apples, garden: s.garden,
      chopped: s.chopped, bonked: s.bonked, won: s.won
    }));
  },
  loadSave(){
    try {
      const raw = CDStore.get('cdSaveV2');
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (!d || !d.day) return null;
      /* A save written before the garden existed has none of these fields. Default every one of
         them — Maya has real progress saved and a crash here would eat it. */
      if (!Array.isArray(d.weapons) || !d.weapons.length) d.weapons = ['sword'];
      if (!Array.isArray(d.seeds) || !d.seeds.length) d.seeds = ['oak'];
      if (!Array.isArray(d.helpers)) d.helpers = [];
      if (typeof d.plots !== 'number' || !(d.plots >= CD.BASE_PLOTS)) d.plots = CD.BASE_PLOTS;
      d.plots = Math.min(d.plots, CD.TREE_SPOTS.length);
      if (typeof d.apples !== 'number' || d.apples < 0) d.apples = 0;
      if (!Array.isArray(d.garden) || d.garden.length !== CD.TREE_SPOTS.length) d.garden = CD.freshGarden();
      d.garden = d.garden.map(sp => CD.TREE_SPECIES[sp] ? sp : 'oak');
      return d;
    } catch(e){ return null; }
  },
  clearSave(){ CDStore.remove('cdSaveV2'); },

  hasTool(id){
    const t = CD.TOOLS.find(t => t.id === id);
    return t && CD.state.day >= t.day;
  },
  hasWeapon(id){ return CD.state.weapons.indexOf(id) >= 0; },

  /* ---------- garden API (cd-day / cd-art / cd-ui all go through these) ---------- */
  hasSeed(id){ return id === 'oak' || CD.state.seeds.indexOf(id) >= 0; },
  hasHelper(id){ return CD.state.helpers.indexOf(id) >= 0; },
  plotUnlocked(i){ return i < CD.state.plots; },
  nextPlotIdx(){ return CD.state.plots < CD.TREE_SPOTS.length ? CD.state.plots : -1; },
  nextPlotCost(){ const i = CD.nextPlotIdx(); return i < 0 ? 0 : CD.TREE_SPOTS[i].cost; },

  speciesOf(i){ return CD.TREE_SPECIES[CD.state.garden[i]] ? CD.state.garden[i] : 'oak'; },
  spec(i){ return CD.TREE_SPECIES[CD.speciesOf(i)]; },
  setSpecies(i, id){ if (CD.TREE_SPECIES[id]) { CD.state.garden[i] = id; CD.save(); } },

  // a spot's own max ANDed with the species cap
  maxStageFor(i){ return Math.min(CD.TREE_SPOTS[i].max, CD.spec(i).maxStage); },
  growMsFor(i){ return CD.GROW_MS * CD.spec(i).grow; },
  woodFor(i, stage){
    const base = CD.TREE_STAGES[stage].wood;
    if (!base) return 0;
    return Math.max(1, Math.round(base * CD.spec(i).wood));
  },
  groundY(i){ return CD.GROUND + (CD.TREE_SPOTS[i].dy || 0); },

  // hearts you START the night with: full + banked apples (capped). Spent on use.
  nightHearts(){ return CD.MAX_HEARTS + Math.min(CD.state.apples, CD.MAX_BONUS_HEARTS); },

  rnd(a, b){ return a + Math.random() * (b - a); },
  pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
};
})();
