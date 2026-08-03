import { REDACTION_DATA_FLOW } from "@/lib/site-messaging";

const faqs = [
  {
    q: "Is it really secure?",
    a: `Yes. You mark redactions in your browser. ${REDACTION_DATA_FLOW} We do not keep a cloud copy of your PDF.`,
  },
  {
    q: "What is the difference between redaction and blacking out?",
    a: "RedactPDF removes extractable text inside your boxes and burns in black fills on export. Other text on the page stays searchable. Hybrid PDFs (text + images) can use secure mode for image-heavy pages.",
  },
  {
    q: "Is it legal for court documents?",
    a: "RedactPDF helps you remove visible content, but court rules vary by jurisdiction. Consult your legal team for compliance requirements before filing.",
  },
  {
    q: "Is RedactPDF better than iLovePDF for redaction?",
    a: "iLovePDF is great for merge, split, and compress. For permanent redaction of personal data, RedactPDF is free, does not store your PDF in a cloud inbox, and removes extractable text — not just black shapes. See our iLovePDF alternative guide.",
  },
  {
    q: "Can I edit a PDF online free to remove text?",
    a: "Yes — when edit PDF means delete or redact sensitive content, not add new pages. RedactPDF is a free browser tool for permanent text removal with no signup.",
  },
];

export function FaqSection() {
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
    <section id="faq" className="border-t bg-white py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-2xl font-bold">Frequently asked questions</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          <a href="/faq" className="font-medium text-brand hover:underline">
            View all FAQs →
          </a>
        </p>
        <dl className="mt-8 space-y-6">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="text-lg font-semibold">{f.q}</dt>
              <dd className="mt-2 text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
