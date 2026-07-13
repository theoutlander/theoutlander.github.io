/* Castle Defenders v2 — DOM UI glue */
(function(){
'use strict';
const $ = id => document.getElementById(id);
const ui = {};
window.CD.ui = ui;

const cdReadyAt = {};   // weapon id -> timestamp ms

/* NO TOOL MODES. A mode ("which tool am I holding?") is exactly the question an 8-year-old
   shouldn't have to answer before every tap, and the belt covered the plots besides. Taps are
   CONTEXTUAL instead — cd-day.js still reads CD.ui.tool, and it is always the axe:
     tap a tree       -> chop it
     tap an empty plot-> plant it (the seed picker opens)
   Watering is not a mode either: it's one button that waters the whole garden at once. */
ui.tool = 'axe';

/* ---------- HUD ---------- */
ui.setWood = function(pop){
  const el = $('wood-chip');
  el.querySelector('.n').textContent = CD.state.wood;
  $('shop-wood').textContent = '🪵 ' + CD.state.wood;
  if (pop){ el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  /* Apples are banked by cd-day.js (speciesPayout / rainbowSurprise) with no UI hook of its own —
     but every felled tree pays wood through CD.addWood -> ui.setWood, so this is the one call that
     reliably fires right after an apple lands. Refresh the apple chip here or it goes stale until
     the next morning and looks broken. */
  updateAppleChip();
  renderShop();
};

function updateAppleChip(){
  const el = $('apple-chip');
  if (!el || !CD.state) return;
  const apples = CD.state.apples || 0;
  const bonus = Math.min(apples, CD.MAX_BONUS_HEARTS);
  if (CD.state.phase !== 'day' || apples <= 0){ el.style.display = 'none'; return; }
  el.style.display = '';
  el.querySelector('.n').textContent = apples;
  el.querySelector('.sfx').innerHTML = '+' + bonus + ' bonus 💖<br>tonight';
}

ui.setHearts = function(pop){
  const h = $('hearts');
  // Apple trees can push the night's heart count ABOVE MAX_HEARTS — render the real cap.
  const cap = Math.max(CD.MAX_HEARTS, CD.state.heartCap || CD.MAX_HEARTS);
  let s = '';
  for (let i = 0; i < cap; i++){
    const cls = (i < CD.state.hearts ? '' : 'lost') + (i >= CD.MAX_HEARTS ? ' bonus' : '');
    s += '<span class="' + cls.trim() + '">' + (i >= CD.MAX_HEARTS ? '💛' : '💖') + '</span>';
  }
  h.innerHTML = s;
  if (pop){ h.classList.remove('pop'); void h.offsetWidth; h.classList.add('pop'); }
};

function phaseChip(txt){ $('phase-chip').textContent = txt; }

ui.dayTick = function(frac){
  $('daybar').querySelector('.fill').style.width = Math.min(100, frac * 100) + '%';
};

/* ---------- Water All ----------
   One tap, the whole garden gets a splash. cd-day.js decides which trees actually benefit. */
$('water-btn').addEventListener('click', () => {
  CDAudio.unlockCtx();
  if (CD.state.phase !== 'day') return;
  CD.Day.waterAll();
});

/* ---------- phase UI ---------- */
ui.enterDay = function(){
  phaseChip('☀️ Day ' + CD.state.day);
  $('hud-top').classList.add('show');
  $('daybar').classList.add('show');
  $('day-controls').classList.add('show');
  $('weapon-bar').classList.remove('show');
  $('hearts').classList.remove('show');
  ui.setWood(); ui.setHearts();
};
ui.exitDay = function(){
  $('day-controls').classList.remove('show');
  $('daybar').classList.remove('show');
  $('apple-chip').style.display = 'none';
  closeShop();
  closeSeedPicker();
  hideToolBanner();
};
ui.enterNight = function(){
  phaseChip('🌙 Night ' + CD.state.day);
  $('hearts').classList.add('show');
  ui.setHearts();
  renderWeaponBar();
  $('weapon-bar').classList.add('show');
};
ui.exitNight = function(){
  $('weapon-bar').classList.remove('show');
  $('hearts').classList.remove('show');
};

/* ---------- banner ---------- */
ui.banner = function(title, sub){
  const b = $('banner');
  b.querySelector('.t').textContent = title;
  b.querySelector('.s').textContent = sub || '';
  b.classList.remove('go'); void b.offsetWidth; b.classList.add('go');
};

let toolTimer = null;
ui.toolBanner = function(tool){
  const tb = $('toolbanner');
  tb.querySelector('.e').textContent = tool.emoji;
  tb.querySelector('.nm').textContent = tool.name;
  tb.querySelector('.d').textContent = tool.desc;
  tb.classList.add('show');
  if (toolTimer) clearTimeout(toolTimer);
  toolTimer = setTimeout(hideToolBanner, 4600);
};
function hideToolBanner(){ $('toolbanner').classList.remove('show'); }

/* ---------- shop ---------- */
let shopTab = 'weapons';

const TABS = ['weapons', 'garden', 'stuff'];

ui.openShop = function(tab){
  if (CD.state.phase !== 'day') return;
  setShopTab(TABS.indexOf(tab) >= 0 ? tab : 'weapons');
  renderShop();
  $('shop').classList.add('show');
};
function closeShop(){ $('shop').classList.remove('show'); }

/* The tab is remembered in `shopTab` so that renderShop() — which runs on EVERY wood tick via
   setWood — can safely redraw the grids without yanking her back to the Weapons tab mid-buy. */
function setShopTab(tab){
  shopTab = tab;
  document.querySelectorAll('#shop-tabs .stab').forEach(b => {
    b.classList.toggle('sel', b.getAttribute('data-tab') === tab);
  });
  $('shop-grid').classList.toggle('hide', tab !== 'weapons');
  $('shop-garden').classList.toggle('show', tab === 'garden');
  $('shop-stuff').classList.toggle('show', tab === 'stuff');
}

/* ---------- MY STUFF ----------
   The four day-unlock tools (throwing axe, beaver, golden axe, squirrels) are passive: the game
   announced each one with a banner and then never showed it anywhere again, so she was told she
   had them and could never find them. ("I didn't see those in my list.") They live here now,
   alongside everything else she owns, with the locked ones showing the day they arrive. */
function renderStuffGrid(){
  const el = $('shop-stuff');
  if (!el || !CD.state) return;
  const card = (emoji, name, desc, on, lockTxt) =>
    '<div class="wcard' + (on ? '' : ' locked') + '">' +
      '<div class="top"><div class="e">' + emoji + '</div><div class="nm">' + name + '</div></div>' +
      '<div class="d">' + desc + '</div>' +
      '<div class="owned">' + (on ? '✓ Working for you!' : '🔒 ' + lockTxt) + '</div>' +
    '</div>';

  const sect = (h, sub, body) =>
    '<div class="gsec"><div class="h">' + h + '</div><div class="sub">' + sub + '</div>' +
    '<div class="grid">' + body + '</div></div>';

  el.innerHTML =
    sect('🪓 Your Tools', 'These work all by themselves — no tapping needed!',
      CD.TOOLS.map(t => card(t.emoji, t.name, t.desc, CD.hasTool(t.id), 'Arrives on Day ' + t.day)).join('')) +
    sect('🌱 Your Seeds', 'Tap any empty plot to plant one.',
      CD.SEED_ORDER.map(id => {
        const s = CD.TREE_SPECIES[id];
        return card(s.emoji, s.name, s.blurb, CD.hasSeed(id), 'Buy in the Garden — 🪵 ' + s.seedCost);
      }).join('')) +
    sect('🤝 Your Helpers', 'Hire them on the Garden tab.',
      CD.HELPERS.map(h => card(h.emoji, h.name, h.desc, CD.hasHelper(h.id), 'Hire in the Garden — 🪵 ' + h.cost)).join(''));
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-tab]');
  if (!b) return;
  CDAudio.fx.click();
  setShopTab(b.getAttribute('data-tab'));
});

function renderShop(){
  if (!CD.state) return;
  renderWeaponGrid();
  renderGardenGrid();
  renderStuffGrid();
}

function renderWeaponGrid(){
  const grid = $('shop-grid');
  if (!grid) return;
  let html = '';
  CD.WEAPONS.forEach(w => {
    const owned = CD.hasWeapon(w.id);
    const afford = CD.state.wood >= w.cost;
    html += '<div class="wcard' + (w.cost === 0 ? ' starter' : '') + '">' +
      '<div class="top"><div class="e">' + w.emoji + '</div><div class="nm">' + w.name + '</div></div>' +
      '<div class="d">' + w.desc + (w.once ? ' <b>(once per night)</b>' : '') + '</div>' +
      (owned
        ? '<div class="owned">✓ ' + (w.cost === 0 ? 'Always ready!' : 'Forged!') + '</div>'
        : '<button class="buy" data-buy="' + w.id + '"' + (afford ? '' : ' disabled') + '>Forge — 🪵 ' + w.cost + '</button>') +
      '</div>';
  });
  grid.innerHTML = html;
}

/* ---------- garden tab ---------- */
function speedTag(spec){
  if (spec.grow <= 0.7) return '⚡ Grows FAST';
  if (spec.grow >= 1.5) return '🐢 Grows slow';
  return '⏱️ Normal speed';
}
function woodTag(spec){
  if (spec.wood >= 2) return '🪵🪵🪵 HUGE wood';
  if (spec.wood >= 1) return '🪵🪵 Good wood';
  return '🪵 A little wood';
}

function seedCard(id, opts){
  const spec = CD.TREE_SPECIES[id];
  const owned = CD.hasSeed(id);
  const afford = CD.state.wood >= spec.seedCost;
  let foot;
  if (id === 'oak') foot = '<div class="owned">✓ Always yours</div>';
  else if (owned) foot = '<div class="owned">✓ In your seed bag!</div>';
  else foot = '<button class="buy" data-buy-seed="' + id + '"' + (afford ? '' : ' disabled') +
    '>Buy seed — 🪵 ' + spec.seedCost + '</button>';
  return '<div class="wcard' + (owned ? ' done' : '') + '">' +
    '<div class="top"><div class="e">' + spec.emoji + '</div><div class="nm">' + spec.name + '</div></div>' +
    '<div class="d">' + spec.blurb + '</div>' +
    '<div><span class="tag">' + speedTag(spec) + '</span><span class="tag">' + woodTag(spec) + '</span></div>' +
    (opts && opts.foot === false ? '' : foot) +
    '</div>';
}

function renderGardenGrid(){
  const box = $('shop-garden');
  if (!box) return;
  let html = '';

  /* Seeds */
  html += '<div class="gsec"><div class="h">🌱 Seeds</div>' +
    '<div class="sub">Buy a seed once and it is yours forever — plant it as many times as you like!</div>' +
    '<div class="grid">';
  CD.SEED_ORDER.forEach(id => { html += seedCard(id); });
  html += '</div></div>';

  /* Plots */
  const idx = CD.nextPlotIdx();
  html += '<div class="gsec"><div class="h">🟫 Garden Plots</div>' +
    '<div class="sub">More plots = more trees growing at the same time.</div>' +
    '<div class="grid">';
  if (idx < 0){
    html += '<div class="wcard done">' +
      '<div class="top"><div class="e">🌳</div><div class="nm">Your garden is COMPLETE!</div></div>' +
      '<div class="d">Every single plot is yours. Nice work, farmer! 👑</div>' +
      '<div class="owned">✓ All ' + CD.TREE_SPOTS.length + ' plots</div></div>';
  } else {
    const cost = CD.nextPlotCost();
    const afford = CD.state.wood >= cost;
    html += '<div class="wcard">' +
      '<div class="top"><div class="e">🟫</div><div class="nm">New Plot</div></div>' +
      '<div class="d">Dig up a fresh patch of dirt down at the front of the garden.</div>' +
      '<div><span class="tag">You have ' + CD.state.plots + ' of ' + CD.TREE_SPOTS.length + '</span></div>' +
      '<button class="buy" data-buy-plot="1"' + (afford ? '' : ' disabled') + '>Dig it — 🪵 ' + cost + '</button>' +
      '</div>';
  }
  html += '</div></div>';

  /* Helpers */
  html += '<div class="gsec"><div class="h">🧑‍🌾 Helpers</div>' +
    '<div class="sub">Friends who work in the garden all by themselves.</div>' +
    '<div class="grid">';
  CD.HELPERS.forEach(h => {
    const owned = CD.hasHelper(h.id);
    const afford = CD.state.wood >= h.cost;
    html += '<div class="wcard' + (owned ? ' done' : '') + '">' +
      '<div class="top"><div class="e">' + h.emoji + '</div><div class="nm">' + h.name + '</div></div>' +
      '<div class="d">' + h.desc + '</div>' +
      (owned
        ? '<div class="owned">✓ Working for you!</div>'
        : '<button class="buy" data-buy-helper="' + h.id + '"' + (afford ? '' : ' disabled') + '>Hire — 🪵 ' + h.cost + '</button>') +
      '</div>';
  });
  html += '</div></div>';

  box.innerHTML = html;
}

/* ---------- purchases (delegated, same pattern as the original weapon buy) ---------- */
function afford(cost){
  if (CD.state.wood >= cost) return true;
  CDAudio.fx.nope();
  return false;
}
function pop(str, color){
  if (CD.scene) CD.floatText(CD.W / 2, 300, str, { size: 28, color: color || '#FFD24D' });
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-buy]');
  if (!b) return;
  const w = CD.WEAPONS.find(w => w.id === b.getAttribute('data-buy'));
  if (!w || CD.hasWeapon(w.id) || CD.state.wood < w.cost) { CDAudio.fx.nope(); return; }
  CD.state.wood -= w.cost;
  CD.state.weapons.push(w.id);
  CDAudio.fx.buy();
  CD.save();
  ui.setWood(true);
  pop(w.emoji + ' ' + w.name + ' forged!');
});

