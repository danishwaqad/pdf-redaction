"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { clonePdfBytes } from "./pdf-loader";
import type { TextSpan } from "./types";

const TESSERACT_CDN =
  "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";

type TesseractModule = {
  createWorker: (
    langs?: string,
    oem?: number,
    options?: { logger?: (m: { status: string; progress: number }) => void }
  ) => Promise<{
    recognize: (image: HTMLCanvasElement) => Promise<{
      data: {
        words: Array<{
          text: string;
          confidence: number;
          bbox: { x0: number; y0: number; x1: number; y1: number };
        }>;
      };
    }>;
    terminate: () => Promise<void>;
  }>;
};

declare global {
  interface Window {
    Tesseract?: TesseractModule;
  }
}

let tesseractLoadPromise: Promise<TesseractModule> | null = null;

async function loadTesseract(): Promise<TesseractModule> {
  if (typeof window === "undefined") {
    throw new Error("OCR runs in the browser only");
  }
  if (window.Tesseract) return window.Tesseract;
  if (!tesseractLoadPromise) {
    tesseractLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = TESSERACT_CDN;
      script.async = true;
      script.onload = () =>
        window.Tesseract ? resolve(window.Tesseract) : reject(new Error("Tesseract failed to load"));
      script.onerror = () => reject(new Error("Could not load Tesseract from CDN"));
      document.head.appendChild(script);
    });
  }
  return tesseractLoadPromise;
}

export interface OcrProgress {
  page: number;
  totalPages: number;
  overall: number;
}

function imageToPdfCoords(
  bbox: { x0: number; y0: number; x1: number; y1: number },
  imgW: number,
  imgH: number,
  pageW: number,
  pageH: number
) {
  const x = (bbox.x0 / imgW) * pageW;
  const w = ((bbox.x1 - bbox.x0) / imgW) * pageW;
  const h = ((bbox.y1 - bbox.y0) / imgH) * pageH;
  const y = pageH - (bbox.y1 / imgH) * pageH;
  return { x, y, width: w, height: h };
}

export async function runOcrOnPdf(
  pdfDoc: PDFDocumentProxy,
  pdfBytes: ArrayBuffer | Uint8Array,
  onProgress?: (p: OcrProgress) => void
): Promise<{ spans: TextSpan[]; pdfBytes: Uint8Array }> {
  const Tesseract = await loadTesseract();
  let currentPage = 0;
  const worker = await Tesseract.createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress({
          page: currentPage + 1,
          totalPages: pdfDoc.numPages,
          overall: ((currentPage + m.progress) / pdfDoc.numPages) * 100,
        });
      }
    },
  });

  const allSpans: TextSpan[] = [];
  const outDoc = await PDFDocument.load(clonePdfBytes(pdfBytes));
  const font = await outDoc.embedFont(StandardFonts.Helvetica);
  const pages = outDoc.getPages();

  try {
    for (let pageIndex = 0; pageIndex < pdfDoc.numPages; pageIndex++) {
      currentPage = pageIndex;
      onProgress?.({
        page: pageIndex + 1,
        totalPages: pdfDoc.numPages,
        overall: (pageIndex / pdfDoc.numPages) * 100,
      });

      const page = await pdfDoc.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const { data } = await worker.recognize(canvas);
      const pdfPage = pages[pageIndex];
      const { width: pageW, height: pageH } = pdfPage.getSize();

      for (const word of data.words) {
        if (!word.text?.trim() || word.confidence < 30) continue;
        const box = imageToPdfCoords(word.bbox, canvas.width, canvas.height, pageW, pageH);
        const fontSize = Math.max(6, Math.min(box.height * 0.85, 24));
        pdfPage.drawText(word.text, {
          x: box.x,
          y: box.y,
          size: fontSize,
          font,
          color: rgb(1, 1, 1),
          opacity: 0,
        });
        allSpans.push({ pageIndex, text: word.text, ...box });
      }

      onProgress?.({
        page: pageIndex + 1,
        totalPages: pdfDoc.numPages,
        overall: ((pageIndex + 1) / pdfDoc.numPages) * 100,
      });
    }
  } finally {
    await worker.terminate();
  }

  return { spans: allSpans, pdfBytes: await outDoc.save() };
}
