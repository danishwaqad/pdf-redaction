"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { FileText, LayoutGrid, Search, Shield } from "lucide-react";
import { PageThumbnails } from "@/components/pdf/page-thumbnails";
import { RedactionToolbar } from "@/components/pdf/redaction-toolbar";
import { TextSearchPanel } from "@/components/pdf/text-search-panel";
import { PatternDetectPanel } from "@/components/pdf/pattern-detect-panel";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PdfViewer = dynamic(
  () => import("@/components/pdf/pdf-viewer").then((m) => m.PdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Loading viewer…
      </div>
    ),
  }
);

export function EditorWorkspace() {
  const [mobileTab, setMobileTab] = useState("document");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <RedactionToolbar />

      {/* Desktop: sidebars + viewer */}
      <div className="hidden min-h-0 flex-1 lg:flex">
        <PageThumbnails />
        <PdfViewer />
        <aside className="w-64 shrink-0 border-l bg-white">
          <ScrollArea className="h-full">
            <div className="space-y-6 p-4">
              <TextSearchPanel />
              <Separator />
              <PatternDetectPanel />
            </div>
          </ScrollArea>
        </aside>
      </div>

      {/* Mobile: tabs — PDF gets full height by default */}
      <Tabs
        value={mobileTab}
        onValueChange={setMobileTab}
        className="flex min-h-0 flex-1 flex-col lg:hidden"
      >
        <TabsList className="mx-2 mt-2 grid h-11 shrink-0 grid-cols-4 gap-1 bg-muted p-1">
          <TabsTrigger value="document" className="gap-1.5 text-xs sm:text-sm">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            PDF
          </TabsTrigger>
          <TabsTrigger value="pages" className="gap-1.5 text-xs sm:text-sm">
            <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-1.5 text-xs sm:text-sm">
            <Search className="h-3.5 w-3.5 shrink-0" />
            Search
          </TabsTrigger>
          <TabsTrigger value="pii" className="gap-1.5 text-xs sm:text-sm">
            <Shield className="h-3.5 w-3.5 shrink-0" />
            PII
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="document"
          className="mt-0 min-h-0 flex-1 focus-visible:outline-none data-[state=active]:flex data-[state=active]:flex-col"
        >
          <PdfViewer />
        </TabsContent>

        <TabsContent value="pages" className="mt-0 min-h-0 flex-1 overflow-auto p-3 focus-visible:outline-none">
          <p className="mb-3 text-xs text-muted-foreground">
            Tap a page to edit. Draw redaction boxes on the PDF tab.
          </p>
          <PageThumbnails orientation="horizontal" />
        </TabsContent>

        <TabsContent value="search" className="mt-0 overflow-auto p-4 focus-visible:outline-none">
          <TextSearchPanel />
        </TabsContent>

        <TabsContent value="pii" className="mt-0 overflow-auto p-4 focus-visible:outline-none">
          <PatternDetectPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
