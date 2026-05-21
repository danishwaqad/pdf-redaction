"use client";

import { PDFName, type PDFDocument, type PDFPage } from "pdf-lib";
import type { PDFPageProxy } from "pdfjs-dist";
import { invalidatePdfLibContentCache } from "./content-stream-redact";

export const FLATTEN_DPI = 200;

type PageInternals = {
  node: { set: (name: ReturnType<typeof PDFName.of>, value: unknown) => void };
  doc: {
    context: {
      flateStream: (bytes: Uint8Array) => unknown;
      register: (obj: unknown) => unknown;
    };
  };
};

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Failed to rasterize page"));
          return;
        }
        resolve(new Uint8Array(await blob.arrayBuffer()));
      },
      "image/png",
      1
    );
  });
}

/**
 * Replace page content with a single full-page raster (text + images baked in).
 */
export async function flattenPageToImage(
  pdfLibPage: PDFPage,
  pdfLibDoc: PDFDocument,
  pdfJsPage: PDFPageProxy,
  dpi = FLATTEN_DPI
): Promise<void> {
  const { width, height } = pdfLibPage.getSize();
  const scale = dpi / 72;
  const viewport = pdfJsPage.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas for flatten");

  await pdfJsPage.render({ canvasContext: ctx, viewport, canvas }).promise;

  const pngBytes = await canvasToPngBytes(canvas);
  const image = await pdfLibDoc.embedPng(pngBytes);

  const internals = pdfLibPage as unknown as PageInternals;
  const emptyStream = internals.doc.context.flateStream(new Uint8Array([0x20, 0x0a]));
  internals.node.set(
    PDFName.of("Contents"),
    internals.doc.context.register(emptyStream)
  );
  invalidatePdfLibContentCache(pdfLibPage);

  pdfLibPage.drawImage(image, { x: 0, y: 0, width, height });
}
