import { linter, type Diagnostic } from "@codemirror/lint";
import {
  autocompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import { unknownCommandHint } from "../sandbox/errors";
import { apiForWorld } from "../sandbox/api";

/** Control-flow words that may legally appear before "(" (or as keywords) — never "unknown". */
const CONTROL = ["for", "if", "else", "while", "function", "repeat"];

/** Kid-declared function names in the doc, so a call to one isn't squiggled as a typo (World 4). */
function userFnNames(doc: string): string[] {
  const out: string[] = [];
  const re = /function\s+([A-Za-z_]\w*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(doc)) !== null) out.push(m[1]);
  return out;
}

/** Scan for `name(` where name isn't allowed, ignoring line comments. Regex-based (not a parser)
 *  so it works live while the code is half-typed or contains `repeat` sugar. */
export function scanUnknownCalls(
  doc: string,
  allowed: Set<string>,
): { from: number; to: number; name: string }[] {
  const out: { from: number; to: number; name: string }[] = [];
  const re = /([A-Za-z_]\w*)\s*\(/g;
  let offset = 0;
  for (const line of doc.split("\n")) {
    const code = line.split("//")[0]; // drop line comments
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
      const name = m[1];
      if (allowed.has(name)) continue;
      const from = offset + m.index;
      out.push({ from, to: from + name.length, name });
    }
    offset += line.length + 1; // + newline
  }
  return out;
}

/** Live red squiggles under unknown commands for a given world, with a "did you mean" message. */
export function makeCodebotsLinter(world: number) {
  const api = apiForWorld(world);
  return linter((view) => {
    const doc = view.state.doc.toString();
    const allowed = new Set([...api, ...CONTROL, ...userFnNames(doc)]);
    return scanUnknownCalls(doc, allowed).map<Diagnostic>((u) => ({
      from: u.from,
      to: u.to,
      severity: "error",
      message: unknownCommandHint(u.name, api),
    }));
  });
}

interface CmdInfo {
  label: string;
  type: "function" | "keyword";
  apply: string;
  detail: string;
  sig: string;
  desc: string;
  example: string;
  /** first world this is offered in (offered in that world and all later ones) */
  world: number;
}

const CMDS: CmdInfo[] = [
  // World 1
  { label: "forward", type: "function", apply: "forward(", detail: "(n)", sig: "forward(n)", desc: "Roll forward n squares.", example: "forward(3)", world: 1 },
  { label: "back", type: "function", apply: "back(", detail: "(n)", sig: "back(n)", desc: "Reverse n squares without turning.", example: "back(2)", world: 1 },
  { label: "left", type: "function", apply: "left()", detail: "(n?)", sig: "left(n?)", desc: "Turn 90° left. Pass a number to turn that many times.", example: "left()  ·  left(2)", world: 1 },
  { label: "right", type: "function", apply: "right()", detail: "(n?)", sig: "right(n?)", desc: "Turn 90° right. Pass a number to turn that many times.", example: "right()  ·  right(2)", world: 1 },
  { label: "honk", type: "function", apply: "honk()", detail: "(n?)", sig: "honk(n?)", desc: "Sound the AIR HORN — and open a gate if you're on its pad.", example: "honk()  ·  honk(3)", world: 1 },
  { label: "repeat", type: "keyword", apply: "repeat 3 {\n  \n}", detail: "n { }", sig: "repeat n { … }", desc: "Do the moves inside the braces n times.", example: "repeat 4 { forward(1) right() }", world: 1 },
  // World 2 — sensors, decisions, blaster
  { label: "blocked", type: "function", apply: "blocked()", detail: "→ yes/no", sig: "blocked()", desc: "Is something right in front of you? Gives back yes or no — use it in an if.", example: "if (blocked()) { right() }", world: 2 },
  { label: "targetAhead", type: "function", apply: "targetAhead()", detail: "→ yes/no", sig: "targetAhead()", desc: "Is a barrel one square ahead? Use it to decide when to shoot.", example: "if (targetAhead()) { shoot() }", world: 2 },
  { label: "atBeacon", type: "function", apply: "atBeacon()", detail: "→ yes/no", sig: "atBeacon()", desc: "Are you standing on the goal yet?", example: "while (!atBeacon()) { forward(1) }", world: 2 },
  { label: "shoot", type: "function", apply: "shoot()", detail: "()", sig: "shoot()", desc: "Fire the blaster straight ahead. Smashes a barrel in your way.", example: "shoot()", world: 2 },
  { label: "if", type: "keyword", apply: "if () {\n  \n}", detail: "( ) { }", sig: "if ( … ) { }", desc: "Only run the moves inside when the test is true.", example: "if (blocked()) { right() }", world: 2 },
  { label: "else", type: "keyword", apply: "else {\n  \n}", detail: "{ }", sig: "else { }", desc: "What to do when the if test was NOT true.", example: "if (blocked()) { right() } else { forward(1) }", world: 2 },
  // World 3 — while
  { label: "while", type: "keyword", apply: "while () {\n  \n}", detail: "( ) { }", sig: "while ( … ) { }", desc: "Keep repeating the moves WHILE the test stays true.", example: "while (!atBeacon()) { forward(1) }", world: 3 },
  // World 4 — functions
  { label: "function", type: "keyword", apply: "function name() {\n  \n}", detail: "name() { }", sig: "function name() { }", desc: "Make your OWN command out of other commands, then call it by name.", example: "function spin() { right(2) }\nspin()", world: 4 },
];

/** A formatted info card for the completion tooltip: signature, description, example. */
function infoCard(c: CmdInfo): () => HTMLElement {
  return () => {
    const wrap = document.createElement("div");
    wrap.style.cssText = "font-family:'IBM Plex Mono',monospace;max-width:240px;line-height:1.5";
    const sig = document.createElement("div");
    sig.textContent = c.sig;
    sig.style.cssText = "color:#FFB454;font-weight:700;font-size:12px;margin-bottom:4px";
    const desc = document.createElement("div");
    desc.textContent = c.desc;
    desc.style.cssText = "color:#B9C9E6;font-size:11px;margin-bottom:6px";
    const ex = document.createElement("div");
    ex.textContent = c.example;
    ex.style.cssText = "color:#5FD4FF;font-size:11px;background:rgba(0,0,0,.25);padding:3px 6px;border-radius:4px;white-space:pre-wrap";
    wrap.append(sig, desc, ex);
    return wrap;
  };
}

/** Autocomplete offering only the CodeBots commands taught by this world (not every JS global). */
export function makeCodebotsAutocomplete(world: number) {
  const options: Completion[] = CMDS.filter((c) => c.world <= world).map((c) => ({
    label: c.label,
    type: c.type,
    apply: c.apply,
    detail: c.detail,
    info: infoCard(c),
  }));
  function complete(ctx: CompletionContext): CompletionResult | null {
    const word = ctx.matchBefore(/\w*/);
    if (!word) return null;
    if (word.from === word.to && !ctx.explicit) return null;
    return { from: word.from, options };
  }
  return autocompletion({ override: [complete], activateOnTyping: true });
}
