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

function asHtmlString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value;
}

function decodeBasicEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

/** SSR-safe plain-text extraction — no jsdom/DOMPurify. */
export function stripRichHtml(html: unknown): string {
  const value = asHtmlString(html);
  if (!value) return "";
  return decodeBasicEntities(value.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeRichHtmlFallback(html: string): string {
  return normalizeFormattingHtml(html)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/\s(on\w+)=(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(
      /<\/?(?!p\b|br\b|div\b|strong\b|b\b|em\b|i\b|u\b|ul\b|ol\b|li\b|a\b|span\b)[^>]+>/gi,
      ""
    );
}

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

function getDOMPurify():
  | { sanitize: (html: string, config?: Record<string, unknown>) => string }
  | null {
  if (typeof window === "undefined") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("isomorphic-dompurify").default;
  } catch {
    return null;
  }
}

export function sanitizeRichHtml(html: unknown): string {
  const value = asHtmlString(html);
  if (!value) return "";

  const DOMPurify = getDOMPurify();
  const normalized = normalizeFormattingHtml(value);
  const clean = DOMPurify
    ? DOMPurify.sanitize(normalized, SANITIZE_CONFIG)
    : sanitizeRichHtmlFallback(normalized);

  return clean.replace(
    /<a\s+/gi,
    '<a target="_blank" rel="noopener noreferrer" '
  );
}

export function richTextPlainLength(html: unknown): number {
  return stripRichHtml(html).length;
}

export function isRichTextEmpty(html: unknown): boolean {
  return richTextPlainLength(html) === 0;
}

export function hasRichTextContent(html: unknown): boolean {
  return !isRichTextEmpty(html);
}
