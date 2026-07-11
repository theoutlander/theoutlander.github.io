/**
 * The Garage catalog: chassis + parts. The design rule that keeps this a CODING game (see the
 * north-star doc): **code skill beats parts, always.**
 *
 *  - CAPABILITY parts (the Blaster, the Scanner…) are what make a command exist — and they are
 *    earned ONLY by LEARNING (a level's `unlock`). You can never buy an ability.
 *  - STAT parts cost WEIGHT. Your chassis has a weight budget, so armour/firepower/range are
 *    TRADE-OFFS, not free upgrades. A heavier bot moves less often in a battle.
 *  - COSMETIC parts are pure self-expression and cost nothing but coins.
 *
 * Loadout only bites in the ARENA. The campaign stays unrestricted so learning is never gated
 * behind gear.
 */

export type PartKind = "capability" | "stat" | "cosmetic";
export type Slot = "core" | "weapon" | "sensor" | "armor" | "treads" | "paint";

export interface Chassis {
  id: string;
  name: string;
  desc: string;
  /** how many parts you can bolt on */
  slots: number;
  /** total weight the frame can carry (stat parts cost weight) */
  capacity: number;
  /** base armour it rolls out of the shop with */
  armor: number;
  /** coins to buy. 0 = you start with it */
  cost: number;
}

export interface Part {
  id: string;
  name: string;
  desc: string;
  kind: PartKind;
  slot: Slot;
  /** weight it costs against the chassis capacity (0 for cosmetics) */
  weight: number;
  /** coins to buy. Capability parts are 0 — they're earned by learning, never sold. */
  cost: number;
  /** the level `unlock` name that grants this. Only set for capability parts. */
  unlockedBy?: string;
  /** battle effects */
  effects?: { armor?: number; damage?: number; range?: number };
  /** the honest downside, in kid words */
  tradeoff?: string;
}

export const CHASSIS: Chassis[] = [
  {
    id: "scout", name: "SCOUT", desc: "The starter frame. Light and nimble, but not much room.",
    slots: 2, capacity: 4, armor: 100, cost: 0,
  },
  {
    id: "ranger", name: "RANGER", desc: "A bigger frame. More room to bolt things on.",
    slots: 3, capacity: 7, armor: 110, cost: 120,
  },
  {
    id: "hauler", name: "HAULER", desc: "A heavy rig. Carries everything — if you can afford it.",
    slots: 4, capacity: 11, armor: 130, cost: 300,
  },
];

export const PARTS: Part[] = [
  // ── CAPABILITY — earned by LEARNING. Never for sale. ─────────────────────────
  { id: "air-horn", name: "AIR HORN", desc: "Lets you honk() — and honking opens gates.", kind: "capability",
    slot: "core", weight: 0, cost: 0, unlockedBy: "AIR HORN" },
  { id: "scanner", name: "SCANNER", desc: "Lets you sense the world: blocked(), atBeacon().", kind: "capability",
    slot: "sensor", weight: 1, cost: 0, unlockedBy: "SCANNER" },
  { id: "blaster", name: "BLASTER", desc: "Lets you shoot(). This is WHY your bot can fire at all.", kind: "capability",
    slot: "weapon", weight: 2, cost: 0, unlockedBy: "BLASTER" },
  { id: "auto-drive", name: "AUTO-DRIVE", desc: "Lets your bot keep going on its own — while loops.", kind: "capability",
    slot: "core", weight: 1, cost: 0, unlockedBy: "AUTO-DRIVE" },
  { id: "function-keys", name: "FUNCTION KEYS", desc: "Lets you build your OWN commands — functions.", kind: "capability",
    slot: "core", weight: 0, cost: 0, unlockedBy: "FUNCTION KEYS" },

  // ── STAT — bought with coins, but every one costs WEIGHT. Trade-offs. ────────
  { id: "plate", name: "ARMOUR PLATE", desc: "Take more hits before you're wrecked.", kind: "stat",
    slot: "armor", weight: 3, cost: 60, effects: { armor: 40 },
    tradeoff: "Heavy — eats a lot of your weight budget." },
  { id: "big-barrel", name: "HEAVY BARREL", desc: "Your shots hit much harder.", kind: "stat",
    slot: "weapon", weight: 3, cost: 90, effects: { damage: 18 },
    tradeoff: "Heavy. And it needs a BLASTER to be any use at all." },
  { id: "long-lens", name: "LONG LENS", desc: "See and shoot further down the lane.", kind: "stat",
    slot: "sensor", weight: 2, cost: 70, effects: { range: 3 },
    tradeoff: "Takes a sensor slot you might want for something else." },
  { id: "light-treads", name: "RACING TREADS", desc: "Shed weight — carry more of everything else.", kind: "stat",
    slot: "treads", weight: -2, cost: 80,
    tradeoff: "Gives you weight back, but uses up a slot." },

  // ── COSMETIC — pure style. No effect on a fight. ─────────────────────────────
  { id: "racing-stripes", name: "RACING STRIPES", desc: "Go faster. (It doesn't. But it looks like it.)", kind: "cosmetic",
    slot: "paint", weight: 0, cost: 25 },
  { id: "gold-trim", name: "GOLD TRIM", desc: "For the bot who has cleared everything.", kind: "cosmetic",
    slot: "paint", weight: 0, cost: 150 },
];

export const chassisById = (id: string) => CHASSIS.find((c) => c.id === id);
export const partById = (id: string) => PARTS.find((p) => p.id === id);

/** A capability part is available only if the campaign granted its unlock. */
export function isPartOwnable(part: Part, unlocked: string[], bought: string[]): boolean {
  if (part.kind === "capability") return !!part.unlockedBy && unlocked.includes(part.unlockedBy);
  return bought.includes(part.id);
}

export interface LoadoutStats {
  armor: number;
  damage: number;
  range: number;
  weightUsed: number;
  capacity: number;
  slotsUsed: number;
  slots: number;
  overWeight: boolean;
  overSlots: boolean;
}

const BASE_DAMAGE = 34;
const BASE_RANGE = 6;

/** Roll up a chassis + equipped parts into the numbers a battle actually uses. */
export function computeStats(chassisId: string, equipped: string[]): LoadoutStats {
  const c = chassisById(chassisId) ?? CHASSIS[0];
  const parts = equipped.map(partById).filter((p): p is Part => !!p);
  const armor = c.armor + parts.reduce((n, p) => n + (p.effects?.armor ?? 0), 0);
  const damage = BASE_DAMAGE + parts.reduce((n, p) => n + (p.effects?.damage ?? 0), 0);
  const range = BASE_RANGE + parts.reduce((n, p) => n + (p.effects?.range ?? 0), 0);
  const weightUsed = parts.reduce((n, p) => n + p.weight, 0);
  return {
    armor, damage, range,
    weightUsed,
    capacity: c.capacity,
    slotsUsed: parts.length,
    slots: c.slots,
    overWeight: weightUsed > c.capacity,
    overSlots: parts.length > c.slots,
  };
}
