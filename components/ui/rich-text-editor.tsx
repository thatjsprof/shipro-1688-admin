"use client";

import { cn } from "@/lib/utils";
import { Bold, Italic, Link2, List, ListOrdered, Underline } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { sanitizeRichHtml } from "@/lib/rich-text";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  compact?: boolean;
  error?: boolean;
};

function ToolbarButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    >
      {children}
    </button>
  );
}

function normalizeEditorHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed || trimmed === "<br>" || trimmed === "<div><br></div>") {
    return "";
  }
  return sanitizeRichHtml(html);
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write here…",
  className,
  editorClassName,
  compact = false,
  error = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || syncingRef.current) return;
    const next = value || "";
    if (el.innerHTML !== next) {
      el.innerHTML = next;
    }
  }, [value]);

  const emitChange = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    syncingRef.current = true;
    onChange(normalizeEditorHtml(el.innerHTML));
    syncingRef.current = false;
  }, [onChange]);

  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emitChange();
  };

  const addLink = () => {
    const url = window.prompt("Link URL");
    if (!url?.trim()) return;
    exec("createLink", url.trim());
  };

  return (
    <div
      className={cn(
        "rounded-md border bg-white shadow-none",
        error && "border-destructive",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
        <ToolbarButton onClick={() => exec("bold")} label="Bold">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")} label="Italic">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("underline")} label="Underline">
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => exec("insertUnorderedList")}
          label="Bullet list"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => exec("insertOrderedList")}
          label="Numbered list"
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
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={emitChange}
        className={cn(
          "rich-text-editor min-w-0 px-3 py-2 text-sm outline-none",
          compact ? "min-h-[5rem]" : "min-h-[10rem]",
          editorClassName
        )}
      />
    </div>
  );
}
