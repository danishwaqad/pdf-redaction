import type { RedactionRect, TextSpan } from "./types";

export type PageTextRef = {
  span: TextSpan;
  start: number;
  end: number;
};

export type PageTextModel = {
  text: string;
  refs: PageTextRef[];
};

/** Build one searchable string per page (spans are merged with spaces/newlines like a PDF reader). */
export function buildPageTextModel(spans: TextSpan[]): PageTextModel {
  const sorted = [...spans].sort((a, b) => {
    const dy = b.y - a.y;
    if (Math.abs(dy) > Math.min(a.height, b.height) * 0.5) return dy > 0 ? 1 : -1;
    return a.x - b.x;
  });

  let text = "";
  const refs: PageTextRef[] = [];
  let lastY: number | null = null;
  let lastXEnd = 0;

  for (const span of sorted) {
    let sep = "";
    if (text.length > 0) {
      if (span.endsLine || (lastY !== null && Math.abs(span.y - lastY) > span.height * 0.5)) {
        sep = "\n";
      } else if (span.x > lastXEnd + 1) {
        sep = " ";
      }
    }
    text += sep;
    const spanStart = text.length;
    text += span.text;
    refs.push({ span, start: spanStart, end: text.length });
    lastY = span.y;
    lastXEnd = span.x + span.width;
  }

  return { text, refs };
}

export function matchRangeToRedactionRect(
  pageIndex: number,
  refs: PageTextRef[],
  matchStart: number,
  matchEnd: number,
  label: string
): Omit<RedactionRect, "id"> | null {
  const overlapping = refs.filter((r) => r.end > matchStart && r.start < matchEnd);
  if (!overlapping.length) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const ref of overlapping) {
    const localStart = Math.max(0, matchStart - ref.start);
    const localEnd = Math.min(ref.span.text.length, matchEnd - ref.start);
    const charWidth = ref.span.width / Math.max(ref.span.text.length, 1);
    const x0 = ref.span.x + localStart * charWidth;
    const x1 = ref.span.x + localEnd * charWidth;
    minX = Math.min(minX, x0);
    maxX = Math.max(maxX, x1);
    minY = Math.min(minY, ref.span.y);
    maxY = Math.max(maxY, ref.span.y + ref.span.height);
  }

  const pad = 2;
  return {
    pageIndex,
    x: minX - pad,
    y: minY - pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
    source: "search",
    label,
  };
}

export function groupSpansByPage(spans: TextSpan[]): Map<number, TextSpan[]> {
  const byPage = new Map<number, TextSpan[]>();
  for (const span of spans) {
    const list = byPage.get(span.pageIndex);
    if (list) list.push(span);
    else byPage.set(span.pageIndex, [span]);
  }
  return byPage;
}
