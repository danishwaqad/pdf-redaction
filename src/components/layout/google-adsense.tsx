"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  ADS_DISABLED_BY_BUILD,
  areAdsDisabledForHostname,
  logAdsDisabledInDev,
} from "@/lib/ad-guards";

/** Google AdSense — set NEXT_PUBLIC_ADSENSE_CLIENT_ID (ca-pub-...) after approval */
export function GoogleAdSense() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!clientId) return;

    if (ADS_DISABLED_BY_BUILD) {
      logAdsDisabledInDev();
      return;
    }

    if (areAdsDisabledForHostname(window.location.hostname)) {
      logAdsDisabledInDev();
      return;
    }

    setShouldLoad(true);
  }, [clientId]);

  if (!clientId || !shouldLoad) return null;

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
