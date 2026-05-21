"use client";

import { PDFDocument, PDFName, rgb, type PDFPage } from "pdf-lib";
import { getPdfJs, clonePdfBytes } from "./pdf-loader";
import { extractAllTextSpans } from "./text";
import { getSpansMarkedForRemoval } from "./intersect";
import { redactPageContents } from "./content-stream-redact";
import type { RedactionRect } from "./types";

type PageNode = { delete?: (n: ReturnType<typeof PDFName.of>) => void };
type CatalogNode = { delete?: (n: ReturnType<typeof PDFName.of>) => void };

function stripMetadata(doc: PDFDocument): void {
  doc.setTitle("Redacted Document");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setCreator("RedactPDF");
  doc.setProducer("RedactPDF");
  (doc as unknown as { catalog: CatalogNode }).catalog?.delete?.(PDFName.of("Metadata"));
}

function stripAnnotations(page: PDFPage): void {
  (page as unknown as { node: PageNode }).node?.delete?.(PDFName.of("Annots"));
}

export async function applyRedactionsPermanent(
  pdfBytes: ArrayBuffer | Uint8Array,
  redactions: RedactionRect[],
  numPages: number
): Promise<Uint8Array> {
  const bytesForPdfJs = clonePdfBytes(pdfBytes);
  const bytesForPdfLib = clonePdfBytes(pdfBytes);
  const pdfjs = await getPdfJs();
  const pdfDoc = await pdfjs.getDocument({ data: bytesForPdfJs }).promise;
  const spans = await extractAllTextSpans(pdfDoc);

  const outDoc = await PDFDocument.load(bytesForPdfLib);
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

    for (const r of pageRedactions) {
      pages[i].drawRectangle({
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        color: rgb(0, 0, 0),
        borderWidth: 0,
      });
    }
    stripAnnotations(pages[i]);
  }

  stripMetadata(outDoc);
  const saved = await outDoc.save();
  pdfDoc.destroy();
  return saved;
}

export function buildRedactionCertificate(count: number, date = new Date()): string {
  const iso = date.toISOString().slice(0, 10);
  return `Redacted ${count} item${count === 1 ? "" : "s"} on ${iso}. Tool: RedactPDF.io\n\nProcessed locally in your browser. No file data was sent to a server.`;
}
