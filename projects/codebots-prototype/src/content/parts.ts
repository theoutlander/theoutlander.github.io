/**
 * THE GARAGE: ONE CHOICE, THREE ANSWERS.
 *
 * What was here before was an RPG inventory: three chassis, a weight budget, slot counts, part
 * weights, an overload rule, and two different kinds of part. To equip anything, a kid had to hold
 * four numbers in her head at once and reason about a constraint nobody had taught her. That's a
 * system for someone who already enjoys systems. She might be six.
 *
 * Worse, it had CAPABILITY parts — a blaster that "lets you shoot()", a scanner that "lets you
 * sense()". Those quietly broke the one rule this entire game rests on: ABILITIES ARE EARNED BY
 * LEARNING, NEVER BOUGHT. If the blaster is a purchase then shoot() is something you buy, and the
 * campaign is just a coin farm with a story. They're gone. Commands come from lessons. Full stop.
 *
 * What's left is a single question, asked once, with three honest answers — and each answer is a real
 * tactic she'll meet in the arena:
 *
 *   SCOUT     balanced; no excuses in either direction
 *   TANK      takes a beating, but must get close to land one     → brawl; charge the snipers
 *   LONGSHOT  outranges everything, but folds if you touch it     → kite; never let them near
 *
 * That's the whole garage. No weights, no slots, no overload, nothing to overwhelm her — and it is
 * still a genuine strategic decision, because the arena punishes the wrong pick.
 *
 * THE RULE THAT MUST NEVER BREAK: code beats parts. A well-written stock bot beats a badly-written
 * one in the most expensive kit in the game. The moment that stops being true, we're telling children
 * to grind coins instead of think, and we've built the wrong product. There's a test.
 */

export interface Kit {
  id: string;
  name: string;
  /** what it is, in a sentence a child can read */
  desc: string;
  /** what it COSTS you — said out loud, because every real choice costs something */
  tradeoff: string;
  cost: number;
  armor: number;
  damage: number;
  /** how far it can shoot, in squares */
  range: number;
}

export const KITS: Kit[] = [
  {
    id: "scout",
    name: "SCOUT",
    desc: "The bot you start with. Good at everything, best at nothing.",
    tradeoff: "No weakness — but no edge either.",
    cost: 0,
    armor: 100,
    damage: 15,
    range: 6,
  },
  {
    id: "tank",
    name: "TANK",
    desc: "Thick armour. It can take a real pounding and keep rolling.",
    tradeoff: "But it only shoots 4 squares. You have to get close — and closing is where bots die.",
    cost: 120,
    armor: 170,
    damage: 15,
    range: 4,
  },
  {
    id: "longshot",
    name: "LONGSHOT",
    desc: "Shoots 9 squares. Further than anything else in the arena.",
    tradeoff: "But it's made of paper. Let anything get close and it's over.",
    cost: 120,
    armor: 65,
    damage: 15,
    range: 9,
  },
];

export const kitById = (id: string): Kit => KITS.find((k) => k.id === id) ?? KITS[0];

export interface Loadout {
  /** the kit she's driving */
  kit: string;
  /** the kits she owns. SCOUT is hers forever, from the first second. */
  owned: string[];
}

export const FRESH_LOADOUT: Loadout = { kit: "scout", owned: ["scout"] };

/** The stats her bot actually fights with. One kit in, three numbers out. */
export function computeStats(loadout: Loadout): { armor: number; damage: number; range: number } {
  const k = kitById(loadout.kit);
  return { armor: k.armor, damage: k.damage, range: k.range };
}

export function buyKit(
  loadout: Loadout,
  coins: number,
  id: string,
): { loadout: Loadout; coins: number } | null {
  const kit = kitById(id);
  if (loadout.owned.includes(id) || coins < kit.cost) return null;
  return { loadout: { kit: id, owned: [...loadout.owned, id] }, coins: coins - kit.cost };
}

/** Switching between kits she already owns is FREE, and always will be. Regret has to be cheap. */
export function equipKit(loadout: Loadout, id: string): Loadout {
  return loadout.owned.includes(id) ? { ...loadout, kit: id } : loadout;
}
