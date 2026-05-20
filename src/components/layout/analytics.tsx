import Script from "next/script";

/** Plausible — set NEXT_PUBLIC_PLAUSIBLE_DOMAIN in Vercel. Omit script when unset. */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
