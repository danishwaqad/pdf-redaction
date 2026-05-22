import { GoogleAnalytics } from "@/components/layout/google-analytics";
import { GoogleAdSense } from "@/components/layout/google-adsense";
import Script from "next/script";

/** Plausible — optional; set NEXT_PUBLIC_PLAUSIBLE_DOMAIN */
function PlausibleAnalytics() {
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

export function Analytics() {
  return (
    <>
      <GoogleAnalytics />
      <GoogleAdSense />
      <PlausibleAnalytics />
    </>
  );
}
