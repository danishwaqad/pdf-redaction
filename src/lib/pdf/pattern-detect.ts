import { generateId } from "@/lib/utils";
import type { RedactionRect, TextSpan } from "./types";

export const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi,
  phone:
    /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b(?:\+44|0)\s?\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b|\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}\b/g,
  date:
    /\b(?:0?[1-9]|1[0-2])[\/\-](?:0?[1-9]|[12]\d|3[01])[\/\-](?:19|20)\d{2}\b|\b(?:0?[1-9]|[12]\d|3[01])[\/\-](?:0?[1-9]|1[0-2])[\/\-](?:19|20)\d{2}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b(?:\d[ -]*?){13,19}\b/g,
} as const;

export type PatternKey = keyof typeof PATTERNS;

function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function findMatchesInSpan(span: TextSpan, regex: RegExp, filter?: (m: string) => boolean): RegExpMatchArray[] {
  const flags = regex.flags.includes("g") ? regex.flags : regex.flags + "g";
  const re = new RegExp(regex.source, flags);
  const matches: RegExpMatchArray[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(span.text)) !== null) {
    if (!filter || filter(m[0])) matches.push(m);
  }
  return matches;
}

export function detectPatterns(
  spans: TextSpan[],
  keys: PatternKey[] = ["email", "phone", "creditCard", "date", "ssn"]
): { rects: RedactionRect[]; counts: Record<PatternKey, number> } {
  const counts: Record<PatternKey, number> = {
    email: 0,
    phone: 0,
    creditCard: 0,
    date: 0,
    ssn: 0,
  };
  const rects: RedactionRect[] = [];
  const seen = new Set<string>();

  for (const span of spans) {
    for (const key of keys) {
      const regex = PATTERNS[key];
      const filter =
        key === "creditCard"
          ? (m: string) => luhnCheck(m)
          : undefined;
      const matches = findMatchesInSpan(span, regex, filter);

      for (const match of matches) {
        const text = match[0];
        const idx = match.index ?? 0;
        const charWidth = span.width / Math.max(span.text.length, 1);
        const x = span.x + idx * charWidth;
        const pad = 2;
        const dedupeKey = `${span.pageIndex}:${key}:${text}:${Math.round(x)}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        counts[key]++;
        rects.push({
          id: generateId(),
          pageIndex: span.pageIndex,
          x: x - pad,
          y: span.y - pad,
          width: text.length * charWidth + pad * 2,
          height: span.height + pad * 2,
          source: "pattern",
          label: key,
        });
      }
    }
  }

  return { rects, counts };
}

export function formatPatternSummary(counts: Record<PatternKey, number>): string {
  const parts: string[] = [];
  if (counts.email) parts.push(`${counts.email} email${counts.email > 1 ? "s" : ""}`);
  if (counts.phone) parts.push(`${counts.phone} phone${counts.phone > 1 ? "s" : ""}`);
  if (counts.creditCard) parts.push(`${counts.creditCard} card${counts.creditCard > 1 ? "s" : ""}`);
  if (counts.date) parts.push(`${counts.date} date${counts.date > 1 ? "s" : ""}`);
  if (counts.ssn) parts.push(`${counts.ssn} SSN${counts.ssn > 1 ? "s" : ""}`);
  return parts.length ? parts.join(", ") : "No patterns found";
}
