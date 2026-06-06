/* ============================================================
   Legend of the Rainbow Dragon — GAME DATA
   Kid-safe content: monsters are silly friends, nobody gets hurt.
   ============================================================ */
window.LORD = window.LORD || {};

LORD.CONFIG = {
  SAVE_KEY: 'lord_rainbow_dragon_v2',
  CONSOLE_NAME: 'Sparkle Dragon 3000',
  GAME_TITLE: 'Legend of the Rainbow Dragon',
  GAME_NICK: 'LORD',
  MAX_TURNS: 18,
  BOSS_UNLOCK_LEVEL: 12,
  BOSS_MAX_HP: 220,
  BOSS_NG_HP: 360,
};

LORD.AVATARS = ['🧚‍♀️', '🦸‍♀️', '🧝‍♀️', '🦄', '🐱', '🐉', '👑', '🌟'];

/* ---- Hero start ---- */
LORD.START = {
  level: 1, xp: 0, hp: 20, maxHp: 20,
  str: 8, def: 4, charm: 5, gold: 120,
  weaponId: 'stick', armorId: 'none',
};

/* ============================================================
   BIOMES — Adventure zones unlocked by level.
   Each = a place she can explore, with its own look + creatures.
   This is the progression / "I unlocked a new place!" feeling.
   ============================================================ */
LORD.BIOMES = [
  {
    id: 'meadow', name: 'Sunny Meadow', emoji: '🌻', minLv: 1,
    sky: ['#3a2a6e', '#6b4ea8'], ground: '#8e6fd6',
    decor: ['🌷', '🦋', '🌼', '☀️'],
    blurb: 'Soft grass and giggly little critters.',
    pool: ['slime', 'bunny', 'pixie', 'goofball'], diff: 1.0,
  },
  {
    id: 'forest', name: 'Giggle Forest', emoji: '🌲', minLv: 3,
    sky: ['#15314b', '#1f6f4a'], ground: '#1a4a30',
    decor: ['🌲', '🍄', '✨', '🦔'],
    blurb: 'Twisty trees and ticklish forest friends.',
    pool: ['bat', 'muffin', 'bear', 'crab'], diff: 1.25,
  },
  {
    id: 'caves', name: 'Crystal Caves', emoji: '💎', minLv: 6,
    sky: ['#241b4e', '#3b2e8f'], ground: '#2a2168',
    decor: ['💎', '🔮', '✨', '🦇'],
    blurb: 'Sparkly gems and shimmer-sprites.',
    pool: ['sprite', 'golem', 'snail', 'wizard'], diff: 1.55,
  },
  {
    id: 'clouds', name: 'Cloud Castle', emoji: '☁️', minLv: 9,
    sky: ['#2b3a6e', '#5b8fd6'], ground: '#4a6fb0',
    decor: ['☁️', '⚡', '🌟', '🎈'],
    blurb: 'Fluffy clouds and bouncy sky-buddies.',
    pool: ['zap', 'jester', 'puppy', 'lizard'], diff: 1.9,
  },
  {
    id: 'peak', name: 'Rainbow Peak', emoji: '🌈', minLv: 12,
    sky: ['#3a1a5e', '#b84fb0'], ground: '#7a2f8f',
    decor: ['🌈', '🐲', '💫', '🏔️'],
    blurb: 'The tippy-top, where the Rainbow Dragon naps.',
    pool: ['pup', 'noodle', 'lizard', 'jester'], diff: 2.3,
  },
];

/* ============================================================
   MONSTERS — silly rivals. atk/def/hp are BASE; scaled by level.
   ============================================================ */
