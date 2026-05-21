"use client";

import { PDFDocument, PDFName, type PDFPage } from "pdf-lib";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import {
  pdfRectToScreenWithViewport,
  viewportTransformFromPdfJs,
} from "./coordinates";
import { invalidatePdfLibContentCache, pageUsesExoticContentFilters, redactPageContents } from "./content-stream-redact";
import { getPdfJs, clonePdfBytes } from "./pdf-loader";
import { extractAllTextSpans, pageHasTextLayer } from "./text";
import { getSpansMarkedForRemoval } from "./intersect";
import type { RedactionRect } from "./types";

const FLATTEN_DPI = 200;

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
  flattenBeforeRedact?: boolean;
  hybridPageIndices?: number[];
}

export interface HybridAnalysis {
  isHybrid: boolean;
  hybridPageIndices: number[];
}

// --- Hybrid detection (text + images) ---

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
    const hasImages =
      pageHasImagesPdfLib(libDoc.getPage(i)) || (await pageHasImagesPdfJs(jsPage));
    if (hasImages) hybridPageIndices.push(i);
  }

  return { isHybrid: hybridPageIndices.length > 0, hybridPageIndices };
}

// --- Flatten hybrid pages to raster ---

function canvasToPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) reject(new Error("Failed to rasterize page"));
      else resolve(new Uint8Array(await blob.arrayBuffer()));
    }, "image/png", 1);
  });
}

function paintBlackOnCanvas(
  ctx: CanvasRenderingContext2D,
  rects: RedactionRect[],
  transform: ReturnType<typeof viewportTransformFromPdfJs>
): void {
  ctx.save();
  ctx.fillStyle = "#000000";
  for (const r of rects) {
    const { left, top, width, height } = pdfRectToScreenWithViewport(r, transform);
    ctx.fillRect(left, top, width, height);
  }
  ctx.restore();
}

async function flattenPageToImage(
  pdfLibPage: PDFPage,
  pdfLibDoc: PDFDocument,
  pdfJsPage: PDFPageProxy,
  rects: RedactionRect[]
): Promise<void> {
  const { width, height } = pdfLibPage.getSize();
  const scale = FLATTEN_DPI / 72;
  const viewport = pdfJsPage.getViewport({ scale, rotation: pdfJsPage.rotate });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas for flatten");

  await pdfJsPage.render({ canvasContext: ctx, viewport, canvas }).promise;
  pdfJsPage.cleanup();

  if (rects.length) {
    paintBlackOnCanvas(ctx, rects, viewportTransformFromPdfJs(viewport.transform));
  }

  const image = await pdfLibDoc.embedPng(await canvasToPng(canvas));
  const internals = pdfLibPage as unknown as PageInternals;
  const empty = internals.doc.context.flateStream(new Uint8Array([0x20, 0x0a]));
  internals.node.set(PDFName.of("Contents"), internals.doc.context.register(empty));
  invalidatePdfLibContentCache(pdfLibPage);
  pdfLibPage.drawImage(image, { x: 0, y: 0, width, height });
}

// --- Apply ---

function stripMetadata(doc: PDFDocument): void {
  doc.setTitle("Redacted Document");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setCreator("RedactPDF");
  doc.setProducer("RedactPDF");
  (doc as unknown as { catalog: CatalogNode }).catalog?.delete?.(PDFName.of("Metadata"));
}

function groupByPage(redactions: RedactionRect[]): Map<number, RedactionRect[]> {
  const map = new Map<number, RedactionRect[]>();
  for (const r of redactions) {
    const list = map.get(r.pageIndex) ?? [];
    list.push(r);
    map.set(r.pageIndex, list);
  }
  return map;
}

function shouldFlattenPage(
  pageIndex: number,
  flattenOn: boolean,
  hybridPages: Set<number>,
  hybridDocument: boolean,
  page: PDFPage
): boolean {
  if (!flattenOn) return false;
  return hybridPages.has(pageIndex) || (hybridDocument && pageUsesExoticContentFilters(page));
}

export async function applyRedactionsPermanent(
  pdfBytes: ArrayBuffer | Uint8Array,
  redactions: RedactionRect[],
  numPages: number,
  options: ApplyRedactionOptions = {}
): Promise<Uint8Array> {
  const flattenOn = options.flattenBeforeRedact ?? false;
  const hybridPages = new Set(options.hybridPageIndices ?? []);
  const hybridDocument = hybridPages.size > 0;

  const bytesForPdfJs = clonePdfBytes(pdfBytes);
  const bytesForPdfLib = clonePdfBytes(pdfBytes);
  const pdfjs = await getPdfJs();
  const pdfDoc = await pdfjs.getDocument({ data: bytesForPdfJs }).promise;
  const spans = await extractAllTextSpans(pdfDoc);
  const outDoc = await PDFDocument.load(bytesForPdfLib);
  const byPage = groupByPage(redactions);

  for (let i = 0; i < numPages && i < outDoc.getPageCount(); i++) {
    const pageRedactions = byPage.get(i);
    if (!pageRedactions?.length) continue;

    const page = outDoc.getPage(i);

    if (shouldFlattenPage(i, flattenOn, hybridPages, hybridDocument, page)) {
      await flattenPageToImage(page, outDoc, await pdfDoc.getPage(i + 1), pageRedactions);
    } else {
      await redactPageContents(
        page,
        getSpansMarkedForRemoval(spans, i, pageRedactions),
        pageRedactions
      );
    }

    (page as unknown as { node: PageNode }).node?.delete?.(PDFName.of("Annots"));
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
