import { compactRedactionsForApi } from "./limits";
import {
  getRedactApiKey,
  getRedactEndpoint,
  isDirectRedactAvailable,
  isLocalHostname,
  isNextJsProxyEndpoint,
} from "./redact-config";
import type { RedactionRect } from "./types";

export interface RedactApiOptions {
  secureImagePages?: boolean;
  hybridPageIndices?: number[];
}

export class RedactApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "RedactApiError";
  }
}

const API_KEY_HEADER = "x-redact-api-key";
const REDACT_TIMEOUT_MS = 10 * 60 * 1000;

function buildRedactForm(
  pdfBytes: Uint8Array,
  redactions: RedactionRect[],
  options: RedactApiOptions
): FormData {
  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }),
    "document.pdf"
  );
  form.append("redactions", JSON.stringify(compactRedactionsForApi(redactions)));
  form.append(
    "options",
    JSON.stringify({
      secureImagePages: options.secureImagePages ?? false,
      hybridPageIndices: options.hybridPageIndices ?? [],
    })
  );
  return form;
}

function resolveEndpoint(): string {
  if (!isDirectRedactAvailable()) {
    throw new RedactApiError(
      "Redaction API URL is not configured.\n\n" +
        "Vercel → Environment Variables:\n" +
        "REDACT_API_URL = https://your-app.up.railway.app\n" +
        "REDACT_API_KEY = same as Railway\n" +
        "Then redeploy."
    );
  }

  const endpoint = getRedactEndpoint();

  if (isNextJsProxyEndpoint(endpoint)) {
    throw new RedactApiError(
      "Redaction is misconfigured (pointing at the website instead of the API).\n\n" +
        "Local: stop npm run dev, delete .next folder, run npm run dev:api + npm run dev.\n" +
        "Do not set REDACT_API_URL to localhost:3000 in .env.local."
    );
  }

  return endpoint;
}

export async function applyRedactionsViaApi(
  pdfBytes: Uint8Array,
  redactions: RedactionRect[],
  options: RedactApiOptions = {}
): Promise<Uint8Array> {
  const endpoint = resolveEndpoint();
  const form = buildRedactForm(pdfBytes, redactions, options);

  const headers: HeadersInit = {};
  const apiKey = getRedactApiKey();
  if (apiKey) {
    headers[API_KEY_HEADER] = apiKey;
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[RedactPDF] POST", endpoint, {
      pdfMb: (pdfBytes.byteLength / (1024 * 1024)).toFixed(2),
      marks: redactions.length,
    });
  }

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      body: form,
      headers,
      signal: AbortSignal.timeout(REDACT_TIMEOUT_MS),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("maximum size") || msg.includes("1024")) {
      throw new RedactApiError(
        "Request hit the website proxy (1 MB limit). Restart dev server:\n" +
          "1) npm run dev:api\n" +
          "2) npm run dev:clean"
      );
    }
    throw e;
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const err = (await res.json()) as { error?: string; detail?: string; hint?: string };
      if (err.error) detail = err.error;
      else if (err.detail) detail = err.detail;
      if (err.hint) detail += `\n\n${err.hint}`;
    } catch {
      try {
        detail = await res.text();
      } catch {
        /* ignore */
      }
    }
    throw new RedactApiError(detail || "Redaction failed", res.status);
  }

  return new Uint8Array(await res.arrayBuffer());
}

export function buildRedactionCertificate(count: number, date = new Date()): string {
  const iso = date.toISOString().slice(0, 10);
  return [
    `Redacted ${count} area${count === 1 ? "" : "s"} on ${iso}.`,
    "Engine: professional PDF redaction (text removed from file structure).",
    "Tool: RedactPDF.io",
    "",
    "Before sharing: open the PDF and search for sensitive terms to confirm they are gone.",
  ].join("\n");
}

export function redactApiUnavailableMessage(err: unknown): string {
  if (err instanceof RedactApiError && err.status === 410) {
    return (
      err.message +
      "\n\nPull latest code, run npm run dev:api, then npm run dev:clean."
    );
  }
  if (err instanceof RedactApiError && err.status === 503) {
    if (isLocalHostname()) {
      return (
        "Redaction API is not running.\n\n" +
        "Terminal: npm run dev:api\n" +
        "Then Apply Redactions again (uses http://127.0.0.1:8000)."
      );
    }
    return "Redaction API unavailable. Check Railway is running and REDACT_API_URL on Vercel.";
  }
  if (err instanceof RedactApiError && err.status === 401) {
    return "API key rejected. Use the same REDACT_API_KEY on Railway and Vercel, then redeploy.";
  }
  if (err instanceof RedactApiError && err.status === 422) {
    return err.message;
  }
  if (err instanceof RedactApiError) {
    if (err.status === 413) {
      return `${err.message}\n\nRestart the API: npm run dev:api`;
    }
    if (err.message.includes("1024") || err.message.includes("maximum size")) {
      return (
        `${err.message}\n\n` +
        "The PyMuPDF API needs a restart after updating: stop and run npm run dev:api again."
      );
    }
    return err.message;
  }
  if (err instanceof Error) {
    if (err.name === "TimeoutError") {
      return "Redaction timed out. Very large PDFs can take several minutes — try again.";
    }
    if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
      if (isLocalHostname()) {
        return "Cannot reach http://127.0.0.1:8000 — run npm run dev:api in another terminal.";
      }
      return "Cannot reach Railway API. Add your site to Railway CORS_ORIGINS and redeploy.";
    }
    return err.message;
  }
  return "Could not complete redaction. Please try again.";
}
