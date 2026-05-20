const rows = [
  { feature: "Price", redactpdf: "Free", adobe: "Paid", smallpdf: "Freemium" },
  { feature: "Upload Required", redactpdf: "No", adobe: "Yes", smallpdf: "Yes" },
  { feature: "Signup", redactpdf: "No", adobe: "Yes", smallpdf: "Often" },
  { feature: "Unlimited", redactpdf: "Yes", adobe: "No", smallpdf: "Limited" },
];

export function ComparisonTable() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight">Why RedactPDF wins</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Compare the only free tool that never uploads your file.
        </p>
        <div className="mt-10 overflow-x-auto rounded-2xl border shadow-card">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold">Feature</th>
                <th className="px-4 py-3 text-center font-semibold text-brand">RedactPDF</th>
                <th className="px-4 py-3 text-center font-semibold">Adobe Acrobat</th>
                <th className="px-4 py-3 text-center font-semibold">Smallpdf</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{row.feature}</td>
                  <td className="bg-accent/30 px-4 py-3 text-center font-medium">{row.redactpdf}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{row.adobe}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{row.smallpdf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
