/* ============================================================
   Legend of the Rainbow Dragon — GAME LOGIC
   State, save, the clean hub, town screens, level-ups.
   (Combat lives in combat.js)
   ============================================================ */
const C = LORD.CONFIG, A = LORD.Audio, FX = LORD.FX;

let state = freshState();
let selectedAvatar = LORD.AVATARS[0];
let currentScreen = 'hub';

const DAILY = [
  { id: 'wins',   text: 'Win 2 play-fights', goal: 2, track: 'wins',   reward: '40 gold', gold: 40 },
  { id: 'snack',  text: 'Visit the Snack Bar', goal: 1, track: 'snack', reward: '2 charm', charm: 2 },
  { id: 'riddle', text: 'Solve a riddle', goal: 1, track: 'riddle', reward: '30 gold', gold: 30 },
];

function freshState() {
  const s = Object.assign({}, LORD.START);
  return Object.assign(s, {
    name: '', avatar: LORD.AVATARS[0], created: false,
    turnsLeft: C.MAX_TURNS, turnDay: todayKey(),
    dragonHp: C.BOSS_MAX_HP, dragonDefeated: false, newGamePlus: 0,
    kills: 0, achievements: [], buddy: null, mail: [],
    bardDay: '', visited: {}, log: [],
    daily: { wins: 0, snack: 0, riddle: 0 }, dailyClaimed: '',
  });
}

/* ---------- time / turns ---------- */
function todayKey() { return new Date().toISOString().slice(0, 10); }

function refreshDay() {
  const t = todayKey();
  if (state.turnDay !== t) {
    state.turnDay = t;
    state.turnsLeft = C.MAX_TURNS;
    state.bardDay = '';
    state.daily = { wins: 0, snack: 0, riddle: 0 };
    state.dailyClaimed = '';
    if (state.mail.length < 12) {
      const m = LORD.MAIL[Math.floor(Math.random() * LORD.MAIL.length)];
      state.mail.push({ from: m.from, text: m.text, day: t });
    }
    addLog('☀️ A brand new day! You have ' + C.MAX_TURNS + ' turns.', 'hi');
    save();
  }
}

function useTurn() {
  refreshDay();
  if (state.turnsLeft <= 0) { showNoTurns(); return false; }
  state.turnsLeft--;
  updateHud();
  save();
  return true;
}

/* ---------- derived stats ---------- */
function weapon() { return LORD.WEAPONS.find(w => w.id === state.weaponId) || LORD.WEAPONS[0]; }
function armor() { return LORD.ARMOR.find(a => a.id === state.armorId) || LORD.ARMOR[0]; }
function weaponStr() { return weapon().str; }
function armorDef() { return armor().def; }
function totalStr() { return state.str + weaponStr(); }
function totalDef() { return state.def + armorDef(); }
function fleeChance() { return Math.min(0.9, 0.55 + state.charm * 0.01); }
function charmGold() { return Math.floor(state.charm / 3); }
function xpToNext(lv) { return 40 + (lv - 1) * 26; }
function biomeUnlocked(b) { return state.level >= b.minLv; }

/* ---------- XP / level up ---------- */
function gainXp(amount) {
  state.xp += amount;
  let leveled = [];
  let need = xpToNext(state.level);
  while (state.xp >= need && state.level < 60) {
    state.xp -= need;
    state.level++;
    state.maxHp += 4; state.str += 2; state.def += 1;
    state.hp = state.maxHp;
    leveled.push(state.level);
    need = xpToNext(state.level);
  }
  if (leveled.length) showLevelUp(leveled[leveled.length - 1]);
  checkAchievements();
  updateHud();
}

