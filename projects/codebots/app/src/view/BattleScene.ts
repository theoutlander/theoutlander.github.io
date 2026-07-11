import Phaser from "phaser";
import type { BattleEvent } from "../sim/battle";
import type { Arena, Facing, Vec2 } from "../sim/types";
import { createBot, facingRotation } from "./botGraphics";
import { CELL, cellCenter, drawArena, drawBeacon, drawGates, drawObstacles, drawTargets } from "./furniture";

const BOT_SCALE = 0.34;

export interface BattleBotDef {
  bodyColor: number;
  domeColor: number;
  start: { pos: Vec2; facing: Facing };
}

export interface BattleSceneData {
  arena: Arena;
  bots: BattleBotDef[];
  ss: number;
}

export interface BattlePlayback {
  onEvent?: (ev: BattleEvent) => void;
  onDone?: () => void;
}

/**
 * Renders several bots fighting and plays back a battle event log. A dumb consumer of the log — the
 * battle engine already decided every move and hit; this only animates them. Mirrors ArenaScene but
 * keyed by `bot` index so each event drives the right bot.
 */
export class BattleScene extends Phaser.Scene {
  private arena!: Arena;
  private defs: BattleBotDef[] = [];
  private ss = 1;
  private bots: Phaser.GameObjects.Container[] = [];
  private targets = new Map<string, Phaser.GameObjects.Container>();
  private playing = false;

  constructor() {
    super("battle");
  }

  init(data: BattleSceneData) {
    this.arena = data.arena;
    this.defs = data.bots;
    this.ss = data.ss;
  }

  create() {
    this.cameras.main.setZoom(this.ss);
    this.cameras.main.centerOn((this.arena.cols * CELL) / 2, (this.arena.rows * CELL) / 2);
    drawArena(this, this.arena);
    drawGates(this, this.arena);
    this.targets = drawTargets(this, this.arena);
    drawObstacles(this, this.arena);
    drawBeacon(this, this.arena.beacon, this.arena.beaconStyle ?? "beacon");
    this.bots = this.defs.map((d) => {
      const b = createBot(this, d.bodyColor, d.domeColor);
      b.setScale(BOT_SCALE);
      const c = cellCenter(d.start.pos);
      b.setPosition(c.x, c.y);
      b.setRotation(facingRotation(d.start.facing));
      b.setDepth(10);
      return b;
    });
  }

  play(events: readonly BattleEvent[], handlers: BattlePlayback = {}): void {
    if (this.playing) return;
    this.playing = true;
    let i = 0;
    const advance = () => {
      if (i >= events.length) {
        this.playing = false;
        handlers.onDone?.();
        return;
      }
      const ev = events[i++];
      handlers.onEvent?.(ev);
      this.animate(ev, advance);
    };
    advance();
  }

  private animate(ev: BattleEvent, done: () => void): void {
    const bot = this.bots[ev.bot];
    switch (ev.type) {
      case "move": {
        const to = cellCenter(ev.to);
        this.tweens.add({ targets: bot, x: to.x, y: to.y, duration: 170 * ev.cost, ease: "Sine.easeInOut", onComplete: done });
        break;
      }
      case "turn": {
        const cur = bot.rotation;
        const target = cur + Phaser.Math.Angle.Wrap(facingRotation(ev.facing) - cur);
        this.tweens.add({ targets: bot, rotation: target, duration: 130, ease: "Cubic.easeInOut", onComplete: done });
        break;
      }
      case "bump": {
        const ox = bot.x;
        this.tweens.add({ targets: bot, x: ox + 4, duration: 45, yoyo: true, repeat: 2, onComplete: () => { bot.x = ox; done(); } });
        break;
      }
      case "honk": {
        this.pulse(ev.at, 0xffb454);
        this.time.delayedCall(160, done);
        break;
      }
      case "shoot": {
        this.bolt(ev.from, ev.facing, ev.at);
        this.time.delayedCall(180, done);
        break;
      }
      case "hit": {
        this.flash(this.bots[ev.target]);
        this.time.delayedCall(120, done);
        break;
      }
      case "wreck": {
        this.burst(ev.at, 0xff6b7a);
        this.tweens.add({
          targets: bot, scale: BOT_SCALE * 1.4, alpha: 0.22, angle: bot.angle + 25, duration: 260,
          ease: "Back.easeIn", onComplete: done,
        });
        break;
      }
      case "reach": {
        this.pulse(ev.at, 0x5fd4ff);
        this.time.delayedCall(200, done);
        break;
      }
      default:
        this.time.delayedCall(20, done);
    }
  }

  private flash(bot: Phaser.GameObjects.Container | undefined): void {
    if (!bot) return;
    const { x, y } = bot;
    const g = this.add.graphics();
    g.fillStyle(0xff6b7a, 0.5);
    g.fillCircle(0, 0, 22);
    const c = this.add.container(x, y, [g]);
    c.setDepth(19);
    this.tweens.add({ targets: c, scale: { from: 1, to: 1.6 }, alpha: { from: 0.8, to: 0 }, duration: 200, onComplete: () => c.destroy() });
  }

  private bolt(from: Vec2, facing: Facing, hit: Vec2 | null): void {
    const d: Record<Facing, Vec2> = { N: { x: 0, y: -1 }, E: { x: 1, y: 0 }, S: { x: 0, y: 1 }, W: { x: -1, y: 0 } };
    const dir = d[facing];
    const start = cellCenter(from);
    const end = hit ? cellCenter(hit) : cellCenter({ x: from.x + dir.x * 5, y: from.y + dir.y * 5 });
    const g = this.add.graphics();
    g.fillStyle(0xff6b7a, 1); g.fillCircle(0, 0, 5);
    g.fillStyle(0xffe08a, 0.9); g.fillCircle(0, 0, 2);
    const c = this.add.container(start.x, start.y, [g]);
    c.setDepth(22);
    this.tweens.add({ targets: c, x: end.x, y: end.y, duration: 150, ease: "Quad.easeIn", onComplete: () => c.destroy() });
  }

  private pulse(at: Vec2, color: number): void {
    const { x, y } = cellCenter(at);
    const ring = this.add.graphics();
    ring.lineStyle(2, color, 1); ring.strokeCircle(0, 0, 14);
    const c = this.add.container(x, y, [ring]);
    c.setDepth(20);
    this.tweens.add({ targets: c, scale: { from: 0.5, to: 2.3 }, alpha: { from: 1, to: 0 }, duration: 380, ease: "Quad.easeOut", onComplete: () => c.destroy() });
  }

  private burst(at: Vec2, color: number): void {
    const { x, y } = cellCenter(at);
    for (let i = 0; i < 7; i++) {
      const shard = this.add.graphics();
      shard.fillStyle(color, 1); shard.fillRect(-2, -2, 4, 4);
      const c = this.add.container(x, y, [shard]);
      c.setDepth(23);
      const ang = (i / 7) * Math.PI * 2;
      this.tweens.add({ targets: c, x: x + Math.cos(ang) * 24, y: y + Math.sin(ang) * 24, alpha: 0, duration: 320, ease: "Quad.easeOut", onComplete: () => c.destroy() });
    }
  }
}
