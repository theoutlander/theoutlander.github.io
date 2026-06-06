// ════════════════════════════════════════════════════════════
//  MAYA'S SEWING SHOP — data: things to sew, customers, dialogue
//  Edit names / prices / lines here. Logic lives in mayas-sewing-shop.js
// ════════════════════════════════════════════════════════════

// ── Things Maya can sew (appear on the shelf) ──
const ITEMS = [
  { key:'cap',     emoji:'🧢', name:'cap',     price:5 },
  { key:'scarf',   emoji:'🧣', name:'scarf',   price:6 },
  { key:'socks',   emoji:'🧦', name:'socks',   price:4 },
  { key:'bag',     emoji:'👜', name:'bag',     price:8 },
  { key:'teddy',   emoji:'🧸', name:'teddy',   price:9 },
  { key:'bow',     emoji:'🎀', name:'bow',     price:3 },
  { key:'mittens', emoji:'🧤', name:'mittens', price:5 },
  { key:'sunhat',  emoji:'👒', name:'sun hat', price:7 },
  { key:'boots',   emoji:'🥾', name:'boots',   price:8 },
  { key:'dress',   emoji:'👗', name:'dress',   price:10 },
  { key:'glasses', emoji:'👓', name:'glasses', price:6 },
  { key:'umbrella',emoji:'☂️', name:'umbrella',price:7 },
  { key:'coat',    emoji:'🧥', name:'coat',    price:11 },
  { key:'watch',   emoji:'⌚', name:'watch',   price:9 },
  { key:'crown',   emoji:'👑', name:'crown',   price:14 },
  { key:'ring',    emoji:'💍', name:'ring',    price:16 },
];

// ── Shopkeeper avatars (pick at the start) ──
const KEEPERS = ['👧','🧒','👩‍🦰','🧕','👩‍🦱','🧚‍♀️','👸','🦸‍♀️'];

// ── Customers who stroll by (creatures + people!) ──
const CUSTOMERS = [
  { emoji:'🐉', name:'Ruby the Dragon' },
  { emoji:'👸', name:'Princess Pearl' },
  { emoji:'🤖', name:'Beep the Robot' },
  { emoji:'🐱', name:'Sir Whiskers' },
  { emoji:'👵', name:'Granny Lou' },
  { emoji:'👽', name:'Zorp the Alien' },
  { emoji:'🦖', name:'Dino Dan' },
  { emoji:'🦄', name:'Sparkle' },
  { emoji:'🐸', name:'Mr. Hoppy' },
  { emoji:'🧙‍♀️', name:'Wanda the Witch' },
  { emoji:'🐼', name:'Bao the Panda' },
  { emoji:'🧛', name:'Count Sniff' },
  { emoji:'🧜‍♀️', name:'Coral the Mermaid' },
  { emoji:'🤠', name:'Tex' },
  { emoji:'🐰', name:'Tofu the Bunny' },
  { emoji:'🐵', name:'Cheeky the Monkey' },
  { emoji:'🦉', name:'Professor Hoot' },
  { emoji:'🐧', name:'Waddles' },
  { emoji:'🦊', name:'Finn the Fox' },
  { emoji:'🐻', name:'Big Bjorn' },
  { emoji:'🧚‍♀️', name:'Grandma Rose' },
  { emoji:'🧝‍♂️', name:'Elwin the Elf' },
  { emoji:'🧌', name:'Tilly the Troll' },
  { emoji:'🐙', name:'Inky' },
];

// ── VIP customers — rare, fancy, and pay DOUBLE! 💰 ──
const VIPS = [
  { emoji:'🤴', name:'Prince Percy' },
  { emoji:'👰', name:'Lady Belle' },
  { emoji:'🤵', name:'Mr. Moneybags' },
  { emoji:'🎅', name:'Santa!' },
  { emoji:'🧚‍♂️', name:'The Royal Wizard' },
  { emoji:'😎', name:'A Famous Popstar' },
];