document.addEventListener('click', e => {
  const b = e.target.closest('[data-buy-seed]');
  if (!b) return;
  const id = b.getAttribute('data-buy-seed');
  const spec = CD.TREE_SPECIES[id];
  if (!spec || CD.hasSeed(id) || !afford(spec.seedCost)) return;
  CD.state.wood -= spec.seedCost;
  CD.state.seeds.push(id);
  CDAudio.fx.buy();
  CD.save();
  ui.setWood(true);
  pop(spec.emoji + ' ' + spec.name + ' seed — it’s yours!', '#FFF3B0');
});

document.addEventListener('click', e => {
  const b = e.target.closest('[data-buy-plot]');
  if (!b) return;
  // Read BOTH before mutating: nextPlotIdx/nextPlotCost are derived from state.plots.
  const idx = CD.nextPlotIdx();
  const cost = CD.nextPlotCost();
  if (idx < 0){ CDAudio.fx.nope(); return; }
  if (!afford(cost)) return;
  CD.state.wood -= cost;
  CD.state.plots++;
  CD.save();
  ui.setWood(true);
  CD.Day.onPlotBought(idx);                     // plays fx.buyplot() + the confetti itself
});

document.addEventListener('click', e => {
  const b = e.target.closest('[data-buy-helper]');
  if (!b) return;
  const id = b.getAttribute('data-buy-helper');
  const h = CD.HELPERS.find(x => x.id === id);
  if (!h || CD.hasHelper(id) || !afford(h.cost)) return;
  CD.state.wood -= h.cost;
  CD.state.helpers.push(id);
  CDAudio.fx.buy();
  CD.save();
  ui.setWood(true);
  CD.Day.onHelperBought(id);
});

