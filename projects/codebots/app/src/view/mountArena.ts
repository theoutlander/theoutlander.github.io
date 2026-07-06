import Phaser from "phaser";
import type { Mission } from "../sim/engine";
import { ArenaScene } from "./ArenaScene";
import { CELL } from "./furniture";

export interface MountedArena {
  game: Phaser.Game;
  scene: ArenaScene;
  destroy: () => void;
}

/**
 * Create a Phaser game for one mission, mounted into `parent`. Resolves once the scene's
 * `create()` has run so callers can immediately drive `scene.play(...)`. The canvas is sized to
 * the arena's grid and scaled to FIT its container (Phaser owns only this box — all other UI is
 * React/DOM).
 *
 * The scene is added and started *inside* `postBoot` (after the game has booted) so it receives
 * the mission data in `init(data)` and its `events` emitter exists before we listen.
 */
export function mountArena(
  parent: HTMLElement,
  mission: Mission,
  paint: { bodyColor: number; domeColor: number },
): Promise<MountedArena> {
  const width = mission.arena.cols * CELL;
  const height = mission.arena.rows * CELL;

  return new Promise((resolve) => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent,
      width,
      height,
      transparent: true,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      callbacks: {
        postBoot: () => {
          game.scene.add("arena", ArenaScene, false);
          const scene = game.scene.getScene("arena") as ArenaScene;
          scene.events.once("create", () => {
            resolve({ game, scene, destroy: () => game.destroy(true) });
          });
          game.scene.start("arena", {
            mission,
            bodyColor: paint.bodyColor,
            domeColor: paint.domeColor,
          });
        },
      },
    });
  });
}