LORD.MONSTERS = {
  slime:    { name: 'Silly Slime',     emoji: '🟢', hp: 8,  atk: 3, def: 0, xp: 14, gold: 9 },
  bunny:    { name: 'Bouncy Bunny',    emoji: '🐰', hp: 9,  atk: 4, def: 0, xp: 16, gold: 10 },
  pixie:    { name: 'Puddle Pixie',    emoji: '💧', hp: 10, atk: 4, def: 1, xp: 17, gold: 11 },
  goofball: { name: 'Giggle Goofball', emoji: '🤪', hp: 11, atk: 5, def: 1, xp: 19, gold: 12 },
  bat:      { name: 'Flappy Bat',      emoji: '🦇', hp: 14, atk: 6, def: 1, xp: 26, gold: 16 },
  muffin:   { name: 'Moss Muffin',     emoji: '🧁', hp: 18, atk: 6, def: 3, xp: 30, gold: 20 },
  bear:     { name: 'Grumbly Bear',    emoji: '🐻', hp: 20, atk: 7, def: 3, xp: 34, gold: 24 },
  crab:     { name: 'Candy Crab',      emoji: '🦀', hp: 16, atk: 6, def: 4, xp: 28, gold: 19 },
  sprite:   { name: 'Crystal Sprite',  emoji: '✨', hp: 18, atk: 9, def: 2, xp: 42, gold: 28 },
  golem:    { name: 'Cookie Golem',    emoji: '🍪', hp: 30, atk: 8, def: 6, xp: 52, gold: 36 },
  snail:    { name: 'Giant Snail Pal', emoji: '🐌', hp: 26, atk: 7, def: 7, xp: 44, gold: 33 },
  wizard:   { name: 'Sparkle Wizard',  emoji: '🧙', hp: 22, atk: 11, def: 3, xp: 48, gold: 31 },
  zap:      { name: 'Zap Knight',      emoji: '⚡', hp: 32, atk: 13, def: 6, xp: 70, gold: 50 },
  jester:   { name: 'Party Jester',    emoji: '🃏', hp: 26, atk: 14, def: 3, xp: 60, gold: 44 },
  puppy:    { name: 'Cloud Puppy',     emoji: '🐺', hp: 28, atk: 12, def: 4, xp: 64, gold: 46 },
  lizard:   { name: 'Lollipop Lizard', emoji: '🦎', hp: 36, atk: 15, def: 5, xp: 80, gold: 56 },
  pup:      { name: 'Dragon Pup',      emoji: '🐲', hp: 40, atk: 16, def: 5, xp: 92, gold: 64 },
  noodle:   { name: 'Moon Noodle',     emoji: '🐍', hp: 34, atk: 17, def: 4, xp: 84, gold: 60 },
};

LORD.STAR_PREFIX = ['Rainbow', 'Star', 'Sparkly', 'Mega', 'Glitter'];

/* ============================================================
   GEAR
   ============================================================ */
LORD.WEAPONS = [
  { id: 'stick',   name: 'Twig Wand',        emoji: '🪄', str: 0,  cost: 0,    minLv: 1 },
  { id: 'wood',    name: 'Wooden Sword',     emoji: '🗡️', str: 5,  cost: 120,  minLv: 2 },
  { id: 'silver',  name: 'Silver Blade',     emoji: '⚔️', str: 12, cost: 360,  minLv: 5 },
  { id: 'rainbow', name: 'Rainbow Saber',    emoji: '🌈', str: 22, cost: 820,  minLv: 9 },
  { id: 'star',    name: 'Starlight Dagger', emoji: '💫', str: 34, cost: 1500, minLv: 14 },
];
LORD.ARMOR = [
  { id: 'none',    name: 'Cozy Clothes',  emoji: '👕', def: 0,  cost: 0,   minLv: 1 },
  { id: 'leather', name: 'Leather Vest',  emoji: '🦺', def: 3,  cost: 110, minLv: 3 },
  { id: 'chain',   name: 'Shiny Mail',    emoji: '🛡️', def: 7,  cost: 320, minLv: 6 },
  { id: 'rainbow', name: 'Rainbow Shield',emoji: '🌟', def: 13, cost: 760, minLv: 10 },
];

/* ============================================================
   SNACK BAR — jokes (giggles), riddles (learning), buddies, muffins
   ============================================================ */
