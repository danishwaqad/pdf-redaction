"use client";

import { PDFDocument } from "pdf-lib";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { getPdfJs } from "./pdf-loader";
import { pdfRectToScreen } from "./coordinates";
import type { RedactionRect } from "./types";

const RASTER_SCALE = 2;

async function renderPageToCanvas(
  doc: PDFDocumentProxy,
  pageIndex: number,
  scale: number,
  redactionsOnPage: RedactionRect[],
  pageHeight: number
): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  ctx.fillStyle = "#000000";
  for (const r of redactionsOnPage) {
    const screen = pdfRectToScreen(r, pageHeight, scale);
    ctx.fillRect(screen.left, screen.top, screen.width, screen.height);
  }

  return canvas;
}

export async function applyRedactionsPermanent(
  pdfBytes: ArrayBuffer,
  redactions: RedactionRect[],
  numPages: number
): Promise<Uint8Array> {
  const pdfjs = await getPdfJs();
  const doc = await pdfjs.getDocument({ data: pdfBytes.slice(0) }).promise;
  const srcDoc = await PDFDocument.load(pdfBytes);
  const outDoc = await PDFDocument.create();

  const byPage = new Map<number, RedactionRect[]>();
  for (const r of redactions) {
    const list = byPage.get(r.pageIndex) ?? [];
    list.push(r);
    byPage.set(r.pageIndex, list);
  }

  for (let i = 0; i < numPages; i++) {
    const pageRedactions = byPage.get(i) ?? [];

    if (pageRedactions.length === 0) {
      const [copied] = await outDoc.copyPages(srcDoc, [i]);
      outDoc.addPage(copied);
      continue;
    }

    const pdfPage = await doc.getPage(i + 1);
    const baseViewport = pdfPage.getViewport({ scale: 1 });
    const pageHeight = baseViewport.height;
    const pageWidth = baseViewport.width;

    const canvas = await renderPageToCanvas(
      doc,
      i,
      RASTER_SCALE,
      pageRedactions,
      pageHeight
    );

    const pngDataUrl = canvas.toDataURL("image/png");
    const pngBytes = Uint8Array.from(atob(pngDataUrl.split(",")[1]), (c) =>
      c.charCodeAt(0)
    );
    const image = await outDoc.embedPng(pngBytes);
    const newPage = outDoc.addPage([pageWidth, pageHeight]);
    newPage.drawImage(image, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });
  }

  doc.destroy();
  return outDoc.save();
}

export function buildRedactionCertificate(
  count: number,
  date = new Date()
): string {
  const iso = date.toISOString().slice(0, 10);
  return `Redacted ${count} item${count === 1 ? "" : "s"} on ${iso}. Tool: RedactPDF.io\n\nThis certificate confirms redaction was performed locally in your browser. No file data was transmitted to any server.`;
}
