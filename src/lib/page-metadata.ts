import type { Metadata } from "next";
import { clampSeoDescription, clampSeoTitle } from "@/lib/seo-limits";

type PageMetadataOptions = {
  openGraph?: Metadata["openGraph"];
  twitter?: Metadata["twitter"];
};

/** SEO-safe metadata — absolute title (no layout suffix), clamped lengths */
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  options?: PageMetadataOptions
): Metadata {
  const safeTitle = clampSeoTitle(title);
  const safeDescription = clampSeoDescription(description);

  return {
    title: { absolute: safeTitle },
    description: safeDescription,
    alternates: { canonical: path },
    openGraph: {
      title: safeTitle,
      description: safeDescription,
      ...options?.openGraph,
    },
    twitter: {
      title: safeTitle,
      description: safeDescription,
      ...options?.twitter,
    },
  };
}
