import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { LegalProse } from "@/components/layout/legal-prose";
import { pageMetadata } from "@/lib/page-metadata";

const LAST_UPDATED = "May 20, 2026";

export const metadata: Metadata = pageMetadata(
  "Privacy Policy - RedactPDF",
  "RedactPDF does not upload or store your PDF files. Browser-only processing, Plausible analytics, and AdSense on blog pages only.",
  "/privacy-policy"
);

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        badge="Legal"
        title="Privacy Policy - RedactPDF"
        subtitle={`Last updated: ${LAST_UPDATED}`}
      />
      <LegalProse>
        <p>
          RedactPDF.io (&quot;RedactPDF,&quot; &quot;we,&quot; &quot;us&quot;) operates a free PDF redaction
          website. This Privacy Policy explains how we handle information when you use our site and tools.
        </p>

        <h2>Your PDF files — we never receive them</h2>
        <p>
          <strong>
            We DO NOT upload, store, or see your PDF files. All redaction happens 100% in your browser
            using JavaScript, WebAssembly, and client-side libraries (pdf.js, pdf-lib).
          </strong>
        </p>
        <p>
          When you select a document, it stays in your device&apos;s memory. Processing occurs locally on
          your computer or phone. We have no server-side file storage, no cloud inbox, and no ability to
          retrieve your documents.
        </p>
        <p>
          <strong>
            Files are processed locally. When you close the tab, the file is gone forever
          </strong>{" "}
          from our perspective — we never had a copy. Clear your browser cache if you share the device with
          others.
        </p>

        <h2>Information we may collect</h2>
        <h3>Website analytics</h3>
        <p>
          We do not use Google Analytics. We may use privacy-friendly analytics (such as{" "}
          <strong>Plausible</strong>) to count page views and referrers in aggregate. Plausible does not use
          cookies on your device in the same way as ad trackers and does not profile individual users for
          marketing.
        </p>
        <p>
          <strong>
            We do not use cookies except for privacy-friendly analytics (Plausible) to count visitors. No
            personal data collected
          </strong>{" "}
          through that service beyond aggregated statistics (e.g., page URL, country, device type).
        </p>

        <h3>Advertising (blog and informational pages only)</h3>
        <p>
          <strong>
            We display Google AdSense ads on blog pages only. The tool page (/tool) has NO ads.
          </strong>{" "}
          AdSense may use cookies and similar technologies to serve and measure ads. Google&apos;s use of
          advertising cookies enables it and its partners to serve ads based on your visits to this and other
          sites. See Google&apos;s policy:{" "}
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
            Google Advertising Policies
          </a>
          . You may opt out of personalized advertising via{" "}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            Google Ad Settings
          </a>
          .
        </p>

        <h2>Contact form data</h2>
        <p>
          If you email us or submit our contact form, we receive the information you provide (name, email,
          message). We use it only to respond to your inquiry and retain it only as long as needed for
          support or legal purposes.
        </p>

        <h2>Legal bases (GDPR / UK GDPR)</h2>
        <p>
          Where GDPR applies, we process analytics data under legitimate interests (understanding site usage)
          and contact data under legitimate interests or pre-contractual steps. We do not process PDF
          content on our servers, so Document processing is not performed by us as a controller.
        </p>

        <h2>CCPA (California)</h2>
        <p>
          We do not sell personal information. Because we do not collect PDF contents, there is no sale of
          document data. California residents may contact us for access or deletion of contact form
          correspondence.
        </p>

        <h2>Children</h2>
        <p>RedactPDF is not directed at children under 13. We do not knowingly collect their data.</p>

        <h2>Security</h2>
        <p>
          We use HTTPS for the website. The strongest privacy control for your documents is local processing
          — your files never traverse our network during redaction.
        </p>

        <h2>Changes</h2>
        <p>
          We may update this policy. The &quot;Last updated&quot; date at the top will change. Continued use
          after changes constitutes acceptance.
        </p>

        <h2>Contact</h2>
        <p>
          Questions: <a href="mailto:support@redactpdf.io">support@redactpdf.io</a>
          <br />
          Legal: <a href="mailto:legal@redactpdf.io">legal@redactpdf.io</a>
        </p>
      </LegalProse>
    </>
  );
}
