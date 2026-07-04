/* ============================================================
   Legend of the Rainbow Dragon — COMBAT
   Tap-the-meter battles, biome picker, dragon boss.
   Progressively harder: faster needle, smaller gold zone.
   ============================================================ */

let combat = null;
let meterRAF = null;

/* ---------- biome picker ---------- */
function goAdventure() {
  if (state.turnsLeft <= 0) { showNoTurns(); return; }
  const ov = document.createElement('div');
  ov.className = 'ov'; ov.id = 'ov-biome';
  ov.innerHTML = '<div class="ov-title" style="font-size:1.5rem">🗺️ Where to?</div>' +
    '<div class="ov-sub">Pick a place to adventure!</div>';
  const grid = document.createElement('div');
  grid.className = 'town-grid';
  grid.style.cssText = 'width:100%;max-width:360px;flex:0 0 auto;height:auto;grid-template-rows:repeat(3,80px)';
  LORD.BIOMES.forEach(b => {
    const unlocked = biomeUnlocked(b);
    const t = document.createElement('button');
    t.className = 'place adventure' + (unlocked ? '' : ' locked');
    t.style.background = 'linear-gradient(160deg,' + b.sky[1] + ',' + b.sky[0] + ')';
    t.innerHTML = '<span class="pe">' + b.emoji + '</span><span class="pl">' + b.name + '</span>' +
      (unlocked ? '<span class="ps">' + b.blurb + '</span>' : '<span class="lock">🔒<span>Reach Lv ' + b.minLv + '</span></span>');
    if (unlocked) t.addEventListener('click', () => { A.sfx('tap'); ov.remove(); startEncounter(b); });
    grid.appendChild(t);
  });
  ov.appendChild(grid);
  const back = document.createElement('button');
  back.className = 'btn ghost'; back.textContent = '← Back to Town';
  back.addEventListener('click', () => { A.sfx('tap'); ov.remove(); });
  ov.appendChild(back);
  document.getElementById('stage').appendChild(ov);
}

/* ---------- start an encounter (costs 1 turn) ---------- */
function startEncounter(biome) {
  if (!useTurn()) return;
  state.visited.adventure = 1;
  const roll = Math.random();

  if (roll < 0.08) { // treasure
    const ev = LORD.TREASURE[Math.floor(Math.random() * LORD.TREASURE.length)];
    applyEvent(ev); A.sfx('coin'); FX.coins(document.getElementById('topbar'), 12);
    toast('📦 ' + ev.text); addLog(ev.text, 'hi'); buildHub(); return;
  }
  if (roll < 0.2) { // goodie
    const ev = LORD.GOODIES[Math.floor(Math.random() * LORD.GOODIES.length)];
    applyEvent(ev);
    if (ev.hp) FX.hearts(document.getElementById('topbar'), 6); else { A.sfx('sparkle'); FX.burst(document.getElementById('topbar'), { count: 10 }); }
    toast('✨ ' + ev.text); addLog(ev.text, 'fun'); buildHub(); return;
  }

  // combat
  const biomeIndex = LORD.BIOMES.indexOf(biome);
  const isStar = Math.random() < 0.14;
  const m = buildMonster(biome, biomeIndex, isStar);
  enterCombat(biome, biomeIndex, m, false);
}

function applyEvent(ev) {
  if (ev.gold) state.gold += ev.gold;
  if (ev.charm) state.charm += ev.charm;
  if (ev.hp) state.hp = Math.min(state.maxHp, state.hp + ev.hp);
  updateHud(); checkAchievements(); save();
}

