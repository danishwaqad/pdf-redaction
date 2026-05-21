"use client";

import { PDFDocument, PDFName, type PDFPage } from "pdf-lib";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import {
  pdfRectToScreenWithViewport,
  viewportTransformFromPdfJs,
} from "./coordinates";
import { invalidatePdfLibContentCache } from "./content-stream-redact";
import { burnRectsFromMarks } from "./intersect";
import { getPdfJs, clonePdfBytes } from "./pdf-loader";
import { pageHasTextLayer } from "./text";
import type { RedactionRect } from "./types";

const DPI_DEFAULT = 150;
const DPI_HIGH = 200;

type PageNode = { delete?: (n: ReturnType<typeof PDFName.of>) => void };
type CatalogNode = { delete?: (n: ReturnType<typeof PDFName.of>) => void };
type PageInternals = {
  node: { set: (name: ReturnType<typeof PDFName.of>, value: unknown) => void };
  doc: {
    context: {
      flateStream: (bytes: Uint8Array) => unknown;
      register: (obj: unknown) => unknown;
    };
  };
};

export interface ApplyRedactionOptions {
  /** Higher DPI raster on redacted pages only (default 150). */
  highQuality?: boolean;
  hybridPageIndices?: number[];
}

export interface HybridAnalysis {
  isHybrid: boolean;
  hybridPageIndices: number[];
}

// --- Hybrid badge (text + images on page) ---

async function pageHasImagesPdfJs(page: PDFPageProxy): Promise<boolean> {
  const pdfjs = await getPdfJs();
  const ops = await page.getOperatorList();
  const imageOps = new Set([
    pdfjs.OPS.paintImageXObject,
    pdfjs.OPS.paintInlineImageXObject,
    pdfjs.OPS.paintImageMaskXObject,
    pdfjs.OPS.paintImageXObjectRepeat,
  ]);
  return ops.fnArray.some((fn) => imageOps.has(fn));
}

function pageHasImagesPdfLib(page: PDFPage): boolean {
  const ctx = (page.doc as { context: { lookup: (r: unknown) => unknown } }).context;
  const resourcesRef = (page.node as { Resources?: () => unknown }).Resources?.();
  if (!resourcesRef) return false;
  const resources = ctx.lookup(resourcesRef) as { lookup?: (n: ReturnType<typeof PDFName.of>) => unknown } | undefined;
  const xObjectRef = resources?.lookup?.(PDFName.of("XObject"));
  if (!xObjectRef) return false;
  const xObjects = ctx.lookup(xObjectRef) as { entries?: () => Iterable<[unknown, unknown]> } | undefined;
  if (!xObjects?.entries) return false;
  for (const [, ref] of Array.from(xObjects.entries())) {
    const obj = ctx.lookup(ref) as { dict?: { lookup: (n: ReturnType<typeof PDFName.of>) => unknown } } | undefined;
    const subtype = obj?.dict?.lookup(PDFName.of("Subtype"));
    const name =
      subtype && typeof subtype === "object" && "asString" in subtype
        ? (subtype as { asString: () => string }).asString().replace(/^\//, "")
        : String(subtype ?? "");
    if (name === "Image") return true;
  }
  return false;
}

export async function analyzeHybridPdf(
  pdfBytes: Uint8Array,
  pdfJsDoc: PDFDocumentProxy
): Promise<HybridAnalysis> {
  const libDoc = await PDFDocument.load(pdfBytes.slice());
  const hybridPageIndices: number[] = [];
  for (let i = 0; i < pdfJsDoc.numPages; i++) {
    if (!(await pageHasTextLayer(pdfJsDoc, i))) continue;
    const jsPage = await pdfJsDoc.getPage(i + 1);
    if (pageHasImagesPdfLib(libDoc.getPage(i)) || (await pageHasImagesPdfJs(jsPage))) {
      hybridPageIndices.push(i);
    }
  }
  return { isHybrid: hybridPageIndices.length > 0, hybridPageIndices };
}

// --- Reliable redaction: rasterize only pages that have marks ---

function canvasToPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) reject(new Error("Failed to export page image"));
      else resolve(new Uint8Array(await blob.arrayBuffer()));
    }, "image/png", 1);
  });
}

function paintBlackOnCanvas(
  ctx: CanvasRenderingContext2D,
  rects: ReturnType<typeof burnRectsFromMarks>,
  transform: ReturnType<typeof viewportTransformFromPdfJs>
): void {
  ctx.save();
  ctx.fillStyle = "#000000";
  for (const r of rects) {
    const { left, top, width, height } = pdfRectToScreenWithViewport(r, transform);
    if (width > 0 && height > 0) ctx.fillRect(left, top, width, height);
  }
  ctx.restore();
}

/**
 * Render page → burn black on marked areas → replace that page with the image.
 * Same technique as professional tools; only runs on pages you marked.
 */
async function redactPageAsRaster(
  libPage: PDFPage,
  libDoc: PDFDocument,
  jsPage: PDFPageProxy,
  marks: RedactionRect[],
  dpi: number
): Promise<void> {
  const { width, height } = libPage.getSize();
  const scale = dpi / 72;
  const viewport = jsPage.getViewport({ scale, rotation: jsPage.rotate });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not render page");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await jsPage.render({ canvasContext: ctx, viewport, canvas, intent: "print" }).promise;

  paintBlackOnCanvas(ctx, burnRectsFromMarks(marks), viewportTransformFromPdfJs(viewport.transform));

  const png = await canvasToPng(canvas);
  const image = await libDoc.embedPng(png);

  const internals = libPage as unknown as PageInternals;
  const empty = internals.doc.context.flateStream(new Uint8Array([0x20, 0x0a]));
  internals.node.set(PDFName.of("Contents"), internals.doc.context.register(empty));
  invalidatePdfLibContentCache(libPage);
  libPage.drawImage(image, { x: 0, y: 0, width, height });
}

function stripMetadata(doc: PDFDocument): void {
  doc.setTitle("Redacted Document");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setCreator("RedactPDF");
  doc.setProducer("RedactPDF");
  (doc as unknown as { catalog: CatalogNode }).catalog?.delete?.(PDFName.of("Metadata"));
}

export async function applyRedactionsPermanent(
  pdfBytes: ArrayBuffer | Uint8Array,
  redactions: RedactionRect[],
  numPages: number,
  options: ApplyRedactionOptions = {}
): Promise<Uint8Array> {
  const dpi = options.highQuality ? DPI_HIGH : DPI_DEFAULT;
  const bytesForPdfJs = clonePdfBytes(pdfBytes);
  const bytesForPdfLib = clonePdfBytes(pdfBytes);
  const pdfjs = await getPdfJs();
  const pdfDoc = await pdfjs.getDocument({ data: bytesForPdfJs, useSystemFonts: true }).promise;
  const outDoc = await PDFDocument.load(bytesForPdfLib);

  const byPage = new Map<number, RedactionRect[]>();
  for (const r of redactions) {
    const list = byPage.get(r.pageIndex) ?? [];
    list.push(r);
    byPage.set(r.pageIndex, list);
  }

  for (let i = 0; i < numPages && i < outDoc.getPageCount(); i++) {
    const marks = byPage.get(i);
    if (!marks?.length) continue;

    const libPage = outDoc.getPage(i);
    const jsPage = await pdfDoc.getPage(i + 1);
    await redactPageAsRaster(libPage, outDoc, jsPage, marks, dpi);
    (libPage as unknown as { node: PageNode }).node?.delete?.(PDFName.of("Annots"));
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
