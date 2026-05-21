"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let pdfjsModule: PdfJsModule | null = null;
let workerConfigured = false;

/** Copy bytes so pdf.js worker transfer cannot detach our stored buffer. */
export function clonePdfBytes(data: ArrayBuffer | Uint8Array): Uint8Array {
  return data instanceof Uint8Array ? new Uint8Array(data) : new Uint8Array(data);
}

export async function getPdfJs(): Promise<PdfJsModule> {
  if (!pdfjsModule) {
    pdfjsModule = await import("pdfjs-dist/legacy/build/pdf.mjs");
  }
  if (typeof window !== "undefined" && !workerConfigured) {
    pdfjsModule.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    workerConfigured = true;
  }
  return pdfjsModule;
}

export async function loadPdfDocument(
  data: ArrayBuffer | Uint8Array
): Promise<PDFDocumentProxy> {
  const pdfjs = await getPdfJs();
  return pdfjs
    .getDocument({ data: clonePdfBytes(data), useSystemFonts: true })
    .promise;
}

export function formatPdfLoadError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  if (lower.includes("password") || lower.includes("encrypted")) {
    return "This PDF is password-protected. Remove the password, then try again.";
  }
  if (lower.includes("invalid pdf") || lower.includes("corrupted")) {
    return "Invalid PDF. Try re-exporting the file.";
  }
  if (lower.includes("worker") || lower.includes("fetch") || lower.includes("network")) {
    return "PDF viewer failed to start. Refresh the page or try another browser.";
  }
  if (message.length < 160) return `Failed to load PDF: ${message}`;
  return "Failed to load PDF. The file may be corrupted or encrypted.";
}

export const MAX_FILE_SIZE = 100 * 1024 * 1024;

export function validatePdfFile(file: File): string | null {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return "Please upload a PDF file.";
  }
  if (file.size > MAX_FILE_SIZE) return "File exceeds 100MB limit.";
  return null;
}
