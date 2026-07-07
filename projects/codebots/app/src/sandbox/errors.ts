export class SandboxError extends Error {}

/** A kid-worded lint problem found before the program runs (e.g. a misspelled command). Carries
 *  the line it points at so the editor can highlight it. Errors never cost points. */
export class LintError extends Error {
  constructor(public line: number, message: string) {
    super(message);
  }
}

export interface RunError {
  /** 1-based line the problem points at, or null if we can't localize it */
  line: number | null;
  /** kid-worded, friendly message — never blames, always points forward */
  message: string;
}

/**
 * Turn any thrown value from a run (our LintError/SandboxError, an acorn parse SyntaxError,
 * anything) into a friendly, line-pointed RunError. The tone is a helpful co-pilot.
 */
export function toRunError(e: unknown): RunError {
  if (e instanceof LintError) {
    return { line: e.line, message: e.message };
  }
  if (e instanceof SandboxError) {
    return { line: null, message: e.message };
  }
  const anyE = e as { loc?: { line?: number }; message?: string } | undefined;
  const line = anyE?.loc?.line ?? null;
  return { line, message: friendlyParseMessage(anyE?.message ?? String(e), line) };
}

/** Rewrite acorn's terse parser messages into kid words. */
export function friendlyParseMessage(raw: string, line: number | null): string {
  const where = line ? `Line ${line} — ` : "";
  if (/Unexpected token/i.test(raw)) {
    return `${where}I got confused here. Check for a missing ( ) or a typo.`;
  }
  if (/Unterminated|Unexpected end of input/i.test(raw)) {
    return `${where}Looks like a { or ( was opened but never closed.`;
  }
  if (/Identifier|is not defined/i.test(raw)) {
    return `${where}I don't know that word — did you spell the command right?`;
  }
  return `${where}Something in the program tripped me up. Give it another look.`;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

/** Closest known command by edit distance, if it's a plausible typo (distance ≤ 3). */
export function suggestCommand(name: string, candidates: string[]): string | null {
  let best: string | null = null;
  let bestD = Infinity;
  for (const c of candidates) {
    const dist = levenshtein(name.toLowerCase(), c.toLowerCase());
    if (dist < bestD) {
      bestD = dist;
      best = c;
    }
  }
  return bestD <= 3 ? best : null;
}

/** "Line 2 — I don't know 'forwrd'. Did you mean forward()?" */
export function unknownCommandMessage(name: string, line: number, candidates: string[]): string {
  const suggestion = suggestCommand(name, candidates);
  const where = `Line ${line} — `;
  return suggestion
    ? `${where}I don't know "${name}". Did you mean ${suggestion}()?`
    : `${where}I don't know "${name}". Check the COMMANDS list on the left.`;
}
