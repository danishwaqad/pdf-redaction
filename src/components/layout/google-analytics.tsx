"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  ANALYTICS_DISABLED_BY_BUILD,
  areAnalyticsDisabledForHostname,
  logAnalyticsDisabledInDev,
} from "@/lib/analytics-guards";

/** Google Analytics 4 — set NEXT_PUBLIC_GA_MEASUREMENT_ID (e.g. G-XXXXXXXXXX) in Vercel */
export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!gaId || gaId.includes("XXXX")) return;

    if (ANALYTICS_DISABLED_BY_BUILD) {
      logAnalyticsDisabledInDev();
      return;
    }

    if (areAnalyticsDisabledForHostname(window.location.hostname)) {
      logAnalyticsDisabledInDev();
      return;
    }

    setShouldLoad(true);
  }, [gaId]);

  if (!gaId || gaId.includes("XXXX") || !shouldLoad) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
