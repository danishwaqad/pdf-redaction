import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BlogCta() {
  return (
    <div className="not-prose my-12 rounded-2xl border border-brand/20 bg-gradient-to-br from-accent to-white p-8 shadow-card">
      <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
          <Shield className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground">Redact your PDF free — no upload</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Permanent browser-only redaction. No signup. Your file never leaves your device.
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link href="/tool">Open RedactPDF Tool</Link>
        </Button>
      </div>
    </div>
  );
}
