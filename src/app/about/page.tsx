import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { LegalProse } from "@/components/layout/legal-prose";
import { ContentWithAds } from "@/components/layout/content-with-ads";
import { Button } from "@/components/ui/button";
import { REDACTION_DATA_FLOW } from "@/lib/site-messaging";
import { CONTACT_EMAIL } from "@/lib/site-contact";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "About RedactPDF — Free Privacy-First PDF Redaction",
  "We built RedactPDF because Adobe put redaction behind a paywall. Mission: make document privacy accessible to everyone.",
  "/about"
);

export default function AboutPage() {
  return (
    <>
      <PageHero
        badge="Our story"
        title="About RedactPDF"
        subtitle="Privacy should be free. No signup walls and no stored copies of your PDF."
      />
      <ContentWithAds>
        <LegalProse embedded>
          <p>
            We built RedactPDF because Adobe put redaction behind a $20/mo paywall. Privacy should be free.
            Millions of people need to black out a social security number, remove a client name from an exhibit,
            or publish a GDPR-safe DSAR response every month — without enterprise software or a cloud inbox that
            keeps their files.
          </p>
          <p>
            {REDACTION_DATA_FLOW} Preview, search, and marking run in your browser. OCR for scanned pages
            runs locally when you need it.
          </p>

          <h2>Our mission</h2>
          <p className="text-lg font-medium text-foreground">
            Make document privacy accessible to everyone.
          </p>
          <p>
            That means no signup walls and honest marketing: we explain when HTTPS redaction runs and that we do
            not store your PDF. We fund the site through optional ads on educational pages — never on the{" "}
            <Link href="/tool">redaction tool</Link> itself.
          </p>

          <div className="not-prose my-10 flex flex-col items-center gap-6 rounded-2xl border bg-slate-50 p-8 sm:flex-row sm:items-start">
            <Image
              src="/images/danish-waqad.png"
              alt="Danish Waqad, Software Engineer at RedactPDF"
              width={160}
              height={160}
              className="rounded-2xl object-cover shadow-md"
              priority
            />
            <div>
              <h3 className="text-xl font-semibold text-foreground">Danish Waqad</h3>
              <p className="text-sm font-medium text-brand">Software Engineer</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Danish spent eight years in application security before focusing on document workflows. He leads
                RedactPDF&apos;s product — browser marking plus secure redaction on export, with verification
                built in. Contact via{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </p>
            </div>
          </div>

          <h2>What we believe</h2>
          <ul>
            <li>Permanent redaction beats cosmetic black boxes</li>
            <li>Transient HTTPS processing beats long-term cloud storage for sensitive PDFs</li>
            <li>Verification (search + copy tests) is non-negotiable before sharing</li>
            <li>Legal and privacy education should be free to read</li>
          </ul>

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