function showLevelUp(newLevel) {
  A.sfx('level');
  FX.confetti(80);
  document.getElementById('lvup-level').textContent = 'Level ' + newLevel + '!';
  const st = document.getElementById('lvup-stats');
  st.innerHTML = '';
  [['❤️ +4 HP', 0], ['💪 +2 STR', 0.1], ['🛡️ +1 DEF', 0.2]].forEach(p => {
    const d = document.createElement('div');
    d.className = 'ls'; d.textContent = p[0]; d.style.animationDelay = p[1] + 's';
    st.appendChild(d);
  });
  const unlockEl = document.getElementById('lvup-unlock');
  const justUnlocked = LORD.BIOMES.find(b => b.minLv === newLevel);
  if (newLevel === C.BOSS_UNLOCK_LEVEL) {
    unlockEl.innerHTML = '🌈🐉 The <b>Rainbow Dragon</b> is ready to be your friend!';
  } else if (justUnlocked) {
    unlockEl.innerHTML = '🗺️ New place unlocked: <b>' + justUnlocked.name + '</b> ' + justUnlocked.emoji + '!';
  } else {
    unlockEl.textContent = 'You feel stronger and sparklier!';
  }
  document.getElementById('ov-levelup').classList.remove('hidden');
  addLog('⭐ LEVEL UP! You are now level ' + newLevel + '!', 'hi');
}

/* ---------- knockout (no death — too sleepy) ---------- */
function knockout() {
  const lost = Math.floor(state.gold * 0.15);
  state.gold = Math.max(0, state.gold - lost);
  state.hp = state.maxHp;
  A.sfx('oops');
  toast('💫 Too sleepy! You woke up cozy at the Inn.');
  addLog('💫 You got too sleepy and napped at the Inn. (-' + lost + ' gold)', 'bad');
  goToHub();
  save();
}

/* ---------- achievements ---------- */
function unlockAch(id) {
  if (state.achievements.indexOf(id) >= 0) return;
  const a = LORD.ACHIEVEMENTS.find(x => x.id === id);
  if (!a) return;
  state.achievements.push(id);
  toast(a.em + ' ' + a.name + ' unlocked!');
  A.sfx('sparkle');
  FX.burst(document.getElementById('toast'), { count: 16 });
  addLog('🏅 Achievement: ' + a.name + '!', 'hi');
  save();
}
function checkAchievements() {
  if (state.kills >= 1) unlockAch('first_fight');
  if (state.level >= 5) unlockAch('lv5');
  if (state.level >= 10) unlockAch('lv10');
  if (state.gold >= 500) unlockAch('rich');
  if (state.charm >= 15) unlockAch('charming');
  if (state.buddy) unlockAch('buddy');
  if (Object.keys(state.visited).length >= 5) unlockAch('explorer');
  if (state.kills >= 50) unlockAch('kills50');
  if (state.dragonDefeated && state.newGamePlus === 0) unlockAch('dragon');
  if (state.dragonDefeated && state.newGamePlus >= 1) unlockAch('ng');
}

/* ---------- log ---------- */
function addLog(msg, cls) {
  state.log.push({ msg, cls: cls || '' });
  if (state.log.length > 60) state.log = state.log.slice(-60);
}

/* ---------- save / load ---------- */
function save() { try { localStorage.setItem(C.SAVE_KEY, JSON.stringify(state)); } catch (e) {} }
function load() {
  try {
    const raw = localStorage.getItem(C.SAVE_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    if (!s || !s.created) return false;
    state = Object.assign(freshState(), s);
    if (!state.daily) state.daily = { wins: 0, snack: 0, riddle: 0 };
    if (!state.visited) state.visited = {};
    refreshDay();
    return true;
  } catch (e) { return false; }
}

/* ---------- HUD ---------- */
function updateHud() {
  document.getElementById('s-hp').textContent = state.hp;
  document.getElementById('s-maxhp').textContent = state.maxHp;
  document.getElementById('s-lv').textContent = state.level;
  document.getElementById('s-gold').textContent = state.gold;
  document.getElementById('s-turns').textContent = state.turnsLeft;
  const pct = Math.max(0, Math.min(1, state.hp / state.maxHp));
  document.getElementById('s-hpfill').style.width = (pct * 100) + '%';
  const need = xpToNext(state.level);
  const xpPct = Math.max(0, Math.min(1, state.xp / need));
  const ring = document.getElementById('s-xpring');
  if (ring) ring.style.strokeDashoffset = (78.5 * (1 - xpPct)).toFixed(1);
}

/* ---------- screens ---------- */
function showScreen(name) {
  currentScreen = name;
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + name));
  if (name === 'combat') A.playMusic(currentScreen === 'dragon' ? 'dragon' : 'battle');
  else A.playMusic('town');
  if (window.MayaPortal) window.MayaPortal.notifyScreen(name);
}
function goToHub() {
  document.getElementById('combat-result').classList.add('hidden');
  buildHub();
  showScreen('hub');
  A.playMusic('town');
}