function buildMonster(biome, biomeIndex, isStar) {
  const key = biome.pool[Math.floor(Math.random() * biome.pool.length)];
  const base = LORD.MONSTERS[key];
  const scale = biome.diff + (state.level - 1) * 0.06;
  const starMul = isStar ? 1.6 : 1;
  const hp = Math.round(base.hp * scale * starMul);
  return {
    name: (isStar ? LORD.STAR_PREFIX[Math.floor(Math.random() * LORD.STAR_PREFIX.length)] + ' ' : '') + base.name,
    emoji: base.emoji, isStar,
    hp, maxHp: hp,
    atk: Math.round(base.atk * biome.diff + state.level * 0.35),
    def: base.def + Math.floor(biome.diff),
    xp: Math.round(base.xp * scale * starMul),
    gold: Math.round(base.gold * scale * starMul),
  };
}

/* ---------- enter combat screen ---------- */
function enterCombat(biome, biomeIndex, monster, isDragon) {
  combat = {
    biome, biomeIndex, monster, isDragon,
    strikes: 0,
    greenHalf: Math.max(0.06, 0.17 - biomeIndex * 0.018),
    coreHalf: Math.max(0.025, 0.07 - biomeIndex * 0.008),
    speed: 0.85 + biomeIndex * 0.2 + (state.level * 0.012),
    pos: 0, dir: 1, last: 0, frozen: false,
    zoneCenter: 0.5,
  };
  if (isDragon) { combat.speed = 1.25 + state.newGamePlus * 0.35; combat.greenHalf = 0.12; combat.coreHalf = 0.045; }

  // backdrop
  const sky = document.getElementById('battle-sky');
  sky.style.background = isDragon
    ? 'linear-gradient(180deg,#3a1a5e,#b84fb0 70%,#7a2f8f)'
    : 'linear-gradient(180deg,' + biome.sky[0] + ',' + biome.sky[1] + ' 75%,' + biome.ground + ')';
  const decor = document.getElementById('battle-decor');
  decor.innerHTML = '';
  const decals = isDragon ? ['🌈', '💫', '⭐', '☁️'] : biome.decor;
  for (let i = 0; i < 7; i++) {
    const s = document.createElement('span');
    s.textContent = decals[i % decals.length];
    s.style.left = (5 + Math.random() * 88) + '%';
    s.style.top = (8 + Math.random() * 55) + '%';
    s.style.animationDelay = (Math.random() * 3) + 's';
    s.style.fontSize = (20 + Math.random() * 16) + 'px';
    decor.appendChild(s);
  }

  document.getElementById('biome-name').textContent = isDragon ? '🌈 Rainbow Peak' : biome.emoji + ' ' + biome.name;
  const flee = document.getElementById('flee-btn');
  flee.textContent = isDragon ? '← Town' : '🏃 Flee';

  const me = document.getElementById('mon-emoji');
  me.textContent = isDragon ? '🌈🐉' : monster.emoji;
  me.className = 'mon-emoji' + (monster.isStar || isDragon ? ' star' : '');
  document.getElementById('mon-name').innerHTML = (isDragon ? 'Rainbow Dragon' : monster.name) +
    (monster.isStar ? '<span class="startag">⭐ STAR</span>' : '');

  document.getElementById('combat-hero-av').textContent = state.avatar;
  document.getElementById('combat-hero-name').textContent = state.name;

  updateMonHp(); updateHeroMini();
  document.getElementById('combat-result').classList.add('hidden');
  document.getElementById('combat-controls').style.display = 'flex';
  layoutMeter(); positionZone();

  currentScreen = isDragon ? 'dragon' : 'combat';
  showScreen('combat');
  A.playMusic(isDragon ? 'dragon' : 'battle');
  if (isDragon) A.sfx('roar');
  say(isDragon ? 'The Rainbow Dragon wants to play! 🌈' : monster.emoji + ' ' + monster.name + ' wants to play-fight!');
  startMeter();
}

function updateMonHp() {
  const m = combat.monster;
  const hp = combat.isDragon ? state.dragonHp : m.hp;
  const max = combat.isDragon ? bossMaxHp() : m.maxHp;
  const pct = Math.max(0, hp / max * 100);
  document.getElementById('mon-hpfill').style.width = pct + '%';
  document.getElementById('mon-hptext').textContent = 'HP ' + Math.max(0, hp) + ' / ' + max;
}
function updateHeroMini() {
  document.getElementById('combat-hero-hp').textContent = '❤️ ' + Math.max(0, state.hp) + '/' + state.maxHp;
}

