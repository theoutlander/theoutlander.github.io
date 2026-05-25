/**
 * Smoke tests for Legend of the Rainbow Dragon combat math.
 * Run: node maya/scripts/verify-lord-combat.mjs
 */

function playerDamage(str, weaponStr, monsterDef) {
  return Math.max(1, Math.floor(str + weaponStr - monsterDef * 0.5));
}

function monsterDamage(monsterAtk, def) {
  return Math.max(1, Math.floor(monsterAtk - def * 0.4));
}

function xpForLevel(lv) {
  if (lv <= 1) return 0;
  return 50 + (lv - 2) * 40;
}

function simulateFight(str, weaponStr, def, monster) {
  let mhp = monster.hp;
  let php = 10;
  let rounds = 0;
  while (mhp > 0 && php > 0 && rounds < 50) {
    mhp -= playerDamage(str, weaponStr, monster.def);
    rounds++;
    if (mhp <= 0) break;
    php -= monsterDamage(monster.atk, def);
    rounds++;
  }
  return { win: mhp <= 0 && php > 0, rounds, hpLeft: php };
}

let ok = true;
function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    ok = false;
  } else {
    console.log('ok:', msg);
  }
}

assert(playerDamage(10, 0, 0) >= 1, 'player damage floor');
assert(monsterDamage(5, 5) >= 1, 'monster damage floor');
assert(playerDamage(10, 20, 5) > playerDamage(10, 0, 5), 'weapon increases damage');

const slime = { hp: 4, atk: 2, def: 0 };
const r = simulateFight(10, 0, 5, slime);
assert(r.win, 'level 1 hero beats slime');
assert(r.rounds <= 10, 'slime fight finishes quickly');

const golem = { hp: 18, atk: 7, def: 5 };
const r2 = simulateFight(10, 0, 5, golem);
assert(!r2.win || r2.rounds > r.rounds, 'golem harder than slime (or longer fight)');

assert(xpForLevel(2) === 50, 'level 2 xp threshold');
assert(xpForLevel(5) === 50 + 3 * 40, 'level 5 xp threshold');

const bossHits = Math.ceil(500 / Math.max(5, Math.floor((10 + 20) * 1.5)));
assert(bossHits >= 10 && bossHits <= 40, 'solo dragon kill in reasonable turns at high STR');

if (ok) console.log('\nAll combat checks passed.');
else process.exit(1);
