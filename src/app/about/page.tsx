import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { LegalProse } from "@/components/layout/legal-prose";
import { ContentWithAds } from "@/components/layout/content-with-ads";
import { Button } from "@/components/ui/button";
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
        subtitle="Privacy should be free. Your documents should never touch our servers."
      />
      <ContentWithAds>
        <LegalProse className="py-0">
          <p>
            We built RedactPDF because Adobe put redaction behind a $20/mo paywall. Privacy should be free. Your
            documents should never touch our servers — not for redaction, not for storage, not for training.
          </p>
          <p>
            Millions of people need to black out a social security number, remove a client name from an exhibit,
            or publish a GDPR-safe DSAR response every month. They should not need enterprise software or a
            cloud upload that creates compliance review. RedactPDF runs pdf.js and pdf-lib entirely in your
            browser, with permanent raster redaction when you download.
          </p>

          <h2>Our mission</h2>
          <p className="text-lg font-medium text-foreground">
            Make document privacy accessible to everyone.
          </p>
          <p>
            That means no signup walls, no file uploads, and honest marketing: we tell you exactly what happens
            on your device. We fund the site through optional ads on educational pages — never on the{" "}
            <Link href="/tool">redaction tool</Link> itself.
          </p>

          <div className="not-prose my-10 flex flex-col items-center gap-6 rounded-2xl border bg-slate-50 p-8 sm:flex-row sm:items-start">
            <Image
              src="/images/alex-morgan.jpg"
              alt="Alex Morgan, Privacy Engineer at RedactPDF"
              width={160}
              height={160}
              className="rounded-2xl object-cover shadow-md"
              priority
            />
            <div>
              <h3 className="text-xl font-semibold text-foreground">Alex Morgan</h3>
              <p className="text-sm font-medium text-brand">Privacy Engineer</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Alex spent eight years in application security before focusing on document workflows. He leads
                RedactPDF&apos;s client-side architecture — ensuring redaction stays local, verifiable, and free.
                Portrait generated for team representation; contact Alex via{" "}
                <a href="mailto:support@redactpdf.io">support@redactpdf.io</a>.
              </p>
            </div>
          </div>

          <h2>What we believe</h2>
          <ul>
            <li>Permanent redaction beats cosmetic black boxes</li>
            <li>Local processing beats cloud convenience for sensitive PDFs</li>
            <li>Verification (search + copy tests) is non-negotiable before sharing</li>
            <li>Legal and privacy education should be free to read</li>
          </ul>

          <div className="not-prose mt-10">
            <Button asChild size="lg">
              <Link href="/tool">Try RedactPDF free</Link>
            </Button>
          </div>
        </LegalProse>
      </ContentWithAds>
    </>
  );
}
