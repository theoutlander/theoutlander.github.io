import { parse } from "acorn";
import { generate } from "astring";
import type { Node, CallExpression, Identifier } from "estree";

/** Textually rewrites `repeat <expr> { <body> }` to a `for` loop. Brace-matched, not regex,
 *  so nested `{ }` in the body (from if/else, later worlds) don't break the scan. */
export function desugarRepeat(source: string): string {
  const REPEAT = /repeat\s+/g;
  let match: RegExpExecArray | null;
  let out = source;

  while ((match = REPEAT.exec(out)) !== null) {
    const afterKeyword = match.index + match[0].length;
    const braceOpen = out.indexOf("{", afterKeyword);
    if (braceOpen === -1) break;
    const expr = out.slice(afterKeyword, braceOpen).trim();

    let depth = 0;
    let braceClose = -1;
    for (let i = braceOpen; i < out.length; i++) {
      if (out[i] === "{") depth++;
      if (out[i] === "}") {
        depth--;
        if (depth === 0) { braceClose = i; break; }
      }
    }
    if (braceClose === -1) break;

    const body = out.slice(braceOpen, braceClose + 1);
    const replacement = `for (let i = 0; i < (${expr}); i++) ${body}`;
    out = out.slice(0, match.index) + replacement + out.slice(braceClose + 1);
    // Resume from where this match started, NOT 0. The replacement's leading `for (...)` holds
    // no `repeat`, so we skip the already-processed prefix while still catching any nested
    // `repeat` now sitting inside `body`. Setting lastIndex = 0 would re-scan the whole string
    // per replacement — O(n²) in the number of repeats. This keeps it linear.
    REPEAT.lastIndex = match.index;
  }

  return out;
}

// The keys of an estree node that hold child nodes vary by type; we walk them generically and
// skip location bookkeeping so we never treat `{ line, column }` objects as AST nodes.
const SKIP_KEYS = new Set(["loc", "start", "end", "range"]);

function isNode(v: unknown): v is Node & Record<string, unknown> {
  return !!v && typeof v === "object" && typeof (v as { type?: unknown }).type === "string";
}

/** Visit every node in the tree (pre-order), read-only. */
function visit(node: unknown, fn: (n: Node & Record<string, unknown>) => void): void {
  if (Array.isArray(node)) {
    node.forEach((c) => visit(c, fn));
    return;
  }
  if (!isNode(node)) return;
  fn(node);
  for (const key of Object.keys(node)) {
    if (SKIP_KEYS.has(key)) continue;
    visit((node as Record<string, unknown>)[key], fn);
  }
}

/** Names of every function the kid declared (top-level or nested) — so calls to them are known
 *  (not linted as typos) and get turned into `yield*` delegations. */
export function collectFunctionNames(source: string): string[] {
  let ast: unknown;
  try {
    ast = parse(source, { ecmaVersion: 2022 });
  } catch {
    return [];
  }
  const names = new Set<string>();
  visit(ast, (n) => {
    if (n.type === "FunctionDeclaration") {
      const id = (n as { id?: Identifier }).id;
      if (id) names.add(id.name);
    }
  });
  return [...names];
}

/** Wrap an API call as `yield __call(name, [args])`; a user-function call as `yield* fn(args)`.
 *  Everything else is returned unchanged. The call's own arguments must already be rewritten. */
function wrapCall(
  node: Node & Record<string, unknown>,
  api: Set<string>,
  userFns: Set<string>,
): Node {
  if (node.type !== "CallExpression") return node;
  const call = node as unknown as CallExpression;
  if (call.callee.type !== "Identifier") return node;
  const name = (call.callee as Identifier).name;

  if (api.has(name)) {
    return {
      type: "YieldExpression",
      delegate: false,
      argument: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "__call" },
        arguments: [
          { type: "Literal", value: name },
          { type: "ArrayExpression", elements: call.arguments },
        ],
        optional: false,
      },
    } as unknown as Node;
  }
  if (userFns.has(name)) {
    // Delegate into the (now generator) user function so its commands stream out of __main.
    return { type: "YieldExpression", delegate: true, argument: call } as unknown as Node;
  }
  return node;
}

