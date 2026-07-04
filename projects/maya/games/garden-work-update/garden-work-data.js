/* ===== Garden Work — data / config ===== */
window.GW = window.GW || {};

GW.DESIGN_W = 720;
GW.DESIGN_H = 920;

/* Where beds can go in the yard (design-space centres, below the house) */
GW.PLOTS = [
  {x:132,y:332},{x:360,y:332},{x:588,y:332},
  {x:132,y:530},{x:360,y:530},{x:588,y:530},
  {x:132,y:728},{x:360,y:728},{x:588,y:728}
];

/* Home spots for the gardener (design space) */
GW.DOOR   = {x:360, y:182};   // house door
GW.YARD   = {x:360, y:866};   // open spot she walks out to in the morning

/* Garden-bed shapes. cells use grid units (gx can be fractional to centre rows). */
GW.SHAPES = {
  rect: {
    label:'Rectangle', icon:'▭', cols:4, rows:3, unit:48, round:false, tri:false,
    cells:[ {gx:0,gy:0},{gx:1,gy:0},{gx:2,gy:0},{gx:3,gy:0},
            {gx:0,gy:1},{gx:1,gy:1},{gx:2,gy:1},{gx:3,gy:1},
            {gx:0,gy:2},{gx:1,gy:2},{gx:2,gy:2},{gx:3,gy:2} ]
  },
  circle: {
    label:'Circle', icon:'⭕', cols:4, rows:4, unit:46, round:true, tri:false,
    cells:[ {gx:1,gy:0},{gx:2,gy:0},
            {gx:0,gy:1},{gx:1,gy:1},{gx:2,gy:1},{gx:3,gy:1},
            {gx:0,gy:2},{gx:1,gy:2},{gx:2,gy:2},{gx:3,gy:2},
            {gx:1,gy:3},{gx:2,gy:3} ]
  },
  tri: {
    label:'Triangle', icon:'🔺', cols:4, rows:4, unit:46, round:false, tri:true,
    cells:[ {gx:1.5,gy:0},
            {gx:1,gy:1},{gx:2,gy:1},
            {gx:0.5,gy:2},{gx:1.5,gy:2},{gx:2.5,gy:2},
            {gx:0,gy:3},{gx:1,gy:3},{gx:2,gy:3},{gx:3,gy:3} ]
  }
};

