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
    question: "Is RedactPDF really free?",
    answer:
      "Yes. You can redact a PDF online for free without creating an account. Open your file, mark sensitive areas, and apply permanent redaction — no subscription and no Adobe license required.",
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
  {
    question: "How is this different from Adobe Acrobat redact?",
    answer:
      "Adobe Acrobat requires a paid subscription for professional redaction. RedactPDF is a free browser tool focused only on permanent PDF redaction — no signup, no desktop install, and no full editing suite you do not need.",
  },
  {
    question: "Does blacking out text in a PDF remove it permanently?",
    answer:
      "Only if the underlying text is deleted from the file structure. Drawing a black shape in a generic editor often leaves recoverable text. RedactPDF removes extractable content in your marked areas — then verify with search and copy-paste tests before sharing.",
  },
  {
    question: "Can I auto-detect emails, phones, and SSN in a PDF?",
    answer:
      "Yes. Use the PII panel to detect emails, phone numbers, credit cards, dates, and SSN patterns, or run a text search to mark all matches. Combine auto-detect with manual boxes for names and other sensitive content.",
  },
] as const;

const metadataKeywords = [
  "redact pdf online free",
  "redact pdf free",
  "redact pdf without adobe",
  "remove text from pdf",
  "delete text from pdf",
  "black out text in pdf",
  "free pdf redaction tool",
  "pdf redaction tool free",
  "adobe acrobat redact alternative",
  "auto redact pdf",
  "permanent pdf redaction",
  "court compliant pdf redaction",
  "gdpr pdf redaction",
  "secure pdf redaction",
];

const keywordSections = [
  {
    title: "Redact PDF Online Free — No Account Required",
    paragraphs: [
      "People search for redact PDF online free because they need to remove sensitive information quickly — without paying for Adobe, creating an account, or uploading files to a long-term cloud inbox. RedactPDF is built for that workflow: open your PDF in the browser, mark what must go, and apply permanent redaction when you are ready to download a clean copy.",
      "Free PDF redaction should mean more than a trial watermark. You should be able to complete the job — review pages, draw boxes, search for names, auto-detect common PII patterns, and export — without a paywall on the final download. That is the standard RedactPDF aims for.",
    ],
  },
  {
    title: "Free Adobe Acrobat Redaction Alternative",
    paragraphs: [
      "Adobe Acrobat redact is powerful but tied to a paid subscription many individuals and small teams do not have. If you need to redact a PDF without Adobe, a purpose-built browser tool is often faster than installing a full desktop suite.",
      "RedactPDF focuses on one job: permanent removal of sensitive text and regions inside PDFs. For a deeper comparison of pricing, privacy, and when Acrobat still makes sense, see our guide on [Adobe Acrobat redact vs free alternatives](/blog/adobe-acrobat-redact-vs-free-alternatives).",
    ],
  },
  {
    title: "How to Black Out Text in PDF Permanently",
    paragraphs: [
      "To black out text in a PDF the right way, you must delete the underlying content — not just cover it. A black rectangle in Word, Canva, or a screenshot tool may look correct while the text remains searchable and copyable underneath.",
      "After you redact, run three checks: search for known sensitive strings, try to select text under black areas, and paste the document into a plain text editor. If hidden text appears, the redaction failed. Read [why blacking out a PDF is not safe](/blog/why-blacking-out-pdf-is-not-safe) for the full explanation.",
    ],
  },
  {
    title: "Auto-Detect Sensitive Information (PII)",
    paragraphs: [
      "Manual boxes work for one-off edits, but auto redact workflows save time on long documents. RedactPDF can detect emails, phone numbers, credit cards, dates, and SSN-style patterns, plus run custom text search across the full file.",
      "Use auto-detect as a first pass, then review every page before applying. Names, addresses, and context-specific identifiers often still need manual marks. For a full walkthrough, see [auto redact PDF: find and remove PII](/blog/auto-redact-pdf-pii-detection).",
    ],
  },
] as const;

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
    href: "/blog/how-to-remove-text-from-pdf-permanently",
    title: "Remove Text from PDF Permanently",
    description: "Delete extractable text — not just visual black boxes.",
  },
  {
    href: "/blog/how-to-redact-pdf-online-free",
    title: "Redact PDF Online Free",
    description: "No signup, no Adobe — step-by-step free redaction.",
  },
  {
    href: "/blog/how-to-black-out-text-in-pdf",
    title: "Black Out Text in PDF the Right Way",
    description: "Permanent blackout vs unsafe overlays explained.",
  },
  {
    href: "/blog/how-to-redact-pdf-without-adobe",
    title: "Redact PDF Without Adobe",
    description: "Free workflow when you do not have Acrobat.",
  },
  {
    href: "/blog/auto-redact-pdf-pii-detection",
    title: "Auto Redact PDF (PII Detection)",
    description: "Find emails, phones, SSNs, and cards automatically.",
  },
  {
    href: "/blog/how-to-redact-scanned-pdf-ocr",
    title: "Redact Scanned PDFs (OCR Guide)",
    description: "Run OCR first, then redact image-based pages.",
  },
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

const TOOL_TITLE = "Redact PDF Online Free — Remove Text Permanently";
const TOOL_DESCRIPTION =
  "Free PDF redactor online. Permanently remove text, auto-detect PII, OCR for scans. No signup, secure HTTPS.";

export const metadata: Metadata = {
  title: {
    absolute: TOOL_TITLE,
  },
  description: TOOL_DESCRIPTION,
  keywords: metadataKeywords,
  robots: { index: true, follow: true },
  alternates: { canonical: TOOL_URL },
  openGraph: {
    title: TOOL_TITLE,
    description: TOOL_DESCRIPTION,
    type: "website",
    url: TOOL_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TOOL_TITLE,
    description: TOOL_DESCRIPTION,
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

          {keywordSections.map((section) => (
            <section
              key={section.title}
              className="mt-10 rounded-3xl border bg-white p-8 shadow-card md:p-10"
            >
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {section.title}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="mt-4 text-base leading-7 text-muted-foreground"
                  >
                    {paragraph.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
                      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                      if (linkMatch) {
                        return (
                          <Link
                            key={i}
                            href={linkMatch[2]}
                            className="font-medium text-brand hover:underline"
                          >
                            {linkMatch[1]}
                          </Link>
                        );
                      }
                      return part;
                    })}
                  </p>
                ))}
              </div>
            </section>
          ))}

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

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
