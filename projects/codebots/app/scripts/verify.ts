/**
 * Authoring oracle. Runs a mission's author solution through the real transform+sim and prints
 * whether it clears, how many stars, bumps, final position, and lines-vs-par. Usage:
 *   npx tsx scripts/verify.ts content/missions/world2/*.json
 * Exits non-zero if any mission fails to clear with 3 stars — so it doubles as a pre-commit gate.
 */
import { readFileSync } from "node:fs";
import { MissionSchema } from "../src/sim/missionSchema";
import { runInSandbox } from "../src/sandbox/driver";
import { countCodeLines } from "../src/sandbox/lines";

const files = process.argv.slice(2);
let bad = 0;

for (const file of files) {
  let mission;
  try {
    mission = MissionSchema.parse(JSON.parse(readFileSync(file, "utf-8")));
  } catch (e) {
    console.log(`✗ ${file}\n    SCHEMA/JSON ERROR: ${(e as Error).message.split("\n")[0]}`);
    bad++;
    continue;
  }
  try {
    const res = runInSandbox(mission, mission.authorSolution);
    const lines = countCodeLines(mission.authorSolution);
    const onBeacon = res.finalState.pos.x === mission.arena.beacon.x && res.finalState.pos.y === mission.arena.beacon.y;
    const ok = res.cleared && res.stars === 3 && onBeacon;
    const tag = ok ? "✓" : "✗";
    if (!ok) bad++;
    console.log(
      `${tag} ${mission.id.padEnd(6)} W${mission.world}L${mission.index} "${mission.title}"\n` +
      `    cleared=${res.cleared} stars=${res.stars} bumps=${res.finalState.bumps} ` +
      `pos=(${res.finalState.pos.x},${res.finalState.pos.y}) beacon=(${mission.arena.beacon.x},${mission.arena.beacon.y}) ` +
      `lines=${lines}/par${mission.parLines}`,
    );
  } catch (e) {
    console.log(`✗ ${mission.id}: RUNTIME ERROR: ${(e as Error).message.split("\n")[0]}`);
    bad++;
  }
}

console.log(bad === 0 ? `\nALL ${files.length} PASS` : `\n${bad}/${files.length} FAILED`);
process.exit(bad === 0 ? 0 : 1);
