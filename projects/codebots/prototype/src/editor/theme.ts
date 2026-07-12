import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

/** CodeBots editor theme — blueprint surfaces, mono type, amber numbers, cyan keywords.
 *  Matches the "YOUR PROGRAM" panel in the design system's Mission-screen mockup. */
export const codebotsTheme = EditorView.theme(
  {
    "&": {
      color: "#B9C9E6",
      backgroundColor: "rgba(0,0,0,0.22)",
      fontSize: "16px",
      borderRadius: "8px",
      height: "100%",
    },
    ".cm-scroller": { overflow: "auto" },
    ".cm-content": {
      fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
      lineHeight: "28px",
      caretColor: "#FFB454",
      padding: "14px 0",
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: "#5c6f92",
      border: "none",
      fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
    },
    ".cm-activeLine": { backgroundColor: "rgba(255,180,84,0.06)" },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: "#8FA7CD" },
    "&.cm-focused": { outline: "none" },
    ".cm-cursor": { borderLeftColor: "#FFB454" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "rgba(95,212,255,0.20)",
    },
    ".cb-error-line": { backgroundColor: "rgba(255,107,122,0.16)" },
  },
  { dark: true },
);

export const codebotsHighlight = syntaxHighlighting(
  HighlightStyle.define([
    { tag: [t.lineComment, t.blockComment], color: "#8FA7CD", fontStyle: "italic" },
    { tag: t.number, color: "#FFB454" },
    { tag: [t.keyword, t.controlKeyword, t.operatorKeyword], color: "#5FD4FF" },
    { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#EAF2FF" },
    { tag: t.string, color: "#6FE3A5" },
    { tag: t.variableName, color: "#B9C9E6" },
  ]),
);