/* ---------- HUB build ---------- */
const TILES = [
  { id: 'adventure', cls: 'adventure', e: '🌲', l: 'Adventure', s: 'Play-fight!', fn: () => goAdventure() },
  { id: 'shop',      cls: 'shop',      e: '🛒', l: 'Shop',      s: 'Get gear',   fn: () => goShop() },
  { id: 'snack',     cls: 'snack',     e: '🧁', l: 'Snack Bar', s: 'Jokes & gold', fn: () => goSnack() },
  { id: 'music',     cls: 'music',     e: '🎵', l: 'Music',     s: 'Daily boost', fn: () => goMusic() },
  { id: 'inn',       cls: 'inn',       e: '🏠', l: 'Inn',       s: 'Free rest',  fn: () => goInn() },
  { id: 'healer',    cls: 'healer',    e: '💚', l: 'Healer',    s: 'Quick heal', fn: () => goHealer() },
  { id: 'mail',      cls: 'mail',      e: '📬', l: 'Mailbox',   s: 'Letters',    fn: () => goMail() },
  { id: 'hero',      cls: 'hero',      e: '🏆', l: 'My Hero',   s: 'Stats',      fn: () => goStats() },
];

function recommendTile() {
  if (state.turnsLeft <= 0) return null;
  if (state.hp <= state.maxHp * 0.4) return 'inn';
  if (state.level >= C.BOSS_UNLOCK_LEVEL && !state.dragonDefeated) return null; // banner handles it
  return 'adventure';
}

function buildHub() {
  document.getElementById('hub-hero').textContent = state.avatar;
  const title = state.dragonDefeated ? (state.newGamePlus >= 1 ? ' 👑' : ' 🏆') : '';
  document.getElementById('hub-name').innerHTML = (state.name || 'Hero') + '<span class="crown">' + title + '</span>';
  document.getElementById('hub-tip').textContent = LORD.TIPS[Math.floor(Math.random() * LORD.TIPS.length)];

  // dragon banner
  const banner = document.getElementById('dragon-banner');
  const bannerTitle = banner.querySelector('.dbt');
  if (state.dragonDefeated && state.newGamePlus === 0) {
    banner.style.display = 'flex';
    bannerTitle.textContent = 'Play Again! 👑';
    document.getElementById('dragon-banner-sub').textContent = 'Meet the extra-tough rematch dragon!';
  } else if (state.level >= C.BOSS_UNLOCK_LEVEL && !state.dragonDefeated) {
    banner.style.display = 'flex';
    bannerTitle.textContent = state.newGamePlus >= 1 ? 'Rainbow Dragon — Round 2!' : 'Rainbow Dragon!';
    document.getElementById('dragon-banner-sub').textContent =
      state.newGamePlus >= 1 ? 'The sparkly rematch awaits!' : "You're strong enough — go be friends!";
  } else {
    banner.style.display = 'none';
  }

  // daily challenge
  renderDaily();

  // tiles
  const grid = document.getElementById('town-grid');
  grid.innerHTML = '';
  const rec = recommendTile();
  const noTurns = state.turnsLeft <= 0;
  TILES.forEach(t => {
    const b = document.createElement('button');
    b.className = 'place ' + t.cls + (t.id === rec ? ' recommend' : '');
    const disabled = noTurns && ['adventure', 'shop', 'snack', 'inn', 'healer'].includes(t.id);
    let sub = t.s;
    if (t.id === 'music') { sub = state.bardDay === todayKey() ? 'Pick a tune!' : '🎁 Free boost!'; }
    if (t.id === 'mail') { sub = state.mail.length + ' letters'; }
    b.innerHTML = '<span class="pe bobble">' + t.e + '</span><span class="pl">' + t.l + '</span><span class="ps">' + sub + '</span>';
    if (disabled) { b.classList.add('locked'); b.innerHTML += '<span class="lock">💤<span>Out of turns</span></span>'; }
    else b.addEventListener('click', () => { A.sfx('tap'); t.fn(); });
    grid.appendChild(b);
  });
}

