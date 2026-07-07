import { linter, type Diagnostic } from "@codemirror/lint";
import {
  autocompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import { suggestCommand } from "../sandbox/errors";

/** The real command names (for lint) — game-availability is a separate rule; syntactically these
 *  are the words the game knows. `repeat` is a keyword form (`repeat n { }`), not a call. */
const KNOWN_CALLS = ["forward", "back", "left", "right", "honk"];
const KNOWN = new Set(KNOWN_CALLS);
const CALL_OK = new Set([...KNOWN_CALLS, "for", "if", "while"]); // things allowed before "("

/** Scan for `name(` where name isn't a known command, ignoring line comments. Regex-based (not a
 *  parser) so it works live while the code is half-typed or contains `repeat` sugar. */
export function scanUnknownCalls(doc: string): { from: number; to: number; name: string }[] {
  const out: { from: number; to: number; name: string }[] = [];
  const re = /([A-Za-z_]\w*)\s*\(/g;
  let offset = 0;
  for (const line of doc.split("\n")) {
    const code = line.split("//")[0]; // drop line comments
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
      const name = m[1];
      if (CALL_OK.has(name)) continue;
      const from = offset + m.index;
      out.push({ from, to: from + name.length, name });
    }
    offset += line.length + 1; // + newline
  }
  return out;
}

/** Live red squiggles under unknown commands, with a kid-worded "did you mean" message. */
export const codebotsLinter = linter((view) => {
  const doc = view.state.doc.toString();
  return scanUnknownCalls(doc).map<Diagnostic>((u) => {
    const guess = suggestCommand(u.name, KNOWN_CALLS);
    return {
      from: u.from,
      to: u.to,
      severity: "error",
      message: guess
        ? `I don't know "${u.name}". Did you mean ${guess}()?`
        : `I don't know "${u.name}". Check the COMMANDS list on the left.`,
    };
  });
});

interface CmdInfo {
  label: string;
  type: "function" | "keyword";
  apply: string;
  detail: string;
  sig: string;
  desc: string;
  example: string;
}

const CMDS: CmdInfo[] = [
  { label: "forward", type: "function", apply: "forward(", detail: "(n)", sig: "forward(n)", desc: "Roll forward n squares.", example: "forward(3)" },
  { label: "back", type: "function", apply: "back(", detail: "(n)", sig: "back(n)", desc: "Reverse n squares without turning.", example: "back(2)" },
  { label: "left", type: "function", apply: "left()", detail: "(n?)", sig: "left(n?)", desc: "Turn 90° left. Pass a number to turn that many times.", example: "left()  ·  left(2)" },
  { label: "right", type: "function", apply: "right()", detail: "(n?)", sig: "right(n?)", desc: "Turn 90° right. Pass a number to turn that many times.", example: "right()  ·  right(2)" },
  { label: "honk", type: "function", apply: "honk()", detail: "(n?)", sig: "honk(n?)", desc: "Sound the AIR HORN — and open a gate if you're on its pad. Pass a number to honk that many times.", example: "honk()  ·  honk(3)" },
  { label: "repeat", type: "keyword", apply: "repeat 3 {\n  \n}", detail: "n { }", sig: "repeat n { … }", desc: "Do the moves inside the braces n times.", example: "repeat 4 { forward(1) right() }" },
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
    ex.style.cssText = "color:#5FD4FF;font-size:11px;background:rgba(0,0,0,.25);padding:3px 6px;border-radius:4px";
    wrap.append(sig, desc, ex);
    return wrap;
  };
}

const OPTIONS: Completion[] = CMDS.map((c) => ({
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
  return { from: word.from, options: OPTIONS };
}

/** Autocomplete offering only the CodeBots commands (not every JS global). */
export const codebotsAutocomplete = autocompletion({ override: [complete], activateOnTyping: true });
