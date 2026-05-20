import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, ServerOff, FileCheck } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { LegalProse } from "@/components/layout/legal-prose";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Security — Browser-Only PDF Redaction",
  "How RedactPDF keeps files on your device: no upload, permanent raster redaction, and verification best practices.",
  "/security"
);

const pillars = [
  {
    icon: ServerOff,
    title: "Zero server upload",
    desc: "PDF bytes never leave your browser during editing. We cannot access, log, or sell your documents.",
  },
  {
    icon: Lock,
    title: "HTTPS delivery only",
    desc: "The app is served over TLS. Static assets cache locally after first visit.",
  },
  {
    icon: FileCheck,
    title: "Permanent export",
    desc: "Redacted text is removed from the PDF stream; remaining text stays searchable.",
  },
  {
    icon: Shield,
    title: "Ad-free tool",
    desc: "The /tool route has no third-party ad scripts — fewer trackers while you work.",
  },
];

export default function SecurityPage() {
  return (
    <>
      <PageHero
        badge="Trust"
        title="Security & Privacy Architecture"
        subtitle="Built for lawyers, DPOs, and anyone who cannot send PDFs to the cloud."
      />
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-12 sm:grid-cols-2">
        {pillars.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-2xl border bg-white p-6 shadow-card">
            <Icon className="h-8 w-8 text-brand" />
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
      <LegalProse>
        <p>
          RedactPDF is a static web application. There is no API that accepts PDF uploads. Processing uses
          pdf.js for rendering and pdf-lib for export, orchestrated by JavaScript on your CPU.
        </p>
        <h2>Threat model we address</h2>
        <ul>
          <li>Cloud PDF vendors retaining copies on their servers</li>
          <li>Overlay redaction leaving recoverable text</li>
          <li>Accidental exfiltration via ad trackers on sensitive workflows (mitigated on /tool)</li>
        </ul>
        <h2>Threat model you must still manage</h2>
        <ul>
          <li>Malware on your device keylogging or screen-capturing</li>
          <li>Sharing the wrong unredacted attachment</li>
          <li>Backups (iCloud, OneDrive) syncing unredacted sources</li>
        </ul>
        <p>
          Read our <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
          <Link href="/disclaimer">Disclaimer</Link>. For enterprise questions,{" "}
          <Link href="/contact">contact us</Link>.
        </p>
      </LegalProse>
    </>
  );
}
