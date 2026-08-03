/** @type {import('next').NextConfig} */

/** Root-level blog slugs users/bots often request without /blog/ */
const blogRootRedirects = [
  "adobe-acrobat-redact-vs-free-alternatives",
  "auto-redact-pdf-pii-detection",
  "gdpr-pdf-redaction-checklist",
  "how-to-batch-redact-pdf",
  "how-to-black-out-text-in-pdf",
  "how-to-redact-bank-statement-pdf",
  "how-to-redact-medical-records-pdf-hipaa",
  "how-to-redact-pdf-for-court",
  "how-to-redact-pdf-online-free",
  "how-to-redact-pdf-without-adobe",
  "how-to-redact-scanned-pdf-ocr",
  "how-to-redact-ssn-from-pdf",
  "how-to-remove-text-from-pdf-permanently",
  "how-to-white-out-text-in-pdf",
  "redact-pdf-android",
  "redact-pdf-mac",
  "redact-pdf-on-iphone-guide",
  "redact-pdf-windows",
  "redactpdf-vs-ilovepdf",
  "ilovepdf-alternative-free-pdf-redaction",
  "edit-pdf-online-remove-text-free",
  "what-is-a-redacted-pdf",
  "why-blacking-out-pdf-is-not-safe",
  "how-to-redact-a-pdf-on-iphone-ipad",
  "how-to-redact-a-pdf-on-iphone",
].map((slug) => {
  const destSlug =
    slug === "how-to-redact-a-pdf-on-iphone-ipad" ||
    slug === "how-to-redact-a-pdf-on-iphone"
      ? "redact-pdf-on-iphone-guide"
      : slug;
  return {
    source: `/${slug}`,
    destination: `/blog/${destSlug}`,
    permanent: true,
  };
});

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Browser calls Railway directly; expose server env to client at build time.
  env: {
    NEXT_PUBLIC_REDACT_API_URL:
      process.env.NEXT_PUBLIC_REDACT_API_URL || process.env.REDACT_API_URL || "",
    NEXT_PUBLIC_REDACT_API_KEY:
      process.env.NEXT_PUBLIC_REDACT_API_KEY || process.env.REDACT_API_KEY || "",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/og-image.png",
        destination: "/opengraph-image",
        permanent: true,
      },
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/terms", destination: "/terms-of-service", permanent: true },
      { source: "/redact", destination: "/tool", permanent: true },
      { source: "/editor", destination: "/tool", permanent: true },
      { source: "/app", destination: "/tool", permanent: true },
      { source: "/ilovepdf", destination: "/blog/ilovepdf-alternative-free-pdf-redaction", permanent: true },
      { source: "/ilovepdf-alternative", destination: "/blog/ilovepdf-alternative-free-pdf-redaction", permanent: true },
      { source: "/pdf-editor", destination: "/blog/edit-pdf-online-remove-text-free", permanent: true },
      { source: "/edit-pdf", destination: "/blog/edit-pdf-online-remove-text-free", permanent: true },
      { source: "/redaction", destination: "/blog/what-is-a-redacted-pdf", permanent: true },
      { source: "/redacted", destination: "/blog/what-is-a-redacted-pdf", permanent: true },
      ...blogRootRedirects,
    ];
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