LORD.JOKES = [
  'Why did the dragon eat a lightbulb? She wanted a light snack!',
  'What do you call a bear with no teeth? A gummy bear!',
  "Why don't eggs tell jokes? They'd crack each other up!",
  'What do elves learn in school? The elf-abet!',
  'Why did the hero bring a ladder? To reach the next level!',
  'What is a unicorn\'s favorite snack? A sugar cone with sprinkles!',
  'Why was the math book sad? It had too many problems!',
  'What do you call a sleepy dinosaur? A dino-snore!',
  'How do you make a tissue dance? Put a little boogie in it!',
  'What did the rainbow say to the rain? You can stop now, I\'ve got this!',
];
LORD.RIDDLES = [
  { q: 'I have keys but no locks. What am I?', opts: ['A piano', 'A dragon', 'A sword'], ans: 0 },
  { q: 'What has hands but cannot clap?', opts: ['A clock', 'A troll', 'A pancake'], ans: 0 },
  { q: 'What goes up but never comes down?', opts: ['Your age', 'A kite', 'Smoke'], ans: 0 },
  { q: 'I am full of holes but still hold water. What am I?', opts: ['A sponge', 'A helmet', 'A dragon'], ans: 0 },
  { q: 'What has a neck but no head?', opts: ['A bottle', 'A knight', 'A cloud'], ans: 0 },
  { q: 'What has teeth but cannot bite?', opts: ['A comb', 'A shark', 'A sword'], ans: 0 },
  { q: 'What gets bigger the more you take away?', opts: ['A hole', 'A balloon', 'A cookie'], ans: 0 },
  { q: 'What can you catch but not throw?', opts: ['A cold', 'A ball', 'A rainbow'], ans: 0 },
  { q: 'What has a ring but no finger?', opts: ['A phone', 'A tree', 'A bell'], ans: 0 },
  { q: 'I am tall when young and short when old. What am I?', opts: ['A candle', 'A tree', 'A hero'], ans: 0 },
  { q: 'What has words but never speaks?', opts: ['A book', 'A parrot', 'A river'], ans: 0 },
  { q: 'What kind of band never plays music?', opts: ['A rubber band', 'A rock band', 'A marching band'], ans: 0 },
  { q: 'What month has 28 days?', opts: ['All of them', 'Only February', 'Only June'], ans: 0 },
  { q: 'What can run but never walks?', opts: ['Water', 'A clock', 'A knight'], ans: 0 },
  { q: 'What has one eye but cannot see?', opts: ['A needle', 'A star', 'A potato'], ans: 0 },
  { q: 'What is black when clean and white when dirty?', opts: ['A chalkboard', 'A cloud', 'Snow'], ans: 0 },
  { q: 'The more you take, the more you leave behind. What?', opts: ['Footsteps', 'Gold', 'Rainbows'], ans: 0 },
  { q: 'What has a head and a tail but no body?', opts: ['A coin', 'A story', 'A muffin'], ans: 0 },
  { q: 'What can you break without touching it?', opts: ['A promise', 'A rock', 'A sword'], ans: 0 },
  { q: 'What invention lets you look through a wall?', opts: ['A window', 'A spell', 'A telescope'], ans: 0 },
];
LORD.BUDDIES = [
  { name: 'Finn the Fox', emoji: '🦊' },
  { name: 'Luna the Owl', emoji: '🦉' },
  { name: 'Bubbles the Otter', emoji: '🦦' },
  { name: 'Zap the Robot', emoji: '🤖' },
  { name: 'Pip the Penguin', emoji: '🐧' },
];

/* ---- Music Stage daily boosts ---- */
LORD.SONGS = [
  { title: 'Ballad of the Brave', text: 'Your STR grows with courage!', str: 2 },
  { title: 'Lullaby of Leaves', text: 'You feel cozy and full of pep!', hp: 12 },
  { title: 'Coin Jingle Rag', text: 'Gold jingles into your pouch!', gold: 30 },
  { title: 'Charm Waltz', text: 'Everyone adores you a little more!', charm: 4 },
  { title: 'Shield Shimmy', text: 'Your DEF dances higher!', def: 2 },
];

