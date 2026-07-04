// ════════════════════════════════════════════════════════════
//  MAYA'S SEWING MUSEUM — data: exhibits, rooms, visitors, dialogue
//  Edit names / prices / lines here. Logic lives in museum-game.js
// ════════════════════════════════════════════════════════════

// ── Rooms ──
const MUSEUM_ROOMS = {
  cozy:   { name:'Cozy Wear',      emoji:'🧣', accent:'#5bc8ff' },
  fancy:  { name:'Fancy Things',   emoji:'✨', accent:'#c77dff' },
  vault:  { name:'Treasure Vault', emoji:'👑', accent:'#ffe14d' },
  secret: { name:'Secret Room',    emoji:'🤫', accent:'#ff6eb4' },
};

// ── The 16 things from Maya's Sewing Shop ──
// Only items in the shop save's `unlocked` list appear on pedestals;
// the rest show as locked "not sewn yet" ghosts.
const MUSEUM_ITEMS = [
  // COZY WEAR
  { key:'cap',     emoji:'🧢', name:'Cap',      price:5,  room:'cozy',  color:'#5bc8ff', desc:'Keeps the sun out of your eyes. Backwards is cooler 😎' },
  { key:'scarf',   emoji:'🧣', name:'Scarf',    price:6,  room:'cozy',  color:'#ff6eb4', desc:'Extra long, extra snuggly. Wraps around TWICE!' },
  { key:'socks',   emoji:'🧦', name:'Socks',    price:4,  room:'cozy',  color:'#5dffb0', desc:'Warm toes = happy toes. No holes, promise!' },
  { key:'mittens', emoji:'🧤', name:'Mittens',  price:5,  room:'cozy',  color:'#5dffb0', desc:'Snowball-proof! Sewn double-thick.' },
  { key:'boots',   emoji:'🥾', name:'Boots',    price:8,  room:'cozy',  color:'#ff9a3c', desc:'Stomp in ALL the puddles. Go ahead.' },
  { key:'coat',    emoji:'🧥', name:'Coat',     price:11, room:'cozy',  color:'#5bc8ff', desc:'Winter\u2019s coziest armor.' },
  { key:'sunhat',  emoji:'👒', name:'Sun Hat',  price:7,  room:'cozy',  color:'#ffe14d', desc:'Floppy and fabulous. Beach approved! 🏖️' },
  // FANCY THINGS
  { key:'umbrella',emoji:'☂️', name:'Umbrella', price:7,  room:'fancy', color:'#c77dff', desc:'Rain? What rain? ☔' },
  { key:'bow',     emoji:'🎀', name:'Bow',      price:3,  room:'fancy', color:'#ff6eb4', desc:'For hair, gifts, or cats. Very fancy.' },
  { key:'glasses', emoji:'👓', name:'Glasses',  price:6,  room:'fancy', color:'#5bc8ff', desc:'See the world in style. (It\u2019s felt, not glass!)' },
  { key:'watch',   emoji:'⌚', name:'Watch',    price:9,  room:'fancy', color:'#5dffb0', desc:'Always says it\u2019s playtime ⏰' },
  { key:'bag',     emoji:'👜', name:'Bag',      price:8,  room:'fancy', color:'#ff9a3c', desc:'Fits snacks, treasures, AND a teddy.' },
  { key:'dress',   emoji:'👗', name:'Dress',    price:10, room:'fancy', color:'#c77dff', desc:'Twirls PERFECTLY. Tested 100 times.', dais:true },
  { key:'teddy',   emoji:'🧸', name:'Teddy',    price:9,  room:'fancy', color:'#ffe14d', desc:'Sewn with extra love. Best hugger in the museum.', dais:true },
  // TREASURE VAULT
  { key:'crown',   emoji:'👑', name:'Crown',    price:14, room:'vault', color:'#ffe14d', desc:'For museum royalty only. Shhh… try it on with your eyes.', treasure:true },
  { key:'ring',    emoji:'💍', name:'Ring',     price:16, room:'vault', color:'#ff6eb4', desc:'The shiniest treasure here. One of a kind! 💎', treasure:true },
];

