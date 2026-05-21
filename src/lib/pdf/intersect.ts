import type { RedactionRect, TextSpan } from "./types";

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function rectsIntersect(a: BBox, b: BBox, pad = 2): boolean {
  const ax2 = a.x + a.width + pad;
  const ay2 = a.y + a.height + pad;
  const bx2 = b.x + b.width + pad;
  const by2 = b.y + b.height + pad;
  return !(ax2 < b.x - pad || bx2 < a.x - pad || ay2 < b.y - pad || by2 < a.y - pad);
}

const SPAN_PAD = 2;
const AUTO_DETECT_PAD = 14;

export function getSpansMarkedForRemoval(
  spans: TextSpan[],
  pageIndex: number,
  redactions: RedactionRect[]
): TextSpan[] {
  const pageRedactions = redactions.filter((r) => r.pageIndex === pageIndex);
  if (!pageRedactions.length) return [];
  return spans.filter((s) => {
    if (s.pageIndex !== pageIndex) return false;
    const box: BBox = { x: s.x, y: s.y, width: s.width, height: s.height };
    return pageRedactions.some((r) => rectsIntersect(box, r, SPAN_PAD));
  });
}

function expandBoxToSpans(rect: RedactionRect, spans: TextSpan[]): RedactionRect | null {
  const padded: RedactionRect = {
    ...rect,
    x: rect.x - AUTO_DETECT_PAD,
    y: rect.y - AUTO_DETECT_PAD,
    width: rect.width + AUTO_DETECT_PAD * 2,
    height: rect.height + AUTO_DETECT_PAD * 2,
  };
  const targets = getSpansMarkedForRemoval(spans, rect.pageIndex, [padded]);
  if (!targets.length) return null;

  let minX = rect.x;
  let minY = rect.y;
  let maxX = rect.x + rect.width;
  let maxY = rect.y + rect.height;
  for (const s of targets) {
    minX = Math.min(minX, s.x);
    minY = Math.min(minY, s.y);
    maxX = Math.max(maxX, s.x + s.width);
    maxY = Math.max(maxY, s.y + s.height);
  }
  const pad = 4;
  return {
    ...rect,
    x: minX - pad,
    y: minY - pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
  };
}

/** Black fills use the same boxes you drew (small padding only). */
export function burnRectsFromMarks(pageRedactions: RedactionRect[], pad = 1): BBox[] {
  return pageRedactions.map((r) => ({
    x: r.x - pad,
    y: r.y - pad,
    width: r.width + pad * 2,
    height: r.height + pad * 2,
  }));
}

export function autoDetectAllRedactionBoxes(
  redactions: RedactionRect[],
  spans: TextSpan[]
): { redactions: RedactionRect[]; changedCount: number } {
  let changedCount = 0;
  const out = redactions.map((rect) => {
    const expanded = expandBoxToSpans(rect, spans);
    if (!expanded) return rect;
    const changed =
      Math.abs(expanded.x - rect.x) > 0.5 ||
      Math.abs(expanded.y - rect.y) > 0.5 ||
      Math.abs(expanded.width - rect.width) > 0.5 ||
      Math.abs(expanded.height - rect.height) > 0.5;
    if (changed) changedCount++;
    return expanded;
  });
  return { redactions: out, changedCount };
}
