/* Castle Defenders v2 — DOM UI glue */
(function(){
'use strict';
const $ = id => document.getElementById(id);
const ui = {};
window.CD.ui = ui;

const cdReadyAt = {};   // weapon id -> timestamp ms

/* ---------- HUD ---------- */
ui.setWood = function(pop){
  const el = $('wood-chip');
  el.querySelector('.n').textContent = CD.state.wood;
  $('shop-wood').textContent = '🪵 ' + CD.state.wood;
  if (pop){ el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  renderShop();
};

ui.setHearts = function(pop){
  const h = $('hearts');
  let s = '';
  for (let i = 0; i < CD.MAX_HEARTS; i++) s += '<span class="' + (i < CD.state.hearts ? '' : 'lost') + '">💖</span>';
  h.innerHTML = s;
  if (pop){ h.classList.remove('pop'); void h.offsetWidth; h.classList.add('pop'); }
};

function phaseChip(txt){ $('phase-chip').textContent = txt; }

ui.dayTick = function(frac){
  $('daybar').querySelector('.fill').style.width = Math.min(100, frac * 100) + '%';
};

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
  closeShop();
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
ui.openShop = function(){
  if (CD.state.phase !== 'day') return;
  renderShop();
  $('shop').classList.add('show');
};
function closeShop(){ $('shop').classList.remove('show'); }

function renderShop(){
  const grid = $('shop-grid');
  if (!grid || !CD.state) return;
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
  CD.floatText(CD.W / 2, 300, w.emoji + ' ' + w.name + ' forged!', { size: 30, color: '#FFD24D' });
});

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
    d: '…and ate ALL the castle snacks! Don\u2019t worry — you keep your weapons and wood. Try the night again!',
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
$('home-btn').addEventListener('click', () => { if (window.MayaPortal) MayaPortal.leaveToLab(); });
$('lab-btn').addEventListener('click', () => { if (window.MayaPortal) MayaPortal.leaveToLab(); });
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
