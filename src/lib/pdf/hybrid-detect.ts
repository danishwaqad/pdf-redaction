"use client";

import { PDFDocument, PDFName, type PDFPage } from "pdf-lib";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { getPdfJs } from "./pdf-loader";
import { pageHasTextLayer } from "./text";

export interface HybridAnalysis {
  isHybrid: boolean;
  hybridPageIndices: number[];
}

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
  const resources = ctx.lookup(resourcesRef) as {
    lookup?: (n: ReturnType<typeof PDFName.of>) => unknown;
  };
  const xObjectRef = resources?.lookup?.(PDFName.of("XObject"));
  if (!xObjectRef) return false;
  const xObjects = ctx.lookup(xObjectRef) as {
    entries?: () => Iterable<[unknown, unknown]>;
  };
  if (!xObjects?.entries) return false;
  for (const [, ref] of Array.from(xObjects.entries())) {
    const obj = ctx.lookup(ref) as {
      dict?: { lookup: (n: ReturnType<typeof PDFName.of>) => unknown };
    };
    const subtype = obj?.dict?.lookup(PDFName.of("Subtype"));
    const name =
      subtype && typeof subtype === "object" && "asString" in subtype
        ? (subtype as { asString: () => string }).asString().replace(/^\//, "")
        : String(subtype ?? "");
    if (name === "Image") return true;
  }
  return false;
}

/** Pages with both text and images (e.g. Canva exports). */
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
