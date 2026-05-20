import Link from "next/link";

const legalLinks = [
  { href: "/about", label: "About" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms-of-service", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
];

const resourceLinks = [
  { href: "/tool", label: "Redact PDF Tool" },
  { href: "/faq", label: "FAQ" },
  { href: "/security", label: "Security" },
];

const LAUNCH_DATE = "April 28, 2026";

export function Footer() {
  return (
    <footer className="border-t bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-white">RedactPDF.io</p>
            <p className="mt-2 text-sm leading-relaxed">
              Free browser-only PDF redaction. No upload. No signup. Permanent removal.
            </p>
            <p className="mt-4 text-xs text-slate-500">Site launched {LAUNCH_DATE}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Company
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Product
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {resourceLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-center text-xs md:flex-row md:text-left">
          <p>© 2026 RedactPDF. Not affiliated with Adobe®.</p>
          <p className="text-slate-500">Not legal advice · Verify redactions before sharing</p>
        </div>
      </div>
    </footer>
  );
}
