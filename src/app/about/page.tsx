import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { LegalProse } from "@/components/layout/legal-prose";
import { ContentWithAds } from "@/components/layout/content-with-ads";
import { Button } from "@/components/ui/button";
import { REDACTION_DATA_FLOW } from "@/lib/site-messaging";
import { pageMetadata } from "@/lib/page-metadata";
import { PRODUCTION_SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata(
  "About RedactPDF — Privacy-First PDF Redaction",
  "Meet the founder behind RedactPDF, learn our security principles, and see why we built a privacy-first PDF redaction tool for legal, compliance, and client work.",
  "/about"
);

const founderJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Danish Waqad",
  jobTitle: "Founder & Security Engineer at RedactPDF",
  image: `${PRODUCTION_SITE_URL}/images/danish-waqad.png`,
  url: `${PRODUCTION_SITE_URL}/about`,
  sameAs: [
    "https://github.com/danishwaqad",
    "https://www.linkedin.com/in/danish-waqad/",
  ],
  worksFor: {
    "@type": "Organization",
    name: "RedactPDF",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RedactPDF",
  url: PRODUCTION_SITE_URL,
  logo: `${PRODUCTION_SITE_URL}/favicon.ico`,
  founder: {
    "@type": "Person",
    name: "Danish Waqad",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: `${PRODUCTION_SITE_URL}/contact`,
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        badge="Our story"
        title="About RedactPDF"
        subtitle="A privacy-first PDF redaction tool built by someone who cares about practical security, honest product claims, and making document privacy more accessible."
      />
      <ContentWithAds>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(founderJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />

        <LegalProse embedded>
          <p>
            RedactPDF was built for a simple reason: privacy work should not require expensive
            desktop software, a vague cloud workflow, or blind trust in where a document goes after
            upload. Every week, people need to remove names, account numbers, signatures, medical
            details, and internal comments from PDFs before sharing them with courts, clients,
            regulators, journalists, or vendors. That job should be straightforward and safe.
          </p>
          <p>
            {REDACTION_DATA_FLOW} Preview, search, and marking run in your browser. OCR for scanned
            pages runs locally when you need it. We try to explain this workflow in plain language
            because trust comes from clarity, not from buzzwords.
          </p>

          <h2>Our mission</h2>
          <p className="text-lg font-medium text-foreground">
            Make document privacy accessible to everyone.
          </p>
          <p>
            That means no signup walls, no misleading &quot;local-only&quot; claims, and no stored cloud inbox
            as the default way to handle sensitive files. We explain when secure HTTPS processing
            happens, what stays in the browser, and why verification still matters before any
            redacted PDF gets shared.
          </p>

          <div className="not-prose my-10 rounded-3xl border bg-slate-50 p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <Image
              src="/images/danish-waqad.png"
              alt="Danish Waqad, Founder and Security Engineer at RedactPDF"
              width={160}
              height={160}
              className="rounded-2xl object-cover shadow-md"
              priority
            />
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-foreground">Danish Waqad</h3>
              <p className="text-base font-medium text-brand">Founder &amp; Security Engineer at RedactPDF</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  8 years in application security
                </span>
                <span className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  Privacy-first document workflows
                </span>
                <span className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  Browser-based product design
                </span>
              </div>

              <div className="mt-5 max-w-3xl space-y-4 text-base leading-8 text-slate-700">
                <p>
                  Danish Waqad has spent eight years in application security, working close to the
                  decisions that determine whether a product deserves trust or only talks about it.
                  His work has focused on practical security questions: how files are handled, where
                  sensitive data travels, what users can verify for themselves, and how privacy
                  claims break down once real workflows get messy.
                </p>
                <p>
                  RedactPDF grew out of that experience and from a very concrete frustration: most
                  &quot;free&quot; PDF tools wanted full document uploads before users could even inspect what
                  would happen to their files. Danish built RedactPDF to offer a simpler, more
                  defensible alternative for privacy-sensitive document work, with browser-based
                  review, permanent redaction workflows, and clear explanations instead of marketing
                  shortcuts.
                </p>
                <p>
                  The goal is not to sound like a security company. It is to ship a tool that real
                  lawyers, HR teams, auditors, clinicians, and journalists can actually trust in
                  practice.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://github.com/danishwaqad"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Danish Waqad on GitHub"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white no-underline shadow-sm transition-colors hover:bg-slate-50 hover:no-underline"
                >
                  <Image
                    src="/images/github-icon.png"
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px]"
                  />
                </a>
                <a
                  href="https://www.linkedin.com/in/danish-waqad/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Danish Waqad on LinkedIn"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white no-underline shadow-sm transition-colors hover:bg-slate-50 hover:no-underline"
                >
                  <Image
                    src="/images/linkedin-icon.png"
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px]"
                  />
                </a>
              </div>
            </div>
            </div>
          </div>

          <h2>What we believe</h2>
          <ul>
            <li>Permanent redaction beats cosmetic black boxes</li>
            <li>Transient HTTPS processing beats long-term cloud storage for sensitive PDFs</li>
            <li>Verification (search + copy tests) is non-negotiable before sharing</li>
            <li>Legal and privacy education should be free to read</li>
          </ul>

          <h2>Why We Built RedactPDF</h2>
          <p>
            RedactPDF started with a problem that should not exist in 2026: if you need to redact
            one PDF safely, your choices are often either a paid desktop suite or a &quot;free&quot; website
            that asks you to upload a sensitive document before explaining what happens next. Adobe
            made serious redaction feel like a premium feature. Meanwhile, many cloud tools trained
            users to accept risk by default. Upload first. Trust later. Hope the privacy page says
            the right words. That never felt like a good answer for client documents, legal exhibits,
            internal investigations, or regulated records.
          </p>
          <p>
            The original product goal was to build a client-side pdf redaction experience that puts
            review and control back in the browser. People search for terms like &quot;no server upload&quot;
            and &quot;zero-knowledge&quot; because they are trying to reduce exposure, not because they care
            about fashionable jargon. That instinct is valid. We wanted a workflow where users can
            open a PDF, inspect the content, search for sensitive data, mark redactions, and verify
            what they are doing before the final output step. Even when secure processing is needed,
            the product should still minimize handling, avoid long-term retention, and never turn
            itself into a permanent document warehouse.
          </p>
          <p>
            That is the mission behind RedactPDF: make redaction free enough to be accessible,
            honest enough to be trusted, and practical enough for real work. We are not trying to
            sound abstractly secure. We are trying to build a tool that respects why people are
            nervous in the first place. If a lawyer is cleaning an exhibit, an HR lead is preparing
            a report, or a journalist is protecting a source, the product should help them reduce
            risk without forcing them into enterprise procurement or a black-box upload flow. That
            is what RedactPDF is for.
          </p>

          <h2>Our Security Principles</h2>
          <div className="not-prose my-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-brand mt-8">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No File Storage</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                RedactPDF is designed around transient handling, not retention. Files are processed
                in memory and returned, without turning your document workflow into a cloud inbox
                that quietly keeps copies around.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-brand mt-8">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Open Source Components</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                We rely on transparent building blocks such as{" "}
                <a
                  href="https://mozilla.github.io/pdf.js/"
                  target="_blank"
                  rel="noreferrer"
                >
                  PDF.js
                </a>{" "}
                for rendering and inspection. Using well-known components improves scrutiny and
                makes the document pipeline easier to reason about.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-brand mt-8">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Third-Party Audits</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                We have not published a formal third-party audit yet. An independent review is
                planned for Q3 2026 once the product surface and deployment model are stable enough
                to make that review meaningful.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-brand mt-8">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">GDPR by Design</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                The workflow is built so users remain the data controller and RedactPDF minimizes
                processor-style handling. No account-based document retention means fewer copies,
                fewer permissions, and fewer places sensitive PDFs can linger.
              </p>
            </div>
          </div>

          <h2>Company Details</h2>
          <div className="not-prose my-8 rounded-2xl border bg-slate-50 p-6 shadow-sm">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium uppercase tracking-wide text-slate-500">Entity</dt>
                <dd className="mt-1 text-sm text-slate-700">
                  RedactPDF is an independent project by Danish Waqad.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium uppercase tracking-wide text-slate-500">Location</dt>
                <dd className="mt-1 text-sm text-slate-700">Multan, Pakistan</dd>
              </div>
              <div>
                {/* <dt className="text-sm font-medium uppercase tracking-wide text-slate-500">Contact</dt> */}
                <dd className="mt-2 text-sm">
                  <Link href="/contact" className="no-underline hover:no-underline">
                    <span className="font-semibold text-brand hover:underline">
                      Contact RedactPDF
                    </span>
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium uppercase tracking-wide text-slate-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-slate-700">May 2026</dd>
              </div>
            </dl>
          </div>
        </LegalProse>
        <div className="mt-10">
          <Button asChild size="lg" className="shadow-md">
            <Link href="/tool">Try RedactPDF free</Link>
          </Button>
        </div>
      </ContentWithAds>
    </>
  );
}