// ── Visitors who come to look around (from the Sewing Shop!) ──
const MUSEUM_VISITORS = [
  { emoji:'🐉', name:'Ruby the Dragon' },
  { emoji:'👸', name:'Princess Pearl' },
  { emoji:'🤖', name:'Beep the Robot' },
  { emoji:'🐱', name:'Sir Whiskers' },
  { emoji:'👵', name:'Granny Lou' },
  { emoji:'👽', name:'Zorp the Alien' },
  { emoji:'🦖', name:'Dino Dan' },
  { emoji:'🐸', name:'Mr. Hoppy' },
  { emoji:'🧙‍♀️', name:'Wanda the Witch' },
  { emoji:'🐼', name:'Bao the Panda' },
  { emoji:'🧜‍♀️', name:'Coral the Mermaid' },
  { emoji:'🤠', name:'Tex' },
  { emoji:'🐰', name:'Tofu the Bunny' },
  { emoji:'🦉', name:'Professor Hoot' },
  { emoji:'🐧', name:'Waddles' },
  { emoji:'🦊', name:'Finn the Fox' },
  { emoji:'🐻', name:'Big Bjorn' },
];

// ── What visitors say while admiring an exhibit. {item} = item name ──
const ADMIRE_LINES = [
  'Ooooh, the {item}! 😍',
  'Did Maya really sew this {item}?!',
  'That {item} is sooo cute 🥰',
  'I\u2019ve never seen a {item} like it!',
  'Wow. Just… wow. 🤩',
  'The {item} is my favorite!',
  '*takes a photo* 📸',
  'A masterpiece! 🖼️',
];

// ── When a visitor wants to buy — they WAIT for Maya to come sell! ──
const WAIT_LINES = [
  '🙋 I want the {item}! Maya!!',
  '🙋 Can I buy the {item}? Pleease!',
  '🙋 The {item}! I MUST have it!',
  '🙋 Maya! One {item} please!',
  '🙋 I\u2019ll pay {price} coins for the {item}!',
];

// ── Right after Maya sells to them ──
const BUY_LINES = [
  'Best museum EVER! ⭐',
  'Thank you, Maya! 💕',
  'I\u2019ll tell ALL my friends! 📣',
  'Yay!! 🎉',
  'So talented! ✨',
];

// ── If Maya doesn't come in time ──
const SIGH_LINES = [
  'Maybe next time… 🥺',
  'Aww. I\u2019ll think about it…',
  'Hmm, my bus is coming! 🚌',
  'I\u2019ll be back for it! 👀',
];

// ── Wandering small talk (no item) ──
const PASS_LINES = [
  '🎵 la la la…',
  'So fancy in here! ✨',
  'Which one is my favorite…? 🤔',
  'Ooh, pretty lights!',
  '*happy museum walk*',
  'My grandma would love this place.',
];

// ── When a visitor walks in the door ──
const ENTER_LINES = [
  'Hello hellooo! 👋',
  'Is this Maya\u2019s museum?! 😍',
  'I heard about this place!',
  '*gasp* It\u2019s beautiful!',
];

// ── Toast shown after a sale. {name}=visitor, {item}=item, {price}=coins ──
const SALE_TOASTS = [
  'You sold the {item} to {name}! +{price} 🪙',
  '{name} took home the {item}! +{price} 🪙',
  'SOLD! The {item} → {name} · +{price} 🪙',
];

// ── The unicorn who lives in the secret room ──
const UNICORN_LINES = [
  'You found me! ✨',
  'Shhh… this room is just for us 🤫',
  'I guard Maya\u2019s first stitch!',
  'Rainbow power! 🌈',
];

// ── The secret exhibit ──
const SECRET_EXHIBIT = {
  emoji:'🧵', name:'Maya\u2019s First Stitch',
  desc:'The very first thing Maya ever sewed. Where it ALL began. 💗',
  color:'#ff6eb4',
};

const MUSEUM_MOTTO = 'Every single thing here was sewn by Maya ✂️';