/** In-place: rewrite every API/user call anywhere in the tree (expression OR statement position)
 *  into a yield, post-order so nested calls (e.g. in `if (a() && b())`) are handled first. */
function rewriteCalls(node: unknown, api: Set<string>, userFns: Set<string>): void {
  if (!isNode(node) && !Array.isArray(node)) return;
  const obj = node as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (SKIP_KEYS.has(key)) continue;
    const val = obj[key];
    if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        const child = val[i];
        if (isNode(child)) {
          rewriteCalls(child, api, userFns); // children first
          val[i] = wrapCall(child, api, userFns);
        }
      }
    } else if (isNode(val)) {
      rewriteCalls(val, api, userFns);
      obj[key] = wrapCall(val, api, userFns);
    }
  }
}

/**
 * Parse (already repeat-desugared) source and produce a runnable generator program. Every call to
 * a known API name becomes `yield __call(name, [args])`; every user `function` becomes a generator
 * and calls to it become `yield*`. The driver steps the resulting `__main` generator, feeding each
 * command's result (a sensor's boolean, or undefined for actions) back in via `gen.next(result)`.
 */
export function toGeneratorSource(source: string, apiNames: string[]): string {
  const ast = parse(source, { ecmaVersion: 2022 }) as unknown as { body: Node[] };
  const api = new Set(apiNames);
  const userFns = new Set<string>();
  visit(ast, (n) => {
    if (n.type === "FunctionDeclaration") {
      const id = (n as { id?: Identifier }).id;
      if (id) userFns.add(id.name);
    }
  });

  rewriteCalls(ast, api, userFns);
  // Make every kid-declared function a generator so its yielded commands propagate through `yield*`.
  visit(ast, (n) => {
    if (n.type === "FunctionDeclaration") (n as { generator?: boolean }).generator = true;
  });

  // Hoist user functions ahead of __main (both live in the compiled Function's scope, so __main
  // can delegate into them); everything else becomes __main's body.
  const fnDecls = ast.body.filter((s) => s.type === "FunctionDeclaration");
  const rest = ast.body.filter((s) => s.type !== "FunctionDeclaration");
  const mainFn = {
    type: "FunctionDeclaration",
    id: { type: "Identifier", name: "__main" },
    generator: true,
    async: false,
    params: [],
    body: { type: "BlockStatement", body: rest },
  };
  const program = { type: "Program", body: [...fnDecls, mainFn], sourceType: "script" };
  return generate(program as unknown as Node);
}

/**
 * Find calls to command names the game doesn't know (misspellings, unknown commands), with the
 * line each is on. Runs on the already-desugared source. Parse errors return [] — those are
 * reported separately as friendly syntax messages.
 */
export function findUnknownCalls(
  source: string,
  apiNames: string[],
): { line: number; name: string }[] {
  const known = new Set(apiNames);
  let ast: unknown;
  try {
    ast = parse(source, { ecmaVersion: 2022, locations: true });
  } catch {
    return [];
  }
  const found: { line: number; name: string }[] = [];
  const seen = new Set<string>();

  function walk(node: unknown): void {
    if (!node || typeof node !== "object") return;
    const n = node as {
      type?: string;
      callee?: { type?: string; name?: string; loc?: { start: { line: number } } };
      loc?: { start: { line: number } };
      [k: string]: unknown;
    };
    if (n.type === "CallExpression" && n.callee?.type === "Identifier" && !known.has(n.callee.name ?? "")) {
      const line = n.callee.loc?.start.line ?? n.loc?.start.line ?? 1;
      const key = `${n.callee.name}:${line}`;
      if (!seen.has(key)) {
        seen.add(key);
        found.push({ line, name: n.callee.name ?? "?" });
      }
    }
    for (const k in n) {
      if (k === "loc" || k === "start" || k === "end") continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object" && typeof (v as { type?: unknown }).type === "string") walk(v);
    }
  }

  walk(ast);
  return found;
}