// ── When a customer wants an item you sewed. {item} = the item. ──
const WANT_LINES = [
  "Ooh! How much for the {item}? 😍",
  "I LOVE that {item}! Can I buy it?",
  "That {item} is sooo cute! 🥰",
  "Pssst… is the {item} for sale?",
  "I NEED that {item}! 🤩",
  "Did you really sew that {item}? Wow!",
  "One {item}, please! 🙏",
  "That {item} would look amazing on me!",
  "My friend has a {item} and now I want one too!",
  "Is the {item} my size? I'll take it!",
  "Wow, a {item}! Just what I needed today!",
  "That {item} is calling my name! 📣",
];

// ── What the customer says when they happily buy ──
const BUY_LINES = [
  "Yay! Thank you! 💕",
  "Best shop EVER! ⭐",
  "Ooh, I love it! 🥰",
  "Wrap it up! 🎁",
  "Take my coins! 🪙",
  "You're so talented! ✨",
  "I'll tell ALL my friends! 📣",
];

// ── What they say when you shoo them out ("get out of my shop!") ──
const SHOO_LINES = [
  "Wha— how RUDE! 😡",
  "Hmph! I'll shop somewhere else! 😤",
  "Meanie! 😭",
  "Okay okay, I'm GOING! 😨",
  "You don't have to be mean! 🥺",
  "Well, I NEVER! 😠",
];

// ── When the shelf is empty and someone stops by ──
const EMPTY_WANTS = [
  "Aw, your shelf is empty! Make me something? 🥺",
  "Nothing to buy yet… sew something cute! 🧵",
  "I'll come back when you've made stuff! 👀",
];

// ── Folks who just wander past without stopping ──
const PASS_THOUGHTS = [
  "💭 just looking…",
  "🎵 la la la…",
  "💭 maybe later…",
  "👀 ooh, pretty!",
  "💭 not today…",
  "🎵 doo doo doo…",
  "💭 I'm late! gotta go!",
  "💭 already have one…",
  "👀 nice shop!",
  "💭 hmm, maybe…",
];

// ── Special encounters (random surprises!) ──
const SPECIALS = [
  {
    id:'bathroom',
    say:"Um… can I please use your bathroom? 🥺",
    options:[
      { text:"Go then — go pee, I'll wait! 🚽", kind:'kind',
        reply:"Phew! Thank you SO much! I'll buy something now! 🙏" },
      { text:"No! This is a SHOP! 😤", kind:'mean' },
    ],
  },
  {
    id:'free',
    say:"Can I have it for FREE? Pretty please? 🥺",
    options:[
      { text:"No way — coins please! 🪙", kind:'wantback' },
      { text:"…okay, just this once 🥹", kind:'gift',
        reply:"You're the BEST! 💖" },
      { text:"Get out of my shop! 😤", kind:'mean' },
    ],
  },
  {
    id:'compliment',
    say:"Your shop is the cutest in town! 😍",
    options:[
      { text:"Aww, thank you! 💕", kind:'thanks', reply:"Hee hee! 🥰" },
      { text:"I know! Now buy something! 😆", kind:'thanks', reply:"Ha! Okay okay! 😂" },
    ],
  },
  {
    id:'lost',
    say:"I'm lost! Where's the candy shop? 🍭",
    options:[
      { text:"Two doors down! 👉", kind:'thanks', reply:"Thank you! Byeee! 👋" },
      { text:"Dunno — buy a hat instead? 🧢", kind:'thanks', reply:"Hee, maybe later! 😄" },
    ],
  },
  {
    id:'snack',
    say:"Do you sell snacks? I'm SO hungry! 😋",
    options:[
      { text:"Just clothes, silly! 😅", kind:'thanks', reply:"Aw, okay! 😆" },
      { text:"Try Maya's Kitchen! 🍳", kind:'thanks', reply:"Ooh, good idea! 🤤" },
      { text:"Out! No loitering! 😤", kind:'mean' },
    ],
  },
  {
    id:'tryon',
    say:"Can I try things on first? 👀",
    options:[
      { text:"Of course! Take your time 😊", kind:'thanks', reply:"It fits PERFECT! I'll take it! 🥰" },
      { text:"Looking is buying here! 😄", kind:'thanks', reply:"Ha! Fair enough! 😅" },
      { text:"No touching! Out! 😤", kind:'mean' },
    ],
  },
  {
    id:'color',
    say:"Do you have this in PURPLE? 💜",
    options:[
      { text:"I can design one! 🎨", kind:'thanks', reply:"Yes please! You're amazing! ✨" },
      { text:"Purple's sold out, sorry! 🙅", kind:'thanks', reply:"Aw, next time! 🙊" },
    ],
  },
  {
    id:'joke',
    say:"Tell me a joke for a discount? 😄",
    options:[
      { text:"Why did the thread blush? It saw the needle's eye! 😂", kind:'thanks', reply:"HAHA! Okay, I'm buying! 😆" },
      { text:"No jokes, just shopping! 🙄", kind:'thanks', reply:"Fiiine. 😑" },
    ],
  },
  {
    id:'pet',
    say:"My puppy needs a tiny hat! 🐶",
    options:[
      { text:"Awww, coming right up! 💕", kind:'thanks', reply:"He looks SO cute now! 🥰" },
      { text:"We don't do pets! 😤", kind:'mean' },
    ],
  },
  {
    id:'photo',
    say:"Can I take a photo of your shop? 📸",
    options:[
      { text:"Sure! Say cheese! 📸", kind:'thanks', reply:"I'll post it everywhere! ⭐" },
      { text:"That'll be 1 coin! 😏", kind:'thanks', reply:"Hee, worth it! 😄" },
    ],
  },
];

