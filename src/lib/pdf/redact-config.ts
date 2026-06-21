/** Client-side redaction API — always Railway / local FastAPI, never Next.js /api/redact. */

export const LOCAL_REDACT_API_URL = "http://127.0.0.1:8000";

export function isLocalHostname(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

/** Normalize API base — adds https:// if missing. */
function normalizeApiBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Uses NEXT_PUBLIC_REDACT_API_URL when set (.env.local REDACT_API_URL or Vercel).
 * Local fallback: port 8000 when unset (npm run dev:api).
 */
export function getRedactApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_REDACT_API_URL?.trim();
  if (configured) {
    return normalizeApiBaseUrl(configured);
  }
  if (isLocalHostname()) {
    return LOCAL_REDACT_API_URL;
  }
  return "";
}

export function getRedactApiKey(): string {
  return process.env.NEXT_PUBLIC_REDACT_API_KEY?.trim() ?? "";
}

export function isDirectRedactAvailable(): boolean {
  return Boolean(getRedactApiBaseUrl());
}

export function getRedactEndpoint(): string {
  const base = getRedactApiBaseUrl();
  if (!base) return "";
  return `${base}/redact`;
}

/** True if URL would hit Next.js (causes 1 MB "Part exceeded" errors). */
export function isNextJsProxyEndpoint(endpoint: string): boolean {
  if (!endpoint) return true;
  if (endpoint.startsWith("/api/")) return true;
  if (typeof window === "undefined") return false;
  try {
    const u = new URL(endpoint, window.location.origin);
    return u.origin === window.location.origin;
  } catch {
    return false;
  }
}
