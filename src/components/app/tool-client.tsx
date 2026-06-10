"use client";

import { useRedactionStore } from "@/store/redaction-store";
import { EditorWorkspace } from "@/components/app/editor-workspace";
import { PdfUploader } from "@/components/pdf/pdf-uploader";
import { Shield } from "lucide-react";
import { TOOL_TAGLINE } from "@/lib/site-messaging";

export function ToolClient() {
  const pdfDoc = useRedactionStore((s) => s.pdfDoc);

  if (!pdfDoc) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">Redact PDF Online Free</h1>
          <p className="mt-2 text-muted-foreground">{TOOL_TAGLINE}</p>
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
