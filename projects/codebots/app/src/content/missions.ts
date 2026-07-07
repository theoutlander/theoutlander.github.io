import { MissionSchema, type Mission } from "../sim/missionSchema";
import m1 from "../../content/missions/world1/m1.json";
import m2 from "../../content/missions/world1/m2.json";
import m3 from "../../content/missions/world1/m3.json";
import m4 from "../../content/missions/world1/m4.json";
import m5 from "../../content/missions/world1/m5.json";
import m6 from "../../content/missions/world1/m6.json";
import w2m1 from "../../content/missions/world2/w2m1.json";
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

// Missions validated at module load so malformed content fails loudly and early.
export const WORLD1: Mission[] = [m1, m2, m3, m4, m5, m6].map((m) => MissionSchema.parse(m));
export const WORLD2: Mission[] = [w2m1, w2m2, w2m3, w2m4, w2m5, w2m6].map((m) => MissionSchema.parse(m));
export const WORLD3: Mission[] = [w3m1, w3m2, w3m3, w3m4, w3m5, w3m6].map((m) => MissionSchema.parse(m));
export const WORLD4: Mission[] = [w4m1, w4m2, w4m3, w4m4, w4m5, w4m6].map((m) => MissionSchema.parse(m));

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
