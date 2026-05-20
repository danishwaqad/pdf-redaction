import type { Metadata } from "next";
import { ToolClient } from "@/components/app/tool-client";

export const metadata: Metadata = {
  title: "Redact PDF Tool — Free, No Upload, In Your Browser",
  description:
    "Open the RedactPDF editor: draw redaction boxes, search text, auto-detect PII, and download permanently redacted PDFs. 100% client-side.",
  robots: { index: true, follow: true },
};

export default function ToolPage() {
  return <ToolClient />;
}
