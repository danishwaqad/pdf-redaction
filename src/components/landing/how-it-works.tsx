import { Upload, MousePointer2, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Open",
    desc: "Choose a PDF — it loads in your browser for preview and marking.",
  },
  {
    icon: MousePointer2,
    title: "Mark",
    desc: "Draw boxes, search text, or auto-detect emails, phones, SSNs & cards.",
  },
  {
    icon: Download,
    title: "Apply & download",
    desc: "Apply permanent redaction (HTTPS, not stored), then download with a certificate.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold">How it works</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-md">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
