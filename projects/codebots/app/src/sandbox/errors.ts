export class SandboxError extends Error {}

export interface RunError {
  /** 1-based line the problem points at, or null if we can't localize it */
  line: number | null;
  /** kid-worded, friendly message — never blames, always points forward */
  message: string;
}

/**
 * Turn any thrown value from a run (acorn parse SyntaxError, our SandboxError, anything) into a
 * friendly, line-pointed RunError. Errors never cost points — the tone is a helpful co-pilot.
 */
export function toRunError(e: unknown): RunError {
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
