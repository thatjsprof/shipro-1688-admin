"use client";

import { cn } from "@/lib/utils";
import { sanitizeRichHtml } from "@/lib/rich-text";
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
import { useCallback, useEffect, useReducer, useRef } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  compact?: boolean;
  error?: boolean;
};

type ToolbarState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  unorderedList: boolean;
  orderedList: boolean;
};

function ToolbarButton({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
        active && "bg-zinc-100 text-zinc-900"
      )}
    >
      {children}
    </button>
  );
}

function isEmptyHtml(html: string): boolean {
  const trimmed = html.trim();
  return (
    !trimmed ||
    trimmed === "<br>" ||
    trimmed === "<div><br></div>" ||
    trimmed === "<p><br></p>" ||
    trimmed === "<p></p>"
  );
}

function normalizeEditorHtml(html: string): string {
  if (isEmptyHtml(html)) return "";
  return sanitizeRichHtml(html);
}

function saveSelection(container: HTMLElement): Range | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) return null;
  return range.cloneRange();
}

function restoreSelection(range: Range | null) {
  if (!range) return;
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function queryCommandState(command: string): boolean {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
}

export default function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder = "Write here…",
  className,
  editorClassName,
  compact = false,
  error = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const focusedRef = useRef(false);
  const lastSyncedValue = useRef(value ?? "");
  const selectionRef = useRef<Range | null>(null);
  const [, bumpToolbar] = useReducer((n: number) => n + 1, 0);
  const [isEmpty, setIsEmpty] = useReducer(
    (_: boolean, html: string) => isEmptyHtml(html),
    isEmptyHtml(value ?? "")
  );

  const getToolbarState = useCallback((): ToolbarState => {
    return {
      bold: queryCommandState("bold"),
      italic: queryCommandState("italic"),
      underline: queryCommandState("underline"),
      unorderedList: queryCommandState("insertUnorderedList"),
      orderedList: queryCommandState("insertOrderedList"),
    };
  }, []);

  const syncFromProps = useCallback((nextValue: string) => {
    const el = editorRef.current;
    if (!el) return;
    const html = nextValue || "";
    if (el.innerHTML !== html) {
      el.innerHTML = html;
    }
    lastSyncedValue.current = html;
    setIsEmpty(html);
  }, []);

  useEffect(() => {
    syncFromProps(value ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (focusedRef.current) return;
    const next = value ?? "";
    if (next === lastSyncedValue.current) return;
    syncFromProps(next);
  }, [value, syncFromProps]);

  const commitHtml = useCallback(
    (html: string, sanitize = false) => {
      const normalized = sanitize ? normalizeEditorHtml(html) : html;
      lastSyncedValue.current = normalized;
      onChange(normalized);
      return normalized;
    },
    [onChange]
  );

  const refreshToolbar = useCallback(() => {
    bumpToolbar();
  }, [bumpToolbar]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    setIsEmpty(el.innerHTML);
    commitHtml(el.innerHTML, false);
    refreshToolbar();
  }, [commitHtml, refreshToolbar]);

  const handleBlur = useCallback(() => {
    focusedRef.current = false;
    const el = editorRef.current;
    if (!el) return;

    const normalized = commitHtml(el.innerHTML, true);
    if (el.innerHTML !== normalized) {
      el.innerHTML = normalized;
    }
    setIsEmpty(normalized);
    onBlur?.();
  }, [commitHtml, onBlur]);

  const handleFocus = useCallback(() => {
    focusedRef.current = true;
    const el = editorRef.current;
    if (el) {
      selectionRef.current = saveSelection(el);
    }
    refreshToolbar();
  }, [refreshToolbar]);

  useEffect(() => {
    const onSelectionChange = () => {
      if (!focusedRef.current) return;
      refreshToolbar();
    };

    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [refreshToolbar]);

  const exec = useCallback(
    (command: string, arg?: string) => {
      const el = editorRef.current;
      if (!el) return;

      el.focus();
      restoreSelection(selectionRef.current);

      document.execCommand("styleWithCSS", false, "false");
      document.execCommand(command, false, arg);

      selectionRef.current = saveSelection(el);
      commitHtml(el.innerHTML, false);
      refreshToolbar();
    },
    [commitHtml, refreshToolbar]
  );

  const addLink = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;

    el.focus();
    restoreSelection(selectionRef.current);

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      window.alert("Select the text you want to link first.");
      return;
    }

    const url = window.prompt("Link URL");
    if (!url?.trim()) return;

    exec("createLink", url.trim());
  }, [exec]);

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      const el = editorRef.current;
      if (!el) return;

      const html = event.clipboardData.getData("text/html");
      const text = event.clipboardData.getData("text/plain");
      const content = html
        ? sanitizeRichHtml(html)
        : text.replace(/\n/g, "<br>");

      el.focus();
      restoreSelection(selectionRef.current);
      document.execCommand("insertHTML", false, content);
      selectionRef.current = saveSelection(el);
      commitHtml(el.innerHTML, false);
      refreshToolbar();
    },
    [commitHtml, refreshToolbar]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!compact || event.key !== "Enter") return;
      event.preventDefault();
      document.execCommand("insertLineBreak");
      handleInput();
    },
    [compact, handleInput]
  );

  const rememberSelection = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    selectionRef.current = saveSelection(el);
    refreshToolbar();
  }, [refreshToolbar]);

  const toolbar = getToolbarState();

  return (
    <div
      className={cn(
        "rounded-md border bg-white shadow-none",
        error && "border-destructive",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
        <ToolbarButton
          onClick={() => exec("bold")}
          label="Bold"
          active={toolbar.bold}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => exec("italic")}
          label="Italic"
          active={toolbar.italic}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => exec("underline")}
          label="Underline"
          active={toolbar.underline}
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => exec("insertUnorderedList")}
          label="Bullet list"
          active={toolbar.unorderedList}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => exec("insertOrderedList")}
          label="Numbered list"
          active={toolbar.orderedList}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addLink} label="Insert link">
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline={!compact}
        data-placeholder={placeholder}
        data-empty={isEmpty ? "true" : "false"}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onMouseUp={rememberSelection}
        onKeyUp={rememberSelection}
        className={cn(
          "rich-text-editor min-w-0 px-3 py-2 text-sm outline-none focus:ring-0",
          compact ? "min-h-[2.75rem]" : "min-h-[10rem]",
          editorClassName
        )}
      />
    </div>
  );
}
