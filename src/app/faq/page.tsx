import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { REDACTION_DATA_FLOW } from "@/lib/site-messaging";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "FAQ — Redact PDF Online Free, Secure & Permanent",
  "Answers about PDF redaction, security, GDPR, court filings, and how RedactPDF works.",
  "/faq"
);

const faqs = [
  {
    q: "Does my PDF upload to your servers?",
    a: `You open and mark files in your browser. ${REDACTION_DATA_FLOW} Contact form messages are separate and do not include your PDF.`,
  },
  {
    q: "What is the difference between redaction and blacking out?",
    a: "Redaction permanently removes extractable text from the PDF content stream. Black boxes in the editor are preview only; the downloaded file has blank gaps where text was deleted—not cosmetic overlays.",
  },
  {
    q: "Is it legal to use for court documents?",
    a: "Many courts accept properly redacted PDFs regardless of tool. Rules vary — verify with your attorney and run search/copy tests before filing.",
  },
  {
    q: "Is RedactPDF GDPR compliant?",
    a: "We do not store PDFs after redaction. Transient processing over HTTPS supports data minimization. You remain responsible for lawful basis, verification, and any onward transfer of the redacted file.",
  },
  {
    q: "Are there ads on the redaction tool?",
    a: "No. Ads appear only on blog and about pages. The /tool page is ad-free.",
  },
  {
    q: "What is the maximum file size?",
    a: "100 MB to open in the editor. Large files may be slower on Apply; production hosting may limit request size (see Privacy Policy).",
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
        subtitle="Security, legal context, and how our free PDF redaction works."
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
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
