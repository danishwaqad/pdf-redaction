/** Client-side redaction API — always Railway / local FastAPI, never Next.js /api/redact. */

export const LOCAL_REDACT_API_URL = "http://127.0.0.1:8000";

export function isLocalHostname(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

/**
 * Local dev always uses port 8000 (ignores REDACT_API_URL in .env.local).
 * Production uses NEXT_PUBLIC_REDACT_API_URL from Vercel build.
 */
export function getRedactApiBaseUrl(): string {
  if (isLocalHostname()) {
    return LOCAL_REDACT_API_URL;
  }
  const configured = process.env.NEXT_PUBLIC_REDACT_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
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
