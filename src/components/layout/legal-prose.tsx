import { cn } from "@/lib/utils";

const proseBody = cn(
  "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
  "[&_h2]:mt-10 [&_h2]:scroll-mt-24 [&_h2]:border-b [&_h2]:border-slate-200 [&_h2]:pb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground sm:[&_h2]:text-2xl",
  "[&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground",
  "[&_p]:mb-4 [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-slate-600",
  "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:text-slate-600",
  "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ol]:text-slate-600",
  "[&_li]:leading-relaxed",
  "[&_strong]:font-semibold [&_strong]:text-foreground",
  "[&_a]:font-medium [&_a]:text-brand [&_a]:underline-offset-2 hover:[&_a]:underline",
  "[&_.not-prose_a]:!text-primary-foreground [&_.not-prose_a]:hover:!text-primary-foreground [&_.not-prose_a]:no-underline hover:[&_.not-prose_a]:no-underline"
);

export function LegalProse({
  children,
  className,
  /** Inside ContentWithAds — skip outer page shell */
  embedded = false,
}: {
  children: React.ReactNode;
  className?: string;
  embedded?: boolean;
}) {
  if (embedded) {
    return <div className={cn(proseBody, className)}>{children}</div>;
  }

  return (
    <section className="border-t border-slate-100 bg-white">
      <div
        className={cn(
          "mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8",
          className
        )}
      >
        <div className={proseBody}>{children}</div>
      </div>
    </section>
  );
}