/* ---------- the meter ---------- */
function layoutMeter() {
  const zone = document.getElementById('meter-zone');
  const core = document.getElementById('meter-core');
  zone.style.width = (combat.greenHalf * 2 * 100) + '%';
  core.style.width = (combat.coreHalf * 2 * 100) + '%';
}
function positionZone() {
  combat.zoneCenter = 0.2 + Math.random() * 0.6;
  const zone = document.getElementById('meter-zone');
  const core = document.getElementById('meter-core');
  zone.style.left = ((combat.zoneCenter - combat.greenHalf) * 100) + '%';
  core.style.left = ((combat.zoneCenter - combat.coreHalf) * 100) + '%';
}
function startMeter() {
  combat.frozen = false; combat.last = 0;
  document.getElementById('strike-btn').disabled = false;
  cancelAnimationFrame(meterRAF);
  const step = (ts) => {
    if (!combat || combat.frozen) return;
    if (!combat.last) combat.last = ts;
    const dt = Math.min(0.05, (ts - combat.last) / 1000); combat.last = ts;
    combat.pos += combat.dir * combat.speed * dt;
    if (combat.pos >= 1) { combat.pos = 1; combat.dir = -1; }
    if (combat.pos <= 0) { combat.pos = 0; combat.dir = 1; }
    document.getElementById('meter-needle').style.left = (combat.pos * 100) + '%';
    // live feedback: light up STRIKE when needle is in the zone
    const btn = document.getElementById('strike-btn');
    const dist = Math.abs(combat.pos - combat.zoneCenter);
    if (dist <= combat.coreHalf) { btn.classList.add('super'); btn.classList.remove('hot'); }
    else if (dist <= combat.greenHalf) { btn.classList.add('hot'); btn.classList.remove('super'); }
    else { btn.classList.remove('hot', 'super'); }
    meterRAF = requestAnimationFrame(step);
  };
  meterRAF = requestAnimationFrame(step);
}
function stopMeter() { combat.frozen = true; cancelAnimationFrame(meterRAF); document.getElementById('strike-btn').classList.remove('hot', 'super'); }

function onStrike() {
  if (!combat || combat.frozen) return;
  stopMeter();
  document.getElementById('strike-btn').disabled = true;
  const dist = Math.abs(combat.pos - combat.zoneCenter);
  let mult, label, kind;
  if (dist <= combat.coreHalf) { mult = 2.3; label = 'SUPER!'; kind = 'super'; }
  else if (dist <= combat.greenHalf) { mult = 1.6; label = 'GREAT!'; kind = 'great'; }
  else { mult = 0.85; label = 'Hit!'; kind = 'ok'; }

  const dmg = Math.max(1, Math.round(totalStr() * mult - combat.monster.def * 0.5));
  const me = document.getElementById('mon-emoji');

  // hero lunges, monster reacts
  document.getElementById('combat-hero-av').style.animation = 'lunge .4s ease';
  setTimeout(() => { document.getElementById('combat-hero-av').style.animation = ''; }, 400);

  if (kind === 'super') {
    A.sfx('super'); FX.shake(12); FX.flash('rgba(255,225,77,.4)');
    FX.burst(me, { count: 24, power: 6 }); FX.floatText(me, '★ SUPER ' + dmg + '!', 'super');
    unlockAch('super');
  } else if (kind === 'great') {
    A.sfx('hit'); FX.shake(7); FX.burst(me, { count: 14 }); FX.floatText(me, dmg + '!', 'dmg');
  } else {
    A.sfx('hit'); FX.floatText(me, dmg, 'dmg');
  }
  me.classList.remove('hurt'); void me.offsetWidth; me.classList.add('hurt');
  say(label + ' You hit for ' + dmg + '!');

  // apply damage
  if (combat.isDragon) state.dragonHp = Math.max(0, state.dragonHp - dmg);
  else combat.monster.hp = Math.max(0, combat.monster.hp - dmg);
  updateMonHp();
  combat.strikes++;

  const dead = combat.isDragon ? state.dragonHp <= 0 : combat.monster.hp <= 0;
  if (dead) { setTimeout(winCombat, 450); return; }

  // monster counter-attack (after a short telegraph)
  setTimeout(monsterCounter, 480);
}

