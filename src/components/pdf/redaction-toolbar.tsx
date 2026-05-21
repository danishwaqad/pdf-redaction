"use client";

import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Trash2,
  FileText,
  Loader2,
  ShieldAlert,
  ScanText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRedactionStore } from "@/store/redaction-store";
import { applyRedactionsPermanent, buildRedactionCertificate } from "@/lib/pdf/redact-apply";
import { certificateFilename, downloadBlob, redactedFilename } from "@/lib/utils";

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
  const clearAfterExport = useRedactionStore((s) => s.clearAfterExport);
  const showRedactionWarning = useRedactionStore((s) => s.showRedactionWarning);
  const setShowRedactionWarning = useRedactionStore((s) => s.setShowRedactionWarning);
  const isOcrRunning = useRedactionStore((s) => s.isOcrRunning);
  const ocrProgress = useRedactionStore((s) => s.ocrProgress);
  const currentPageHasText = useRedactionStore((s) => s.currentPageHasText);
  const ocrCompleted = useRedactionStore((s) => s.ocrCompleted);
  const runOcr = useRedactionStore((s) => s.runOcr);
  const autoDetectAllBoxes = useRedactionStore((s) => s.autoDetectAllBoxes);
  const isHybridPdf = useRedactionStore((s) => s.isHybridPdf);
  const hybridPageIndices = useRedactionStore((s) => s.hybridPageIndices);
  const flattenBeforeRedact = useRedactionStore((s) => s.flattenBeforeRedact);
  const setFlattenBeforeRedact = useRedactionStore((s) => s.setFlattenBeforeRedact);
  const lastApplyUsedFlatten = useRedactionStore((s) => s.lastApplyUsedFlatten);

  const showOcrBanner = isOcrRunning || (!currentPageHasText && !ocrCompleted && !isHybridPdf);

  const handleApply = async () => {
    if (!pdfBytes || !redactions.length) return;
    setIsApplying(true);
    try {
      const usedFlatten = flattenBeforeRedact && isHybridPdf;
      const out = await applyRedactionsPermanent(pdfBytes, redactions, numPages, {
        flattenBeforeRedact: usedFlatten,
        hybridPageIndices,
      });
      useRedactionStore.setState({ lastApplyUsedFlatten: usedFlatten });
      downloadBlob(new Blob([new Uint8Array(out)], { type: "application/pdf" }), redactedFilename(fileName));
      downloadBlob(
        new Blob([buildRedactionCertificate(redactions.length)], { type: "text/plain" }),
        certificateFilename(fileName)
      );
      clearAfterExport();
      setShowRedactionWarning(true);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Redaction failed. Try larger boxes or Auto-Detect.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="shrink-0 space-y-2 border-b bg-white px-3 py-2 sm:px-4">
      {showRedactionWarning && (
        <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="flex-1">
            {lastApplyUsedFlatten
              ? "Done. Hybrid pages saved as images (secure, not searchable)."
              : "Done. Marked text removed; the rest stays selectable."}
          </p>
          <button type="button" className="text-xs underline" onClick={() => setShowRedactionWarning(false)}>
            Dismiss
          </button>
        </div>
      )}

      {showOcrBanner && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
          <ScanText className="h-4 w-4 text-amber-800" />
          <p className="min-w-0 flex-1 text-xs text-amber-900">
            {isOcrRunning
              ? `Running OCR… ${Math.round(ocrProgress)}%`
              : "No text on this page — run OCR to enable redaction."}
          </p>
          {!isOcrRunning && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => void runOcr()}>
              Run OCR
            </Button>
          )}
          {isOcrRunning && (
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-amber-200">
              <div
                className="h-full rounded-full bg-amber-600 transition-all"
                style={{ width: `${Math.min(100, ocrProgress)}%` }}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex min-w-0 items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-brand" />
        <span className="min-w-0 truncate text-sm font-medium">{fileName}</span>
        {isHybridPdf && (
          <span
            className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800"
            title="Text + images — use Flatten for secure redaction on image backgrounds."
          >
            Hybrid
          </span>
        )}
        <span className="ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {redactions.length} mark{redactions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-md border bg-slate-50/80 p-0.5">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setScale(scale - 0.25)} disabled={scale <= 0.5} aria-label="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[2.75rem] px-1 text-center text-xs font-medium text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setScale(scale + 0.25)} disabled={scale >= 3} aria-label="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" size="icon" className="h-9 w-9" onClick={undo} disabled={!canUndo()} aria-label="Undo">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={redo} disabled={!canRedo()} aria-label="Redo">
          <Redo2 className="h-4 w-4" />
        </Button>

        {redactions.length > 0 && (
          <Button variant="outline" size="sm" className="h-9 text-xs" onClick={autoDetectAllBoxes}>
            Auto-Detect
          </Button>
        )}

        {isHybridPdf && (
          <label
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50/80 px-2 text-xs text-violet-900"
            title="Flatten page to image before redacting (recommended for CVs)."
          >
            <input
              type="checkbox"
              checked={flattenBeforeRedact}
              onChange={(e) => setFlattenBeforeRedact(e.target.checked)}
              className="rounded border-violet-400"
            />
            Flatten
          </label>
        )}

        <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={reset}>
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">New file</span>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          className="h-9 min-w-0 flex-1 gap-1.5 sm:ml-auto sm:flex-initial"
          disabled={!redactions.length || isApplying || !pdfBytes}
          onClick={handleApply}
        >
          {isApplying && <Loader2 className="h-4 w-4 animate-spin" />}
          Apply Redactions
        </Button>
      </div>
    </div>
  );
}