/* ---------- seed picker ---------- */
let seedSpot = -1;

ui.openSeedPicker = function(spotIdx){
  if (!CD.state || CD.state.phase !== 'day') return;
  seedSpot = spotIdx;
  renderSeedPicker();
  $('seedpick').classList.add('show');
};
function closeSeedPicker(){ $('seedpick').classList.remove('show'); seedSpot = -1; }

function renderSeedPicker(){
  const grid = $('seed-grid');
  if (!grid || !CD.state) return;
  let html = '';
  CD.SEED_ORDER.forEach(id => {
    const spec = CD.TREE_SPECIES[id];
    const owned = CD.hasSeed(id);
    html += '<div class="wcard' + (owned ? '' : ' locked') + '">' +
      '<div class="top"><div class="e">' + spec.emoji + '</div><div class="nm">' + spec.name + '</div></div>' +
      '<div class="d">' + spec.blurb + '</div>' +
      '<div><span class="tag">' + speedTag(spec) + '</span><span class="tag">' + woodTag(spec) + '</span></div>' +
      (owned
        ? '<button class="plant" data-plant="' + id + '">' + spec.emoji + ' Plant it!</button>'
        : '<button class="nudge" data-seed-shop="1">🔒 🪵 ' + spec.seedCost + ' — Buy at the Forge 🌱</button>') +
      '</div>';
  });
  grid.innerHTML = html;
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-plant]');
  if (!b) return;
  const id = b.getAttribute('data-plant');
  const spot = seedSpot;
  if (spot < 0 || !CD.hasSeed(id)){ CDAudio.fx.nope(); return; }
  closeSeedPicker();
  CD.Day.plantSeed(spot, id);                   // plays fx.plant() itself
});

