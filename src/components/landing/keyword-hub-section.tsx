import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const cards = [
  {
    title: "iLovePDF alternative — free & no file storage",
    body: "Searching ilovepdf for redaction? RedactPDF is 100% free, does not keep your personal PDF in a cloud inbox, and removes text permanently — not just black boxes.",
    href: "/blog/ilovepdf-alternative-free-pdf-redaction",
    cta: "iLovePDF alternative guide",
  },
  {
    title: "Edit PDF online free — remove sensitive text",
    body: "When edit pdf means delete or black out confidential lines — not add pages — use our free online redaction tool. No Adobe, no signup.",
    href: "/blog/edit-pdf-online-remove-text-free",
    cta: "Edit PDF to redact",
  },
  {
    title: "Redacted PDF — what redaction means",
    body: "Redacted, redaction, redact: learn the difference between real removal and unsafe blackout, then redact documents free in your browser.",
    href: "/blog/what-is-a-redacted-pdf",
    cta: "What is a redacted PDF?",
  },
];

export function KeywordHubSection() {
  return (
    <section className="border-t bg-muted/30 py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-col items-center text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5" />
            Free · No stored personal files · Permanent redaction
          </span>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Free PDF redaction — better privacy than upload-first editors
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            People search for ilovepdf, pdf editor, and edit pdf when they need to remove confidential
            text. RedactPDF is built for that job only — not merge or compress — with no standing
            storage of your records.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.href}
              className="flex flex-col rounded-2xl border bg-white p-6 shadow-card"
            >
              <h3 className="text-lg font-semibold leading-snug">{card.title}</h3>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{card.body}</p>
              <Link
                href={card.href}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
              >
                {card.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button asChild size="lg">
            <Link href="/tool">
              Redact PDF free now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
