import { softwareApplicationJsonLd } from "@/lib/seo";

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(softwareApplicationJsonLd),
      }}
    />
  );
}
