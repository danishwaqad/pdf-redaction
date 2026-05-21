"use client";

import { PDFDocument, PDFName, type PDFPage } from "pdf-lib";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { getPdfJs } from "./pdf-loader";
import { pageHasTextLayer } from "./text";

type PdfContext = {
  lookup: (ref: unknown) => unknown;
};

type DictLike = {
  lookup: (name: ReturnType<typeof PDFName.of>) => unknown;
  entries?: () => Iterable<[unknown, unknown]>;
};

function subtypeIsImage(subtype: unknown): boolean {
  if (!subtype || typeof subtype !== "object") return false;
  const s =
    "asString" in subtype && typeof (subtype as { asString: () => string }).asString === "function"
      ? (subtype as { asString: () => string }).asString()
      : String(subtype);
  return s.replace(/^\//, "") === "Image";
}

/** Count image XObjects in page Resources (pdf-lib). */
export function pageHasImagesPdfLib(page: PDFPage): boolean {
  const ctx = (page.doc as unknown as { context: PdfContext }).context;
  const resourcesRef = (page.node as unknown as { Resources: () => unknown }).Resources?.();
  if (!resourcesRef) return false;

  const resources = ctx.lookup(resourcesRef) as DictLike | undefined;
  if (!resources?.lookup) return false;

  const xObjectRef = resources.lookup(PDFName.of("XObject"));
  if (!xObjectRef) return false;

  const xObjects = ctx.lookup(xObjectRef) as DictLike | undefined;
  if (!xObjects?.entries) return false;

  const entries = Array.from(xObjects.entries());
  for (let j = 0; j < entries.length; j++) {
    const ref = entries[j][1];
    const obj = ctx.lookup(ref) as { dict?: DictLike } | undefined;
    const subtype = obj?.dict?.lookup(PDFName.of("Subtype"));
    if (subtypeIsImage(subtype)) return true;
  }
  return false;
}

/** Detect image paint operators via pdf.js. */
export async function pageHasImagesPdfJs(page: PDFPageProxy): Promise<boolean> {
  const pdfjs = await getPdfJs();
  const ops = await page.getOperatorList();
  const imageOps = new Set<number>([
    pdfjs.OPS.paintXObject,
    pdfjs.OPS.paintImageXObject,
    pdfjs.OPS.paintInlineImageXObject,
    pdfjs.OPS.paintImageMaskXObject,
    pdfjs.OPS.paintImageXObjectRepeat,
  ]);
  return ops.fnArray.some((fn) => imageOps.has(fn));
}

export async function pageHasImages(page: PDFPage, pdfJsPage: PDFPageProxy): Promise<boolean> {
  return pageHasImagesPdfLib(page) || pageHasImagesPdfJs(pdfJsPage);
}

export interface HybridAnalysis {
  isHybrid: boolean;
  hybridPageIndices: number[];
}

/** Page has both searchable text and embedded images → hybrid. */
export async function analyzeHybridPdf(
  pdfBytes: Uint8Array,
  pdfJsDoc: PDFDocumentProxy
): Promise<HybridAnalysis> {
  const libDoc = await PDFDocument.load(pdfBytes.slice());
  const hybridPageIndices: number[] = [];

  for (let i = 0; i < pdfJsDoc.numPages; i++) {
    const hasText = await pageHasTextLayer(pdfJsDoc, i);
    if (!hasText) continue;

    const libPage = libDoc.getPage(i);
    const jsPage = await pdfJsDoc.getPage(i + 1);
    const hasImages = await pageHasImages(libPage, jsPage);
    if (hasImages) hybridPageIndices.push(i);
  }

  return {
    isHybrid: hybridPageIndices.length > 0,
    hybridPageIndices,
  };
}
