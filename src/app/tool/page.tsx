import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BadgeHelp, CheckCircle2, FileText, Scale, ShieldCheck, Users } from "lucide-react";
import { ToolClient } from "@/components/app/tool-client";
import { Button } from "@/components/ui/button";
import { PRODUCTION_SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

const TOOL_URL = `${PRODUCTION_SITE_URL}/tool`;

const faqItems = [
  {
    question: "Is RedactPDF free to use?",
    answer:
      "Yes. You can open a PDF, mark redactions, and use the tool without creating an account. The goal is to keep simple PDF redaction fast and accessible for people who need to remove sensitive information quickly.",
  },
  {
    question: "Is RedactPDF secure?",
    answer:
      "Yes. Marking and review happen in your browser. When you apply permanent redaction, the file is sent over HTTPS for processing and returned. RedactPDF is designed around data minimization and does not rely on a stored cloud inbox for routine use.",
  },
  {
    question: "What is the maximum PDF file size?",
    answer:
      "The current interface is designed for files up to 100 MB. Large PDFs may take longer to open depending on your device, browser memory, and connection speed.",
  },
  {
    question: "Is PDF redaction legal for court documents?",
    answer:
      "Redaction is commonly used for court filings, productions, and exhibits, but court rules vary by jurisdiction. Always verify the final document, confirm local filing requirements, and follow your legal team's procedures before submission.",
  },
  {
    question: "Is RedactPDF GDPR compliant?",
    answer:
      "The tool is built to support privacy-focused workflows by minimizing storage and helping teams remove personal data before sharing documents. You remain the data controller and should review your own legal and compliance obligations before distribution.",
  },
  {
    question: "What is the difference between redaction and using a black marker?",
    answer:
      "A visual black box can hide text on screen while leaving the underlying text layer extractable. Proper redaction permanently removes the sensitive text or image content from the document so it cannot be copied, searched, or recovered in a normal workflow.",
  },
  {
    question: "Can I redact images as well as text?",
    answer:
      "Yes. Redaction can be used for visible content such as names, faces, signatures, account numbers, charts, screenshots, and image regions that should not appear in the final PDF.",
  },
  {
    question: "Does the tool work on mobile?",
    answer:
      "Yes. RedactPDF works in modern mobile browsers, including Safari on iPhone and iPad. For large or heavily scanned PDFs, desktop browsers may still provide a faster review experience.",
  },
] as const;

const metadataKeywords = [
  "free pdf redaction tool",
  "redact pdf online",
  "remove sensitive data from pdf",
  "pdf metadata removal",
  "court compliant pdf redaction",
  "gdpr pdf redaction",
  "black out pdf text safely",
  "browser based pdf redactor",
  "redact images in pdf",
  "secure pdf redaction",
];

const featureHighlights = [
  {
    title: "No signup required",
    description:
      "Open the tool and start working immediately without creating an account before you can clean a document.",
  },
  {
    title: "Browser-based review",
    description:
      "Inspect pages, mark redactions, and validate what needs to be removed in a fast browser workflow.",
  },
  {
    title: "Metadata removal mindset",
    description:
      "A good redaction process looks beyond visible text and considers the hidden document information you should not share.",
  },
  {
    title: "Batch-friendly workflow",
    description:
      "Repeatable steps make it easier to clean multiple records, exhibits, or responses under deadline pressure.",
  },
  {
    title: "OCR-friendly use cases",
    description:
      "Useful for mixed PDFs that combine selectable text, scans, screenshots, and image-heavy pages.",
  },
  {
    title: "Court-compliant process support",
    description:
      "Built around permanent removal instead of cosmetic cover-up, which is the correct mindset for regulated documents.",
  },
] as const;

const userGroups = [
  {
    title: "Lawyers and Legal Teams",
    icon: Scale,
    body:
      "Legal professionals regularly redact pleadings, exhibits, discovery responses, contracts, witness statements, due diligence packets, and expert reports. Sensitive information may include minors' names, financial account numbers, medical details, signatures, home addresses, trade secrets, or privileged content. A legal team needs a redaction tool that supports permanent removal rather than a visual black overlay. That is especially important when filing documents in court, sharing productions with opposing counsel, or preparing public-facing case materials. RedactPDF helps legal teams move quickly while keeping the emphasis on review, permanent removal, and final verification.",
  },
  {
    title: "HR and Internal People Operations",
    icon: Users,
    body:
      "Human resources teams often handle resumes, disciplinary records, compensation summaries, investigation notes, payroll attachments, background documents, and internal reports that include personally identifiable information. When documents are shared with managers, external counsel, auditors, or vendors, unnecessary personal details should be removed first. A browser-based PDF redaction workflow is useful here because it reduces training friction and helps HR teams sanitize documents without learning a full design or publishing suite. For hiring, employee-relations, and audit work, this can save time while lowering exposure.",
  },
  {
    title: "Healthcare and Clinical Operations",
    icon: ShieldCheck,
    body:
      "Clinics, healthcare administrators, insurers, and medical-legal teams often need to redact protected health information before sharing records outside the treatment or billing context. That may include names, dates of birth, policy numbers, lab references, chart excerpts, or image annotations. A good redaction process is a practical support layer for privacy obligations because it helps teams remove patient identifiers before a document leaves the original environment. RedactPDF is useful for preparing summaries, second-opinion packets, research materials, and external documentation where confidentiality is non-negotiable.",
  },
  {
    title: "GDPR and Privacy Compliance Teams",
    icon: CheckCircle2,
    body:
      "Compliance officers and privacy teams are often asked to share documents while minimizing exposure to personal data. This can include customer service records, vendor contracts, complaint files, data subject response materials, internal audit reports, or screenshots captured during investigations. GDPR-minded teams care about data minimization, access control, and secure disclosure, which means PDF redaction should be deliberate and repeatable. A tool focused on permanent removal helps teams avoid accidental leaks that can happen when files are blacked out visually but remain machine-readable underneath.",
  },
  {
    title: "Journalists, Researchers, and Investigators",
    icon: FileText,
    body:
      "Reporters, nonprofit researchers, watchdog organizations, and internal investigators often work with source documents that contain whistleblower details, contact information, addresses, signatures, minor names, or identifying metadata. In those situations, redaction protects people, not just paperwork. A practical PDF redaction tool helps publish responsibly by removing identifying details while preserving the public-interest substance of the document. For investigative reporting and evidence review, that distinction is essential.",
  },
] as const;

const relatedGuides = [
  {
    href: "/blog/how-to-redact-pdf-for-court",
    title: "How to Redact a PDF for Court",
    description: "Court filing workflow, verification steps, and mistakes that can expose hidden text.",
  },
  {
    href: "/blog/gdpr-pdf-redaction-checklist",
    title: "GDPR PDF Redaction Checklist",
    description: "A practical checklist for removing personal data before sharing regulated documents.",
  },
  {
    href: "/blog/why-blacking-out-pdf-is-not-safe",
    title: "Why Blacking Out a PDF Is Not Safe",
    description: "Understand why cosmetic black boxes fail and why permanent removal matters.",
  },
] as const;

const toolJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RedactPDF Tool",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web Browser",
  url: TOOL_URL,
  description:
    "Free PDF redaction tool for permanently removing text, images, and sensitive data from PDF files online without signup.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Permanent PDF redaction",
    "No signup required",
    "Browser-based review",
    "PII search and detection",
    "Certificate download",
    "Mobile browser support",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export const metadata: Metadata = {
  title: {
    absolute:
      "Free PDF Redaction Tool - Permanently Remove Sensitive Data Online | RedactPDF",
  },
  description:
    "Redact text, images & metadata from PDFs online. No signup, no storage. GDPR & court compliant. Browser-based redaction is 100% private and secure. Try free.",
  keywords: metadataKeywords,
  robots: { index: true, follow: true },
  alternates: { canonical: TOOL_URL },
  openGraph: {
    title:
      "Free PDF Redaction Tool - Permanently Remove Sensitive Data Online | RedactPDF",
    description:
      "Redact text, images & metadata from PDFs online. No signup, no storage. GDPR & court compliant. Browser-based redaction is 100% private and secure. Try free.",
    type: "website",
    url: TOOL_URL,
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Free PDF Redaction Tool - Permanently Remove Sensitive Data Online | RedactPDF",
    description:
      "Redact text, images & metadata from PDFs online. No signup, no storage. GDPR & court compliant. Browser-based redaction is 100% private and secure. Try free.",
  },
};

export default function ToolPage() {
  return (
    <>
      <div id="tool-top">
        <ToolClient />
      </div>

      <article className="mt-20 border-t bg-slate-50/60 py-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(toolJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd),
          }}
        />

        <div className="mx-auto max-w-4xl px-4">
          <section className="rounded-3xl border border-brand/10 bg-gradient-to-br from-accent via-white to-white p-8 shadow-card md:p-10">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white/80 px-4 py-1.5 text-sm font-medium text-brand">
                <ShieldCheck className="h-4 w-4" />
                Complete PDF Redaction Guide
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                How to Redact a PDF Online for Free
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
                Redacting a PDF properly means more than drawing a black rectangle over text. True
                redaction is the process of permanently removing sensitive information from the
                document so that names, addresses, signatures, account numbers, medical details,
                internal comments, and other confidential material cannot be searched, copied, or
                recovered in a typical workflow. That is the core reason people look for a
                dedicated PDF redaction tool instead of a generic PDF editor. On RedactPDF, the
                workflow is intentionally simple: open your PDF, review the page, mark the areas
                that need to be hidden, and apply permanent redaction when you are ready to
                produce a clean version for sharing.
              </p>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                The biggest mistake people make is confusing blackout styling with actual
                redaction. If you place a shape on top of text in a design tool, a document
                editor, or a screenshot workflow, the visible content may appear hidden while the
                underlying text remains inside the file. Proper redaction is about data removal,
                not cosmetic masking. This matters in litigation, compliance, procurement,
                journalism, healthcare, and internal investigations because the purpose of
                redaction is to create a document that can be safely shared outside the original
                trust boundary.
              </p>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Security also matters when choosing an online PDF redaction tool. RedactPDF is
                designed so that document review and marking happen in the browser, which keeps the
                user in control while identifying what should be removed. When permanent redaction
                is applied, the file is sent over HTTPS for processing and then returned so the
                user can download the redacted version. This approach supports privacy-first
                workflows without requiring account creation or a stored document inbox for normal
                use.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-md">
                <a href="#tool-top">
                  Start Redacting Free
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#tool-faq">Jump to FAQs</a>
              </Button>
            </div>
          </section>

          <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featureHighlights.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-card"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-brand">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </section>

          <section className="mt-10 rounded-3xl border bg-white p-8 shadow-card md:p-10">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Key Features of RedactPDF Tool
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                A good redaction workflow should be fast enough for everyday use and precise
                enough for sensitive filings. RedactPDF focuses on both. The tool is built for
                people who need to clean PDFs without the overhead of a complex desktop suite,
                recurring seat license, or manual screenshot workaround. Whether you are preparing
                one NDA or a stack of records for disclosure, these features help turn PDF
                redaction into a repeatable process instead of a last-minute scramble.
              </p>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                These features matter because most redaction failures happen for process reasons,
                not because the user lacked good intentions. People are under time pressure, the
                document arrives late, and a generic editor seems close enough. RedactPDF reduces
                that friction by offering a workflow specifically built for PDF redaction. It is
                especially valuable when the document contains personal data, financial
                identifiers, witness names, addresses, signatures, or investigation details that
                should never survive into the exported copy.
              </p>
            </div>
          </section>

          <section className="mt-10 rounded-3xl border bg-white p-8 shadow-card md:p-10">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Who Should Use PDF Redaction?
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                PDF redaction is not a niche need. Almost every industry that shares documents
                eventually faces the problem of removing personal, confidential, or privileged
                information before sending a file to a client, regulator, journalist, vendor, or
                court. RedactPDF is built for practical workflows where accuracy matters more than
                flashy editing features.
              </p>
            </div>

            <div className="mt-8 grid gap-6">
              {userGroups.map(({ title, icon: Icon, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-3xl border bg-white p-8 shadow-card md:p-10">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                RedactPDF vs Adobe Acrobat vs Smallpdf
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Not every PDF tool is designed for the same job. Some platforms focus on broad PDF
                editing, some emphasize compression or file conversion, and only a subset are
                suitable for privacy-sensitive redaction workflows. The table below highlights the
                practical differences that matter when your goal is to remove sensitive data, not
                just rearrange pages.
              </p>
            </div>

            <div className="mt-8 overflow-x-auto rounded-2xl border shadow-sm">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold">Feature</th>
                    <th className="px-4 py-3 text-center font-semibold text-brand">RedactPDF</th>
                    <th className="px-4 py-3 text-center font-semibold">Adobe Acrobat</th>
                    <th className="px-4 py-3 text-center font-semibold">Smallpdf</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">Price</td>
                    <td className="bg-accent/30 px-4 py-3 text-center font-medium">Free</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      Paid subscription
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">Freemium</td>
                  </tr>
                  <tr className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">File storage model</td>
                    <td className="bg-accent/30 px-4 py-3 text-center font-medium">
                      No routine file storage workflow
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      Varies by product and cloud settings
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      Cloud workflow common
                    </td>
                  </tr>
                  <tr className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">Signup requirement</td>
                    <td className="bg-accent/30 px-4 py-3 text-center font-medium">
                      No signup for basic use
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">Usually yes</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">Often yes</td>
                  </tr>
                  <tr className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">Redaction focus</td>
                    <td className="bg-accent/30 px-4 py-3 text-center font-medium">
                      Purpose-built for secure redaction
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      Broad PDF suite with redaction features
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      General PDF utilities
                    </td>
                  </tr>
                  <tr className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">Browser-based workflow</td>
                    <td className="bg-accent/30 px-4 py-3 text-center font-medium">Yes</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      Mixed desktop and cloud options
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">Yes</td>
                  </tr>
                  <tr className="last:border-0">
                    <td className="px-4 py-3 font-medium">Best for</td>
                    <td className="bg-accent/30 px-4 py-3 text-center font-medium">
                      Fast privacy-focused PDF cleanup
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      Enterprise editing suites
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      General PDF tasks and conversions
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-base leading-7 text-muted-foreground">
              For many users, the decision comes down to simplicity. If you need a full desktop
              publishing suite with signatures, commenting, layout review, and enterprise
              licensing, Acrobat may fit. If you need a general online PDF toolkit, a service like
              Smallpdf may cover basic tasks. But if your specific job is to redact sensitive
              content from a PDF quickly, without signup friction, and with a workflow centered on
              permanent removal, RedactPDF is the sharper fit.
            </p>
          </section>

          <section id="tool-faq" className="mt-10 rounded-3xl border bg-white p-8 shadow-card md:p-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-brand">
                  <BadgeHelp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    Frequently Asked Questions
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Quick answers for privacy, compliance, file limits, and mobile usage.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              {faqItems.map((item) => (
                <div key={item.question} className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5">
                  <h3 className="text-lg font-semibold text-foreground">{item.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-3xl border border-brand/15 bg-gradient-to-br from-accent to-white p-8 shadow-card md:p-10">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Related Guides
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                If you want deeper guidance for specific redaction scenarios, these guides explain
                common mistakes, legal workflow considerations, and privacy-first document handling
                in more detail.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="group rounded-2xl border border-white/70 bg-white/90 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card"
                >
                  <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-brand">
                    {guide.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {guide.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
                    Read guide
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>

            <p className="mt-8 text-base leading-7 text-muted-foreground">
              The `/tool` page is meant to do two jobs well: give users an immediate way to redact
              a PDF online for free, and provide enough clear, indexable information for search
              engines and human visitors to understand what the tool does. That is why the upload
              and editor experience remain at the top, while the detailed guidance sits below the
              fold. Users who arrive ready to redact can act immediately. Users who need trust
              signals, compliance context, feature detail, and workflow guidance can continue
              reading without leaving the page. This balance supports both conversion and
              discoverability, which is especially important for a practical utility tool like
              RedactPDF.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
