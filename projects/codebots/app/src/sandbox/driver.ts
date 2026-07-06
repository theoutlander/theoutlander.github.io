import { desugarRepeat, toGeneratorSource } from "./transform";
import { createSim, type Mission } from "../sim/engine";
import { SandboxError } from "./errors";
import { countCodeLines } from "./lines";
import type { Command } from "../sim/types";

const W1_API = ["forward", "back", "left", "right", "honk"];
const MAX_STEPS = 5000;

interface RunFacts {
  honks: number;
  bumps: number;
  /** a honk() executed while the bot was standing on the (cleared) beacon */
  honkedOnBeacon: boolean;
}

function computeStars(mission: Mission, source: string, cleared: boolean, facts: RunFacts): number {
  if (!cleared) return 0;
  let stars = 1; // complete
  if (countCodeLines(source) <= mission.parLines) stars += 1;
  // Bonus star (one per mission). honkOnBeacon means the honk landed ON the beacon, not just
  // that some honk happened somewhere — hence facts.honkedOnBeacon, tracked in the run loop.
  if (mission.bonusStar.kind === "honkOnBeacon" && facts.honkedOnBeacon) stars += 1;
  if (mission.bonusStar.kind === "zeroBumps" && facts.bumps === 0) stars += 1;
  if (mission.bonusStar.kind === "exactHonks" && facts.honks === mission.bonusStar.count) stars += 1;
  return stars;
}

export function runInSandbox(mission: Mission, source: string) {
  const desugared = desugarRepeat(source);
  const generatorSource = toGeneratorSource(desugared, W1_API);
  const compiled = new Function(
    "__call",
    `${generatorSource}\nreturn __main;`,
  )((name: string, args: unknown[]) => ({ name, args } as Command));

  const sim = createSim(mission);
  const gen: Generator<Command, void, unknown> = compiled();
  let step = gen.next();
  let stepsUsed = 0;
  let honkedOnBeacon = false;

  while (!step.done) {
    if (++stepsUsed > MAX_STEPS) {
      throw new SandboxError(
        "Your program ran for a very long time — check for a loop that never stops.",
      );
    }
    const cmd = step.value;
    const result = sim.execute(cmd);
    if (cmd.name === "honk" && sim.isCleared()) honkedOnBeacon = true;
    step = gen.next(result);
  }

  const finalState = sim.state();
  const cleared = sim.isCleared();
  const facts: RunFacts = {
    honks: finalState.honks,
    bumps: finalState.bumps,
    honkedOnBeacon,
  };
  return {
    cleared,
    stars: computeStars(mission, source, cleared, facts),
    ticks: sim.trace().length,
    trace: sim.trace(),
    finalState,
  };
}
