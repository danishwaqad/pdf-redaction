"use client";

import { useEffect, useState } from "react";
import {
  ADS_DISABLED_BY_BUILD,
  areAdsDisabledForHostname,
  logAdsDisabledInDev,
} from "@/lib/ad-guards";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

type AdVariant = "sidebar" | "banner";
type AdPosition = "left" | "right";

interface AdSenseSlotProps {
  className?: string;
  variant?: AdVariant;
  position?: AdPosition;
}

/** Google AdSense — set NEXT_PUBLIC_ADSENSE_CLIENT_ID; paste ad unit attrs after approval */
export function AdSenseSlot({
  className,
  variant = "sidebar",
  position = "right",
}: AdSenseSlotProps) {
  const [adsAllowed, setAdsAllowed] = useState(false);
  const id = variant === "sidebar" ? `adsense-sidebar-${position}` : "adsense-mobile-banner";
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const slotId =
    variant === "sidebar"
      ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR
      : process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER;
  const hasAdConfig = Boolean(clientId && slotId);
  const showLiveAd = hasAdConfig && adsAllowed;

  useEffect(() => {
    if (!hasAdConfig) return;

    if (ADS_DISABLED_BY_BUILD) {
      logAdsDisabledInDev();
      setAdsAllowed(false);
      return;
    }

    if (areAdsDisabledForHostname(window.location.hostname)) {
      logAdsDisabledInDev();
      setAdsAllowed(false);
      return;
    }

    setAdsAllowed(true);
  }, [hasAdConfig]);

  useEffect(() => {
    if (!showLiveAd) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      /* ignore */
    }
  }, [showLiveAd]);

  if (variant === "sidebar") {
    return (
      <div id={id} className={cn("w-full", className)} role="complementary" aria-label="Advertisement">
        {showLiveAd ? (
          <ins
            className="adsbygoogle block min-h-[280px] w-full max-w-[160px] rounded-lg border border-slate-200/80 bg-white"
            style={{ display: "block" }}
            data-ad-client={clientId}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="false"
          />
        ) : (
          <div className="flex min-h-[280px] w-full max-w-[160px] flex-col items-center justify-center rounded-lg border border-slate-200/80 bg-white px-2 py-6 text-center shadow-sm">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Ad
            </span>
            <p className="mt-3 text-[11px] leading-snug text-slate-400">
              Sidebar · {position}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id={id} className={cn("w-full", className)} role="complementary" aria-label="Advertisement">
      {showLiveAd ? (
        <ins
          className="adsbygoogle block min-h-[90px] w-full rounded-lg border border-slate-200/80 bg-white"
          style={{ display: "block" }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="flex min-h-[90px] items-center justify-center rounded-lg border border-slate-200/80 bg-white px-4 py-4 text-center shadow-sm">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Advertisement
          </span>
        </div>
      )}
    </div>
  );
}
