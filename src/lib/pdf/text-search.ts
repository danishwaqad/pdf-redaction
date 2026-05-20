import { generateId } from "@/lib/utils";
import type { RedactionRect, TextSpan } from "./types";

export function buildSearchRegex(query: string, useRegex: boolean): RegExp | null {
  if (!query.trim()) return null;
  try {
    if (useRegex) {
      return new RegExp(query, "gi");
    }
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(escaped, "gi");
  } catch {
    return null;
  }
}

export function searchTextSpans(
  spans: TextSpan[],
  query: string,
  useRegex: boolean
): RedactionRect[] {
  const regex = buildSearchRegex(query, useRegex);
  if (!regex) return [];

  const rects: RedactionRect[] = [];
  const seen = new Set<string>();

  for (const span of spans) {
    const flags = regex.flags.includes("g") ? regex.flags : regex.flags + "g";
    const re = new RegExp(regex.source, flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(span.text)) !== null) {
      const text = m[0];
      const idx = m.index ?? 0;
      const charWidth = span.width / Math.max(span.text.length, 1);
      const x = span.x + idx * charWidth;
      const pad = 2;
      const key = `${span.pageIndex}:${text}:${idx}`;
      if (seen.has(key)) continue;
      seen.add(key);

      rects.push({
        id: generateId(),
        pageIndex: span.pageIndex,
        x: x - pad,
        y: span.y - pad,
        width: text.length * charWidth + pad * 2,
        height: span.height + pad * 2,
        source: "search",
        label: text,
      });
    }
  }

  return rects;
}
