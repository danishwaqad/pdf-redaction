"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type Ref,
} from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
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

type PdfPageViewProps = {
  pdfDoc: PDFDocumentProxy;
  pageIndex: number;
  renderScale: number;
  redactions: RedactionRect[];
  canRedact: boolean;
  onAddRedaction: (rect: Omit<RedactionRect, "id" | "pageIndex">) => void;
  scrollRoot: React.RefObject<HTMLElement | null>;
  onVisibilityChange?: (pageIndex: number, ratio: number) => void;
};

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as MutableRefObject<T | null>).current = node;
      }
    }
  };
}

export const PdfPageView = forwardRef<HTMLDivElement, PdfPageViewProps>(
  function PdfPageView(
    {
      pdfDoc,
      pageIndex,
      renderScale,
      redactions,
      canRedact,
      onAddRedaction,
      scrollRoot,
      onVisibilityChange,
    },
    ref
  ) {
    const rootRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const renderGenRef = useRef(0);
    const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

    const [shouldRender, setShouldRender] = useState(false);
    const [pageSize, setPageSize] = useState({
      width: 0,
      height: 0,
      pdfHeight: 0,
      transform: [1, 0, 0, 1, 0, 0] as ViewportTransform,
    });
    const [drawing, setDrawing] = useState<DrawState | null>(null);
    const [placeholderHeight, setPlaceholderHeight] = useState(842 * renderScale);

    useEffect(() => {
      const root = scrollRoot.current;
      const el = rootRef.current;
      if (!root || !el) return;

      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setShouldRender(true);
          onVisibilityChange?.(pageIndex, entry.intersectionRatio);
        },
        { root, rootMargin: "400px 0px", threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
      );
      io.observe(el);
      return () => io.disconnect();
    }, [scrollRoot, pageIndex, onVisibilityChange]);

    useEffect(() => {
      let cancelled = false;
      pdfDoc.getPage(pageIndex + 1).then((page) => {
        if (cancelled) return;
        const vp = page.getViewport({ scale: renderScale });
        setPlaceholderHeight(vp.height);
      });
      return () => {
        cancelled = true;
      };
    }, [pdfDoc, pageIndex, renderScale]);

    const renderPage = useCallback(async () => {
      if (!shouldRender || !canvasRef.current || renderScale <= 0) return;

      const gen = ++renderGenRef.current;
      renderTaskRef.current?.cancel();

      const page = await pdfDoc.getPage(pageIndex + 1);
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
    }, [pdfDoc, pageIndex, renderScale, shouldRender]);

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
        onAddRedaction({ ...pdfRect, source: "manual" });
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

    const showPage = shouldRender && pageSize.width > 0 && pageSize.height > 0;

    return (
      <div
        ref={mergeRefs(ref, rootRef)}
        data-page-index={pageIndex}
        className="relative w-full scroll-mt-2"
        style={{ minHeight: showPage ? undefined : placeholderHeight }}
      >
        <div
          className="relative mx-auto shrink-0 shadow-drop"
          style={{
            width: showPage ? pageSize.width : "100%",
            maxWidth: showPage ? pageSize.width : undefined,
            height: showPage ? pageSize.height : placeholderHeight,
            visibility: showPage ? "visible" : "hidden",
          }}
        >
          <canvas ref={canvasRef} className="block w-full bg-white" />
          <div
            ref={overlayRef}
            className="absolute left-0 top-0 cursor-crosshair touch-none"
            style={{
              width: showPage ? pageSize.width : 0,
              height: showPage ? pageSize.height : 0,
            }}
            onMouseDown={(e) => {
              if (e.button !== 0 || !canRedact) return;
              startDraw(e.clientX, e.clientY);
            }}
            onMouseMove={(e) => moveDraw(e.clientX, e.clientY)}
            onMouseUp={finishDraw}
            onMouseLeave={finishDraw}
            onTouchStart={(e) => {
              if (e.touches.length !== 1 || !canRedact) return;
              startDraw(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchMove={(e) => {
              if (!drawing || e.touches.length !== 1) return;
              e.preventDefault();
              moveDraw(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchEnd={finishDraw}
            onTouchCancel={finishDraw}
          >
            {showPage &&
              redactions.map((r) => (
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
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Page {pageIndex + 1}…
          </div>
        )}
      </div>
    );
  }
);

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
