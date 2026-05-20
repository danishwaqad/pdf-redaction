"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/tool", label: "Redact Tool" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const pathname = usePathname();
  const isTool = pathname === "/tool";

  return (
    <header
      className={cn(
        "sticky top-[41px] z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80",
        isTool && "border-brand/20"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
            <Shield className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">RedactPDF</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-accent text-brand"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {!isTool ? (
          <Button asChild size="sm" className="shrink-0 shadow-sm">
            <Link href="/tool">Redact PDF Free</Link>
          </Button>
        ) : (
          <span className="shrink-0 text-xs font-medium text-muted-foreground sm:text-sm">
            Editor
          </span>
        )}
      </div>
    </header>
  );
}