function renderDaily() {
  const seed = Number(todayKey().slice(-2));
  const d = DAILY[seed % DAILY.length];
  state._dailyDef = d;
  const prog = state.daily[d.track] || 0;
  const done = prog >= d.goal;
  const claimed = state.dailyClaimed === todayKey();
  document.getElementById('chal-text').innerHTML =
    '⭐ ' + d.text + ' <b>(' + Math.min(prog, d.goal) + '/' + d.goal + ')</b> · ' + d.reward;
  const btn = document.getElementById('chal-claim');
  btn.disabled = !done || claimed;
  btn.textContent = claimed ? '✅' : (done ? '🎁 Claim' : '…');
}

function claimDaily() {
  const d = state._dailyDef;
  if (!d || state.dailyClaimed === todayKey()) return;
  if ((state.daily[d.track] || 0) < d.goal) return;
  if (d.gold) state.gold += d.gold;
  if (d.charm) state.charm += d.charm;
  state.dailyClaimed = todayKey();
  A.sfx('coin'); FX.coins(document.getElementById('chal-ribbon'), 12);
  toast('🎁 Daily reward: ' + d.reward + '!');
  addLog('🎁 Daily challenge done! +' + d.reward, 'hi');
  updateHud(); renderDaily(); checkAchievements(); save();
}

function bumpDaily(track) {
  state.daily[track] = (state.daily[track] || 0) + 1;
}

/* ---------- INN / HEALER ---------- */
function goInn() {
  if (!useTurn()) return;
  state.visited.inn = 1;
  state.hp = state.maxHp;
  A.sfx('sparkle'); FX.hearts(document.getElementById('topbar'), 10);
  toast('🏠 Cozy rest! Hearts all full 💚');
  addLog('🏠 You rested at the Inn. HP full!', 'hi');
  updateHud(); buildHub(); save();
}
function goHealer() {
  if (!useTurn()) return;
  state.visited.healer = 1;
  const cost = 15 + state.level * 4;
  if (state.hp >= state.maxHp) { toast('💚 You already feel great!'); buildHub(); return; }
  if (state.gold < cost) { toast('💚 Need ' + cost + ' gold for a heal.'); buildHub(); return; }
  state.gold -= cost; state.hp = state.maxHp;
  A.sfx('sparkle'); FX.hearts(document.getElementById('topbar'), 8);
  toast('💚 All healed for ' + cost + ' gold!');
  addLog('💚 Healer fixed you up for ' + cost + ' gold.', 'hi');
  updateHud(); buildHub(); save();
}