/* Plant catalogue. growth: 0 seed → 1 sprout → 2 ripe. */
GW.PLANTS = [
  // flowers
  {id:'sunflower', name:'Sunflower', kind:'flower', seed:'🌱', sprout:'🌿', ripe:'🌻', sell:5, unlock:0},
  {id:'tulip',     name:'Tulip',     kind:'flower', seed:'🌱', sprout:'🌿', ripe:'🌷', sell:5, unlock:0},
  {id:'rose',      name:'Rose',      kind:'flower', seed:'🌱', sprout:'🌿', ripe:'🌹', sell:6, unlock:0},
  {id:'daisy',     name:'Daisy',     kind:'flower', seed:'🌱', sprout:'🌿', ripe:'🌼', sell:5, unlock:0},
  // veggies
  {id:'carrot',    name:'Carrot',    kind:'veggie', seed:'🌱', sprout:'🌿', ripe:'🥕', sell:4, unlock:0},
  {id:'tomato',    name:'Tomato',    kind:'veggie', seed:'🌱', sprout:'🌿', ripe:'🍅', sell:4, unlock:0},
  {id:'corn',      name:'Corn',      kind:'veggie', seed:'🌱', sprout:'🌿', ripe:'🌽', sell:5, unlock:0},
  {id:'lettuce',   name:'Lettuce',   kind:'veggie', seed:'🌱', sprout:'🌿', ripe:'🥬', sell:4, unlock:0},
  // fruit
  {id:'strawberry',name:'Strawberry',kind:'fruit',  seed:'🌱', sprout:'🌿', ripe:'🍓', sell:6, unlock:0},
  {id:'melon',     name:'Watermelon',kind:'fruit',  seed:'🌱', sprout:'🌿', ripe:'🍉', sell:8, unlock:0},
  // magic (unlocks after selling enough)
  {id:'rainbow',   name:'Rainbow Bloom', kind:'magic', seed:'🌱', sprout:'🌿', ripe:'🌈', sell:12, unlock:25},
  {id:'star',      name:'Star Flower',   kind:'magic', seed:'🌱', sprout:'✨', ripe:'⭐', sell:15, unlock:25},
  {id:'moonflower',name:'Moonflower',    kind:'magic', seed:'🌱', sprout:'✨', ripe:'🌙', sell:14, unlock:25, glow:true},
  // candy seeds (bought in the shop)
  {id:'lollipop',  name:'Lollipop',  kind:'candy', seed:'🌱', sprout:'🌿', ripe:'🍭', sell:10, unlock:-1, price:14},
  {id:'cupcake',   name:'Cupcake',   kind:'candy', seed:'🌱', sprout:'🌿', ripe:'🧁', sell:11, unlock:-1, price:16},
  {id:'candy',     name:'Candy',     kind:'candy', seed:'🌱', sprout:'🌿', ripe:'🍬', sell:9,  unlock:-1, price:12},
  {id:'icecream',  name:'Ice Cream', kind:'candy', seed:'🌱', sprout:'🌿', ripe:'🍦', sell:12, unlock:-1, price:18},
  {id:'donut',     name:'Donut',     kind:'candy', seed:'🌱', sprout:'🌿', ripe:'🍩', sell:11, unlock:-1, price:16},
  // giant seeds (bought in the shop — they grow HUGE & sell for lots)
  {id:'giantsun',  name:'Giant Sunflower', kind:'giant', seed:'🌱', sprout:'🌿', ripe:'🌻', sell:18, unlock:-1, price:24, giant:true},
  {id:'pumpkin',   name:'Giant Pumpkin',   kind:'giant', seed:'🌱', sprout:'🌿', ripe:'🎃', sell:20, unlock:-1, price:28, giant:true},
  {id:'giantmush', name:'Giant Toadstool', kind:'giant', seed:'🌱', sprout:'🌿', ripe:'🍄', sell:16, unlock:-1, price:22, giant:true}
];
GW.byId = function(id){ return GW.PLANTS.find(function(p){return p.id===id;}); };

GW.MAGIC_UNLOCK = 25;   // coins needed to unlock magic seeds
GW.RIPEN_NIGHTS = 1;    // nights of growth (watered) before ripe
GW.GOLDEN_CHANCE = 0.16; // chance a ripening plant turns golden (worth 3x!)
GW.GOLDEN_MULT = 3;

GW.GARDEN_NAME_DEFAULT = "Maya's Garden";

/* ===== Shop decorations (buy with coins, place anywhere) ===== */
GW.DECOR = [
  {id:'flowers',  em:'🌸', name:'Flower Patch', price:10},
  {id:'toadstool',em:'🍄', name:'Toadstool',    price:12},
  {id:'tulips',   em:'🌷', name:'Tulip Row',     price:12},
  {id:'lantern',  em:'🏮', name:'Lantern',       price:16},
  {id:'birdhouse',em:'🐦', name:'Little Birdie',  price:18},
  {id:'pine',     em:'🌲', name:'Pine Tree',     price:20},
  {id:'chime',    em:'🎐', name:'Wind Chime',    price:22},
  {id:'duck',     em:'🦆', name:'Duck Pond',     price:26},
  {id:'fountain', em:'⛲', name:'Fountain',      price:32},
  {id:'swan',     em:'🦢', name:'Swan',          price:38},
  {id:'fairy',    em:'🧚', name:'Garden Fairy',  price:44},
  {id:'rainbow',  em:'🌈', name:'Rainbow',       price:50},
  {id:'castle',   em:'🏰', name:'Fairy Castle',  price:60},
  {id:'unicorn',  em:'🦄', name:'Unicorn',       price:75}
];
GW.decorById = function(id){ return GW.DECOR.find(function(d){return d.id===id;}); };

