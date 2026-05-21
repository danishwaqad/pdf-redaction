import type { Metadata } from "next";
import { ToolClient } from "@/components/app/tool-client";

export const metadata: Metadata = {
  title: "Redact PDF Tool — Free, No Signup",
  description:
    "Mark redactions in your browser. Apply permanent removal securely (HTTPS, not stored). Search, PII detect, certificate download.",
  robots: { index: true, follow: true },
};

export default function ToolPage() {
  return <ToolClient />;
}
