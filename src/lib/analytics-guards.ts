export const ANALYTICS_DISABLED_BY_BUILD =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_DISABLE_ANALYTICS === "true";

const LOCAL_ANALYTICS_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

export function areAnalyticsDisabledForHostname(hostname: string) {
  return LOCAL_ANALYTICS_HOSTNAMES.has(hostname);
}

export function logAnalyticsDisabledInDev() {
  console.log("Analytics disabled in dev");
}