function monsterCounter() {
  if (!combat) return;
  // buddy help: every 3rd strike, buddy softens the blow
  let buddyBlock = false;
  if (state.buddy && combat.strikes % 3 === 0) { buddyBlock = true; }

  let dmg = Math.max(1, Math.round(combat.monster.atk - totalDef() * 0.4));
  if (combat.isDragon) dmg = Math.round(dmg * 0.8);
  if (buddyBlock) { dmg = Math.max(0, Math.round(dmg * 0.4)); }

  const heroAv = document.getElementById('combat-hero-av');
  const mon = document.getElementById('mon-emoji');
  mon.style.animation = 'lunge .35s ease'; setTimeout(() => mon.style.animation = '', 350);

  state.hp -= dmg;
  if (combat.isDragon && state.hp < 1) state.hp = 1; // dragon never knocks you fully out
  updateHeroMini(); updateHud();
  FX.floatText(heroAv, '-' + dmg, 'bad'); FX.flash('rgba(255,93,126,.25)');
  heroAv.style.animation = 'hurt .4s ease'; setTimeout(() => heroAv.style.animation = '', 400);
  if (buddyBlock) say(state.buddy.emoji + ' ' + state.buddy.name + ' blocked most of it!');
  else say(combat.monster.name.replace(/^(Rainbow|Star|Sparkly|Mega|Glitter) /, '') + ' tags you! -' + dmg + ' HP');
  A.sfx('oops');

  if (state.hp <= 0) {
    stopMeter();
    document.getElementById('combat-controls').style.display = 'none';
    setTimeout(() => knockout(), 600);
    return;
  }
  // next round
  positionZone();
  setTimeout(() => { if (combat && !combat.frozen) {} startMeter(); }, 250);
}

/* ---------- win ---------- */
function winCombat() {
  const m = combat.monster;
  const mon = document.getElementById('mon-emoji');
  document.getElementById('combat-controls').style.display = 'none';

  if (combat.isDragon) {
    state.dragonDefeated = true;
    A.sfx('fanfare'); FX.confetti(120); FX.poof(mon, ['🌈', '💖', '⭐', '✨']);
    addLog('🏆 The Rainbow Dragon is your friend now! You saved the realm!', 'hi');
    checkAchievements(); save();
    const ng = state.newGamePlus >= 1;
    document.getElementById('victory-msg').innerHTML = state.name + ' the brave ' + state.avatar +
      (ng ? ' is a <b>double legend!</b> 👑' : ' made friends with the <b>Rainbow Dragon!</b> 🌈');
    setTimeout(() => document.getElementById('ov-victory').classList.remove('hidden'), 700);
    return;
  }

  // friendly win — monster becomes a pal
  A.sfx('win'); FX.poof(mon, ['💖', '⭐', '✨', '💫']);
  const bonus = charmGold();
  const gold = m.gold + bonus;
  state.gold += gold; state.kills++; bumpDaily('wins');
  FX.coins(mon, m.isStar ? 16 : 10);
  FX.floatText(document.getElementById('s-gold'), '+' + gold, 'gold');
  addLog('⚔️ Made friends with ' + m.name + '! +' + m.xp + ' XP, +' + gold + ' gold', 'hi');
  say('🎉 ' + m.name + ' is your friend now!');

  const card = document.getElementById('combat-result');
  card.classList.remove('hidden');
  card.innerHTML = '';
  const rc = document.createElement('div'); rc.className = 'result-card';
  rc.innerHTML = '<div class="rt">🎉 New Friend!</div><div class="rr">+' + m.xp + ' XP ⭐  ·  +' + gold + ' gold 🪙' +
    (m.isStar ? '<br>⭐ Star bonus loot!' : '') + (bonus ? '<br>✨ Charm bonus: +' + bonus + ' gold' : '') + '</div>';
  card.appendChild(rc);
  const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px';
  const again = document.createElement('button'); again.className = 'btn green'; again.style.flex = '1';
  again.textContent = state.turnsLeft > 0 ? '🌲 Again!' : '😴 No turns';
  again.disabled = state.turnsLeft <= 0;
  again.addEventListener('click', () => { A.sfx('tap'); startEncounter(combat.biome); });
  const home = document.createElement('button'); home.className = 'btn primary'; home.style.flex = '1';
  home.textContent = '🏠 Town';
  home.addEventListener('click', () => { A.sfx('tap'); goToHub(); });
  row.appendChild(again); row.appendChild(home);
  card.appendChild(row);

  gainXp(m.xp); // may pop level-up overlay above
  checkAchievements(); updateHud(); save();
}

