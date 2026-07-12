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
  water: 0x2e6bd6,
  waterLine: 0x9fe0ff,
  cyan: 0x5fd4ff,
  amber: 0xffb454,
  green: 0x6fe3a5,
  red: 0xff6b7a,
  ink: 0xeaf2ff,
};

const gateKey = (p: Vec2) => `${p.x},${p.y}`;

/** Static arena: background, grid, and cell-kind furniture (mud, steel, pits). Crates + coins too.
 *  Gates, obstacles, and the beacon are drawn separately so they can animate. */
export function drawArena(scene: Phaser.Scene, arena: Arena): void {
  const w = arena.cols * CELL;
  const h = arena.rows * CELL;

  const bg = scene.add.graphics();
  bg.fillStyle(COLORS.arena, 1);
  bg.fillRect(0, 0, w, h);

  bg.lineStyle(1, COLORS.grid, 0.5);
  for (let x = 0; x <= arena.cols; x++) bg.lineBetween(x * CELL, 0, x * CELL, h);
  for (let y = 0; y <= arena.rows; y++) bg.lineBetween(0, y * CELL, w, y * CELL);

  for (let y = 0; y < arena.rows; y++) {
    for (let x = 0; x < arena.cols; x++) {
      const kind = arena.cells[y][x];
      const px = x * CELL;
      const py = y * CELL;
      if (kind === "mud") {
        bg.fillStyle(COLORS.mud, 1);
        bg.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
        bg.fillStyle(0x000000, 0.18);
        for (let i = 0; i < 3; i++) bg.fillCircle(px + 12 + i * 14, py + 16 + (i % 2) * 18, 3);
      } else if (kind === "wall") {
        bg.fillStyle(COLORS.steel, 1);
        bg.fillRoundedRect(px + 3, py + 3, CELL - 6, CELL - 6, 3);
        bg.lineStyle(2, COLORS.steelEdge, 1);
        bg.strokeRoundedRect(px + 3, py + 3, CELL - 6, CELL - 6, 3);
      } else if (kind === "pit") {
        bg.fillStyle(COLORS.pit, 1);
        bg.fillRoundedRect(px + 3, py + 3, CELL - 6, CELL - 6, 4);
        bg.lineStyle(2, 0x14203c, 1);
        bg.strokeRoundedRect(px + 3, py + 3, CELL - 6, CELL - 6, 4);
      } else if (kind === "water") {
        bg.fillStyle(COLORS.water, 0.55);
        bg.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
        // wavy ripples
        bg.lineStyle(2, COLORS.waterLine, 0.8);
        for (let r = 0; r < 3; r++) {
          const wy = py + 14 + r * 12;
          bg.beginPath();
          bg.moveTo(px + 6, wy);
          bg.lineTo(px + 14, wy - 3);
          bg.lineTo(px + 22, wy);
          bg.lineTo(px + 30, wy - 3);
          bg.lineTo(px + 38, wy);
          bg.lineTo(px + 46, wy - 3);
          bg.strokePath();
        }
      }
    }
  }

  for (const c of arena.crates) drawCrate(bg, c.x * CELL, c.y * CELL);
  for (const coin of arena.coins) drawCoin(bg, coin.x * CELL, coin.y * CELL);
}

