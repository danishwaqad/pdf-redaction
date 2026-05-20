const faqs = [
  {
    q: "Is it really secure?",
    a: "Yes. RedactPDF runs entirely in your browser using WebAssembly and JavaScript. Your PDF is never sent to our servers — we have no backend file storage.",
  },
  {
    q: "What is the difference between redaction and blacking out?",
    a: "Blacking out with a drawing tool may leave text searchable underneath. RedactPDF rasterizes redacted pages so text cannot be copied, searched, or extracted.",
  },
  {
    q: "Is it legal for court documents?",
    a: "RedactPDF helps you remove visible content, but court rules vary by jurisdiction. Consult your legal team for compliance requirements before filing.",
  },
  {
    q: "Is RedactPDF GDPR compliant?",
    a: "Because files never leave your device, you remain the data controller. No personal data is processed on our servers during redaction.",
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
