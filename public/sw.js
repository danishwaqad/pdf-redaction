/*
Previous Monetag service worker implementation intentionally kept commented out.

const DEV_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);
const BLOCKED_AD_HOSTNAMES = new Set([
  "3nbf4.com",
  "al5sm.com",
  "pagead2.googlesyndication.com",
]);

const adsDisabledInDev = DEV_HOSTNAMES.has(self.location.hostname);

if (adsDisabledInDev) {
  console.log("Ads disabled in dev");

  self.addEventListener("fetch", (event) => {
    const requestUrl = new URL(event.request.url);
    if (BLOCKED_AD_HOSTNAMES.has(requestUrl.hostname)) {
      event.respondWith(new Response("", { status: 204 }));
    }
  });
} else {
  self.options = {
    domain: "3nbf4.com",
    zoneId: 11055976,
  };
  self.lary = "";
  importScripts("https://3nbf4.com/act/files/service-worker.min.js?r=sw");
}
*/

// Monetag disabled by site owner.
// This placeholder service worker intentionally does nothing.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
