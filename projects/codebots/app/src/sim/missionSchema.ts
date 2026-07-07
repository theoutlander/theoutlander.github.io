import { z } from "zod";

const Vec2Schema = z.object({ x: z.number().int(), y: z.number().int() });
const FacingSchema = z.enum(["N", "E", "S", "W"]);
const CellKindSchema = z.enum([
  "floor", "wall", "pit", "mud", "ice", "bush", "tree", "water", "repairPad", "spawnPad",
]);

export const ArenaSchema = z.object({
  cols: z.number().int().positive(),
  rows: z.number().int().positive(),
  cells: z.array(z.array(CellKindSchema)),
  crates: z.array(Vec2Schema),
  coins: z.array(Vec2Schema),
  chests: z.array(z.object({ id: z.string(), pos: Vec2Schema })),
  gates: z.array(z.object({
    pad: Vec2Schema,
    gateCells: z.array(Vec2Schema),
    open: z.boolean(),
  })),
  obstacles: z.array(z.object({ kind: z.literal("tank"), pos: Vec2Schema })).optional(),
  targets: z.array(Vec2Schema).optional(),
  beacon: Vec2Schema,
  beaconRequiresFacing: FacingSchema.optional(),
  beaconStyle: z.enum(["beacon", "chest"]).optional(),
});

export const MissionSchema = z.object({
  id: z.string(),
  world: z.number().int().min(1).max(8),
  index: z.number().int().min(1).max(6),
  title: z.string(),
  teaches: z.string(),
  arena: ArenaSchema,
  start: z.object({ pos: Vec2Schema, facing: FacingSchema }),
  parLines: z.number().int().positive(),
  starterCode: z.string(),
  hints: z.array(z.string()).length(3),
  briefing: z.string(),
  authorSolution: z.string(),
  bonusStar: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("honkOnBeacon") }),
    z.object({ kind: z.literal("zeroBumps") }),
    z.object({ kind: z.literal("exactHonks"), count: z.number().int().positive() }),
  ]),
  unlock: z.object({ part: z.string(), cost: z.number().int().nonnegative() }).optional(),
  cutscene: z.string().optional(),
});
export type Mission = z.infer<typeof MissionSchema>;

export const PartSchema = z.object({
  name: z.string(),
  slot: z.enum(["blaster", "blasterMod", "sidePod", "gizmo", "treads", "core"]),
  weight: z.number().int().nonnegative(),
  grants: z.string(),
  teaches: z.string().optional(),
  tradeoff: z.string().optional(),
  unlockedBy: z.string(),
  costC: z.number().int().nonnegative(),
});
export type Part = z.infer<typeof PartSchema>;
