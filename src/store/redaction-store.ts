"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { generateId } from "@/lib/utils";
import {
  clonePdfBytes,
  formatPdfLoadError,
  loadPdfDocument,
  validatePdfFile,
} from "@/lib/pdf/pdf-loader";
import {
  detectPatterns,
  extractAllTextSpans,
  formatPatternSummary,
  pageHasTextLayer,
  pdfHasTextLayer,
  searchTextSpans,
  type PatternKey,
} from "@/lib/pdf/text";
import { analyzeHybridPdf } from "@/lib/pdf/redact-apply";
import { runOcrOnPdf } from "@/lib/pdf/ocr";
import { autoDetectAllRedactionBoxes, getSpansMarkedForRemoval } from "@/lib/pdf/intersect";
import type { RedactionRect, TextSpan } from "@/lib/pdf/types";

const MAX_HISTORY = 50;

interface RedactionState {
  fileName: string;
  pdfBytes: Uint8Array | null;
  pdfDoc: PDFDocumentProxy | null;
  numPages: number;
  currentPage: number;
  scale: number;
  redactions: RedactionRect[];
  history: RedactionRect[][];
  historyIndex: number;
  textSpans: TextSpan[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  useRegex: boolean;
  patternCounts: Record<PatternKey, number> | null;
  patternSummary: string;
  isApplying: boolean;
  hasTextLayer: boolean;
  currentPageHasText: boolean;
  ocrCompleted: boolean;
  isOcrRunning: boolean;
  ocrProgress: number;
  drawHint: string | null;
  showRedactionWarning: boolean;
  isHybridPdf: boolean;
  hybridPageIndices: number[];
  flattenBeforeRedact: boolean;
  lastApplyUsedFlatten: boolean;

  loadFile: (file: File) => Promise<void>;
  reset: () => void;
  setCurrentPage: (page: number) => void;
  setScale: (scale: number) => void;
  addRedaction: (rect: Omit<RedactionRect, "id">) => void;
  addRedactions: (rects: Omit<RedactionRect, "id">[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  canRedact: () => boolean;
  setSearchQuery: (q: string) => void;
  setUseRegex: (v: boolean) => void;
  runSearch: () => RedactionRect[];
  runPatternDetect: (keys?: PatternKey[]) => void;
  setIsApplying: (v: boolean) => void;
  setDrawHint: (msg: string | null) => void;
  setShowRedactionWarning: (v: boolean) => void;
  setFlattenBeforeRedact: (v: boolean) => void;
  runOcr: () => Promise<void>;
  autoDetectAllBoxes: () => void;
  clearAfterExport: () => void;
  pushHistory: () => void;
}

function cloneRedactions(r: RedactionRect[]): RedactionRect[] {
  return r.map((x) => ({ ...x }));
}

export const useRedactionStore = create<RedactionState>()(
  immer((set, get) => ({
    fileName: "",
    pdfBytes: null,
    pdfDoc: null,
    numPages: 0,
    currentPage: 0,
    scale: 1.25,
    redactions: [],
    history: [[]],
    historyIndex: 0,
    textSpans: [],
    isLoading: false,
    error: null,
    searchQuery: "",
    useRegex: false,
    patternCounts: null,
    patternSummary: "",
    isApplying: false,
    hasTextLayer: false,
    currentPageHasText: false,
    ocrCompleted: false,
    isOcrRunning: false,
    ocrProgress: 0,
    drawHint: null,
    showRedactionWarning: false,
    isHybridPdf: false,
    hybridPageIndices: [],
    flattenBeforeRedact: false,
    lastApplyUsedFlatten: false,

    pushHistory: () => {
      set((s) => {
        const snapshot = cloneRedactions(s.redactions);
        const trimmed = s.history.slice(0, s.historyIndex + 1);
        trimmed.push(snapshot);
        if (trimmed.length > MAX_HISTORY) trimmed.shift();
        s.history = trimmed;
        s.historyIndex = trimmed.length - 1;
      });
    },

    canRedact: () => get().hasTextLayer || get().ocrCompleted,

    loadFile: async (file: File) => {
      const err = validatePdfFile(file);
      if (err) return set({ error: err });
      set({ isLoading: true, error: null });
      try {
        const pdfBytes = clonePdfBytes(await file.arrayBuffer());
        const doc = await loadPdfDocument(pdfBytes);
        let spans: TextSpan[] = [];
        let hasText = false;
        let pageText = false;
        try {
          spans = await extractAllTextSpans(doc);
          hasText = await pdfHasTextLayer(doc);
          pageText = await pageHasTextLayer(doc, 0);
        } catch {
          /* continue without spans */
        }
        let hybrid = { isHybrid: false, hybridPageIndices: [] as number[] };
        try {
          hybrid = await analyzeHybridPdf(pdfBytes, doc);
        } catch {
          /* non-fatal */
        }
        const mobile =
          typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
        set({
          fileName: file.name,
          pdfBytes,
          pdfDoc: doc,
          numPages: doc.numPages,
          currentPage: 0,
          scale: mobile ? 1 : 1.25,
          redactions: [],
          history: [[]],
          historyIndex: 0,
          textSpans: spans,
          isLoading: false,
          hasTextLayer: hasText,
          currentPageHasText: pageText,
          ocrCompleted: false,
          ocrProgress: 0,
          drawHint: null,
          showRedactionWarning: false,
          isHybridPdf: hybrid.isHybrid,
          hybridPageIndices: hybrid.hybridPageIndices,
          flattenBeforeRedact: hybrid.isHybrid,
          lastApplyUsedFlatten: false,
        });
      } catch (e) {
        console.error(e);
        set({ isLoading: false, error: formatPdfLoadError(e) });
      }
    },

    reset: () => {
      get().pdfDoc?.destroy();
      set({
        fileName: "",
        pdfBytes: null,
        pdfDoc: null,
        numPages: 0,
        currentPage: 0,
        redactions: [],
        history: [[]],
        historyIndex: 0,
        textSpans: [],
        error: null,
        patternCounts: null,
        patternSummary: "",
        hasTextLayer: false,
        currentPageHasText: false,
        ocrCompleted: false,
        isOcrRunning: false,
        ocrProgress: 0,
        drawHint: null,
        showRedactionWarning: false,
        isHybridPdf: false,
        hybridPageIndices: [],
        flattenBeforeRedact: false,
        lastApplyUsedFlatten: false,
      });
    },

    clearAfterExport: () => {
      get().pdfDoc?.destroy();
      set({
        pdfBytes: null,
        pdfDoc: null,
        redactions: [],
        history: [[]],
        historyIndex: 0,
        textSpans: [],
        showRedactionWarning: true,
      });
    },

    setCurrentPage: (page) => {
      set({ currentPage: page });
      const { pdfDoc } = get();
      if (pdfDoc) {
        void pageHasTextLayer(pdfDoc, page).then((currentPageHasText) =>
          set({ currentPageHasText })
        );
      }
    },

    setScale: (scale) => set({ scale }),
    setSearchQuery: (q) => set({ searchQuery: q }),
    setUseRegex: (v) => set({ useRegex: v }),
    setIsApplying: (v) => set({ isApplying: v }),
    setDrawHint: (msg) => set({ drawHint: msg }),
    setShowRedactionWarning: (v) => set({ showRedactionWarning: v }),
    setFlattenBeforeRedact: (v) => set({ flattenBeforeRedact: v }),

    runOcr: async () => {
      const { pdfDoc, pdfBytes } = get();
      if (!pdfDoc || !pdfBytes) return;
      set({ isOcrRunning: true, ocrProgress: 0, drawHint: null, error: null });
      try {
        const { spans, pdfBytes: out } = await runOcrOnPdf(pdfDoc, pdfBytes, (p) =>
          set({ ocrProgress: p.overall })
        );
        get().pdfDoc?.destroy();
        const owned = clonePdfBytes(out);
        const doc = await loadPdfDocument(owned);
        let hybrid = { isHybrid: false, hybridPageIndices: [] as number[] };
        try {
          hybrid = await analyzeHybridPdf(owned, doc);
        } catch {
          /* non-fatal */
        }
        set({
          pdfBytes: owned,
          pdfDoc: doc,
          textSpans: spans,
          hasTextLayer: true,
          currentPageHasText: true,
          ocrCompleted: true,
          isOcrRunning: false,
          ocrProgress: 100,
          isHybridPdf: hybrid.isHybrid,
          hybridPageIndices: hybrid.hybridPageIndices,
          flattenBeforeRedact: hybrid.isHybrid,
          drawHint: "OCR done. Draw boxes and click Apply Redactions.",
        });
      } catch (e) {
        console.error(e);
        set({
          isOcrRunning: false,
          error: e instanceof Error ? e.message : "OCR failed",
          drawHint: "OCR failed. Check internet (Tesseract loads from CDN).",
        });
      }
    },

    autoDetectAllBoxes: () => {
      const { redactions, textSpans } = get();
      if (!redactions.length) return;
      const { redactions: next, changedCount } = autoDetectAllRedactionBoxes(
        redactions,
        textSpans
      );
      if (changedCount > 0) {
        get().pushHistory();
        set({
          redactions: next,
          drawHint: `Expanded ${changedCount} box${changedCount === 1 ? "" : "es"}. Click Apply Redactions.`,
        });
      } else {
        set({
          drawHint: "No nearby text found. Draw a larger box over the full line.",
        });
      }
    },

    addRedaction: (rect) => {
      if (!get().canRedact()) {
        set({ drawHint: "Scanned PDF — run OCR from the banner first." });
        return;
      }
      get().pushHistory();
      const id = generateId();
      set((s) => {
        s.redactions.push({ ...rect, id });
      });
      const added = get().redactions.find((r) => r.id === id)!;
      const hit = getSpansMarkedForRemoval(get().textSpans, added.pageIndex, [added]).length;
      set({
        drawHint: hit
          ? null
          : "No text in this box. Draw larger, or run OCR for scanned pages.",
      });
    },

    addRedactions: (rects) => {
      if (!rects.length || !get().canRedact()) return;
      get().pushHistory();
      set((s) => {
        for (const r of rects) s.redactions.push({ ...r, id: generateId() });
      });
    },

    undo: () => {
      const { historyIndex, history } = get();
      if (historyIndex <= 0) return;
      const i = historyIndex - 1;
      set({ historyIndex: i, redactions: cloneRedactions(history[i]) });
    },

    redo: () => {
      const { historyIndex, history } = get();
      if (historyIndex >= history.length - 1) return;
      const i = historyIndex + 1;
      set({ historyIndex: i, redactions: cloneRedactions(history[i]) });
    },

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    runSearch: () => searchTextSpans(get().textSpans, get().searchQuery, get().useRegex),

    runPatternDetect: (keys) => {
      const { rects, counts } = detectPatterns(get().textSpans, keys);
      set({ patternCounts: counts, patternSummary: formatPatternSummary(counts) });
      if (rects.length) {
        get().pushHistory();
        set((s) => {
          s.redactions.push(...rects);
        });
      }
    },
  }))
);
