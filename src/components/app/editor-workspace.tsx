"use client";

import dynamic from "next/dynamic";
import { PageThumbnails } from "@/components/pdf/page-thumbnails";
import { RedactionToolbar } from "@/components/pdf/redaction-toolbar";
import { TextSearchPanel } from "@/components/pdf/text-search-panel";
import { PatternDetectPanel } from "@/components/pdf/pattern-detect-panel";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const PdfViewer = dynamic(
  () => import("@/components/pdf/pdf-viewer").then((m) => m.PdfViewer),
  { ssr: false, loading: () => <div className="flex flex-1 items-center justify-center p-8">Loading viewer…</div> }
);

export function EditorWorkspace() {
  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <RedactionToolbar />
      <div className="border-b bg-white p-3 lg:hidden">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextSearchPanel />
          <PatternDetectPanel />
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <PageThumbnails />
        <PdfViewer />
        <aside className="hidden w-64 shrink-0 border-l bg-white lg:block">
          <ScrollArea className="h-full">
            <div className="space-y-6 p-4">
              <TextSearchPanel />
              <Separator />
              <PatternDetectPanel />
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
