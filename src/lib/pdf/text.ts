"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";
import { generateId } from "@/lib/utils";
import {
  buildPageTextModel,
  groupSpansByPage,
  matchRangeToRedactionRect,
} from "./page-text";
import type { RedactionRect, TextSpan } from "./types";

// --- Extract & text-layer detection ---

export async function extractAllTextSpans(doc: PDFDocumentProxy): Promise<TextSpan[]> {
  const spans: TextSpan[] = [];
  for (let pageIndex = 0; pageIndex < doc.numPages; pageIndex++) {
    const page = await doc.getPage(pageIndex + 1);
    const textContent = await page.getTextContent();
    for (const item of textContent.items) {
      if (!("str" in item) || !item.str?.trim()) continue;
      const t = item.transform;
      const fontHeight = Math.hypot(t[2], t[3]) || 12;
      spans.push({
        pageIndex,
        text: item.str,
        x: t[4],
        y: t[5] - fontHeight * 0.2,
        width: item.width || item.str.length * fontHeight * 0.5,
        height: fontHeight * 1.2,
        endsLine: "hasEOL" in item && Boolean(item.hasEOL),
      });
    }
  }
  return spans;
}

export async function pageHasTextLayer(
  doc: PDFDocumentProxy,
  pageIndex: number
): Promise<boolean> {
  const page = await doc.getPage(pageIndex + 1);
  const textContent = await page.getTextContent();
  return textContent.items.some(
    (item) => "str" in item && typeof item.str === "string" && item.str.trim().length > 0
  );
}

export async function pdfHasTextLayer(doc: PDFDocumentProxy): Promise<boolean> {
  for (let i = 0; i < doc.numPages; i++) {
    if (await pageHasTextLayer(doc, i)) return true;
  }
  return false;
}

// --- Search ---

function buildSearchRegex(query: string, useRegex: boolean): RegExp | null {
  if (!query.trim()) return null;
  try {
    if (useRegex) return new RegExp(query, "gi");
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(escaped, "gi");
  } catch {
    return null;
  }
}

function findMatchesOnPage(
  pageIndex: number,
  pageSpans: TextSpan[],
  regex: RegExp
): Omit<RedactionRect, "id">[] {
  const { text, refs } = buildPageTextModel(pageSpans);
  if (!text) return [];

  const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
  const re = new RegExp(regex.source, flags);
  const rects: Omit<RedactionRect, "id">[] = [];
  const seen = new Set<string>();

  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const matchText = m[0];
    const matchStart = m.index ?? 0;
    const matchEnd = matchStart + matchText.length;
    if (matchText.length === 0) {
      re.lastIndex++;
      continue;
    }

    const key = `${pageIndex}:${matchStart}:${matchEnd}:${matchText.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const rect = matchRangeToRedactionRect(
      pageIndex,
      refs,
      matchStart,
      matchEnd,
      matchText
    );
    if (rect) rects.push(rect);
  }

  return rects;
}

export function searchTextSpans(
  spans: TextSpan[],
  query: string,
  useRegex: boolean
): RedactionRect[] {
  const regex = buildSearchRegex(query, useRegex);
  if (!regex) return [];

  const rects: RedactionRect[] = [];
  const byPage = groupSpansByPage(spans);

  byPage.forEach((pageSpans, pageIndex) => {
    for (const rect of findMatchesOnPage(pageIndex, pageSpans, regex)) {
      rects.push({ ...rect, id: generateId() });
    }
  });

  return rects;
}

export function countSearchMatches(
  spans: TextSpan[],
  query: string,
  useRegex: boolean
): number {
  const regex = buildSearchRegex(query, useRegex);
  if (!regex) return 0;

  let total = 0;
  const byPage = groupSpansByPage(spans);
  byPage.forEach((pageSpans) => {
    const { text } = buildPageTextModel(pageSpans);
    if (!text) return;
    const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
    const re = new RegExp(regex.source, flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (!m[0].length) {
        re.lastIndex++;
        continue;
      }
      total++;
    }
  });
  return total;
}

// --- PII patterns ---

export const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi,
  phone:
    /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b(?:\+44|0)\s?\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,
  date:
    /\b(?:0?[1-9]|1[0-2])[\/\-](?:0?[1-9]|[12]\d|3[01])[\/\-](?:19|20)\d{2}\b/g,
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

  const byPage = groupSpansByPage(spans);

  byPage.forEach((pageSpans, pageIndex) => {
    const { text, refs } = buildPageTextModel(pageSpans);
    if (!text) return;

    for (const key of keys) {
      const regex = PATTERNS[key];
      const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
      const re = new RegExp(regex.source, flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const matchText = m[0];
        const matchStart = m.index ?? 0;
        const matchEnd = matchStart + matchText.length;
        if (!matchText.length) {
          re.lastIndex++;
          continue;
        }
        if (key === "creditCard" && !luhnCheck(matchText)) continue;

        const dedupeKey = `${pageIndex}:${key}:${matchStart}:${matchEnd}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        counts[key]++;

        const base = matchRangeToRedactionRect(
          pageIndex,
          refs,
          matchStart,
          matchEnd,
          key
        );
        if (base) {
          rects.push({
            ...base,
            id: generateId(),
            source: "pattern",
            label: key,
          });
        }
      }
    }
  });
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