document.addEventListener('click', e => {
  if (!e.target.closest('[data-seed-shop]')) return;
  CDAudio.fx.click();
  closeSeedPicker();
  ui.openShop('garden');
});

$('seed-close').addEventListener('click', () => { CDAudio.fx.click(); closeSeedPicker(); });
$('seedpick').addEventListener('click', e => { if (e.target.id === 'seedpick') closeSeedPicker(); });

/* ---------- weapon bar ---------- */
function renderWeaponBar(){
  const bar = $('weapon-bar');
  let html = '<div class="wpn-hint"><span class="e">⚔️</span>Tap zombies<br>to BONK!</div>';
  CD.WEAPONS.forEach(w => {
    if (w.id === 'sword' || !CD.hasWeapon(w.id)) return;
    html += '<button class="wpn" data-fire="' + w.id + '" title="' + w.name + '">' + w.emoji +
      '<div class="lbl">' + (w.once ? '1× night' : w.cd + 's') + '</div><div class="cdov"></div></button>';
  });
  bar.innerHTML = html;
}

document.addEventListener('pointerdown', e => {
  const b = e.target.closest('[data-fire]');
  if (!b) return;
  e.preventDefault();
  CDAudio.unlockCtx();
  CD.Night.fire(b.getAttribute('data-fire'));
});

