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

export async function applyRedactionsViaApi(
  pdfBytes: Uint8Array,
  redactions: RedactionRect[],
  options: RedactApiOptions = {}
): Promise<Uint8Array> {
  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }),
    "document.pdf"
  );
  form.append(
    "redactions",
    JSON.stringify(
      redactions.map((r) => ({
        pageIndex: r.pageIndex,
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
      }))
    )
  );
  form.append(
    "options",
    JSON.stringify({
      secureImagePages: options.secureImagePages ?? false,
      hybridPageIndices: options.hybridPageIndices ?? [],
    })
  );

  const res = await fetch("/api/redact", { method: "POST", body: form });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const err = (await res.json()) as { error?: string };
      if (err.error) detail = err.error;
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
  if (err instanceof RedactApiError && err.status === 503) {
    return (
      "Redaction service is not running.\n\n" +
      "Local dev: open a terminal and run npm run dev:api\n" +
      "Then restart the website (npm run dev) and try again."
    );
  }
  if (err instanceof RedactApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Could not complete redaction. Please try again.";
}
