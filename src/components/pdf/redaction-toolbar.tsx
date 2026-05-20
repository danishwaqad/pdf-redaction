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
    <div className="flex flex-wrap items-center gap-2 border-b bg-white px-4 py-2">
      <div className="mr-auto flex items-center gap-2 truncate text-sm font-medium">
        <FileText className="h-4 w-4 shrink-0 text-brand" />
        <span className="truncate max-w-[200px] md:max-w-xs">{fileName}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {redactions.length} mark{redactions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <Button variant="outline" size="icon" onClick={() => setScale(scale - 0.25)} disabled={scale <= 0.5}>
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="min-w-[3rem] text-center text-xs text-muted-foreground">
        {Math.round(scale * 100)}%
      </span>
      <Button variant="outline" size="icon" onClick={() => setScale(scale + 0.25)} disabled={scale >= 3}>
        <ZoomIn className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="icon" onClick={undo} disabled={!canUndo()}>
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={redo} disabled={!canRedo()}>
        <Redo2 className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="sm" onClick={reset}>
        <Trash2 className="h-4 w-4" />
        New file
      </Button>

      <Button
        size="sm"
        disabled={redactions.length === 0 || isApplying}
        onClick={handleDownload}
      >
        {isApplying ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Download Redacted PDF
      </Button>
    </div>
  );
}
