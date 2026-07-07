import React, { useEffect, useRef } from "react";
import { EditorState, StateEffect, StateField } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, Decoration, type DecorationSet } from "@codemirror/view";
import { history, historyKeymap, defaultKeymap, indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { codebotsTheme, codebotsHighlight } from "./theme";
import { codebotsLinter, codebotsAutocomplete } from "./assist";

// A single-line highlight for the line an error points at. Errors never cost points — this is
// just a gentle "look here".
const setErrorLine = StateEffect.define<number | null>();
const errorLineField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(setErrorLine)) {
        if (e.value == null || e.value < 1 || e.value > tr.state.doc.lines) {
          deco = Decoration.none;
        } else {
          const line = tr.state.doc.line(e.value);
          deco = Decoration.set([
            Decoration.line({ class: "cb-error-line" }).range(line.from),
          ]);
        }
      }
    }
    return deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});

export function Editor({
  value,
  onChange,
  onRun,
  errorLine,
}: {
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  errorLine?: number | null;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  onChangeRef.current = onChange;
  onRunRef.current = onRun;

  useEffect(() => {
    if (!hostRef.current) return;
    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        history(),
        javascript(),
        codebotsTheme,
        codebotsHighlight,
        codebotsAutocomplete,
        codebotsLinter,
        errorLineField,
        keymap.of([
          {
            key: "Mod-Enter",
            run: () => {
              onRunRef.current?.();
              return true;
            },
          },
          indentWithTab,
          ...defaultKeymap,
          ...historyKeymap,
        ]),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChangeRef.current(u.state.doc.toString());
        }),
      ],
    });
    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the doc in sync if the value is changed from outside (e.g. RESET).
  useEffect(() => {
    const view = viewRef.current;
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
    }
  }, [value]);

  // Reflect the current error line.
  useEffect(() => {
    viewRef.current?.dispatch({ effects: setErrorLine.of(errorLine ?? null) });
  }, [errorLine]);

  return <div ref={hostRef} style={{ borderRadius: 8, overflow: "hidden", height: "100%" }} />;
}
