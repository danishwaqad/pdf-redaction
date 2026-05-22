import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://redactpdf.org";
export const SITE_NAME = "RedactPDF";

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Redact PDF Online Free - Hide Text in PDF Instantly | RedactPDF.org",
    template: "%s | RedactPDF.org",
  },
  description:
    "Free online PDF redaction tool. Black out text, images & sensitive data from PDF instantly. Secure processing, no file storage. Works in your browser.",
  keywords: [
    "redact pdf",
    "pdf redaction tool",
    "black out pdf text",
    "hide pdf data",
    "pdf editor online",
    "free pdf redactor",
    "redact pdf online free",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Redact PDF Online Free - RedactPDF.org",
    description: "Black out sensitive text from PDF in 2 clicks. Free & secure.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Redact PDF Online Free - RedactPDF.org",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Redact PDF Online Free - RedactPDF.org",
    description: "Black out sensitive text from PDF in 2 clicks. Free & secure.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
};

export const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RedactPDF",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free online tool to redact and black out text from PDF files securely in your browser.",
  url: SITE_URL,
};
