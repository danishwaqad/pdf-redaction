export const ADS_DISABLED_BY_BUILD =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_DISABLE_ADS === "true";

const LOCAL_AD_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

export function areAdsDisabledForHostname(hostname: string) {
  return LOCAL_AD_HOSTNAMES.has(hostname);
}

export function logAdsDisabledInDev() {
  console.log("Ads disabled in dev");
}
