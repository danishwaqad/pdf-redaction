import { NextResponse } from "next/server";

/**
 * Disabled — browser must POST directly to Railway / local FastAPI (see src/lib/pdf/redact-api.ts).
 * Parsing FormData here triggers Next.js 1 MB "Part exceeded maximum size of 1024KB" on large PDFs.
 */
export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "This proxy is disabled. Redaction runs on the PyMuPDF API (port 8000 locally, Railway in production).",
      hint: "Run npm run dev:api, restart with npm run dev:clean, then Apply Redactions again.",
    },
    { status: 410 }
  );
}
