"use client";

import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  Trash2,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRedactionStore } from "@/store/redaction-store";
import {
  applyRedactionsPermanent,
  buildRedactionCertificate,
} from "@/lib/pdf/redact-apply";
import {
  certificateFilename,
  downloadBlob,
  redactedFilename,
} from "@/lib/utils";

export function RedactionToolbar() {
  const fileName = useRedactionStore((s) => s.fileName);
  const pdfBytes = useRedactionStore((s) => s.pdfBytes);
  const numPages = useRedactionStore((s) => s.numPages);
  const redactions = useRedactionStore((s) => s.redactions);
  const scale = useRedactionStore((s) => s.scale);
  const setScale = useRedactionStore((s) => s.setScale);
  const zoomPercent = Math.round(scale * 100);
  const undo = useRedactionStore((s) => s.undo);
  const redo = useRedactionStore((s) => s.redo);
  const canUndo = useRedactionStore((s) => s.canUndo);
  const canRedo = useRedactionStore((s) => s.canRedo);
  const reset = useRedactionStore((s) => s.reset);
  const isApplying = useRedactionStore((s) => s.isApplying);
  const setIsApplying = useRedactionStore((s) => s.setIsApplying);
  const setLastAppliedCount = useRedactionStore((s) => s.setLastAppliedCount);

  const handleDownload = async () => {
    if (!pdfBytes || redactions.length === 0) return;
    setIsApplying(true);
    try {
      const out = await applyRedactionsPermanent(pdfBytes, redactions, numPages);
      const blob = new Blob([new Uint8Array(out)], { type: "application/pdf" });
      downloadBlob(blob, redactedFilename(fileName));

      const cert = buildRedactionCertificate(redactions.length);
      const certBlob = new Blob([cert], { type: "text/plain" });
      downloadBlob(certBlob, certificateFilename(fileName));
      setLastAppliedCount(redactions.length);
    } catch (err) {
      console.error("Redaction failed:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to apply redactions. Please try again.";
      alert(msg.length > 200 ? "Failed to apply redactions. Please try again." : msg);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="shrink-0 space-y-2 border-b bg-white px-3 py-2 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-brand" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{fileName}</span>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {redactions.length} mark{redactions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-md border bg-slate-50/80 p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setScale(scale - 0.25)}
            disabled={scale <= 0.5}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[2.75rem] px-1 text-center text-xs font-medium text-muted-foreground">
            {zoomPercent}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setScale(scale + 0.25)}
            disabled={scale >= 3}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" size="icon" className="h-9 w-9" onClick={undo} disabled={!canUndo()} aria-label="Undo">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={redo} disabled={!canRedo()} aria-label="Redo">
          <Redo2 className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={reset}>
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">New file</span>
        </Button>

        <Button
          size="sm"
          className="h-9 min-w-0 flex-1 gap-1.5 sm:ml-auto sm:flex-initial"
          disabled={redactions.length === 0 || isApplying}
          onClick={handleDownload}
        >
          {isApplying ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <Download className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate">Download</span>
        </Button>
      </div>
    </div>
  );
}
