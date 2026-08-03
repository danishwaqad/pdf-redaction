import Link from "next/link";
import { COMPARISON_STORES_PDF } from "@/lib/site-messaging";

const rows = [
  { feature: "Price", redactpdf: "Free", ilovepdf: "Freemium", adobe: "Paid", smallpdf: "Freemium" },
  {
    feature: "Stores your PDF",
    redactpdf: COMPARISON_STORES_PDF,
    ilovepdf: "Upload workflow",
    adobe: "Varies",
    smallpdf: "Yes",
  },
  { feature: "Signup", redactpdf: "No", ilovepdf: "Often", adobe: "Yes", smallpdf: "Often" },
  { feature: "Permanent redaction", redactpdf: "Core focus", ilovepdf: "Not core", adobe: "Yes (Pro)", smallpdf: "Limited" },
  { feature: "PII auto-detect", redactpdf: "Yes", ilovepdf: "No", adobe: "Limited", smallpdf: "No" },
];

export function ComparisonTable() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Better than iLovePDF for confidential PDFs
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          100% free redaction — we do not save your personal files. Compare vs iLovePDF, Adobe, and
          Smallpdf for permanent text removal (not merge/compress).
        </p>
        <div className="mt-10 overflow-x-auto rounded-2xl border shadow-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold">Feature</th>
                <th className="px-4 py-3 text-center font-semibold text-brand">RedactPDF</th>
                <th className="px-4 py-3 text-center font-semibold">iLovePDF</th>
                <th className="px-4 py-3 text-center font-semibold">Adobe Acrobat</th>
                <th className="px-4 py-3 text-center font-semibold">Smallpdf</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{row.feature}</td>
                  <td className="bg-accent/30 px-4 py-3 text-center font-medium">{row.redactpdf}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{row.ilovepdf}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{row.adobe}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{row.smallpdf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted-foreground">
          Need merge or compress? Use iLovePDF. Need{" "}
          <strong className="font-medium text-foreground">edit PDF online free</strong> to{" "}
          <strong className="font-medium text-foreground">remove text</strong>? See our{" "}
          <Link href="/blog/ilovepdf-alternative-free-pdf-redaction" className="text-brand hover:underline">
            iLovePDF alternative
          </Link>{" "}
          and{" "}
          <Link href="/blog/edit-pdf-online-remove-text-free" className="text-brand hover:underline">
            edit PDF to redact guide
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
