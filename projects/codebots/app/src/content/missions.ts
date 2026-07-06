import { MissionSchema, type Mission } from "../sim/missionSchema";
import m1 from "../../content/missions/world1/m1.json";
import m2 from "../../content/missions/world1/m2.json";
import m3 from "../../content/missions/world1/m3.json";

// World 1 missions, validated at module load so malformed content fails loudly and early.
export const WORLD1: Mission[] = [m1, m2, m3].map((m) => MissionSchema.parse(m));

export function missionById(id: string): Mission | undefined {
  return WORLD1.find((m) => m.id === id);
}
