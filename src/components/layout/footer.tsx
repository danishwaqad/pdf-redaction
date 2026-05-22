"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FOOTER_BLURB } from "@/lib/site-messaging";

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
  const pathname = usePathname();
  if (pathname === "/tool") return null;

  return (
    <footer className="border-t bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-white">RedactPDF.org</p>
            <p className="mt-2 text-sm leading-relaxed">{FOOTER_BLURB}</p>
            <p className="mt-4 text-xs text-slate-500">Site launched {LAUNCH_DATE}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Legal</p>
            <ul className="mt-3 space-y-2 text-sm">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Resources</p>
            <ul className="mt-3 space-y-2 text-sm">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>
            <Link href="/privacy-policy" className="hover:text-slate-300">
              Privacy Policy
            </Link>
            {" · "}
            <Link href="/about" className="hover:text-slate-300">
              About
            </Link>
            {" · "}
            <Link href="/contact" className="hover:text-slate-300">
              Contact
            </Link>
          </p>
          <p className="mt-3">© 2026 RedactPDF.org</p>
          <p className="mt-2 text-xs">Not legal advice · Verify redactions before sharing</p>
        </div>
      </div>
    </footer>
  );
}
