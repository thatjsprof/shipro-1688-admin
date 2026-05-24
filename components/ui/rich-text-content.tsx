"use client";

import { cn } from "@/lib/utils";
import { sanitizeRichHtml } from "@/lib/rich-text";

type RichTextContentProps = {
  html: string;
  className?: string;
  as?: "div" | "span" | "p";
  onClick?: () => void;
};

export default function RichTextContent({
  html,
  className,
  as: Tag = "div",
  onClick,
}: RichTextContentProps) {
  const safe = sanitizeRichHtml(html);
  if (!safe) return null;

  return (
    <Tag
      onClick={onClick}
      className={cn(
        "rich-text font-inherit text-inherit leading-inherit",
        Tag === "span" && "rich-text-inline",
        className
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
      suppressHydrationWarning
    />
  );
}