/* ===== Notes from Dad (a new one waits in the mailbox each morning) ===== */
GW.DAD_NOTES = [
  "I love you to the moon and back, my sunflower. 🌻 Love, Dad",
  "Your garden is as beautiful as you are. 💛 Love, Dad",
  "I'm so proud of you. Go grow something amazing! 🌱 Love, Dad",
  "Sending you a hug as big as a watermelon. 🍉 Love, Dad",
  "You make every day brighter than the sun. ☀️ Love, Dad",
  "Whatever you plant, I know it will be wonderful. 🌷 Love, Dad",
  "Dream big, my little gardener. 🎁 Love, Dad",
  "You are my favorite person in the whole world. 🌍 Love, Dad",
  "Keep being kind and curious. I love you! 💚 Love, Dad",
  "A garden grows with love, and yours has so much. 🌺 Love, Dad",
  "Even when I am busy, I am always thinking of you. 💕 Love, Dad",
  "You can do hard things. I believe in you! ⭐ Love, Dad",
  "I hope today is full of butterflies and giggles. 🦋 Love, Dad",
  "Thank you for being you, the best kid ever. 🏆 Love, Dad",
  "Plant a little patience and watch the magic grow. ✨ Love, Dad",
  "You are a superstar. 🌟 Love, Dad",
  "You are cooler than the other side of the pillow. 😎 Love, Dad",
  "Fun fact: you are the world's number one gardener. 🌻 Love, Dad",
  "Go be amazing. You do not even have to try. 🌈 Love, Dad",
  "If gardens gave out medals, yours would win gold. 🥇 Love, Dad",
  "You plus this garden equals pure magic. 💫 Love, Dad",
  "Be brave, be silly, be you. 🌈 Love, Dad",
  "Every flower you grow makes me smile this big: 😁 Love, Dad",
  "Have the most fun ever today. You've got this! 🚀 Love, Dad",
  "You are growing up so fast, almost as fast as these plants! 😄 Love, Dad",
  "Sending sunshine, snacks, and a giant high five. ✋ Love, Dad",
  "Whatever happens today, I am in your corner. 💪 Love, Dad",
  "Your garden is the prettiest one I have ever seen. 🌻 Love, Dad"
];

/* ===== Rare surprise visitors (much rarer than critters) ===== */
GW.VISITORS = [
  {id:'unicorn', em:'🦄', name:'Unicorn',  reward:'coins', amount:20, msg:'A unicorn pranced through your garden! 🦄'},
  {id:'fairy',   em:'🧚', name:'Fairy',    reward:'golden',          msg:'A fairy sprinkled magic on your garden! 🧚'},
  {id:'chest',   em:'🧰', name:'Treasure', reward:'coins', amount:15, msg:'You found buried treasure! 💰'},
  {id:'star',    em:'🌟', name:'Wishing Star', reward:'wish',         msg:'Make a wish on the shooting star! 🌟'}
];

/* ===== Levels ===== */
GW.LEVEL_TITLES = ['Little Sprout 🌱','Garden Helper 🌿','Green Thumb 👍','Flower Friend 🌷',
  'Garden Star ⭐','Garden Hero 🦸','Garden Wizard 🧙','Garden Queen 👑','Garden Legend 🌈'];
GW.levelInfo = function(xp){
  xp=xp||0; var need=40, lvl=1, acc=0;
  while(xp >= acc+need){ acc+=need; lvl++; need=Math.round(need*1.3); }
  return {level:lvl, into:xp-acc, need:need,
          title:GW.LEVEL_TITLES[Math.min(lvl-1, GW.LEVEL_TITLES.length-1)]};
};

