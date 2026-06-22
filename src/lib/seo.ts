import type { Metadata } from "next";

/** Browser/metadata base — may be localhost in local .env */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://redactpdf.org";

/** Always use for sitemap.xml & robots.txt (never localhost) */
export const PRODUCTION_SITE_URL = "https://redactpdf.org";

/** Canonical / OG base — production never uses localhost even if .env is wrong */
export const CANONICAL_SITE_URL =
  process.env.NODE_ENV === "production" &&
  (!process.env.NEXT_PUBLIC_SITE_URL ||
    /localhost|127\.0\.0\.1/i.test(process.env.NEXT_PUBLIC_SITE_URL))
    ? PRODUCTION_SITE_URL
    : (process.env.NEXT_PUBLIC_SITE_URL ?? PRODUCTION_SITE_URL);

export const SITE_NAME = "RedactPDF";

/** Bing/Google SERP snippet — keep 25–160 characters */
export const SITE_DESCRIPTION =
  "Free PDF redaction online. Permanently remove text — not black boxes. Auto-detect PII, OCR for scans. No signup. Secure HTTPS, files not stored.";

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingVerification =
  process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ??
  "806FC035850D34AB87D08A7936488264";

function siteVerification(): Metadata["verification"] | undefined {
  const verification: NonNullable<Metadata["verification"]> = {};
  if (googleVerification) verification.google = googleVerification;
  if (bingVerification) {
    verification.other = { "msvalidate.01": bingVerification };
  }
  return Object.keys(verification).length > 0 ? verification : undefined;
}
//bing verification meta is required for Bing Webmaster Tools to verify site ownership, so we provide a default value to ensure it works even if the environment variable is not set.
const verificationMeta = siteVerification();

export const defaultMetadata: Metadata = {
  metadataBase: new URL(CANONICAL_SITE_URL),
  title: {
    default:
      "Redact PDF Online Free — Remove Text Permanently | No Adobe",
    template: "%s | RedactPDF.org",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "redact pdf",
    "redact pdf online",
    "redact pdf online free",
    "redact pdf free",
    "redact pdf without adobe",
    "remove text from pdf",
    "delete text from pdf",
    "black out text in pdf",
    "pdf redaction tool free",
    "adobe acrobat redact alternative",
    "auto redact pdf",
    "permanent pdf redaction",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: CANONICAL_SITE_URL,
    siteName: SITE_NAME,
    title: "Redact PDF Online Free — Remove Text Permanently | No Adobe",
    description: SITE_DESCRIPTION,
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
    title: "Redact PDF Online Free — Remove Text Permanently | No Adobe",
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: CANONICAL_SITE_URL },
  ...(verificationMeta ? { verification: verificationMeta } : {}),
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
    "Free online tool to permanently remove text from PDF files. No Adobe, no signup. Auto-detect PII and secure redaction in your browser.",
  url: PRODUCTION_SITE_URL,
};
