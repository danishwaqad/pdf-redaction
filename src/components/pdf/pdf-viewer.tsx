"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRedactionStore } from "@/store/redaction-store";
import { pdfRectToScreen, screenRectToPdf } from "@/lib/pdf/coordinates";
import type { RedactionRect } from "@/lib/pdf/types";
import { cn } from "@/lib/utils";

interface DrawState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function PdfViewer() {
  const pdfDoc = useRedactionStore((s) => s.pdfDoc);
  const currentPage = useRedactionStore((s) => s.currentPage);
  const scale = useRedactionStore((s) => s.scale);
  const redactions = useRedactionStore((s) => s.redactions);
  const addRedaction = useRedactionStore((s) => s.addRedaction);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0, pdfHeight: 0 });
  const [drawing, setDrawing] = useState<DrawState | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  const pageRedactions = redactions.filter((r) => r.pageIndex === currentPage);

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;
    renderTaskRef.current?.cancel();

    const page = await pdfDoc.getPage(currentPage + 1);
    const viewport = page.getViewport({ scale });
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    setPageSize({ width: viewport.width, height: viewport.height, pdfHeight: viewport.height / scale });

    const task = page.render({ canvasContext: ctx, viewport, canvas });
    renderTaskRef.current = task;
    await task.promise.catch(() => undefined);
  }, [pdfDoc, currentPage, scale]);

  useEffect(() => {
    renderPage();
    return () => renderTaskRef.current?.cancel();
  }, [renderPage]);

  const getOverlayPoint = (e: React.MouseEvent) => {
    const el = overlayRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const p = getOverlayPoint(e);
    setDrawing({ startX: p.x, startY: p.y, currentX: p.x, currentY: p.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    const p = getOverlayPoint(e);
    setDrawing((d) => (d ? { ...d, currentX: p.x, currentY: p.y } : null));
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
      const pdfRect = screenRectToPdf(left, top, width, height, pageSize.pdfHeight, scale);
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

  return (
    <div className="flex flex-1 flex-col items-center overflow-auto bg-slate-100 p-4">
      <div
        className="relative inline-block shadow-drop"
        style={{ width: pageSize.width || "auto", height: pageSize.height || "auto" }}
      >
        <canvas ref={canvasRef} className="block max-w-full bg-white" />
        <div
          ref={overlayRef}
          className="absolute inset-0 cursor-crosshair touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={finishDraw}
          onMouseLeave={finishDraw}
        >
          {pageRedactions.map((r) => (
            <RedactionOverlay key={r.id} rect={r} pageHeight={pageSize.pdfHeight} scale={scale} />
          ))}
          {previewRect && previewRect.width > 0 && previewRect.height > 0 && (
            <div
              className="absolute border-2 border-dashed border-rose-500 bg-black/80"
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
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Click and drag to draw black redaction boxes on page {currentPage + 1}
      </p>
    </div>
  );
}

function RedactionOverlay({
  rect,
  pageHeight,
  scale,
}: {
  rect: RedactionRect;
  pageHeight: number;
  scale: number;
}) {
  const screen = pdfRectToScreen(rect, pageHeight, scale);
  return (
    <div
      className={cn(
        "pointer-events-none absolute bg-black",
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
