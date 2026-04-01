import { useEffect, useRef, useState } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching } from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  darkMode?: boolean;
  readOnly?: boolean;
  minHeight?: string;
}

export function CodeEditor({ value, onChange, darkMode = false, readOnly = false, minHeight = "200px" }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      history(),
      python(),
      lineNumbers(),
      highlightActiveLine(),
      bracketMatching(),
      closeBrackets(),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      keymap.of([
        indentWithTab,
        ...defaultKeymap,
        ...historyKeymap,
        ...closeBracketsKeymap,
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        "&": {
          minHeight,
          fontSize: "0.875rem",
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        },
        ".cm-content": {
          padding: "12px 8px",
          minHeight,
        },
        ".cm-gutters": {
          borderRight: "1px solid hsl(240 8% 88%)",
          backgroundColor: "transparent",
          paddingRight: "4px",
        },
        ".cm-lineNumbers .cm-gutterElement": {
          fontSize: "0.75rem",
          color: "hsl(240 5% 55%)",
        },
        ".cm-activeLine": {
          backgroundColor: darkMode ? "hsl(240 10% 18%)" : "hsl(240 10% 96%)",
        },
        ".cm-cursor": {
          borderLeftColor: "hsl(250 70% 55%)",
        },
      }),
    ];

    if (darkMode) {
      extensions.push(oneDark);
    } else {
      extensions.push(
        EditorView.theme({
          "&": { backgroundColor: "hsl(240 10% 99%)", color: "hsl(240 10% 10%)" },
          ".cm-gutters": { backgroundColor: "hsl(240 8% 96%)", color: "hsl(240 5% 55%)" },
        })
      );
    }

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true));
    }

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darkMode, readOnly, minHeight]);

  // Sync external value changes (e.g. reset)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={editorRef}
      className="rounded-lg overflow-hidden border border-border"
      data-testid="code-editor"
      style={{ fontFamily: '"JetBrains Mono", monospace' }}
    />
  );
}
