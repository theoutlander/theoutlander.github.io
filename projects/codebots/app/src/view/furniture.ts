import Phaser from "phaser";
import type { Arena, Vec2 } from "../sim/types";

export const CELL = 52;

export function cellCenter(pos: Vec2): { x: number; y: number } {
  return { x: pos.x * CELL + CELL / 2, y: pos.y * CELL + CELL / 2 };
}

const COLORS = {
  arena: 0x0a1f45,
  grid: 0x78aaff,
  crate: 0x7fa8e0,
  steel: 0x41598c,
  steelEdge: 0x2b3f6b,
  mud: 0x243a63,
  pit: 0x050a14,
  cyan: 0x5fd4ff,
  amber: 0xffb454,
};

/** Draws the static arena: background, grid lines, and every furniture cell. The beacon is drawn
 *  separately so it can pulse. Returns nothing the caller needs to keep. */
export function drawArena(scene: Phaser.Scene, arena: Arena): void {
  const w = arena.cols * CELL;
  const h = arena.rows * CELL;

  const bg = scene.add.graphics();
  bg.fillStyle(COLORS.arena, 1);
  bg.fillRect(0, 0, w, h);

  // grid lines
  bg.lineStyle(1, COLORS.grid, 0.5);
  for (let x = 0; x <= arena.cols; x++) {
    bg.lineBetween(x * CELL, 0, x * CELL, h);
  }
  for (let y = 0; y <= arena.rows; y++) {
    bg.lineBetween(0, y * CELL, w, y * CELL);
  }

  // cell-kind furniture (mud, steel walls, pits)
  for (let y = 0; y < arena.rows; y++) {
    for (let x = 0; x < arena.cols; x++) {
      const kind = arena.cells[y][x];
      const px = x * CELL;
      const py = y * CELL;
      if (kind === "mud") {
        bg.fillStyle(COLORS.mud, 1);
        bg.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
        bg.fillStyle(0x000000, 0.18);
        for (let i = 0; i < 3; i++) {
          bg.fillCircle(px + 12 + i * 14, py + 16 + (i % 2) * 18, 3);
        }
      } else if (kind === "wall") {
        drawSteel(bg, px, py);
      } else if (kind === "pit") {
        bg.fillStyle(COLORS.pit, 1);
        bg.fillRoundedRect(px + 3, py + 3, CELL - 6, CELL - 6, 4);
      }
    }
  }

  // crates
  for (const c of arena.crates) drawCrate(bg, c.x * CELL, c.y * CELL);

  // coins
  for (const coin of arena.coins) drawCoin(bg, coin.x * CELL, coin.y * CELL);
}

function drawSteel(g: Phaser.GameObjects.Graphics, px: number, py: number): void {
  g.fillStyle(COLORS.steel, 1);
  g.fillRoundedRect(px + 3, py + 3, CELL - 6, CELL - 6, 3);
  g.lineStyle(2, COLORS.steelEdge, 1);
  g.strokeRoundedRect(px + 3, py + 3, CELL - 6, CELL - 6, 3);
}

function drawCrate(g: Phaser.GameObjects.Graphics, px: number, py: number): void {
  const pad = 7;
  const s = CELL - pad * 2;
  g.fillStyle(COLORS.crate, 0.12);
  g.fillRoundedRect(px + pad, py + pad, s, s, 5);
  g.lineStyle(2, COLORS.crate, 1);
  g.strokeRoundedRect(px + pad, py + pad, s, s, 5);
  // the X
  g.lineStyle(2, COLORS.crate, 0.9);
  g.lineBetween(px + pad + 3, py + pad + 3, px + pad + s - 3, py + pad + s - 3);
  g.lineBetween(px + pad + s - 3, py + pad + 3, px + pad + 3, py + pad + s - 3);
}

function drawCoin(g: Phaser.GameObjects.Graphics, px: number, py: number): void {
  const size = 20;
  const cx = px + CELL / 2;
  const cy = py + CELL / 2;
  g.fillStyle(COLORS.amber, 1);
  g.fillRoundedRect(cx - size / 2, cy - size / 2, size, size, 6);
  g.lineStyle(2, 0x000000, 0.35);
  g.strokeRoundedRect(cx - size / 2, cy - size / 2, size, size, 6);
}

/** The beacon is a pulsing cyan diamond with an expanding ring — drawn as its own object so it
 *  can animate independently of the static furniture. */
export function drawBeacon(scene: Phaser.Scene, pos: Vec2): Phaser.GameObjects.Container {
  const { x, y } = cellCenter(pos);
  const ring = scene.add.graphics();
  ring.lineStyle(2, COLORS.cyan, 1);
  ring.strokeCircle(0, 0, 18);

  const diamond = scene.add.graphics();
  diamond.fillStyle(COLORS.cyan, 1);
  diamond.fillRect(-7, -7, 14, 14);
  diamond.setRotation(Math.PI / 4);

  const c = scene.add.container(x, y, [ring, diamond]);
  scene.tweens.add({
    targets: ring,
    scale: { from: 0.5, to: 2.1 },
    alpha: { from: 0.9, to: 0 },
    duration: 1600,
    repeat: -1,
    ease: "Quad.easeOut",
  });
  return c;
}
