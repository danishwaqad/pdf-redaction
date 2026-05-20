"use client";

import { PDFDocument } from "pdf-lib";
import { getPdfJs } from "./pdf-loader";
import { extractAllTextSpans } from "./text-extract";
import { getSpansMarkedForRemoval } from "./intersect";
import { redactPageContents } from "./content-stream-redact";
import type { RedactionRect } from "./types";

/**
 * Apply redactions by deleting intersecting text operators from PDF content streams.
 * Black boxes in the editor are preview only; the downloaded PDF has text removed (blank gaps).
 */
export async function applyRedactionsPermanent(
  pdfBytes: ArrayBuffer,
  redactions: RedactionRect[],
  numPages: number
): Promise<Uint8Array> {
  const pdfjs = await getPdfJs();
  const pdfDoc = await pdfjs.getDocument({ data: pdfBytes.slice(0) }).promise;
  const spans = await extractAllTextSpans(pdfDoc);

  const outDoc = await PDFDocument.load(pdfBytes.slice(0));
  const pages = outDoc.getPages();

  const byPage = new Map<number, RedactionRect[]>();
  for (const r of redactions) {
    const list = byPage.get(r.pageIndex) ?? [];
    list.push(r);
    byPage.set(r.pageIndex, list);
  }

  for (let i = 0; i < numPages && i < pages.length; i++) {
    const pageRedactions = byPage.get(i) ?? [];
    if (!pageRedactions.length) continue;

    const markedSpans = getSpansMarkedForRemoval(spans, i, pageRedactions);
    await redactPageContents(pages[i], markedSpans, pageRedactions);
  }

  pdfDoc.destroy();
  return outDoc.save();
}

export function buildRedactionCertificate(
  count: number,
  date = new Date()
): string {
  const iso = date.toISOString().slice(0, 10);
  return `Redacted ${count} item${count === 1 ? "" : "s"} on ${iso}. Tool: RedactPDF.io\n\nThis certificate confirms redaction was performed locally in your browser. No file data was transmitted to any server.`;
}
