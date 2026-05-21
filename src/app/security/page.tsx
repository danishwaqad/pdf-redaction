import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Server, FileCheck } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { LegalProse } from "@/components/layout/legal-prose";
import { REDACTION_DATA_FLOW } from "@/lib/site-messaging";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Security — PDF Redaction Architecture",
  "How RedactPDF works: browser marking, secure apply over HTTPS, no file storage, verification best practices.",
  "/security"
);

const pillars = [
  {
    icon: Server,
    title: "Apply over HTTPS only",
    desc: "When you export, the PDF is sent to our secure redaction service, processed in memory, and returned. We do not store files.",
  },
  {
    icon: Lock,
    title: "HTTPS everywhere",
    desc: "The site and redaction service are served over TLS. Static assets cache locally after first visit.",
  },
  {
    icon: FileCheck,
    title: "Permanent removal",
    desc: "Redacted text is removed from the PDF stream; remaining text stays searchable where not redacted.",
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
        subtitle="Mark locally. Apply securely. No cloud inbox for your documents."
      />
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:px-8">
        {pillars.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-2xl border bg-white p-6 shadow-card">
            <Icon className="h-8 w-8 text-brand" />
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
      <LegalProse>
        <p>{REDACTION_DATA_FLOW}</p>
        <h2>What runs in your browser</h2>
        <ul>
          <li>PDF preview, thumbnails, and text search</li>
          <li>Marking redaction boxes, undo/redo, PII pattern search</li>
          <li>Optional OCR for scanned pages</li>
        </ul>
        <h2>What runs when you apply redaction</h2>
        <ul>
          <li>Secure server processing to permanently remove text inside your boxes</li>
          <li>In-memory handling only — no persistent PDF storage on our side</li>
        </ul>
        <h2>Threat model we address</h2>
        <ul>
          <li>Cloud PDF vendors retaining long-term copies on their servers</li>
          <li>Overlay redaction leaving recoverable text</li>
          <li>Accidental exfiltration via ad trackers on sensitive workflows (mitigated on /tool)</li>
        </ul>
        <h2>Threat model you must still manage</h2>
        <ul>
          <li>Malware on your device keylogging or screen-capturing</li>
          <li>Sharing the wrong unredacted attachment</li>
          <li>Backups (iCloud, OneDrive) syncing unredacted sources</li>
          <li>Network exposure during HTTPS apply — use trusted networks for highly sensitive work</li>
        </ul>
        <p>
          Read our <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
          <Link href="/disclaimer">Disclaimer</Link>. For questions,{" "}
          <Link href="/contact">contact us</Link>.
        </p>
      </LegalProse>
    </>
  );
}
