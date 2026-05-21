"use client";

import { useRedactionStore } from "@/store/redaction-store";
import { EditorWorkspace } from "@/components/app/editor-workspace";
import { PdfUploader } from "@/components/pdf/pdf-uploader";
import { Shield } from "lucide-react";

export function ToolClient() {
  const pdfDoc = useRedactionStore((s) => s.pdfDoc);
  const showRedactionWarning = useRedactionStore((s) => s.showRedactionWarning);
  const setShowRedactionWarning = useRedactionStore((s) => s.setShowRedactionWarning);

  if (!pdfDoc) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        {showRedactionWarning && (
          <div className="mb-6 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <Shield className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1">
              Download complete. Marked areas redacted; other text stays selectable.
            </p>
            <button
              type="button"
              className="shrink-0 text-xs underline"
              onClick={() => setShowRedactionWarning(false)}
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">PDF Redaction Tool</h1>
          <p className="mt-2 text-muted-foreground">
            No ads · No upload · Permanent redaction in your browser
          </p>
        </div>
        <PdfUploader variant="hero" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-6.5rem)] flex-col lg:min-h-[calc(100dvh-7rem)]">
      <EditorWorkspace />
    </div>
  );
}
