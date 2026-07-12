/**
 * "EXPORT MY BOT" — turn the kid's program into a real, runnable JavaScript module.
 *
 * Her code already IS JavaScript, with one exception: the invented `repeat n { }` block. Desugaring
 * that (via the sandbox's own `desugarRepeat`) is the whole compile step — everything else is
 * packaging. That's the point: what leaves the game is *her* file, comments and all.
 */
import { parse } from "acorn";
import { desugarRepeat } from "../sandbox/transform";
import { apiForWorld } from "../sandbox/api";

/** The full command surface, in a stable, readable order (the order the campaign teaches them in) —
 *  so the emitted import list doesn't shuffle between exports. */
export const ALL_API: string[] = [
  ...new Set([1, 2, 3, 4].flatMap((w) => apiForWorld(w))),
];

/** The package the exported file imports from. */
export const SDK_MODULE = "codebots-sdk";

/** Every API command actually called anywhere in the program — including inside `if`/`while`
 *  conditions and inside her own `function` bodies. Names she declared herself aren't in ALL_API,
 *  so they fall out on their own and never get imported. */
export function usedCommands(desugared: string): string[] {
  let ast: unknown;
  try {
    ast = parse(desugared, { ecmaVersion: 2022, sourceType: "module" });
  } catch {
    // An unparseable program has no meaningful call list; the caller still emits her code verbatim
    // so she can fix it in a real editor.
    return [];
  }

  const called = new Set<string>();
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!node || typeof node !== "object") return;
    const n = node as Record<string, unknown> & { type?: string };
    if (typeof n.type !== "string") return;
    if (n.type === "CallExpression") {
      const callee = n.callee as { type?: string; name?: string } | undefined;
      if (callee?.type === "Identifier" && callee.name) called.add(callee.name);
    }
    for (const key of Object.keys(n)) {
      if (key === "loc" || key === "start" || key === "end" || key === "range") continue;
      walk(n[key]);
    }
  };
  walk(ast);

  return ALL_API.filter((name) => called.has(name));
}

/** Indent a block of source by one level, leaving blank lines blank (a line of spaces would show up
 *  as trailing whitespace in her editor). */
function indent(source: string): string {
  return source
    .split("\n")
    .map((line) => (line.trim() === "" ? "" : `  ${line}`))
    .join("\n");
}

/** A safe JS identifier / filename stem for the bot's name — kids type things like "Zap Bot 3000!". */
export function slugifyBotName(botName: string): string {
  const slug = botName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "bot";
}

/**
 * Emit a complete ES module: her program, desugared, wrapped in an exported `brain()`.
 *
 * `brain` is async because a real robot's commands take time — this is the shape the SDK's runner
 * expects. Her code goes in unchanged (no awaits injected): the SDK's commands are the synchronous
 * queue-a-move calls she already knows.
 */
export function exportBot(source: string, opts: { botName: string }): string {
  const desugared = desugarRepeat(source);
  const commands = usedCommands(desugared);

  const header = [
    `// ${opts.botName} — a CodeBots robot brain.`,
    `// Written by a real programmer. This is real JavaScript: run it, change it, break it, fix it.`,
  ];
  const importLine = commands.length
    ? `import { ${commands.join(", ")} } from "${SDK_MODULE}";`
    : null;

  const body = indent(desugared.replace(/\s+$/, ""));

  return [
    ...header,
    "",
    ...(importLine ? [importLine, ""] : []),
    "export async function brain() {",
    body,
    "}",
    "",
  ].join("\n");
}
