import Phaser from "phaser";

/**
 * The bot mascot, reproduced in Phaser graphics to match the design system's `BotAvatar`
 * component (treads · hull · barrel · dome · eyes · antenna) exactly. The design system says
 * "the bot IS the mascot… never redraw it differently" — this is the flagged reconciliation
 * (see the World-1 design spec): same construction and proportions, drawn with Phaser primitives
 * instead of divs so it can live on the arena canvas. Built centered on the hull, facing EAST at
 * rotation 0 (barrel points +x), so `container.rotation` maps straight to the bot's facing.
 */
const DARK = { color: 0x000000, alpha: 0.3 };

// Geometry lifted from BotAvatar.jsx (a 150×106 box), then translated so the hull center is the
// origin. Hull center in the original is (75, 53).
const CX = 75;
const CY = 53;

export function createBot(
  scene: Phaser.Scene,
  bodyColor: number,
  domeColor: number,
): Phaser.GameObjects.Container {
  const g = scene.add.graphics();

  // treads — top & bottom rounded bars (text-dim)
  const tread = 0x8fa7cd;
  g.fillStyle(tread, 1);
  g.fillRoundedRect(18 - CX, 0 - CY, 114, 17, 9); // top
  g.fillRoundedRect(18 - CX, 89 - CY, 114, 17, 9); // bottom

  // barrel — bar sticking out east (body color, dark border)
  g.fillStyle(bodyColor, 1);
  g.fillRoundedRect(132 - CX, 47 - CY, 44, 12, 6);
  g.lineStyle(3, DARK.color, DARK.alpha);
  g.strokeRoundedRect(132 - CX, 47 - CY, 44, 12, 6);

  // hull — body-colored rounded rect with dark border
  g.fillStyle(bodyColor, 1);
  g.fillRoundedRect(13 - CX, 15 - CY, 114, 76, 11);
  g.lineStyle(3, DARK.color, DARK.alpha);
  g.strokeRoundedRect(13 - CX, 15 - CY, 114, 76, 11);

  // dome — circle at hull center
  g.fillStyle(domeColor, 1);
  g.fillCircle(75 - CX, 53 - CY, 21);
  g.lineStyle(3, 0x000000, 0.35);
  g.strokeCircle(75 - CX, 53 - CY, 21);

  // eyes — two cloud dots
  g.fillStyle(0xeaf2ff, 1);
  g.lineStyle(2, 0x000000, 0.4);
  g.fillCircle(75 - CX, 48 - CY, 4.5);
  g.strokeCircle(75 - CX, 48 - CY, 4.5);
  g.fillCircle(75 - CX, 61 - CY, 4.5);
  g.strokeCircle(75 - CX, 61 - CY, 4.5);

  // antenna — thin stalk up-left + cyan tip
  g.fillStyle(0x8fa7cd, 1);
  g.fillRect(55 - CX, -20 - CY, 3, 22);
  g.fillStyle(0x5fd4ff, 1);
  g.fillCircle(49 - CX, -22 - CY, 4.5);

  const c = scene.add.container(0, 0, [g]);
  return c;
}

/** Facing → rotation in radians. East is 0 (barrel points +x); clockwise with y-down. */
export function facingRotation(facing: "N" | "E" | "S" | "W"): number {
  switch (facing) {
    case "E": return 0;
    case "S": return Math.PI / 2;
    case "W": return Math.PI;
    case "N": return -Math.PI / 2;
  }
}
