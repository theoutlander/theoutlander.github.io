export type Facing = "N" | "E" | "S" | "W";
export interface Vec2 { x: number; y: number; }

export type CellKind =
  | "floor" | "wall" | "pit" | "mud" | "ice" | "bush" | "tree" | "water"
  | "repairPad" | "spawnPad";

export interface GateSpec {
  pad: Vec2;
  gateCells: Vec2[];
  /** opens permanently once honk() is called while standing on `pad` */
  open: boolean;
}

export interface Arena {
  cols: number;
  rows: number;
  /** cells[y][x] */
  cells: CellKind[][];
  crates: Vec2[];
  coins: Vec2[];
  chests: { id: string; pos: Vec2 }[];
  gates: GateSpec[];
  beacon: Vec2;
  /** if set, arriving at the beacon also requires this facing (W1M3 rule) */
  beaconRequiresFacing?: Facing;
}

export interface BotState {
  pos: Vec2;
  facing: Facing;
  armor: number;
  score: number;
  bumps: number;
  honks: number;
  wrecked: boolean;
}
// NOTE: `speed`/`weight` are deliberately absent. CONTENT_SPEC makes SPEED a felt, discrete
// meter that debuts at W3M2, and weight only exists once grab() lands in W3. In World 1 weight
// is always 0, so any speed model here would be untested fiction. Reintroduced with the W3 plan.

export interface TraceEntry {
  tick: number;
  x: number;
  y: number;
  hazards: string[]; // e.g. ["mud"], ["pit"], [] — cell kinds the bot is currently on/in
}

export interface SimResult {
  cleared: boolean;
  stars: number;
  ticks: number;
  trace: TraceEntry[];
  finalState: BotState;
}

export type CommandName =
  | "forward" | "back" | "left" | "right" | "boost"
  | "honk" | "grab" | "drop" | "fire" | "dropChaff"
  | "grapple" | "mortar"
  | "radar" | "touch" | "position" | "heading" | "status"
  | "coins" | "carrying";

export interface Command { name: CommandName; args: number[]; }
