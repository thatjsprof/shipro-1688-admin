import DOMPurify from "isomorphic-dompurify";

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "p",
    "br",
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

export function sanitizeRichHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
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
