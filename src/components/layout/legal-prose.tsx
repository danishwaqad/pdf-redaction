import { cn } from "@/lib/utils";

export function LegalProse({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-slate max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}
