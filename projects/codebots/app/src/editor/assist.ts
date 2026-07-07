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

const OPTIONS: Completion[] = [
  { label: "forward", type: "function", apply: "forward(", detail: "(n)", info: "forward(n) — roll forward n squares. n is a number, e.g. forward(3)." },
  { label: "back", type: "function", apply: "back(", detail: "(n)", info: "back(n) — reverse n squares without turning." },
  { label: "left", type: "function", apply: "left()", detail: "(n?)", info: "left() turns 90° left. left(2) turns twice." },
  { label: "right", type: "function", apply: "right()", detail: "(n?)", info: "right() turns 90° right. right(2) turns twice." },
  { label: "honk", type: "function", apply: "honk()", detail: "(n?)", info: "honk() honks once. honk(3) honks three times — opens gates on a pad." },
  { label: "repeat", type: "keyword", apply: "repeat 3 {\n  \n}", detail: "n { }", info: "repeat n { ... } runs the moves inside n times." },
];

function complete(ctx: CompletionContext): CompletionResult | null {
  const word = ctx.matchBefore(/\w*/);
  if (!word) return null;
  if (word.from === word.to && !ctx.explicit) return null;
  return { from: word.from, options: OPTIONS };
}

/** Autocomplete offering only the CodeBots commands (not every JS global). */
export const codebotsAutocomplete = autocompletion({ override: [complete], activateOnTyping: true });
