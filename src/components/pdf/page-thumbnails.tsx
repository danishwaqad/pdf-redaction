"use client";

import { useEffect, useState } from "react";
import { useRedactionStore } from "@/store/redaction-store";
import { cn } from "@/lib/utils";

type PageThumbnailsProps = {
  orientation?: "vertical" | "horizontal";
};

export function PageThumbnails({ orientation = "vertical" }: PageThumbnailsProps) {
  const pdfDoc = useRedactionStore((s) => s.pdfDoc);
  const numPages = useRedactionStore((s) => s.numPages);
  const currentPage = useRedactionStore((s) => s.currentPage);
  const goToPage = useRedactionStore((s) => s.goToPage);
  const redactions = useRedactionStore((s) => s.redactions);

  const [thumbs, setThumbs] = useState<Record<number, string>>({});

  useEffect(() => {
    setThumbs({});
  }, [pdfDoc]);

  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;

    (async () => {
      const preload = new Set<number>();
      for (let i = 0; i < Math.min(numPages, 10); i++) preload.add(i);
      for (let i = Math.max(0, currentPage - 8); i <= Math.min(numPages - 1, currentPage + 8); i++) {
        preload.add(i);
      }

      const existing = new Set(Object.keys(thumbs).map((x) => Number(x)));
      for (const idx of preload) {
        if (cancelled) break;
        if (existing.has(idx)) continue;
        const page = await pdfDoc.getPage(idx + 1);
        const viewport = page.getViewport({ scale: 0.14 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          const url = canvas.toDataURL("image/jpeg", 0.6);
          if (cancelled) break;
          setThumbs((prev) => ({ ...prev, [idx]: url }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, numPages, currentPage, thumbs]);

  const countOnPage = (idx: number) =>
    redactions.filter((r) => r.pageIndex === idx).length;

  const thumbButton = (idx: number) => (
    <button
      key={idx}
      type="button"
      onClick={() => goToPage(idx)}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-md border-2 transition-all hover:border-brand/50",
        orientation === "horizontal" ? "w-24 sm:w-28" : "w-full",
        currentPage === idx ? "border-brand shadow-sm" : "border-transparent"
      )}
    >
      {thumbs[idx] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbs[idx]} alt={`Page ${idx + 1}`} className="block w-full" />
      ) : (
        <div className="flex aspect-[3/4] w-full items-center justify-center bg-slate-100 text-[10px] text-muted-foreground">
          Loading...
        </div>
      )}
      <span className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 text-center text-[10px] text-white">
        {idx + 1}
        {countOnPage(idx) > 0 && (
          <span className="ml-1 rounded bg-brand px-1">{countOnPage(idx)}</span>
        )}
      </span>
    </button>
  );

  if (orientation === "horizontal") {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
        {Array.from({ length: numPages }, (_, idx) => thumbButton(idx))}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-36 shrink-0 flex-col border-r bg-white md:w-44">
      <div className="border-b px-3 py-2 text-xs font-semibold text-muted-foreground">
        Pages ({numPages})
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        <div className="space-y-2 pb-2">
          {Array.from({ length: numPages }, (_, idx) => thumbButton(idx))}
        </div>
      </div>
    </div>
  );
}
