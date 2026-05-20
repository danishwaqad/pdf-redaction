"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";
import type { TextSpan } from "./types";

export async function extractAllTextSpans(doc: PDFDocumentProxy): Promise<TextSpan[]> {
  const spans: TextSpan[] = [];

  for (let pageIndex = 0; pageIndex < doc.numPages; pageIndex++) {
    const page = await doc.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();

    for (const item of textContent.items) {
      if (!("str" in item) || !item.str?.trim()) continue;
      const transform = item.transform;
      const fontHeight = Math.hypot(transform[2], transform[3]) || 12;
      const x = transform[4];
      const y = transform[5];
      const width = item.width || item.str.length * fontHeight * 0.5;
      const height = fontHeight * 1.2;

      spans.push({
        pageIndex,
        text: item.str,
        x,
        y: y - height * 0.2,
        width,
        height,
      });
    }

    void viewport;
  }

  return spans;
}

export function mergeAdjacentSpans(spans: TextSpan[], pageIndex: number): string {
  return spans
    .filter((s) => s.pageIndex === pageIndex)
    .map((s) => s.text)
    .join(" ");
}