/* ---------- flee ---------- */
function onFlee() {
  if (!combat) return;
  if (combat.isDragon) { stopMeter(); goToHub(); return; }
  stopMeter();
  if (Math.random() < fleeChance()) {
    A.sfx('flee'); say('🏃 You zoomed away safely!');
    addLog('🏃 Fled from ' + combat.monster.name + '.', '');
    setTimeout(() => goToHub(), 500);
  } else {
    say("Couldn't get away! One more round!");
    A.sfx('oops');
    setTimeout(monsterCounter, 400);
  }
}

/* ---------- dragon ---------- */
function bossMaxHp() { return state.newGamePlus >= 1 ? C.BOSS_NG_HP : C.BOSS_MAX_HP; }
function goDragon() {
  if (state.dragonDefeated) { toast('🌈 You and the dragon are already best friends!'); return; }
  if (state.turnsLeft <= 0) { showNoTurns(); return; }
  enterCombat(null, 4, { name: 'Rainbow Dragon', emoji: '🌈🐉', def: 4, atk: Math.round(10 + state.newGamePlus * 5), isStar: true, hp: state.dragonHp, maxHp: bossMaxHp() }, true);
}
function startNewGamePlus() {
  state.newGamePlus = 1; state.dragonDefeated = false; state.dragonHp = C.BOSS_NG_HP;
  addLog('👑 NEW GAME+! The Rainbow Dragon returns for a sparkly rematch!', 'hi');
  save(); buildHub(); toast('👑 The dragon is back for Round 2!');
}

