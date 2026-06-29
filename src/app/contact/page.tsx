import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ContactForm } from "@/components/contact/contact-form";
import { CONTACT_EMAIL } from "@/lib/site-contact";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Contact Us - RedactPDF",
  "Contact RedactPDF for help with free PDF redaction, privacy questions, bug reports, and tool support. Email us — PDF files are not accepted through this form.",
  "/contact"
);

export default function ContactPage() {
  return (
    <>
      <PageHero
        badge="Contact"
        title="Contact Us"
        subtitle="Questions about privacy, bugs, or partnerships — we read every message."
      />
      <div className="border-t border-slate-100 bg-white">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-2 lg:gap-12 lg:px-8">
          <div className="rounded-2xl border bg-white p-6 shadow-card sm:p-8">
            <ContactForm />
          </div>
          <div className="space-y-6 lg:pt-2">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Mail className="h-5 w-5 text-brand" />
                Email us directly
              </h2>
              <p className="mt-3 text-muted-foreground">
                Questions, feedback, and partnerships:
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-2 inline-block text-lg font-medium text-brand hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              <p className="mt-4 text-sm text-muted-foreground">
                Use the form on the left — messages are delivered to this inbox. You can also
                copy-paste the address above into your email app.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
