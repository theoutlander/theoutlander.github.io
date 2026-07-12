/** Counts par-relevant lines: non-blank, non-comment. This is the SINGLE source of truth for
 *  line counting — the runtime's star scoring (driver.ts) and the golden test's par-drift check
 *  both import it, so the "did the author solution meet par" question is answered one way and
 *  the two can never silently diverge. (Code review point #4.) */
export function countCodeLines(source: string): number {
  return source
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("//")).length;
}
