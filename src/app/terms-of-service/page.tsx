import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { LegalProse } from "@/components/layout/legal-prose";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Terms of Service - RedactPDF",
  "Free as-is PDF redaction tool terms. User responsibility for verifying redactions. No illegal use.",
  "/terms-of-service"
);

export default function TermsOfServicePage() {
  return (
    <>
      <PageHero badge="Legal" title="Terms of Service" subtitle="Last updated: May 20, 2026" />
      <LegalProse>
        <p>By using RedactPDF.io, you agree to these Terms of Service.</p>

        <h2>Service description</h2>
        <p>
          <strong>RedactPDF is provided &quot;as-is&quot; for free.</strong> We offer browser-based tools to
          mark and export redacted PDFs. Features may change without notice.
        </p>

        <h2>No warranty</h2>
        <p>
          We disclaim all warranties, express or implied, including merchantability and fitness for a
          particular purpose. We do not guarantee uninterrupted access, error-free operation, or that
          redaction will meet legal, regulatory, or court requirements in your jurisdiction.
        </p>

        <h2>Your responsibility</h2>
        <p>
          <strong>
            User is responsible for verifying redaction is complete before sharing documents. We are not
            liable for data leaks
          </strong>
          , sanctions, regulatory penalties, or damages arising from incomplete redaction, mis-sent files,
          or misuse of exported documents. Always run search, copy-paste, and visual checks; obtain legal
          counsel when required.
        </p>

        <h2>Permanent redaction</h2>
        <p>
          <strong>True redaction permanently deletes data. It cannot be undone.</strong> Keep secure backups
          of originals before applying redaction. We are not responsible for lost data after export.
        </p>

        <h2>Acceptable use</h2>
        <p>
          <strong>Do not use for illegal purposes.</strong> You may not use RedactPDF to facilitate fraud,
          harassment, evasion of law enforcement, or infringement of others&apos; rights. We may block access
          where abuse is detected.
        </p>

        <h2>Intellectual property</h2>
        <p>
          The RedactPDF name, site content, and branding are ours. You retain all rights to your PDFs. We
          claim no ownership of your documents.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, our total liability for any claim relating to the service
          is zero dollars (USD $0) for a free consumer tool, or the amount you paid us in the prior twelve
          months if you purchased optional paid features in the future.
        </p>

        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of the State of Delaware, USA, without regard to conflict of
          law principles. Disputes shall be brought in Delaware courts unless otherwise required by
          mandatory consumer protection laws in your country.
        </p>

        <h2>Contact</h2>
        <p>
          <a href="mailto:legal@redactpdf.io">legal@redactpdf.io</a>
        </p>
      </LegalProse>
    </>
  );
}
