"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const MONETAG_LAST_LOAD_KEY = "monetag-popunder-last-load";
const MONETAG_LOAD_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function MonetagPopunder() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || pathname !== "/") {
      setShouldLoad(false);
      return;
    }

    try {
      const lastLoad = window.localStorage.getItem(MONETAG_LAST_LOAD_KEY);
      const isExpired =
        !lastLoad || Date.now() - Number(lastLoad) >= MONETAG_LOAD_INTERVAL_MS;

      setShouldLoad(isExpired);
    } catch {
      // If storage is unavailable, still allow the script to load once.
      setShouldLoad(true);
    }
  }, [isClient, pathname]);

  if (!isClient || pathname !== "/" || !shouldLoad) {
    return null;
  }

  // Monetag Popunder - PH Launch 26 May 2026 - 1/24h frequency
  return (
    <Script
      id="monetag-popunder"
      strategy="afterInteractive"
    >
      {`
        (function() {
          try {
            var target = [document.documentElement, document.body].filter(Boolean).pop();
            if (!target) return;

            var monetagScript = document.createElement('script');
            monetagScript.dataset.zone = '11056161';
            monetagScript.src = 'https://al5sm.com/tag.min.js';
            monetagScript.async = true;
            monetagScript.onload = function() {
              try {
                window.localStorage.setItem('${MONETAG_LAST_LOAD_KEY}', String(Date.now()));
              } catch (error) {
                console.warn('Monetag load timestamp could not be saved.', error);
              }
            };
            monetagScript.onerror = function() {
              console.warn('Monetag popunder failed to load.');
            };

            target.appendChild(monetagScript);
          } catch (error) {
            console.warn('Monetag popunder setup failed.', error);
          }
        })();
      `}
    </Script>
  );
}
