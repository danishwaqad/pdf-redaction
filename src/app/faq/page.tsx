import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "FAQ — Redact PDF Online Free, Secure & Permanent",
  "Answers about browser-only PDF redaction, security, GDPR, court filings, and how RedactPDF differs from black boxes.",
  "/faq"
);

const faqs = [
  {
    q: "Is RedactPDF really secure? Does my PDF upload to your servers?",
    a: "No upload ever occurs. Redaction runs 100% in your browser. When you close the tab, we never had your file.",
  },
  {
    q: "What is the difference between redaction and blacking out?",
    a: "Redaction permanently removes extractable text (we rasterize marked pages). Black boxes often leave searchable text underneath.",
  },
  {
    q: "Is it legal to use for court documents?",
    a: "Many courts accept properly redacted PDFs regardless of tool. Rules vary — verify with your attorney and run search/copy tests before filing.",
  },
  {
    q: "Is RedactPDF GDPR compliant?",
    a: "We do not process PDFs on our servers, supporting data minimization. You remain responsible for lawful basis and verification.",
  },
  {
    q: "Are there ads on the redaction tool?",
    a: "No. Ads appear only on blog and about pages. The /tool page is ad-free.",
  },
  {
    q: "What is the maximum file size?",
    a: "100 MB per PDF in current versions.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHero
        badge="Help"
        title="Frequently Asked Questions"
        subtitle="Security, legal context, and how our free browser redaction works."
      />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <dl className="space-y-8">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-xl border bg-white p-6 shadow-card">
              <dt className="text-lg font-semibold text-foreground">{f.q}</dt>
              <dd className="mt-3 leading-relaxed text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          More detail in our{" "}
          <Link href="/blog" className="text-brand hover:underline">
            blog guides
          </Link>{" "}
          or <Link href="/contact" className="text-brand hover:underline">contact us</Link>.
        </p>
      </div>
    </>
  );
}
