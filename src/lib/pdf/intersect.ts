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
  return !(
    ax2 < b.x - pad ||
    bx2 < a.x - pad ||
    ay2 < b.y - pad ||
    by2 < a.y - pad
  );
}

export function spanIntersectsRedaction(span: TextSpan, redactions: RedactionRect[]): boolean {
  const box: BBox = { x: span.x, y: span.y, width: span.width, height: span.height };
  return redactions.some((r) => rectsIntersect(box, r));
}

/** Generous padding when matching pdf.js spans to redaction boxes (points). */
const SPAN_REDACTION_PAD = 10;

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
    return pageRedactions.some((r) => rectsIntersect(box, r, SPAN_REDACTION_PAD));
  });
}
