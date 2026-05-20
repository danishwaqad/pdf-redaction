import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ContactForm } from "@/components/contact/contact-form";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Contact Us - RedactPDF",
  "Contact RedactPDF support, legal, and DMCA. Form and email for questions about browser-only PDF redaction.",
  "/contact"
);

export default function ContactPage() {
  return (
    <>
      <PageHero
        badge="Support"
        title="Contact Us"
        subtitle="Questions about privacy, bugs, or partnerships — we read every message."
      />
      <div className="mx-auto grid max-w-5xl gap-12 px-4 py-12 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-8 shadow-card">
          <ContactForm />
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Mail className="h-5 w-5 text-brand" />
              Email
            </h2>
            <p className="mt-2 text-muted-foreground">
              General support:{" "}
              <a href="mailto:support@redactpdf.io" className="font-medium text-brand hover:underline">
                support@redactpdf.io
              </a>
            </p>
            <p className="mt-2 text-muted-foreground">
              For legal/DMCA:{" "}
              <a href="mailto:legal@redactpdf.io" className="font-medium text-brand hover:underline">
                legal@redactpdf.io
              </a>
            </p>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5 text-brand" />
              Mailing address
            </h2>
            <p className="mt-2 text-muted-foreground">
              RedactPDF.io
              <br />
              123 Privacy Lane
              <br />
              Wilmington, DE 19801
              <br />
              United States
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Virtual business address for correspondence.</p>
          </div>
        </div>
      </div>
    </>
  );
}
