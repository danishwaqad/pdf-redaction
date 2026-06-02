"use client";

import { useEffect, useRef, useState } from "react";
import { useRedactionStore } from "@/store/redaction-store";
import { PdfPageView } from "@/components/pdf/pdf-page-view";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

export function PdfViewer() {
  const pdfDoc = useRedactionStore((s) => s.pdfDoc);
  const numPages = useRedactionStore((s) => s.numPages);
  const currentPage = useRedactionStore((s) => s.currentPage);
  const scale = useRedactionStore((s) => s.scale);
  const redactions = useRedactionStore((s) => s.redactions);
  const addRedaction = useRedactionStore((s) => s.addRedaction);
  const canRedactFn = useRedactionStore((s) => s.canRedact);
  const drawHint = useRedactionStore((s) => s.drawHint);
  const setCurrentPage = useRedactionStore((s) => s.setCurrentPage);
  const scrollTargetPage = useRedactionStore((s) => s.scrollTargetPage);
  const clearScrollTarget = useRedactionStore((s) => s.clearScrollTarget);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pageWidthAt1, setPageWidthAt1] = useState(0);
  const [pageHeightAt1, setPageHeightAt1] = useState(0);
  const [fitScale, setFitScale] = useState(1);
  const isMobile = useIsMobile();
  const RENDER_WINDOW = 2;

  const renderScale = isMobile && pageWidthAt1 > 0 ? fitScale * scale : scale;

  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;
    pdfDoc.getPage(1).then((page) => {
      if (!cancelled) {
        const viewport = page.getViewport({ scale: 1 });
        setPageWidthAt1(viewport.width);
        setPageHeightAt1(viewport.height);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pdfDoc]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || pageWidthAt1 <= 0) return;

    const updateFit = () => {
      const w = el.clientWidth;
      if (w > 0) {
        const padding = 16;
        setFitScale(Math.max(0.1, Math.min((w - padding) / pageWidthAt1, 3)));
      }
    };

    updateFit();
    const ro = new ResizeObserver(updateFit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pageWidthAt1, isMobile]);

  useEffect(() => {
    if (scrollTargetPage == null) return;
    const el = pageRefs.current[scrollTargetPage];
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    clearScrollTarget();
  }, [scrollTargetPage, clearScrollTarget]);

  const visibilityRatios = useRef(new Map<number, number>());
  useEffect(() => {
    const root = containerRef.current;
    if (!root || !numPages) return;

    visibilityRatios.current.clear();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.pageIndex);
          if (Number.isNaN(idx)) continue;
          visibilityRatios.current.set(idx, entry.intersectionRatio);
        }
        let bestPage = currentPage;
        let bestRatio = 0;
        visibilityRatios.current.forEach((ratio, idx) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestPage = idx;
          }
        });
        if (bestRatio > 0.2 && bestPage !== currentPage) {
          setCurrentPage(bestPage);
        }
      },
      { root, threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );

    for (const el of pageRefs.current) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [numPages, currentPage, setCurrentPage]);

  if (!pdfDoc) return null;
  const estimatedPageHeight = Math.max(120, Math.round(pageHeightAt1 * renderScale));

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto bg-slate-100 p-2 sm:p-4"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        {Array.from({ length: numPages }, (_, pageIndex) => {
          const isNearCurrent = Math.abs(pageIndex - currentPage) <= RENDER_WINDOW;
          if (isNearCurrent) {
            return (
              <PdfPageView
                key={pageIndex}
                ref={(el) => {
                  pageRefs.current[pageIndex] = el;
                }}
                pdfDoc={pdfDoc}
                pageIndex={pageIndex}
                renderScale={renderScale}
                redactions={redactions.filter((r) => r.pageIndex === pageIndex)}
                canRedact={canRedactFn()}
                onAddRedaction={(rect) => addRedaction({ ...rect, pageIndex })}
              />
            );
          }

          return (
            <div
              key={pageIndex}
              ref={(el) => {
                pageRefs.current[pageIndex] = el;
              }}
              data-page-index={pageIndex}
              className="relative w-full scroll-mt-2 rounded-md border bg-white/30"
              style={{ minHeight: estimatedPageHeight }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                Page {pageIndex + 1}
              </div>
            </div>
          );
        })}
      </div>
      {drawHint && (
        <p className="mt-2 shrink-0 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-900">
          {drawHint}
        </p>
      )}
      <p className="sticky bottom-0 mt-2 shrink-0 bg-slate-100/90 px-2 py-2 text-center text-xs text-muted-foreground backdrop-blur-sm">
        {isMobile
          ? "Scroll all pages · +/− zoom · Drag to mark · Page "
          : "Scroll through all pages · Drag to mark · Page "}
        {currentPage + 1} of {numPages}
      </p>
    </div>
  );
}