/* ---------- combat ticker ---------- */
let sayTimer = null;
function say(msg) {
  const el = document.getElementById('combat-say');
  el.textContent = msg; el.classList.add('show');
  if (sayTimer) clearTimeout(sayTimer);
  sayTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* dragon strike costs a turn each (epic daily grind) */
function dragonStrikeGate() {
  if (!combat || !combat.isDragon) return true;
  if (state.turnsLeft <= 0) { stopMeter(); showNoTurns(); return false; }
  state.turnsLeft--; updateHud(); save();
  return true;
}

/* ============================================================
   INIT + EVENT WIRING (this is the last script to load)
   ============================================================ */
function wireStrike() {
  const btn = document.getElementById('strike-btn');
  btn.addEventListener('click', () => {
    if (combat && combat.isDragon) { if (!dragonStrikeGate()) return; }
    onStrike();
  });
}

function init() {
  FX.init(document.getElementById('fx-canvas'));
  A.loadMuted(); A.loadTune(); updateMuteIcon();
  renderAvatars();

  // overlay buttons
  document.getElementById('btn-continue').addEventListener('click', () => { A.resume(); enterGame(); });
  document.getElementById('btn-new').addEventListener('click', () => { A.resume(); A.sfx('tap'); document.getElementById('ov-title').classList.add('hidden'); document.getElementById('ov-create').classList.remove('hidden'); document.getElementById('hero-name').value = ''; selectedAvatar = LORD.AVATARS[0]; renderAvatars(); });
  document.getElementById('btn-start').addEventListener('click', () => { A.resume(); createHero(); });
  document.getElementById('btn-create-cancel').addEventListener('click', () => { A.sfx('tap'); document.getElementById('ov-create').classList.add('hidden'); document.getElementById('ov-title').classList.remove('hidden'); });
  document.getElementById('btn-leave-lab').addEventListener('click', () => { if (window.MayaPortal) window.MayaPortal.leaveToLab(); });

  document.getElementById('btn-lvup-ok').addEventListener('click', () => { A.sfx('tap'); document.getElementById('ov-levelup').classList.add('hidden'); buildHub(); });
  document.getElementById('btn-victory-ok').addEventListener('click', () => { A.sfx('tap'); document.getElementById('ov-victory').classList.add('hidden'); goToHub(); });
  document.getElementById('btn-day-ok').addEventListener('click', () => { A.sfx('tap'); document.getElementById('ov-noturns').classList.add('hidden'); goToHub(); });
  document.getElementById('btn-day-stay').addEventListener('click', () => { A.sfx('tap'); document.getElementById('ov-noturns').classList.add('hidden'); goToHub(); });
  document.getElementById('btn-story').addEventListener('click', () => { A.sfx('tap'); showStory(); });
  document.getElementById('btn-story-close').addEventListener('click', () => { A.sfx('tap'); document.getElementById('ov-story').classList.add('hidden'); });
  document.getElementById('btn-endday').addEventListener('click', () => { A.sfx('tap'); endDay(); });

  // screen backs
  document.getElementById('shop-back').addEventListener('click', () => { A.sfx('tap'); goToHub(); });
  document.getElementById('mail-back').addEventListener('click', () => { A.sfx('tap'); goToHub(); });
  document.getElementById('stats-back').addEventListener('click', () => { A.sfx('tap'); goToHub(); });

  // hub
  document.getElementById('dragon-banner').addEventListener('click', () => {
    A.sfx('tap');
    if (state.dragonDefeated && state.newGamePlus === 0) startNewGamePlus();
    else goDragon();
  });
  document.getElementById('chal-claim').addEventListener('click', claimDaily);
  document.getElementById('btn-mute').addEventListener('click', toggleMute);

  // combat
  wireStrike();
  document.getElementById('flee-btn').addEventListener('click', () => { A.sfx('tap'); onFlee(); });

  // new-game-plus button is added dynamically when needed (in stats / victory flow)
  window.addEventListener('message', (ev) => { if (ev.data === 'maya:nav-back') goToHub(); });

  // first-touch resume audio
  document.body.addEventListener('pointerdown', () => A.resume(), { once: true });

  // boot
  if (load()) {
    document.getElementById('btn-continue').style.display = '';
  } else {
    document.getElementById('btn-continue').style.display = 'none';
  }
}

/* expose play-again from victory overlay -> offer NG+ */
document.addEventListener('click', function (e) {
  // when victory closes and player is at hub with dragon defeated & no NG+, show a one-time NG+ offer button in stats
});

window.mayaGameCanGoBack = function () { return false; };
window.render_game_to_text = function () {
  return JSON.stringify({ name: state.name, level: state.level, hp: state.hp, maxHp: state.maxHp,
    str: totalStr(), def: totalDef(), charm: state.charm, gold: state.gold, xp: state.xp,
    kills: state.kills, turnsLeft: state.turnsLeft, dragonHp: state.dragonHp,
    dragonDefeated: state.dragonDefeated, screen: currentScreen, created: state.created });
};
window.advanceTime = function () {};

init();
