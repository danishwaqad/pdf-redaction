import { AdSenseSlot } from "@/components/layout/adsense-slot";

/**
 * Content + side rails for AdSense (blog & about only).
 * Desktop: sticky left/right skyscrapers — content stays centered, hero flow intact.
 * Mobile: no ads between hero and body; optional compact banner after content only.
 */
export function ContentWithAds({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-12">
        <div className="flex items-start justify-center gap-6 lg:gap-8">
          <aside
            className="hidden shrink-0 lg:block lg:w-36 xl:w-40"
            aria-label="Left advertisement"
          >
            <div className="sticky top-32">
              <AdSenseSlot variant="sidebar" position="left" />
            </div>
          </aside>

          <div className="min-w-0 w-full max-w-3xl flex-1">{children}</div>

          <aside
            className="hidden shrink-0 lg:block lg:w-36 xl:w-40"
            aria-label="Right advertisement"
          >
            <div className="sticky top-32">
              <AdSenseSlot variant="sidebar" position="right" />
            </div>
          </aside>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-10 lg:hidden">
        <AdSenseSlot variant="banner" />
      </div>
    </>
  );
}