ui.weaponReady = function(id){ return !(cdReadyAt[id] > Date.now()); };
ui.weaponCd = function(id, secs){
  cdReadyAt[id] = Date.now() + secs * 1000;
  const btn = document.querySelector('[data-fire="' + id + '"]');
  if (!btn) return;
  const ov = btn.querySelector('.cdov');
  ov.style.transition = 'none';
  ov.style.height = '100%';
  void ov.offsetWidth;
  ov.style.transition = 'height ' + secs + 's linear';
  ov.style.height = '0%';
};
ui.weaponUsedUp = function(id){
  const btn = document.querySelector('[data-fire="' + id + '"]');
  if (btn) btn.classList.add('used');
};

/* ---------- endcards ---------- */
function showEnd(cfg){
  $('endcard').classList.add('show');
  const p = $('end-panel');
  p.querySelector('.e').textContent = cfg.e;
  p.querySelector('.t').textContent = cfg.t;
  p.querySelector('.d').textContent = cfg.d;
  $('end-stats').innerHTML =
    '<div class="st">🪵 ' + CD.state.chopped + ' wood chopped</div>' +
    '<div class="st">🧟 ' + CD.state.bonked + ' zombies bonked</div>';
  const pr = $('end-primary'), se = $('end-secondary');
  pr.textContent = cfg.primary; se.textContent = cfg.secondary;
  pr.onclick = () => { $('endcard').classList.remove('show'); cfg.onPrimary(); };
  se.onclick = () => { $('endcard').classList.remove('show'); cfg.onSecondary(); };
}

