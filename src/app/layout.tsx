import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { defaultMetadata } from "@/lib/seo";
import { PrivacyBanner } from "@/components/layout/privacy-banner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Analytics } from "@/components/layout/analytics";
import { JsonLd } from "@/components/layout/json-ld";
import { TooltipProvider } from "@/components/ui/tooltip";
// import { MonetagPopunder } from "@/components/layout/monetag-popunder";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  ...defaultMetadata,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Monetag disabled by owner. Uncomment to restore:
        <MonetagPopunder />
        */}
      </head>
      <body className={`${inter.variable} font-sans`}>
        <JsonLd />
        <TooltipProvider>
          <PrivacyBanner />
          <Header />
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
          <Footer />
        </TooltipProvider>
        <Analytics />
      </body>
    </html>
  );
}
