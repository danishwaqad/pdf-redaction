import { cn } from "@/lib/utils";

type AdVariant = "sidebar" | "banner";
type AdPosition = "left" | "right";

interface AdSenseSlotProps {
  className?: string;
  variant?: AdVariant;
  position?: AdPosition;
}

/** Google AdSense — paste your ad unit script inside the marked div after approval. */
export function AdSenseSlot({
  className,
  variant = "sidebar",
  position = "right",
}: AdSenseSlotProps) {
  const id = variant === "sidebar" ? `adsense-sidebar-${position}` : "adsense-mobile-banner";

  if (variant === "sidebar") {
    return (
      <div id={id} className={cn("w-full", className)} role="complementary" aria-label="Advertisement">
        <div className="flex min-h-[280px] w-full max-w-[160px] flex-col items-center justify-center rounded-lg border border-slate-200/80 bg-white px-2 py-6 text-center shadow-sm">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Ad
          </span>
          <p className="mt-3 text-[11px] leading-snug text-slate-400">
            Sidebar · {position}
          </p>
          {/* <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client="..." /> */}
        </div>
      </div>
    );
  }

  return (
    <div id={id} className={cn("w-full", className)} role="complementary" aria-label="Advertisement">
      <div className="flex min-h-[90px] items-center justify-center rounded-lg border border-slate-200/80 bg-white px-4 py-4 text-center shadow-sm">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          Advertisement
        </span>
      </div>
    </div>
  );
}
