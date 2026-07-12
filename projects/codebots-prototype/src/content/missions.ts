import { MissionSchema, type Mission } from "../sim/missionSchema";
import m1 from "../../content/missions/world1/m1.json";
import m2 from "../../content/missions/world1/m2.json";
import m4 from "../../content/missions/world1/m4.json";
import m5 from "../../content/missions/world1/m5.json";
import m6 from "../../content/missions/world1/m6.json";
import w2m1 from "../../content/missions/world2/w2m1.json";
import w2m2s from "../../content/missions/world2/w2m2s.json";
import w2m2 from "../../content/missions/world2/w2m2.json";
import w2m3 from "../../content/missions/world2/w2m3.json";
import w2m4 from "../../content/missions/world2/w2m4.json";
import w2m5 from "../../content/missions/world2/w2m5.json";
import w2m6 from "../../content/missions/world2/w2m6.json";
import w3m1 from "../../content/missions/world3/w3m1.json";
import w3m2 from "../../content/missions/world3/w3m2.json";
import w3m3 from "../../content/missions/world3/w3m3.json";
import w3m4 from "../../content/missions/world3/w3m4.json";
import w3m5 from "../../content/missions/world3/w3m5.json";
import w3m6 from "../../content/missions/world3/w3m6.json";
import w4m1 from "../../content/missions/world4/w4m1.json";
import w4m2 from "../../content/missions/world4/w4m2.json";
import w4m3 from "../../content/missions/world4/w4m3.json";
import w4m4 from "../../content/missions/world4/w4m4.json";
import w4m5 from "../../content/missions/world4/w4m5.json";
import w4m6 from "../../content/missions/world4/w4m6.json";

/**
 * ELEVEN LEVELS. ONE IDEA EACH. ALL OF THEM POINTED AT THE ARENA.
 *
 * There were twenty-four, and thirteen of them taught nothing new — they were practice levels wearing
 * the costume of progress. A kid grinding through "THE ZIGZAG" and "MIXED BAG" isn't learning, she's
 * waiting, and she's waiting on the way to the only room that has anyone else in it.
 *
 * So every level that doesn't introduce a NEW idea is gone. What's left is exactly the concept ladder:
 * each level teaches one thing, and each thing is a verb she needs in a fight. Practice didn't
 * disappear with them — it moved somewhere better. Every concept now ends in a PROVE IT drill, which
 * is practice on boards she has never seen, and cannot be beaten by counting squares. That's worth
 * more than three more hand-made levels she can memorise.
 *
 * The campaign is the tutorial for the arena. It should be as short as it can be and still get her
 * there able to fight.
 */
export const WORLD1: Mission[] = [m1, m5].map((m) => MissionSchema.parse(m));
export const WORLD2: Mission[] = [w2m1, w2m2s, w2m2, w2m3, w2m4].map((m) => MissionSchema.parse(m));
export const WORLD3: Mission[] = [w3m1, w3m2, w3m5].map((m) => MissionSchema.parse(m));
export const WORLD4: Mission[] = [w4m1].map((m) => MissionSchema.parse(m));

/** The campaign, world by world, in play order. Append a world here as it's authored. */
export const WORLDS: Mission[][] = [WORLD1, WORLD2, WORLD3, WORLD4];

/** One flat sequence across every world — the campaign is a single ladder of levels. A level's
 *  GLOBAL number (what the kid sees, "LEVEL 9") is its 1-based position here. */
export const ALL: Mission[] = WORLDS.flat();

export interface WorldMeta {
  world: number;
  name: string;
  subtitle: string;
}

/** Display names for each world's section on the map. */
export const WORLD_META: WorldMeta[] = [
  { world: 1, name: "FIRST ROLL", subtitle: "move & loop" },
  { world: 2, name: "EYES OPEN", subtitle: "sense & decide" },
  { world: 3, name: "NEVER GIVE UP", subtitle: "while loops" },
  { world: 4, name: "BUILD YOUR OWN", subtitle: "your own commands" },
];

/** The kid-facing global level number (1-based across all worlds). */
export function globalLevel(mission: Mission): number {
  return ALL.findIndex((m) => m.id === mission.id) + 1;
}

export function missionById(id: string): Mission | undefined {
  return ALL.find((m) => m.id === id);
}
