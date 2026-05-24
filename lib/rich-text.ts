import DOMPurify from "isomorphic-dompurify";

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "div",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "ul",
    "ol",
    "li",
    "a",
    "span",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class"],
};

function isBoldStyle(style: string): boolean {
  return /font-weight:\s*(bold|[6-9]00)/i.test(style);
}

function isItalicStyle(style: string): boolean {
  return /font-style:\s*italic/i.test(style);
}

function isUnderlineStyle(style: string): boolean {
  return /text-decoration(?:-line)?:[^;]*underline/i.test(style);
}

/** Convert browser CSS formatting to semantic tags before sanitization strips styles. */
export function normalizeFormattingHtml(html: string): string {
  if (!html) return "";

  if (typeof window === "undefined") {
    return html
      .replace(
        /<span[^>]*style="[^"]*font-weight:\s*(?:bold|[6-9]00)[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
        "<strong>$1</strong>"
      )
      .replace(
        /<span[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
        "<em>$1</em>"
      )
      .replace(
        /<span[^>]*style="[^"]*text-decoration[^"]*underline[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
        "<u>$1</u>"
      );
  }

  const template = document.createElement("template");
  template.innerHTML = html;

  template.content.querySelectorAll("[style]").forEach((el) => {
    const style = el.getAttribute("style") || "";
    let tag: "strong" | "em" | "u" | null = null;

    if (isBoldStyle(style)) tag = "strong";
    else if (isItalicStyle(style)) tag = "em";
    else if (isUnderlineStyle(style)) tag = "u";

    if (!tag) return;

    const replacement = document.createElement(tag);
    replacement.innerHTML = el.innerHTML;
    el.replaceWith(replacement);
  });

  template.content.querySelectorAll("font").forEach((font) => {
    const span = document.createElement("span");
    span.innerHTML = font.innerHTML;
    font.replaceWith(span);
  });

  return template.innerHTML;
}

export function sanitizeRichHtml(html: string): string {
  if (!html) return "";
  const normalized = normalizeFormattingHtml(html);
  const clean = DOMPurify.sanitize(normalized, SANITIZE_CONFIG);
  return clean.replace(
    /<a\s+/gi,
    '<a target="_blank" rel="noopener noreferrer" '
  );
}

export function stripRichHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
    .replace(/\s+/g, " ")
    .trim();
}

export function richTextPlainLength(html: string): number {
  return stripRichHtml(html).length;
}

export function isRichTextEmpty(html: string): boolean {
  return richTextPlainLength(html) === 0;
}

export function hasRichTextContent(html: string): boolean {
  return !isRichTextEmpty(html);
}