/* ---------- SHOP ---------- */
function goShop() {
  if (!useTurn()) return;
  state.visited.shop = 1;
  renderShop(); showScreen('shop'); checkAchievements();
}
function renderShop() {
  document.getElementById('shop-gold').textContent = 'Gold: ' + state.gold;
  const list = document.getElementById('shop-list');
  list.innerHTML = '';
  const head = (t) => { const h = document.createElement('div'); h.className = 'scr-sub'; h.style.cssText = 'font-family:Fredoka One,cursive;color:var(--blue);font-size:14px;margin:2px 0'; h.textContent = t; list.appendChild(h); };
  head('⚔️ Weapons');
  LORD.WEAPONS.forEach(w => { if (w.cost === 0) return; gearCard(list, w, 'str', 'weaponId'); });
  head('🛡️ Armor');
  LORD.ARMOR.forEach(a => { if (a.cost === 0) return; gearCard(list, a, 'def', 'armorId'); });
}
function gearCard(list, item, statKey, slot) {
  const owned = state[slot] === item.id;
  const can = state.level >= item.minLv && state.gold >= item.cost && !owned;
  const card = document.createElement('div');
  card.className = 'gear-card' + (owned ? ' owned' : '');
  card.innerHTML =
    '<span class="ge">' + item.emoji + '</span>' +
    '<span class="gi"><span class="gn">' + item.name + '</span>' +
    '<span class="gm">+' + item[statKey] + ' ' + statKey.toUpperCase() + ' · 🪙' + item.cost + ' · Lv' + item.minLv + '</span></span>';
  const act = document.createElement('span'); act.className = 'gact';
  if (owned) { act.innerHTML = '<span class="tagok">✓ ' + (slot === 'weaponId' ? 'Equipped' : 'Wearing') + '</span>'; }
  else {
    const b = document.createElement('button');
    b.className = 'btn ' + (slot === 'weaponId' ? 'primary' : 'green') + ' sm';
    b.textContent = can ? 'Buy' : (state.level < item.minLv ? 'Lv' + item.minLv : 'Need 🪙');
    b.disabled = !can;
    b.addEventListener('click', () => {
      state.gold -= item.cost; state[slot] = item.id;
      A.sfx('shop'); FX.burst(card, { count: 14 });
      toast('✨ Got the ' + item.name + '!');
      addLog('🛒 Bought ' + item.name + '!', 'hi');
      renderShop(); updateHud(); save();
    });
    act.appendChild(b);
  }
  card.appendChild(act);
  list.appendChild(card);
}