ui.winCard = function(){
  showEnd({
    e: '👑', t: 'YOU SAVED THE CASTLE!',
    d: 'Five whole nights! The zombies gave up and went home for a nap. The kingdom throws a party in your honor!',
    primary: '🌞 Keep Playing!', secondary: 'Back to Title',
    onPrimary: () => { CD.stopFireworks(); CD.toDay(); },
    onSecondary: () => { CD.stopFireworks(); showTitle(); }
  });
};

ui.loseCard = function(){
  showEnd({
    e: '🍪', t: 'Oh no! The zombies got in…',
    d: '…and ate ALL the castle snacks! Don’t worry — you keep your weapons and wood. Try the night again!',
    primary: '💪 Try Night ' + CD.state.day + ' Again', secondary: 'Back to Title',
    onPrimary: () => CD.retryNight(),
    onSecondary: () => showTitle()
  });
};

/* ---------- title ---------- */
function showTitle(){
  CD.Night.stop();
  CDAudio.stopMusic();
  CD.state.phase = 'title';
  ui.exitDay(); ui.exitNight();
  $('hud-top').classList.remove('show');
  refreshTitleButtons();
  $('title').classList.add('show');
  if (window.MayaPortal) MayaPortal.notifyScreen('title');
}

function refreshTitleButtons(){
  const save = CD.loadSave();
  const cb = $('continue-btn');
  if (save && save.day > 1){
    cb.style.display = '';
    cb.textContent = 'Continue — Day ' + save.day + (save.won ? ' 👑' : '');
  } else cb.style.display = 'none';
  $('won-badge').style.display = (save && save.won) ? '' : 'none';
}

ui.onSceneReady = function(){ refreshTitleButtons(); };

$('play-btn').addEventListener('click', () => {
  CDAudio.unlockCtx(); CDAudio.fx.click();
  $('title').classList.remove('show');
  $('hud-top').classList.add('show');
  CDGame.start(null);
  if (window.MayaPortal) MayaPortal.notifyScreen('game');
});
$('continue-btn').addEventListener('click', () => {
  CDAudio.unlockCtx(); CDAudio.fx.click();
  $('title').classList.remove('show');
  $('hud-top').classList.add('show');
  CDGame.start(CD.loadSave());
  if (window.MayaPortal) MayaPortal.notifyScreen('game');
});

/* ---------- top buttons ---------- */
/* No #home-btn any more — shared/back.js owns the back button (a fixed #maya-back at top-left).
   Binding to a missing element here would THROW at top level and take the whole UI script with
   it, which is exactly how other games have shipped a dead start screen. */
$('forge-btn').addEventListener('click', () => { CDAudio.unlockCtx(); CDAudio.fx.click(); ui.openShop(); });
$('night-btn').addEventListener('click', () => { CDAudio.unlockCtx(); CDAudio.fx.click(); if (CD.state.phase === 'day') CD.Day.end(); });
$('shop-close').addEventListener('click', () => { CDAudio.fx.click(); closeShop(); });
$('shop').addEventListener('click', e => { if (e.target.id === 'shop') closeShop(); });

const muteBtn = $('mute-btn');
function syncMute(){ muteBtn.textContent = CDAudio.muted ? '🔇' : '🔊'; muteBtn.classList.toggle('off', CDAudio.muted); }
muteBtn.addEventListener('click', () => { CDAudio.setMuted(!CDAudio.muted); syncMute(); });
syncMute();

/* ---------- boot ---------- */
function boot(){ if (!CD.game) CDGame.boot(); }
if (document.fonts && document.fonts.load){
  Promise.all([
    document.fonts.load('30px "Fredoka One"'),
    document.fonts.load('900 16px "Nunito"')
  ]).then(boot).catch(boot);
  setTimeout(() => { if (!CD.game) boot(); }, 2500);
} else boot();
})();
