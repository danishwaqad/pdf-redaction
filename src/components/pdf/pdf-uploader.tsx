"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Upload } from "lucide-react";
import { useRedactionStore } from "@/store/redaction-store";
import { cn, formatFileSize } from "@/lib/utils";
import { MAX_FILE_SIZE } from "@/lib/pdf/pdf-loader";
import { UPLOADER_HINT, UPLOADER_SUBTEXT } from "@/lib/site-messaging";

interface PdfUploaderProps {
  variant?: "hero" | "compact";
  className?: string;
  /** After successful load, navigate to /tool (no ads). */
  redirectToTool?: boolean;
}

export function PdfUploader({
  variant = "hero",
  className,
  redirectToTool = false,
}: PdfUploaderProps) {
  const router = useRouter();
  const loadFile = useRedactionStore((s) => s.loadFile);
  const isLoading = useRedactionStore((s) => s.isLoading);
  const error = useRedactionStore((s) => s.error);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      await loadFile(file);
      if (redirectToTool && !useRedactionStore.getState().error) {
        router.push("/tool");
      }
    },
    [loadFile, redirectToTool, router]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const isHero = variant === "hero";

  return (
    <div className={cn("w-full", className)}>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "group cursor-pointer rounded-2xl border-2 border-dashed transition-all",
          isHero ? "px-8 py-14 md:py-16" : "px-4 py-6",
          dragOver
            ? "border-brand bg-accent scale-[1.01]"
            : "border-slate-300 bg-white hover:border-brand hover:bg-accent/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-brand/10 text-brand transition-transform group-hover:scale-110",
              isHero ? "h-16 w-16" : "h-10 w-10"
            )}
          >
            {isHero ? <Upload className="h-8 w-8" /> : <FileUp className="h-5 w-5" />}
          </div>
          <div>
            <p className={cn("font-semibold text-foreground", isHero ? "text-lg" : "text-sm")}>
              {isLoading ? "Loading PDF…" : "Drop your PDF here or click to browse"}
            </p>
            <p className="mt-1 text-xs font-medium text-brand">{UPLOADER_SUBTEXT}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {UPLOADER_HINT.replace("100 MB", formatFileSize(MAX_FILE_SIZE))}
            </p>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