/* ---------- SNACK BAR ---------- */
function goSnack() {
  if (!useTurn()) return;
  state.visited.snack = 1;
  bumpDaily('snack');
  const roll = Math.random();
  const body = document.getElementById('snack-body');
  const actions = document.getElementById('snack-actions');
  body.innerHTML = ''; actions.innerHTML = '';
  const backOnly = (label) => {
    const b = document.createElement('button'); b.className = 'btn primary'; b.textContent = label || 'Back to Town 🏠';
    b.addEventListener('click', () => { A.sfx('tap'); goToHub(); }); actions.appendChild(b);
  };

  if (roll < 0.34) { // riddle
    const r = LORD.RIDDLES[Math.floor(Math.random() * LORD.RIDDLES.length)];
    body.innerHTML = '<div class="big-emoji-card"><div class="bce">🤔</div><div class="bct">Riddle Time!</div><div class="bcx">' + r.q + '</div></div>';
    const opts = document.createElement('div'); opts.className = 'opt-list';
    r.opts.forEach((opt, i) => {
      const b = document.createElement('button'); b.className = 'btn purple'; b.textContent = opt;
      b.addEventListener('click', () => {
        opts.querySelectorAll('button').forEach(x => x.disabled = true);
        if (i === r.ans) {
          state.gold += 15; bumpDaily('riddle');
          A.sfx('coin'); FX.coins(b, 10);
          body.innerHTML += '<div class="scr-sub" style="color:var(--green);font-size:15px">🎉 Correct! +15 gold!</div>';
          addLog('🧁 Solved a riddle! +15 gold', 'hi');
        } else {
          A.sfx('oops');
          body.innerHTML += '<div class="scr-sub" style="color:var(--pink);font-size:15px">Good try! The answer was "' + r.opts[r.ans] + '".</div>';
          addLog('🧁 Tried a riddle — nice effort!', '');
        }
        updateHud(); save(); backOnly('Yay! Back to Town 🏠');
      });
      opts.appendChild(b);
    });
    actions.appendChild(opts);
  } else if (roll < 0.62) { // joke
    const j = LORD.JOKES[Math.floor(Math.random() * LORD.JOKES.length)];
    state.charm += 1;
    body.innerHTML = '<div class="big-emoji-card"><div class="bce">😂</div><div class="bct">Snack Bar Joke</div><div class="bcx">' + j + '</div><div class="scr-sub" style="color:var(--pink);margin-top:8px">+1 Charm ✨</div></div>';
    A.sfx('sparkle'); addLog('🧁 Laughed at a joke! +1 Charm', 'fun');
    updateHud(); backOnly('Ha ha! 🏠');
  } else if (roll < 0.8 && !state.buddy) { // buddy
    const bud = LORD.BUDDIES[Math.floor(Math.random() * LORD.BUDDIES.length)];
    state.buddy = { name: bud.name, emoji: bud.emoji };
    body.innerHTML = '<div class="big-emoji-card"><div class="bce">' + bud.emoji + '</div><div class="bct">New Adventure Buddy!</div><div class="bcx">' + bud.name + ' joins you! They help in play-fights.</div></div>';
    A.sfx('win'); FX.burst(body, { count: 18 }); checkAchievements();
    addLog('🐾 ' + bud.name + ' is now your Adventure Buddy!', 'hi');
    backOnly('High five! 🐾');
  } else { // muffin
    state.hp = Math.min(state.maxHp, state.hp + 6);
    body.innerHTML = '<div class="big-emoji-card"><div class="bce">🧁</div><div class="bct">Magic Muffin</div><div class="bcx">Warm, sparkly, delicious. +6 HP!</div></div>';
    A.sfx('sparkle'); FX.hearts(body, 6); addLog('🧁 Ate a magic muffin. +6 HP', 'hi');
    updateHud(); backOnly('Yum! 🏠');
  }
  showScreen('snack'); save();
}

/* ---------- MUSIC STAGE (free to browse — daily boost + jukebox) ---------- */
const TUNES_UI = [
  { id: 'sparkle', name: 'Sparkle Pop',   emoji: '✨', cls: 'pink' },
  { id: 'rainbow', name: 'Rainbow Chill',  emoji: '🌈', cls: 'green' },
  { id: 'march',   name: 'Brave March',    emoji: '🥁', cls: 'primary' },
  { id: 'disco',   name: 'Disco Party',    emoji: '🪩', cls: 'blue' },
  { id: 'lullaby', name: 'Sleepy Lullaby', emoji: '🌙', cls: 'purple' },
];

function goMusic() {
  state.visited.music = 1;
  renderMusic();
  showScreen('music');
}

