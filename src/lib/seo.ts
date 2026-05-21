import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://redactpdf.io";
export const SITE_NAME = "RedactPDF";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Redact PDF Online — Free, No Signup | RedactPDF",
    template: "%s | RedactPDF",
  },
  description:
    "Mark redactions in your browser, apply permanent removal securely. Free PDF redaction — no signup, no file storage. Adobe Acrobat alternative.",
  keywords: [
    "redact pdf online free",
    "black out text pdf permanently",
    "pdf redaction tool",
    "GDPR pdf redaction",
    "adobe redact alternative",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Redact PDF Free — No Signup",
    description:
      "Permanent PDF redaction in the browser. Secure apply via HTTPS; we do not store your files.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Redact PDF Free" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Redact PDF Online — Free & Private",
    description:
      "Mark locally, apply securely. HTTPS processing only — no file storage.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};
