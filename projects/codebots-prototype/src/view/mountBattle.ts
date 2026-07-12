import Phaser from "phaser";
import { BattleScene, type BattleBotDef } from "./BattleScene";
import { CELL } from "./furniture";
import type { Arena } from "../sim/types";

export interface MountedBattle {
  game: Phaser.Game;
  scene: BattleScene;
  destroy: () => void;
}

/** Mount a Phaser game that renders a battle (multiple bots) into `parent`. Mirrors mountArena. */
export function mountBattle(parent: HTMLElement, arena: Arena, bots: BattleBotDef[]): Promise<MountedBattle> {
  const ss = Math.min(3, Math.max(2, Math.ceil(window.devicePixelRatio || 1) + 1));
  const width = arena.cols * CELL * ss;
  const height = arena.rows * CELL * ss;
  return new Promise((resolve) => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent,
      width,
      height,
      transparent: true,
      render: { antialias: true, roundPixels: false },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      callbacks: {
        postBoot: () => {
          game.scene.add("battle", BattleScene, false);
          const scene = game.scene.getScene("battle") as BattleScene;
          scene.events.once("create", () => resolve({ game, scene, destroy: () => game.destroy(true) }));
          game.scene.start("battle", { arena, bots, ss });
        },
      },
    });
  });
}
