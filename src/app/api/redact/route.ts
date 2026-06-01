import { NextResponse } from "next/server";

import { isPdfMagicBytes, MAX_PDF_BYTES } from "@/lib/pdf/limits";

export const runtime = "nodejs";
export const maxDuration = 120;

const API_URL = process.env.REDACT_API_URL ?? "http://127.0.0.1:8000";
const API_KEY = process.env.REDACT_API_KEY?.trim() ?? "";
const API_KEY_HEADER = "x-redact-api-key";

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  const redactions = form.get("redactions");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing PDF file" }, { status: 400 });
  }
  if (!redactions || typeof redactions !== "string") {
    return NextResponse.json({ error: "Missing redactions JSON" }, { status: 400 });
  }

  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json({ error: "File exceeds 100MB limit." }, { status: 413 });
  }

  const headerBytes = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  if (!isPdfMagicBytes(headerBytes)) {
    return NextResponse.json({ error: "Invalid PDF file" }, { status: 400 });
  }

  const upstream = new FormData();
  upstream.append("file", file, "document.pdf");
  upstream.append("redactions", redactions);
  const options = form.get("options");
  upstream.append("options", typeof options === "string" ? options : "{}");

  const headers: HeadersInit = {};
  if (API_KEY) {
    headers[API_KEY_HEADER] = API_KEY;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/redact`, {
      method: "POST",
      body: upstream,
      headers,
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    return NextResponse.json(
      {
        error: "Redaction service unavailable. Ensure the API is running (see README).",
      },
      { status: 503 }
    );
  }

  if (!res.ok) {
    let error = res.statusText;
    try {
      const j = (await res.json()) as { detail?: string };
      error = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail ?? j);
    } catch {
      try {
        error = await res.text();
      } catch {
        /* ignore */
      }
    }
    return NextResponse.json({ error }, { status: res.status });
  }

  const pdf = await res.arrayBuffer();
  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="redacted.pdf"',
    },
  });
}