// ── VIP lines (they pay DOUBLE — don't shoo them away!) ──
const VIP_WANT_LINES = [
  "I'm VERY rich. I'll pay DOUBLE for that {item}! 💎",
  "Splendid {item}! Money is no object! 🤑",
  "A {item}! Charge me whatever you like! 💰",
  "Exquisite {item}! I must have it, double price! 👑",
];
const VIP_BUY_LINES = [
  "Marvelous! Keep the change! 💰",
  "Simply divine! 💎",
  "Worth every coin! 🤑",
  "I'll be back with friends! 🎩",
];

// ── Word-of-mouth: after a gift, eager referred customers show up ──
const REFERRAL_LINES = [
  "My friend said you're SO nice! I want to buy a {item}! 💖",
  "I heard you give the BEST stuff! One {item}, please! 🤩",
  "Everyone's talking about your shop! I'll take the {item}! ⭐",
  "You gave my buddy a freebie — here, I'll PAY for this {item}! 🪙",
];

// ════════════════════════════════════════════════════════════
//  UNLOCKS — Maya starts with these, earns the rest by winning days
// ════════════════════════════════════════════════════════════
const STARTER_KEYS = ['cap','scarf','socks','bag','teddy'];
const UNLOCK_ORDER = ['bow','mittens','sunhat','boots','glasses','umbrella','dress','watch','coat','crown','ring'];

// ════════════════════════════════════════════════════════════
//  DESIGN STUDIO — Maya makes her OWN things and hangs them up
// ════════════════════════════════════════════════════════════
const DESIGN_BASES = [
  { key:'shirt', emoji:'👕', name:'shirt', base:4 },
  { key:'dress', emoji:'👗', name:'dress', base:6 },
  { key:'hat',   emoji:'🧢', name:'hat',   base:4 },
  { key:'bag',   emoji:'👜', name:'bag',   base:5 },
  { key:'top',   emoji:'👚', name:'top',   base:5 },
  { key:'shoes', emoji:'👟', name:'shoes', base:5 },
  { key:'scarf', emoji:'🧣', name:'scarf', base:5 },
  { key:'coat',  emoji:'🧥', name:'coat',  base:7 },
  { key:'crown', emoji:'👑', name:'crown', base:8 },
  { key:'teddy', emoji:'🧸', name:'teddy', base:7 },
];