/* ---- Mail (from townsfolk + Dad) ---- */
LORD.MAIL = [
  { from: 'Town Elder 🧓', text: 'Brave one, the Rainbow Dragon snores glitter. Stock up at the shop!' },
  { from: 'Healer Greenleaf 🌿', text: 'When your HP is low, rest at the Inn for free hugs and health!' },
  { from: 'Snack Bar Betty 🧁', text: 'Try the riddles — I hide extra gold in the right answers!' },
  { from: 'Forest Ranger 🌲', text: 'Star monsters glow gold — they share extra-sparkly loot!' },
  { from: 'DJ Stringsong 🎵', text: 'Visit the Music Stage once a day for a free power boost!' },
  { from: 'Dad 💖', text: 'So proud of you, superstar. Go befriend that dragon! Love, Dad.' },
  { from: 'Dad 💖', text: 'You are braver than a knight and kinder than a fairy. xoxo Dad.' },
  { from: 'Cloud Mayor ☁️', text: 'Higher places have tougher friends — gear up before you climb!' },
];

/* ---- Achievements (🏅 — never scary) ---- */
LORD.ACHIEVEMENTS = [
  { id: 'first_fight', em: '⚔️', name: 'First Win', desc: 'Win your first play-fight' },
  { id: 'lv5', em: '⭐', name: 'Rising Star', desc: 'Reach level 5' },
  { id: 'lv10', em: '🌟', name: 'Realm Champion', desc: 'Reach level 10' },
  { id: 'rich', em: '🪙', name: 'Treasure Pal', desc: 'Hold 500 gold' },
  { id: 'charming', em: '✨', name: 'Super Charming', desc: 'Reach 15 Charm' },
  { id: 'buddy', em: '🐾', name: 'Best Friends', desc: 'Recruit an Adventure Buddy' },
  { id: 'explorer', em: '🗺️', name: 'Explorer', desc: 'Visit all 5 adventure places' },
  { id: 'super', em: '💥', name: 'Super Striker', desc: 'Land a SUPER hit' },
  { id: 'dragon', em: '🐉', name: 'Dragon Friend', desc: 'Befriend the Rainbow Dragon' },
  { id: 'ng', em: '👑', name: 'Double Legend', desc: 'Win the extra-tough rematch' },
  { id: 'kills50', em: '🏅', name: 'Friend Maker', desc: 'Make friends with 50 critters' },
];

/* ---- Hub tip bubbles (short, peppy) ---- */
LORD.TIPS = [
  "Today's vibe: extra sparkly! ✨",
  'Tap STRIKE in the gold zone for a SUPER hit! 💥',
  'New places unlock as you level up. Keep going! 🗺️',
  'Low on hearts? The Inn is free! 🏠',
  'Snack Bar riddles hide bonus gold. 🧠',
  'Music Stage gives a free boost once a day. 🎵',
  'Star monsters glow gold and give extra loot! ⭐',
  'Check your Mailbox — Dad writes to you! 💌',
  'If a slime bounces twice, say hi. 🟢',
  'Buy gear at the Shop to hit harder! 🛡️',
];

/* ---- Forest goodies (no-fight happy events) ---- */
LORD.GOODIES = [
  { text: 'A unicorn shares a cupcake!', gold: 12 },
  { text: 'You found coins behind a mushroom!', gold: 16 },
  { text: 'A cloud high-fives you — so cozy!', hp: 8 },
  { text: 'Rainbow butterflies cheer you up!', charm: 2 },
  { text: 'A squirrel trades you shiny acorns!', gold: 20 },
  { text: 'You nap in a flower hammock. Comfy!', hp: 12 },
];
LORD.TREASURE = [
  { text: '📦 Treasure chest! Sparkly gold!', gold: 40 },
  { text: '📦 The chest had a healing potion!', hp: 16 },
  { text: '📦 Gems and good vibes!', gold: 26, charm: 2 },
];
