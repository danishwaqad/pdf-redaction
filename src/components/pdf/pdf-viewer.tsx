"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRedactionStore } from "@/store/redaction-store";
import {
  pdfRectToScreenWithViewport,
  screenRectToPdfWithViewport,
  viewportTransformFromPdfJs,
  type ViewportTransform,
} from "@/lib/pdf/coordinates";
import type { RedactionRect } from "@/lib/pdf/types";
import { cn } from "@/lib/utils";

interface DrawState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

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
  const currentPage = useRedactionStore((s) => s.currentPage);
  const scale = useRedactionStore((s) => s.scale);
  const redactions = useRedactionStore((s) => s.redactions);
  const addRedaction = useRedactionStore((s) => s.addRedaction);
  const canRedactFn = useRedactionStore((s) => s.canRedact);
  const drawHint = useRedactionStore((s) => s.drawHint);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderGenRef = useRef(0);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  const [pageSize, setPageSize] = useState({
    width: 0,
    height: 0,
    pdfHeight: 0,
    transform: [1, 0, 0, 1, 0, 0] as ViewportTransform,
  });
  const [drawing, setDrawing] = useState<DrawState | null>(null);
  const [pageWidthAt1, setPageWidthAt1] = useState(0);
  const [fitScale, setFitScale] = useState(1);
  const isMobile = useIsMobile();

  const renderScale =
    isMobile && pageWidthAt1 > 0 ? fitScale * scale : scale;

  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;
    pdfDoc.getPage(currentPage + 1).then((page) => {
      if (!cancelled) {
        setPageWidthAt1(page.getViewport({ scale: 1 }).width);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, currentPage]);

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

  const pageRedactions = redactions.filter((r) => r.pageIndex === currentPage);

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || renderScale <= 0) return;

    const gen = ++renderGenRef.current;
    renderTaskRef.current?.cancel();

    const page = await pdfDoc.getPage(currentPage + 1);
    if (gen !== renderGenRef.current) return;

    const viewport = page.getViewport({ scale: renderScale });
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = Math.floor(viewport.width);
    const h = Math.floor(viewport.height);
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    setPageSize({
      width: w,
      height: h,
      pdfHeight: h / renderScale,
      transform: viewportTransformFromPdfJs(viewport.transform),
    });

    const task = page.render({ canvasContext: ctx, viewport, canvas });
    renderTaskRef.current = task;
    await task.promise.catch(() => undefined);
  }, [pdfDoc, currentPage, renderScale]);

  useEffect(() => {
    renderPage();
    return () => {
      renderTaskRef.current?.cancel();
    };
  }, [renderPage]);

  const getOverlayPoint = (clientX: number, clientY: number) => {
    const el = overlayRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (clientX: number, clientY: number) => {
    const p = getOverlayPoint(clientX, clientY);
    setDrawing({ startX: p.x, startY: p.y, currentX: p.x, currentY: p.y });
  };

  const moveDraw = (clientX: number, clientY: number) => {
    if (!drawing) return;
    const p = getOverlayPoint(clientX, clientY);
    setDrawing((d) => (d ? { ...d, currentX: p.x, currentY: p.y } : null));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !canRedactFn()) return;
    startDraw(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    moveDraw(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1 || !canRedactFn()) return;
    startDraw(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!drawing || e.touches.length !== 1) return;
    e.preventDefault();
    moveDraw(e.touches[0].clientX, e.touches[0].clientY);
  };

  const finishDraw = () => {
    if (!drawing || pageSize.pdfHeight === 0) {
      setDrawing(null);
      return;
    }
    const left = Math.min(drawing.startX, drawing.currentX);
    const top = Math.min(drawing.startY, drawing.currentY);
    const width = Math.abs(drawing.currentX - drawing.startX);
    const height = Math.abs(drawing.currentY - drawing.startY);

    if (width > 4 && height > 4) {
      const pdfRect = screenRectToPdfWithViewport(
        left,
        top,
        width,
        height,
        pageSize.transform
      );
      addRedaction({
        pageIndex: currentPage,
        ...pdfRect,
        source: "manual",
      });
    }
    setDrawing(null);
  };

  const previewRect = drawing
    ? {
        left: Math.min(drawing.startX, drawing.currentX),
        top: Math.min(drawing.startY, drawing.currentY),
        width: Math.abs(drawing.currentX - drawing.startX),
        height: Math.abs(drawing.currentY - drawing.startY),
      }
    : null;

  if (!pdfDoc) return null;

  const showPage = pageSize.width > 0 && pageSize.height > 0;

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto bg-slate-100 p-2 sm:p-4"
    >
      <div className="relative flex w-full min-h-[12rem] flex-1 justify-center">
        <div
          className="relative shrink-0 shadow-drop"
          style={{
            width: showPage ? pageSize.width : 1,
            height: showPage ? pageSize.height : 1,
            visibility: showPage ? "visible" : "hidden",
          }}
        >
          <canvas ref={canvasRef} className="block bg-white" />
          <div
            ref={overlayRef}
            className="absolute left-0 top-0 cursor-crosshair touch-none"
            style={{
              width: showPage ? pageSize.width : 0,
              height: showPage ? pageSize.height : 0,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={finishDraw}
            onMouseLeave={finishDraw}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={finishDraw}
            onTouchCancel={finishDraw}
          >
            {pageRedactions.map((r) => (
              <RedactionOverlay key={r.id} rect={r} transform={pageSize.transform} />
            ))}
            {previewRect && previewRect.width > 0 && previewRect.height > 0 && (
              <div
                className="absolute border-2 border-dashed border-rose-600 bg-rose-500/10"
                style={{
                  left: previewRect.left,
                  top: previewRect.top,
                  width: previewRect.width,
                  height: previewRect.height,
                }}
              />
            )}
          </div>
        </div>
        {!showPage && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Loading page…
          </div>
        )}
      </div>
      {drawHint && (
        <p className="mt-2 shrink-0 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-900">
          {drawHint}
        </p>
      )}
      <p className="mt-2 shrink-0 px-2 text-center text-xs text-muted-foreground">
        {isMobile
          ? "+/− to zoom · Drag to mark areas · Page "
          : "Drag to mark redaction areas (applied on export) · Page "}
        {currentPage + 1}
      </p>
    </div>
  );
}

function RedactionOverlay({
  rect,
  transform,
}: {
  rect: RedactionRect;
  transform: ViewportTransform;
}) {
  const screen = pdfRectToScreenWithViewport(rect, transform);
  return (
    <div
      className={cn(
        "pointer-events-none absolute border-2 border-dashed border-rose-600 bg-rose-500/15",
        rect.source === "search" && "ring-1 ring-amber-400",
        rect.source === "pattern" && "ring-1 ring-sky-400"
      )}
      style={{
        left: screen.left,
        top: screen.top,
        width: screen.width,
        height: screen.height,
      }}
      title={rect.label ?? "Redaction"}
    />
  );
}