function renderMusic() {
  const body = document.getElementById('music-body');
  body.innerHTML = '';
  const boostDone = state.bardDay === todayKey();

  // daily boost card + button
  const card = document.createElement('div');
  card.className = 'big-emoji-card';
  card.innerHTML = '<div class="bce">🎁</div><div class="bct">Daily Power Boost</div>' +
    '<div class="bcx">' + (boostDone ? "You got today's boost! Come back tomorrow 🌙" : 'A free sparkly surprise — once a day!') + '</div>';
  body.appendChild(card);
  const bbtn = document.createElement('button');
  bbtn.className = 'btn primary'; bbtn.disabled = boostDone;
  bbtn.textContent = boostDone ? '✅ Got it today!' : '🎁 Get My Boost!';
  bbtn.addEventListener('click', doMusicBoost);
  body.appendChild(bbtn);

  // jukebox
  const jh = document.createElement('div');
  jh.className = 'scr-sub';
  jh.style.cssText = 'font-family:Fredoka One,cursive;color:var(--blue);font-size:15px;margin:8px 0 2px';
  jh.textContent = '🎶 Jukebox — Pick Your Tune!';
  body.appendChild(jh);
  const list = document.createElement('div'); list.className = 'opt-list';
  const cur = A.getTune();
  TUNES_UI.forEach(t => {
    const b = document.createElement('button');
    const active = cur === t.id;
    b.className = 'btn ' + (active ? 'green' : 'ghost');
    b.innerHTML = t.emoji + ' ' + t.name + (active ? '  ▶ playing' : '');
    b.addEventListener('click', () => {
      A.resume(); A.setTune(t.id); A.playMusic('town'); A.sfx('bard');
      FX.burst(b, { count: 12, ch: '🎵', kind: 'emoji', size: 16 });
      renderMusic();
    });
    list.appendChild(b);
  });
  body.appendChild(list);

  const actions = document.getElementById('music-actions');
  actions.innerHTML = '';
  const back = document.createElement('button');
  back.className = 'btn ghost'; back.textContent = '← Back to Town';
  back.addEventListener('click', () => { A.sfx('tap'); goToHub(); });
  actions.appendChild(back);
}

function doMusicBoost() {
  if (state.bardDay === todayKey()) return;
  state.bardDay = todayKey();
  const song = LORD.SONGS[Math.floor(Math.random() * LORD.SONGS.length)];
  if (song.str) state.str += song.str;
  if (song.hp) state.hp = Math.min(state.maxHp, state.hp + song.hp);
  if (song.gold) state.gold += song.gold;
  if (song.charm) state.charm += song.charm;
  if (song.def) state.def += song.def;
  A.sfx('bard'); FX.burst(document.getElementById('music-body'), { count: 20, ch: '🎵', kind: 'emoji', size: 18 });
  toast('🎵 ' + song.title + ' — ' + song.text);
  addLog('🎵 Music boost: ' + song.title, 'hi');
  updateHud(); renderMusic(); checkAchievements(); save();
}

/* ---------- MAIL ---------- */
function goMail() {
  state.visited.mail = 1;
  renderMail(); showScreen('mail');
}
function renderMail() {
  const list = document.getElementById('mail-list');
  list.innerHTML = '';
  if (!state.mail.length) { list.innerHTML = '<div class="mail-card">No mail yet. Check tomorrow! 💌</div>'; return; }
  state.mail.slice().reverse().forEach(m => {
    const d = document.createElement('div');
    d.className = 'mail-card' + (/dad/i.test(m.from) ? ' dad' : '');
    d.innerHTML = '<div class="mf">' + m.from + '</div><div class="mt">' + m.text + '</div>';
    list.appendChild(d);
  });
}

/* ---------- STATS ---------- */
function goStats() {
  const body = document.getElementById('stats-body');
  body.innerHTML = '';
  const grid = document.createElement('div'); grid.className = 'stat-grid';
  const cells = [
    ['Level', state.level], ['Gold', '🪙 ' + state.gold],
    ['Hearts', state.hp + '/' + state.maxHp], ['STR', totalStr() + ' 💪'],
    ['DEF', totalDef() + ' 🛡️'], ['Charm', state.charm + ' ✨'],
    ['Weapon', weapon().emoji + ' ' + weapon().name], ['Armor', armor().emoji + ' ' + armor().name],
    ['Friends made', state.kills + ' 🤝'], ['Buddy', state.buddy ? state.buddy.emoji + ' ' + state.buddy.name : 'None yet'],
  ];
  cells.forEach(c => {
    const d = document.createElement('div'); d.className = 'stat-cell';
    d.innerHTML = '<span class="sk">' + c[0] + '</span><span class="sv">' + c[1] + '</span>';
    grid.appendChild(d);
  });
  body.appendChild(grid);
  const ah = document.createElement('div'); ah.className = 'scr-sub'; ah.style.cssText = 'font-family:Fredoka One,cursive;color:var(--blue);font-size:15px;margin:6px 0 2px'; ah.textContent = '🏅 Achievements'; body.appendChild(ah);
  const ag = document.createElement('div'); ag.className = 'ach-grid';
  LORD.ACHIEVEMENTS.forEach(a => {
    const on = state.achievements.indexOf(a.id) >= 0;
    const d = document.createElement('div'); d.className = 'ach' + (on ? ' on' : '');
    d.innerHTML = '<div class="ae">' + (on ? a.em : '🔒') + '</div><div class="an">' + a.name + '</div>';
    ag.appendChild(d);
  });
  body.appendChild(ag);
  showScreen('stats');
}

