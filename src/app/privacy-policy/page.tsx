import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { LegalProse } from "@/components/layout/legal-prose";
import { REDACTION_DATA_FLOW } from "@/lib/site-messaging";
import { CONTACT_EMAIL } from "@/lib/site-contact";
import { pageMetadata } from "@/lib/page-metadata";

const LAST_UPDATED = "May 21, 2026";

export const metadata: Metadata = pageMetadata(
  "Privacy Policy - RedactPDF",
  "How RedactPDF handles PDFs: browser marking, secure processing over HTTPS, no file storage. Plausible analytics and AdSense on blog pages.",
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

        <h2>Your PDF files — how redaction works</h2>
        <p>
          <strong>{REDACTION_DATA_FLOW}</strong>
        </p>
        <p>
          While you edit, your PDF stays in your browser memory. We do not receive your file until you
          click <strong>Apply redaction</strong> or download a redacted export. At that moment the document is
          transmitted over HTTPS to our secure redaction service, processed in memory, and the result is sent back.
          We do not write PDFs to a cloud inbox, training dataset, or long-term storage.
        </p>
        <p>
          Closing the tab clears the in-browser copy from our perspective on the client side. Server-side, we do
          not retain PDF bytes after the response is delivered. Clear your browser cache if others use your
          device.
        </p>

        <h2>Information we may collect</h2>
        <h3>Website analytics</h3>
        <p>
          We do not use Google Analytics. We may use privacy-friendly analytics (such as{" "}
          <strong>Plausible</strong>) to count page views and referrers in aggregate. Plausible does not use
          cookies on your device in the same way as ad trackers and does not profile individual users for
          marketing.
        </p>

        <h3>Advertising (blog and informational pages only)</h3>
        <p>
          <strong>
            We display Google AdSense ads on blog pages only. The tool page (/tool) has NO ads.
          </strong>{" "}
          AdSense may use cookies and similar technologies to serve and measure ads. See Google&apos;s policy:{" "}
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
            Google Advertising Policies
          </a>
          .
        </p>

        <h2>Contact form data</h2>
        <p>
          If you use our contact form, we receive the name, email, and message you provide via our email
          delivery service. This is separate from PDF redaction and does not include your document unless you
          attach information in the message text.
        </p>

        <h2>Legal bases (GDPR / UK GDPR)</h2>
        <p>
          Where GDPR applies, we process analytics data under legitimate interests (understanding site usage)
          and contact data under legitimate interests or pre-contractual steps. PDF redaction involves transient
          processing as a processor-like step on your instruction when you click Apply; you remain responsible
          for lawful basis, verification, and onward sharing of redacted files.
        </p>

        <h2>CCPA (California)</h2>
        <p>
          We do not sell personal information. We do not store PDF contents after processing. California
          residents may contact us for access or deletion of contact form correspondence.
        </p>

        <h2>Children</h2>
        <p>RedactPDF is not directed at children under 13. We do not knowingly collect their data.</p>

        <h2>Security</h2>
        <p>
          We use HTTPS for the website and redaction API. Sensitive workflows should still use trusted networks
          and verified outputs before disclosure.
        </p>

        <h2>Changes</h2>
        <p>
          We may update this policy. The &quot;Last updated&quot; date at the top will change. Continued use
          after changes constitutes acceptance.
        </p>

        <h2>Contact</h2>
        <p>
          Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </LegalProse>
    </>
  );
}
