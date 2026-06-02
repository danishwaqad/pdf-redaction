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

  const [thumbs, setThumbs] = useState<string[]>([]);

  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;

    (async () => {
      const urls: string[] = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        if (cancelled) break;
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          urls.push(canvas.toDataURL("image/jpeg", 0.7));
        }
      }
      if (!cancelled) setThumbs(urls);
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, numPages]);

  const countOnPage = (idx: number) =>
    redactions.filter((r) => r.pageIndex === idx).length;

  const thumbButton = (src: string, idx: number) => (
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`Page ${idx + 1}`} className="block w-full" />
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
        {thumbs.map((src, idx) => thumbButton(src, idx))}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-36 shrink-0 flex-col border-r bg-white md:w-44">
      <div className="border-b px-3 py-2 text-xs font-semibold text-muted-foreground">
        Pages ({numPages})
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        <div className="space-y-2 pb-2">{thumbs.map((src, idx) => thumbButton(src, idx))}</div>
      </div>
    </div>
  );
}