const FABRICS = [
  { name:'pink',    css:'#ff6eb4' },
  { name:'yellow',  css:'#ffe14d' },
  { name:'mint',    css:'#5dffb0' },
  { name:'blue',    css:'#5bc8ff' },
  { name:'purple',  css:'#c77dff' },
  { name:'orange',  css:'#ff9a3c' },
  { name:'rainbow', css:'linear-gradient(135deg,#ff6eb4,#ffe14d,#5dffb0,#5bc8ff,#c77dff)' },
];

const STICKERS = ['⭐','🌈','💖','🦄','🌸','🐱','🍓','✨','🦋','🌟','🎀','🍰','💛','🔥','🍋','🐠','🍎','🐝'];

// pretty random names for her creations: "{word} {base}"
const DESIGN_WORDS = ['Sparkle','Rainbow','Dreamy','Magic','Sunshine','Cozy','Glitter','Unicorn','Candy','Dazzle','Twinkle','Bubbly'];

// what customers say when they spot one of Maya's OWN designs (worth more!)
const CUSTOM_WANT_LINES = [
  "Wow! Did you DESIGN this {item} yourself?! 😍",
  "This {item} is one-of-a-kind! I MUST have it!",
  "Ooh la la! A custom {item}! How much? 🤩",
  "I've never seen a {item} like this! 😮",
];

// ════════════════════════════════════════════════════════════
//  TRICKSTER SELLERS — customers who try to sell stuff to Maya!
//  cost = what they charge · value = what it's really worth on her shelf
//  (value > cost = bargain · value < cost = rip-off!)
// ════════════════════════════════════════════════════════════
const SELLERS = [
  { emoji:'🦊', item:{emoji:'🔘', name:'magic button'},  cost:6,  value:9,
    say:"Pssst… wanna buy a REAL magic button? Only 🪙6! 🦊" },
  { emoji:'🧙‍♂️', item:{emoji:'💎', name:'sparkly gem'},  cost:8,  value:13,
    say:"A rare sparkly gem! Just 🪙8 — such a deal! 💎" },
  { emoji:'🤡', item:{emoji:'🧦', name:'\u2018antique\u2019 sock'}, cost:8, value:3,
    say:"Genuine ANTIQUE sock! Worth a fortune — yours for 🪙8! 🤡" },
  { emoji:'🦝', item:{emoji:'🫖', name:'\u2018gold\u2019 teapot'}, cost:11, value:5,
    say:"Royal golden teapot! A bargain at just 🪙11! 🦝" },
  { emoji:'🐭', item:{emoji:'🎀', name:'lucky ribbon'},   cost:3,  value:6,
    say:"Lucky ribbon! Brings good luck! Only 🪙3! 🐭" },
  { emoji:'🦜', item:{emoji:'🪄', name:'magic wand'},     cost:9,  value:14,
    say:"A magic wand! Make anything! 🪙9, squawk! 🦜" },
  { emoji:'🐍', item:{emoji:'🥫', name:'mystery can'},    cost:7,  value:2,
    say:"Mystery can! Could be treasure inside! Just 🪙7! 🐍" },
];

// seller reactions
const SELLER_GOODBUY = ["Pleasure doing business! 🤝","Enjoy! Tee hee! 😊","Smart shopper! 🤝"];   // value >= cost
const SELLER_RIPOFF  = ["Heh heh… see ya, sucker! 🤭","Mwahaha! No refunds! 😈","Too easy! 🤣"];     // value < cost
const SELLER_REFUSE  = ["Your loss! Hmph! 😼","Fine, MORE for me! 😤","Bah! 🙄","Suit yourself! 😏"];

// ── Protesters! (show up when the town is UNhappy with the shop) ──
const PROTEST_SIGNS = ['🚫','👎','✊','😠'];
const PROTEST_CHANTS = [
  "Boo! Rude shop! 👎",
  "Be nicer! ✊",
  "We want service! 😠",
  "No more meanies! 🚫",
  "Hmph! 😤",
];
