"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@/components/layout/google-analytics";
import { GoogleAdSense } from "@/components/layout/google-adsense";
import { ADS_DISABLED_BY_BUILD } from "@/lib/ad-guards";
import {
  ANALYTICS_DISABLED_BY_BUILD,
  areAnalyticsDisabledForHostname,
  logAnalyticsDisabledInDev,
} from "@/lib/analytics-guards";
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
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    if (ANALYTICS_DISABLED_BY_BUILD) {
      logAnalyticsDisabledInDev();
      setAnalyticsAllowed(false);
      return;
    }

    if (areAnalyticsDisabledForHostname(window.location.hostname)) {
      logAnalyticsDisabledInDev();
      setAnalyticsAllowed(false);
      return;
    }

    setAnalyticsAllowed(true);
  }, []);

  return (
    <>
      {analyticsAllowed ? <GoogleAnalytics /> : null}
      {!ADS_DISABLED_BY_BUILD ? <GoogleAdSense /> : null}
      {analyticsAllowed ? <PlausibleAnalytics /> : null}
    </>
  );
}
