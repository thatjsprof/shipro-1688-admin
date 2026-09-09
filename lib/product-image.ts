/** 1688 / Alibaba CDN — need API proxy (referrer rules). */
const PROXY_HOST = /(?:^|\.)alicdn\.com$|(?:^|\.)1688\.com$|(?:^|\.)taobao\.com$/i;

/** Owned bucket / domain — load directly. */
const DIRECT_HOST = /shipro-public-assets|\.amazonaws\.com|shipro\.africa/i;

function resolveUrl(url: string): string {
  const trimmed = url.trim();
  const match = trimmed.match(/\/proxy\?url=([^&]+)/);
  if (!match) return trimmed;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/**
 * Image src for <img>: owned URLs as-is; alicdn/1688 via API proxy.
 */
export function productImageSrc(url: string | undefined | null): string {
  if (!url) return "";

  const raw = resolveUrl(url);
  if (!raw || raw.startsWith("/")) return raw;

  try {
    const host = new URL(raw).hostname;
    if (DIRECT_HOST.test(host) || !PROXY_HOST.test(host)) return raw;
  } catch {
    return raw;
  }

  const api = (process.env.SERVER_URL ?? "").replace(/\/$/, "");
  return `${api}/proxy?url=${encodeURIComponent(raw)}&v=2`;
}
