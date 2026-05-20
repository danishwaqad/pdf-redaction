"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { generateId } from "@/lib/utils";
import { loadPdfDocument, validatePdfFile } from "@/lib/pdf/pdf-loader";
import { extractAllTextSpans } from "@/lib/pdf/text-extract";
import { detectPatterns, formatPatternSummary, type PatternKey } from "@/lib/pdf/pattern-detect";
import { searchTextSpans } from "@/lib/pdf/text-search";
import type { RedactionRect, TextSpan } from "@/lib/pdf/types";

const MAX_HISTORY = 50;

interface RedactionState {
  file: File | null;
  fileName: string;
  pdfBytes: ArrayBuffer | null;
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
  viewMode: "landing" | "editor";
  isApplying: boolean;
  lastAppliedCount: number;

  loadFile: (file: File) => Promise<void>;
  reset: () => void;
  setCurrentPage: (page: number) => void;
  setScale: (scale: number) => void;
  addRedaction: (rect: Omit<RedactionRect, "id">) => void;
  addRedactions: (rects: Omit<RedactionRect, "id">[]) => void;
  removeRedaction: (id: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setSearchQuery: (q: string) => void;
  setUseRegex: (v: boolean) => void;
  runSearch: () => RedactionRect[];
  runPatternDetect: (keys?: PatternKey[]) => void;
  applyPatternRedactions: () => void;
  setViewMode: (mode: "landing" | "editor") => void;
  setIsApplying: (v: boolean) => void;
  setLastAppliedCount: (n: number) => void;
  pushHistory: () => void;
}

function cloneRedactions(r: RedactionRect[]): RedactionRect[] {
  return r.map((x) => ({ ...x }));
}

export const useRedactionStore = create<RedactionState>()(
  immer((set, get) => ({
    file: null,
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
    viewMode: "landing",
    isApplying: false,
    lastAppliedCount: 0,

    pushHistory: () => {
      set((state) => {
        const snapshot = cloneRedactions(state.redactions);
        const trimmed = state.history.slice(0, state.historyIndex + 1);
        trimmed.push(snapshot);
        if (trimmed.length > MAX_HISTORY) trimmed.shift();
        state.history = trimmed;
        state.historyIndex = trimmed.length - 1;
      });
    },

    loadFile: async (file: File) => {
      const err = validatePdfFile(file);
      if (err) {
        set({ error: err });
        return;
      }
      set({ isLoading: true, error: null });
      try {
        const buffer = await file.arrayBuffer();
        const doc = await loadPdfDocument(buffer);
        const spans = await extractAllTextSpans(doc);
        const mobile =
          typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
        set({
          file,
          fileName: file.name,
          pdfBytes: buffer,
          pdfDoc: doc,
          numPages: doc.numPages,
          currentPage: 0,
          scale: mobile ? 1 : 1.25,
          redactions: [],
          history: [[]],
          historyIndex: 0,
          textSpans: spans,
          isLoading: false,
          viewMode: "editor",
          patternCounts: null,
          patternSummary: "",
        });
      } catch {
        set({ isLoading: false, error: "Failed to load PDF. The file may be corrupted or encrypted." });
      }
    },

    reset: () => {
      const { pdfDoc } = get();
      pdfDoc?.destroy();
      set({
        file: null,
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
        viewMode: "landing",
        patternCounts: null,
        patternSummary: "",
      });
    },

    setCurrentPage: (page) => set({ currentPage: page }),
    setScale: (scale) => set({ scale }),
    setSearchQuery: (q) => set({ searchQuery: q }),
    setUseRegex: (v) => set({ useRegex: v }),
    setViewMode: (mode) => set({ viewMode: mode }),
    setIsApplying: (v) => set({ isApplying: v }),
    setLastAppliedCount: (n) => set({ lastAppliedCount: n }),

    addRedaction: (rect) => {
      get().pushHistory();
      set((state) => {
        state.redactions.push({ ...rect, id: generateId() });
      });
    },

    addRedactions: (rects) => {
      if (!rects.length) return;
      get().pushHistory();
      set((state) => {
        for (const r of rects) {
          state.redactions.push({ ...r, id: generateId() });
        }
      });
    },

    removeRedaction: (id) => {
      get().pushHistory();
      set((state) => {
        state.redactions = state.redactions.filter((r) => r.id !== id);
      });
    },

    undo: () => {
      const { historyIndex, history } = get();
      if (historyIndex <= 0) return;
      const newIndex = historyIndex - 1;
      set({
        historyIndex: newIndex,
        redactions: cloneRedactions(history[newIndex]),
      });
    },

    redo: () => {
      const { historyIndex, history } = get();
      if (historyIndex >= history.length - 1) return;
      const newIndex = historyIndex + 1;
      set({
        historyIndex: newIndex,
        redactions: cloneRedactions(history[newIndex]),
      });
    },

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    runSearch: () => {
      const { textSpans, searchQuery, useRegex } = get();
      return searchTextSpans(textSpans, searchQuery, useRegex);
    },

    runPatternDetect: (keys) => {
      const { textSpans } = get();
      const { rects, counts } = detectPatterns(textSpans, keys);
      set({
        patternCounts: counts,
        patternSummary: formatPatternSummary(counts),
      });
      if (rects.length) {
        get().pushHistory();
        set((state) => {
          state.redactions.push(...rects);
        });
      }
    },

    applyPatternRedactions: () => {
      /* patterns already added on detect; placeholder for UX */
    },
  }))
);
