"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [fitScale, setFitScale] = useState(1);
  const isMobile = useIsMobile();

  const renderScale = isMobile && pageWidthAt1 > 0 ? fitScale * scale : scale;

  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;
    pdfDoc.getPage(1).then((page) => {
      if (!cancelled) setPageWidthAt1(page.getViewport({ scale: 1 }).width);
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
  const handlePageVisibility = useCallback(
    (pageIndex: number, ratio: number) => {
      visibilityRatios.current.set(pageIndex, ratio);
      let bestPage = currentPage;
      let bestRatio = 0;
      visibilityRatios.current.forEach((r, idx) => {
        if (r > bestRatio) {
          bestRatio = r;
          bestPage = idx;
        }
      });
      if (bestRatio > 0.2 && bestPage !== currentPage) {
        setCurrentPage(bestPage);
      }
    },
    [currentPage, setCurrentPage]
  );

  if (!pdfDoc) return null;

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto bg-slate-100 p-2 sm:p-4"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        {Array.from({ length: numPages }, (_, pageIndex) => (
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
            scrollRoot={containerRef}
            onAddRedaction={(rect) => addRedaction({ ...rect, pageIndex })}
            onVisibilityChange={handlePageVisibility}
          />
        ))}
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
