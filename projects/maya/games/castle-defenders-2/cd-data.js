/* Castle Defenders v2 — config + state */
(function(){
'use strict';

window.CD = {
  W: 960, H: 600, GROUND: 522,
  scene: null, game: null,

  TREE_SPOTS: [
    { x: 305, max: 1 },
    { x: 415, max: 2 },
    { x: 525, max: 1 },
    { x: 650, max: 2 },
    { x: 830, max: 3 }   // Grandpa Tree — the GIANT
  ],

  // stage: 0 sprout, 1 small, 2 big, 3 giant
  TREE_STAGES: {
    0: { name: 'Sprout',  chops: 0,  wood: 0,  h: 46,  canopy: 26 },
    1: { name: 'Tree',    chops: 3,  wood: 2,  h: 130, canopy: 52 },
    2: { name: 'Big Tree',chops: 6,  wood: 5,  h: 215, canopy: 82 },
    3: { name: 'Grandpa Tree', chops: 12, wood: 14, h: 330, canopy: 120 }
  },
  GROW_MS: 9000,          // time per growth stage
  REGROW_DELAY: 5000,     // stump -> sprout

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
      hearts: CD.MAX_HEARTS, phase: 'title',
      chopped: 0, bonked: 0, won: false
    };
  },

  save(){
    const s = CD.state;
    try {
      localStorage.setItem('cdSaveV2', JSON.stringify({
        day: s.day, wood: s.wood, weapons: s.weapons,
        chopped: s.chopped, bonked: s.bonked, won: s.won
      }));
    } catch(e){}
  },
  loadSave(){
    try {
      const raw = localStorage.getItem('cdSaveV2');
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (!d || !d.day) return null;
      return d;
    } catch(e){ return null; }
  },
  clearSave(){ try { localStorage.removeItem('cdSaveV2'); } catch(e){} },

  hasTool(id){
    const t = CD.TOOLS.find(t => t.id === id);
    return t && CD.state.day >= t.day;
  },
  hasWeapon(id){ return CD.state.weapons.indexOf(id) >= 0; },

  rnd(a, b){ return a + Math.random() * (b - a); },
  pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
};
})();
