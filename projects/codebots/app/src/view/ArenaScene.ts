import Phaser from "phaser";
import type { Mission } from "../sim/engine";
import type { SimEvent } from "../sim/events";
import type { Facing } from "../sim/types";
import { createBot, facingRotation } from "./botGraphics";
import { CELL, cellCenter, drawArena, drawBeacon, drawGates, drawObstacles } from "./furniture";

const BOT_SCALE = 0.34;

export interface PlaybackHandlers {
  /** fired as each event STARTS animating, so sound/HUD/tank-radio stay in sync */
  onEvent?: (ev: SimEvent) => void;
  onDone?: () => void;
}

export interface ArenaSceneData {
  mission: Mission;
  bodyColor: number;
  domeColor: number;
  /** supersample factor: the canvas is rendered `ss`× the grid size and downscaled, so the
   *  vector art stays crisp instead of upscaling a low-res buffer. */
  ss: number;
}

/**
 * The arena view. It draws the grid + furniture + bot from a mission, then plays back a
 * `SimEvent[]` with tweens and per-event callbacks. It is a DUMB CONSUMER of the log — it holds
 * no game rules; positions and outcomes are already decided by the sim.
 */
export class ArenaScene extends Phaser.Scene {
  private mission!: Mission;
  private bodyColor = 0xff8bb3;
  private domeColor = 0x5fd4ff;
  private bot!: Phaser.GameObjects.Container;
  private playing = false;
  private ss = 1;
  private gateBarriers = new Map<string, Phaser.GameObjects.Container>();

  constructor() {
    super("arena");
  }

  init(data: ArenaSceneData) {
    this.mission = data.mission;
    this.bodyColor = data.bodyColor;
    this.domeColor = data.domeColor;
    this.ss = data.ss;
  }

  create() {
    // Draw in grid units, then zoom the camera by the supersample factor so the whole grid fills
    // the ss×-resolution canvas. FIT then downscales it into the panel — crisp at any size.
    this.cameras.main.setZoom(this.ss);
    this.cameras.main.centerOn((this.mission.arena.cols * CELL) / 2, (this.mission.arena.rows * CELL) / 2);
    drawArena(this, this.mission.arena);
    this.gateBarriers = drawGates(this, this.mission.arena);
    drawObstacles(this, this.mission.arena);
    drawBeacon(this, this.mission.arena.beacon, this.mission.arena.beaconStyle ?? "beacon");
    this.bot = createBot(this, this.bodyColor, this.domeColor);
    this.bot.setScale(BOT_SCALE);
    this.resetBot();
  }

  /** Put the bot back on its start square, kill any running tweens, re-close gates. */
  reset(): void {
    this.tweens.killAll();
    this.playing = false;
    this.resetBot();
    for (const barrier of this.gateBarriers.values()) {
      barrier.setAlpha(1);
      barrier.setScale(1);
    }
  }

  private resetBot(): void {
    const { pos, facing } = this.mission.start;
    const { x, y } = cellCenter(pos);
    this.bot.setPosition(x, y);
    this.bot.setRotation(facingRotation(facing));
    this.bot.setDepth(10);
  }

  /** Play the event log. Sequential: each event's animation completes before the next starts. */
  play(events: readonly SimEvent[], handlers: PlaybackHandlers = {}): void {
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

  private animate(ev: SimEvent, done: () => void): void {
    switch (ev.type) {
      case "move": {
        const to = cellCenter(ev.to);
        this.tweens.add({
          targets: this.bot,
          x: to.x,
          y: to.y,
          duration: 190 * ev.cost,
          ease: "Sine.easeInOut",
          onComplete: done,
        });
        break;
      }
      case "turn": {
        const target = this.shortestRotation(ev.facing);
        this.tweens.add({
          targets: this.bot,
          rotation: target,
          duration: 150,
          ease: "Cubic.easeInOut",
          onComplete: done,
        });
        break;
      }
      case "bump": {
        const ox = this.bot.x;
        this.tweens.add({
          targets: this.bot,
          x: ox + 4,
          duration: 45,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            this.bot.x = ox;
            done();
          },
        });
        break;
      }
      case "fall": {
        // lurch toward the pit and get towed back
        const ox = this.bot.x;
        const oy = this.bot.y;
        this.tweens.add({
          targets: this.bot,
          x: ox + (Math.cos(this.bot.rotation) * 14),
          y: oy + (Math.sin(this.bot.rotation) * 14),
          duration: 140,
          yoyo: true,
          ease: "Quad.easeOut",
          onComplete: () => {
            this.bot.x = ox;
            this.bot.y = oy;
            done();
          },
        });
        break;
      }
      case "honk": {
        this.honkPulse(ev.at);
        this.time.delayedCall(240, done);
        break;
      }
      case "gateOpen": {
        const barrier = this.gateBarriers.get(`${ev.pad.x},${ev.pad.y}`);
        if (barrier) {
          this.tweens.add({
            targets: barrier,
            alpha: 0,
            scaleY: 0,
            duration: 260,
            ease: "Back.easeIn",
            onComplete: done,
          });
        } else {
          this.time.delayedCall(30, done);
        }
        break;
      }
      case "score": {
        this.floater(ev.at, ev.delta);
        this.time.delayedCall(60, done);
        break;
      }
      case "clear": {
        this.time.delayedCall(300, done);
        break;
      }
      default:
        // coin — no W1 animation yet; advance immediately.
        this.time.delayedCall(30, done);
    }
  }

  private shortestRotation(facing: Facing): number {
    const current = this.bot.rotation;
    const target = facingRotation(facing);
    const delta = Phaser.Math.Angle.Wrap(target - current);
    return current + delta;
  }

  private honkPulse(at: { x: number; y: number }): void {
    const { x, y } = cellCenter(at);
    const ring = this.add.graphics();
    ring.lineStyle(2, 0xffb454, 1);
    ring.strokeCircle(0, 0, 14);
    const c = this.add.container(x, y, [ring]);
    c.setDepth(20);
    this.tweens.add({
      targets: c,
      scale: { from: 0.5, to: 2.4 },
      alpha: { from: 1, to: 0 },
      duration: 420,
      ease: "Quad.easeOut",
      onComplete: () => c.destroy(),
    });
  }

  private floater(at: { x: number; y: number }, delta: number): void {
    const { x, y } = cellCenter(at);
    const color = delta >= 0 ? "#6FE3A5" : "#FF6B7A";
    const txt = this.add.text(x, y - 8, `${delta >= 0 ? "+" : ""}${delta}`, {
      fontFamily: "IBM Plex Mono, monospace",
      fontSize: "13px",
      fontStyle: "bold",
      color,
    });
    txt.setResolution(this.ss * 2); // keep floater text sharp under camera zoom
    txt.setOrigin(0.5, 0.5).setDepth(30);
    this.tweens.add({
      targets: txt,
      y: y - 40,
      alpha: 0,
      duration: 900,
      ease: "Quad.easeOut",
      onComplete: () => txt.destroy(),
    });
  }
}
