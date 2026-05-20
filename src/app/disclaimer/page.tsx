import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { LegalProse } from "@/components/layout/legal-prose";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Disclaimer - RedactPDF",
  "RedactPDF is not legal advice. Verify redactions before sharing. Consult lawyers for court, GDPR, and HIPAA.",
  "/disclaimer"
);

export default function DisclaimerPage() {
  return (
    <>
      <PageHero badge="Legal" title="Disclaimer" subtitle="Important limitations of our tools and content" />
      <LegalProse>
        <p>
          <strong>
            RedactPDF provides tools for redaction. We do not provide legal advice. For court/GDPR/HIPAA
            compliance, consult your lawyer.
          </strong>
        </p>
        <p>
          Blog posts, FAQs, and guides are educational only. They are not a substitute for qualified legal
          counsel in your jurisdiction. Court rules, e-filing requirements, and regulatory obligations vary.
        </p>
        <h2>Software limitations</h2>
        <p>
          <strong>
            While we test thoroughly, software can have bugs. Always double-check redacted files before
            sharing.
          </strong>{" "}
          Run text search, selection tests, and human review. Complex PDFs (forms, portfolios, embedded
          files) may need additional steps we do not automate.
        </p>
        <h2>No affiliation</h2>
        <p>
          RedactPDF is not affiliated with Adobe®, Smallpdf®, or any court system. Trademarks belong to
          their owners.
        </p>
        <h2>Third-party links</h2>
        <p>
          External links (including Google policies) are provided for convenience. We do not control third-party
          content.
        </p>
      </LegalProse>
    </>
  );
}
