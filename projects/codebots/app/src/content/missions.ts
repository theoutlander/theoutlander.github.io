import { MissionSchema, type Mission } from "../sim/missionSchema";
import m1 from "../../content/missions/world1/m1.json";

// World 1 missions, validated at module load so malformed content fails loudly and early.
export const WORLD1: Mission[] = [MissionSchema.parse(m1)];

export function missionById(id: string): Mission | undefined {
  return WORLD1.find((m) => m.id === id);
}
