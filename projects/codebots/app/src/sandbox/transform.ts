import { parse } from "acorn";
import { generate } from "astring";
import type { Node, ExpressionStatement, CallExpression, Identifier } from "estree";

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

/** Parses (already repeat-desugared) source and rewrites top-level calls to known API names
 *  into `yield __call(name, [args])` inside a `function* __main() { ... }` wrapper. */
export function toGeneratorSource(source: string, apiNames: string[]): string {
  const ast = parse(source, { ecmaVersion: 2022 }) as unknown as { body: Node[] };
  const known = new Set(apiNames);

  function isKnownCall(stmt: Node): stmt is ExpressionStatement {
    if (stmt.type !== "ExpressionStatement") return false;
    const expr = (stmt as ExpressionStatement).expression as CallExpression;
    return expr.type === "CallExpression" && expr.callee.type === "Identifier" &&
      known.has((expr.callee as Identifier).name);
  }

  function transformStatement(stmt: Node): Node {
    if (isKnownCall(stmt)) {
      const expr = (stmt as ExpressionStatement).expression as CallExpression;
      const name = (expr.callee as Identifier).name;
      return {
        type: "ExpressionStatement",
        expression: {
          type: "YieldExpression",
          delegate: false,
          argument: {
            type: "CallExpression",
            callee: { type: "Identifier", name: "__call" },
            arguments: [
              { type: "Literal", value: name },
              { type: "ArrayExpression", elements: expr.arguments },
            ],
            optional: false,
          },
        },
      } as unknown as Node;
    }
    if ((stmt as { body?: Node }).body && Array.isArray((stmt as { body: unknown }).body)) {
      const withBody = stmt as unknown as { body: Node[] };
      return { ...stmt, body: withBody.body.map(transformStatement) } as Node;
    }
    // ForStatement's body is a single statement/block, not an array — recurse into it too.
    const forLike = stmt as unknown as { body?: Node };
    if (forLike.body && !Array.isArray(forLike.body)) {
      return { ...stmt, body: transformStatement(forLike.body) } as Node;
    }
    return stmt;
  }

  const transformedBody = ast.body.map(transformStatement);
  const mainFn = {
    type: "FunctionDeclaration",
    id: { type: "Identifier", name: "__main" },
    generator: true,
    async: false,
    params: [],
    body: { type: "BlockStatement", body: transformedBody },
  };

  return generate(mainFn as unknown as Node);
}