function drawCrate(g: Phaser.GameObjects.Graphics, px: number, py: number): void {
  const pad = 7;
  const s = CELL - pad * 2;
  g.fillStyle(COLORS.crate, 0.12);
  g.fillRoundedRect(px + pad, py + pad, s, s, 5);
  g.lineStyle(2, COLORS.crate, 1);
  g.strokeRoundedRect(px + pad, py + pad, s, s, 5);
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

/** Honk-gates: a pad marker on the floor (where to honk) + a barrier over each gate cell. Returns
 *  a map from pad-key to the barrier container so the scene can fade it open on a gateOpen event. */
export function drawGates(scene: Phaser.Scene, arena: Arena): Map<string, Phaser.GameObjects.Container> {
  const map = new Map<string, Phaser.GameObjects.Container>();
  for (const gate of arena.gates) {
    // pad marker — dashed amber ring on the floor
    const pc = cellCenter(gate.pad);
    const pad = scene.add.graphics();
    pad.lineStyle(2, COLORS.amber, 0.7);
    pad.strokeCircle(pc.x, pc.y, 14);
    pad.fillStyle(COLORS.amber, 0.12);
    pad.fillCircle(pc.x, pc.y, 14);

    // barrier — a portcullis of vertical bars over each gate cell
    const bars = scene.add.graphics();
    bars.fillStyle(COLORS.amber, 0.9);
    for (const cell of gate.gateCells) {
      const px = cell.x * CELL;
      const py = cell.y * CELL;
      for (let i = 0; i < 3; i++) {
        bars.fillRoundedRect(px + 9 + i * 13, py + 6, 5, CELL - 12, 2);
      }
      bars.lineStyle(2, COLORS.amber, 1);
      bars.strokeRect(px + 5, py + 5, CELL - 10, CELL - 10);
    }
    bars.setDepth(5);
    const container = scene.add.container(0, 0, [bars]);
    map.set(gateKey(gate.pad), container);
  }
  return map;
}

/** Breakable barrels (shoot targets): a coppery drum with hoops, distinct from the blue crates so
 *  it reads as "destroy me". Returns a map from cell-key to each barrel container so the scene can
 *  pop the right one on a targetDestroyed event. */
export function drawTargets(scene: Phaser.Scene, arena: Arena): Map<string, Phaser.GameObjects.Container> {
  const map = new Map<string, Phaser.GameObjects.Container>();
  for (const t of arena.targets ?? []) {
    const { x, y } = cellCenter(t);
    const g = scene.add.graphics();
    const pad = 9;
    const w = CELL - pad * 2;
    const h = CELL - pad * 2;
    g.fillStyle(COLORS.red, 0.9);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    g.lineStyle(2, 0x000000, 0.3);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    // hoops
    g.lineStyle(2, COLORS.ink, 0.55);
    g.lineBetween(-w / 2 + 2, -h / 4, w / 2 - 2, -h / 4);
    g.lineBetween(-w / 2 + 2, h / 4, w / 2 - 2, h / 4);
    const c = scene.add.container(x, y, [g]);
    c.setDepth(6);
    map.set(gateKey(t), c);
  }
  return map;
}

/** Villain obstacles — Sprocket's parked tank. Geometric placeholder in the design-system
 *  language (steel body, red barrel/dome), pending real villain art from the design project. */
export function drawObstacles(scene: Phaser.Scene, arena: Arena): void {
  for (const o of arena.obstacles ?? []) {
    if (o.kind !== "tank") continue;
    const px = o.pos.x * CELL;
    const py = o.pos.y * CELL;
    const g = scene.add.graphics();
    // treads
    g.fillStyle(0x2b3f6b, 1);
    g.fillRoundedRect(px + 5, py + 6, CELL - 10, 8, 4);
    g.fillRoundedRect(px + 5, py + CELL - 14, CELL - 10, 8, 4);
    // hull
    g.fillStyle(COLORS.steel, 1);
    g.fillRoundedRect(px + 8, py + 12, CELL - 16, CELL - 24, 5);
    g.lineStyle(2, 0x000000, 0.3);
    g.strokeRoundedRect(px + 8, py + 12, CELL - 16, CELL - 24, 5);
    // barrel pointing left (toward the road)
    g.fillStyle(COLORS.red, 1);
    g.fillRoundedRect(px - 2, py + CELL / 2 - 4, 16, 8, 3);
    // turret
    g.fillStyle(COLORS.red, 1);
    g.fillCircle(px + CELL / 2, py + CELL / 2, 10);
    g.lineStyle(2, 0x000000, 0.35);
    g.strokeCircle(px + CELL / 2, py + CELL / 2, 10);
    g.setDepth(6);
  }
}

/** The goal: a pulsing cyan beacon, or a treasure chest for boss missions. */
export function drawBeacon(scene: Phaser.Scene, pos: Vec2, style: "beacon" | "chest" = "beacon"): Phaser.GameObjects.Container {
  const { x, y } = cellCenter(pos);

  if (style === "chest") {
    const g = scene.add.graphics();
    g.fillStyle(0x6b4a1f, 1);
    g.fillRoundedRect(-16, -6, 32, 20, 4); // chest base
    g.fillStyle(COLORS.amber, 1);
    g.fillRoundedRect(-16, -14, 32, 10, 4); // lid
    g.lineStyle(2, 0x000000, 0.35);
    g.strokeRoundedRect(-16, -14, 32, 28, 4);
    g.fillStyle(COLORS.ink, 1);
    g.fillRoundedRect(-3, -6, 6, 8, 1); // lock
    const chest = scene.add.container(x, y, [g]);
    scene.tweens.add({ targets: chest, y: y - 3, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    return chest;
  }

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
