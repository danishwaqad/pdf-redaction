/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Browser calls Railway directly; expose server env to client at build time.
  env: {
    NEXT_PUBLIC_REDACT_API_URL:
      process.env.NEXT_PUBLIC_REDACT_API_URL || process.env.REDACT_API_URL || "",
    NEXT_PUBLIC_REDACT_API_KEY:
      process.env.NEXT_PUBLIC_REDACT_API_KEY || process.env.REDACT_API_KEY || "",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/og-image.png",
        destination: "/opengraph-image",
        permanent: true,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