/* ===== Seasons (change every few days) ===== */
GW.SEASON_LEN = 4;
GW.SEASONS = [
  {id:'spring', name:'Spring 🌸', tint:'rgba(255,180,220,.10)', particle:'🌸', tree:'🌳'},
  {id:'summer', name:'Summer ☀️', tint:'rgba(255,236,140,.10)', particle:'',   tree:'🌳'},
  {id:'autumn', name:'Autumn 🍂', tint:'rgba(255,150,70,.13)',  particle:'🍂', tree:'🍁'},
  {id:'winter', name:'Winter ❄️', tint:'rgba(180,220,255,.16)', particle:'❄️', tree:'🌲'}
];
GW.seasonForDay = function(day){ return GW.SEASONS[Math.floor((day-1)/GW.SEASON_LEN) % 4]; };

/* Pets she can adopt (they live in the garden, follow her & dig up coins) */
GW.PETS = [
  {id:'bunny', em:'🐰', name:'Bunny',  price:20},
  {id:'cat',   em:'🐱', name:'Kitty',  price:22},
  {id:'dog',   em:'🐶', name:'Puppy',  price:24},
  {id:'chick', em:'🐥', name:'Chick',  price:18},
  {id:'hamster',em:'🐹',name:'Hammy',  price:20},
  {id:'turtle',em:'🐢', name:'Shelly', price:26},
  {id:'hedgehog',em:'🦔',name:'Spike', price:24},
  {id:'penguin',em:'🐧',name:'Waddles',price:22},
  {id:'horse', em:'🐴', name:'Pony',   price:30},
  {id:'donkey',em:'🫏', name:'Donkey', price:30},
  {id:'pig',   em:'🐷', name:'Piggy',  price:24},
  {id:'sheep', em:'🐑', name:'Lamby',  price:26},
  {id:'cow',   em:'🐮', name:'Moo',    price:28},
  {id:'frog',  em:'🐸', name:'Hoppy',  price:18},
  {id:'fox',   em:'🦊', name:'Foxy',   price:30},
  {id:'panda', em:'🐼', name:'Panda',  price:34}
];
GW.petById = function(id){ return GW.PETS.find(function(p){return p.id===id;}); };

/* Critters that visit the garden — each has a clear job! Tap to use it. */
GW.CRITTERS = [
  {id:'butterfly', em:'🦋', name:'Butterfly', job:'lucky', coins:5},
  {id:'bee',       em:'🐝', name:'Bee',       job:'bloom', coins:4},
  {id:'ladybug',   em:'🐞', name:'Ladybug',   job:'guard', coins:6},
  {id:'bird',      em:'🐦', name:'Bird',      job:'lucky', coins:5}
];
GW.critterById = function(id){ return GW.CRITTERS.find(function(c){return c.id===id;}); };
/* Pests sneak in — shoo them to protect your garden! */
GW.PESTS = [
  {id:'caterpillar', em:'🐛', name:'Caterpillar'},
  {id:'snail',       em:'🐌', name:'Snail'}
];

/* what eating a plant says */
GW.EAT_MSG = {
  flower:['So pretty! 😊','Smells lovely 🌸','Aaah 😌'],
  veggie:['Yum! 😋','Crunchy! 😋','Nom nom 😋'],
  fruit: ['Sweet! 🤤','Yummy! 😋','Juicy! 😋'],
  magic: ['Magic! ✨','Wow! 🤩','Sparkly! ✨']
};

/* instruction banners per step */
GW.BANNER = {
  morning_pick: 'Your plants are ready! Tap them to pick. 🧺',
  morning_build:'Time to build a new garden bed!',
  pick_shape:   'Pick a shape for your garden bed!',
  place:        'Now tap a sunny spot in the grass! ☀️',
  dirt:         'Tap the dirt bag to fill your bed! 🟫',
  plant_pick:   'Pick a plant from the tray! 🌱',
  plant_place:  'Tap the soil to plant it!',
  plant_more:   'Keep tapping the soil to plant more, or tap Done. 🌱',
  water:        'Water your plants! 💧',
  goodnight:    'All done! Time for bed… 💤'
};
