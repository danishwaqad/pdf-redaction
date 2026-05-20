import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://redactpdf.io";
export const SITE_NAME = "RedactPDF";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Redact PDF Online — Free, No Signup, No Upload | RedactPDF",
    template: "%s | RedactPDF",
  },
  description:
    "Permanently black out text from PDF in your browser. Free pdf redaction tool with no upload — the secure Adobe Acrobat alternative. GDPR-friendly, HIPAA-ready workflow.",
  keywords: [
    "redact pdf online free",
    "black out text pdf permanently",
    "pdf redaction tool no upload",
    "GDPR pdf redaction",
    "HIPAA compliant redact",
    "redact credit card pdf",
    "adobe redact alternative",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Redact PDF Free — No Upload, Browser-Only",
    description:
      "Permanently redact PDFs in your browser. No signup, no server upload.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Redact PDF Free" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Redact PDF Online — Free & Private",
    description: "Browser-only PDF redaction. Your files never leave your device.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};
