import type { SimEvent } from "../sim/events";

/**
 * Retro sound effects, synthesized with the Web Audio API. The design system asks that "every
 * command has a sound" so the kid can close her eyes and hear the program run. We generate the
 * effects procedurally (no asset files, fully offline/deterministic) rather than wiring
 * jsfxr+Howler — same intent, precise control over the described sounds, zero dependencies.
 *
 * The context is created lazily on the first play() (which happens inside the RUN click), so we
 * satisfy the browser autoplay policy without any special handling.
 */
export class Sfx {
  private ctx: AudioContext | null = null;
  muted = false;

  private ac(): AudioContext {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  /** One tone with an attack/decay envelope. */
  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    at = 0,
    slideTo?: number,
  ): void {
    const ctx = this.ac();
    const t0 = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo != null) osc.frequency.linearRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  /** A burst of filtered noise — for treads and the sad buzzer. */
  private noise(dur: number, gain: number, lowpass: number, at = 0): void {
    const ctx = this.ac();
    const t0 = ctx.currentTime + at;
    const frames = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = lowpass;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter).connect(g).connect(ctx.destination);
    src.start(t0);
    src.stop(t0 + dur);
  }

  private tread(): void {
    this.noise(0.14, 0.14, 380);
    this.tone(70, 0.14, "square", 0.05);
  }
  private turn(): void {
    this.tone(320, 0.13, "sawtooth", 0.05, 0, 520); // servo whirr up
  }
  private honk(): void {
    this.tone(300, 0.22, "square", 0.09);
    this.tone(400, 0.22, "square", 0.07, 0.02);
  }
  private bump(): void {
    this.tone(90, 0.18, "square", 0.12, 0, 55); // CLUNK
    this.noise(0.22, 0.08, 900, 0.04); // sad buzzer
  }
  private fall(): void {
    this.tone(420, 0.4, "sawtooth", 0.1, 0, 90); // whoooop — descending
  }
  private gate(): void {
    this.tone(300, 0.12, "square", 0.06, 0, 620); // clank up — gate springs open
    this.tone(700, 0.1, "triangle", 0.05, 0.06);
  }
  private win(): void {
    const notes = [523, 659, 784, 1047]; // C E G C — ascending jingle
    notes.forEach((f, i) => this.tone(f, 0.16, "triangle", 0.09, i * 0.11));
  }
  private coin(): void {
    this.tone(880, 0.06, "square", 0.08);
    this.tone(1320, 0.09, "square", 0.07, 0.05);
  }

  /** Map a sim event to its sound. Unknown/silent events do nothing. */
  play(ev: SimEvent): void {
    if (this.muted) return;
    switch (ev.type) {
      case "move": this.tread(); break;
      case "turn": this.turn(); break;
      case "honk": this.honk(); break;
      case "bump": this.bump(); break;
      case "fall": this.fall(); break;
      case "gateOpen": this.gate(); break;
      case "coin": this.coin(); break;
      case "clear": this.win(); break;
      default: break; // score — no dedicated sound
    }
  }
}