/* ---------- STORY LOG ---------- */
function showStory() {
  const log = document.getElementById('story-log');
  log.innerHTML = '';
  const entries = state.log.slice(-40);
  if (!entries.length) { log.innerHTML = '<div class="mail-card">Your adventure story starts here! 🌈</div>'; }
  entries.forEach(e => {
    const d = document.createElement('div');
    const color = e.cls === 'hi' ? 'var(--yellow)' : e.cls === 'bad' ? 'var(--pink)' : e.cls === 'fun' ? 'var(--blue)' : 'var(--green)';
    d.style.cssText = 'font-family:monospace;font-size:13px;color:' + color + ';padding:3px 4px;line-height:1.4';
    d.textContent = e.msg;
    log.appendChild(d);
  });
  log.scrollTop = log.scrollHeight;
  document.getElementById('ov-story').classList.remove('hidden');
}

/* ---------- end day ---------- */
function endDay() {
  state.turnsLeft = 0; state.turnDay = todayKey(); state.hp = state.maxHp;
  addLog('🌙 You ended the day and slept soundly.', 'hi');
  updateHud(); save(); showNoTurns();
}
function showNoTurns() { document.getElementById('ov-noturns').classList.remove('hidden'); }

/* ---------- toast ---------- */
let toastTimer = null;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.remove('hidden');
  t.style.animation = 'none'; void t.offsetWidth; t.style.animation = 'popIn .4s ease';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2600);
}

/* ---------- create / start ---------- */
function renderAvatars() {
  const g = document.getElementById('avatar-grid'); g.innerHTML = '';
  LORD.AVATARS.forEach(em => {
    const b = document.createElement('button');
    b.className = 'av' + (em === selectedAvatar ? ' sel' : '');
    b.textContent = em;
    b.addEventListener('click', () => { selectedAvatar = em; A.sfx('tap'); renderAvatars(); });
    g.appendChild(b);
  });
}
function createHero() {
  const name = (document.getElementById('hero-name').value || '').trim().slice(0, 12);
  if (!name) { document.getElementById('hero-name').focus(); return; }
  state = freshState();
  state.name = name; state.avatar = selectedAvatar; state.created = true;
  state.mail.push({ from: LORD.MAIL[5].from, text: LORD.MAIL[5].text, day: todayKey() });
  addLog('✨ Welcome, ' + name + '! Your sparkly quest begins!', 'hi');
  save(); enterGame();
}
function enterGame() {
  document.getElementById('ov-title').classList.add('hidden');
  document.getElementById('ov-create').classList.add('hidden');
  refreshDay(); updateHud(); A.resume(); A.playMusic('town'); goToHub();
}

/* ---------- mute ---------- */
function updateMuteIcon() { document.getElementById('btn-mute').textContent = A.isMuted() ? '🔇' : '🔊'; }
function toggleMute() {
  A.setMuted(!A.isMuted()); updateMuteIcon();
  if (!A.isMuted()) { A.resume(); A.playMusic(currentScreen === 'combat' ? 'battle' : 'town'); A.sfx('tap'); }
}
