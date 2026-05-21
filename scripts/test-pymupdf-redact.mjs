/**
 * Integration test: PyMuPDF API must be running on :8000
 * Run: npm run dev:api  (separate terminal)
 *      node scripts/test-pymupdf-redact.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(__dirname, "..", "fixtures", "basic-text.pdf");
const api = process.env.REDACT_API_URL ?? "http://127.0.0.1:8000";

const health = await fetch(`${api}/health`);
if (!health.ok) {
  console.error("API not running at", api);
  process.exit(1);
}

const pdf = fs.readFileSync(fixture);
const form = new FormData();
form.append("file", new Blob([pdf], { type: "application/pdf" }), "basic-text.pdf");
form.append(
  "redactions",
  JSON.stringify([{ pageIndex: 0, x: 40, y: 680, width: 280, height: 50 }])
);
form.append("options", "{}");

const res = await fetch(`${api}/redact`, { method: "POST", body: form });
if (!res.ok) {
  console.error("redact failed", res.status, await res.text());
  process.exit(1);
}

const outPath = path.join(__dirname, "..", "fixtures", "basic-text-pymupdf-out.pdf");
fs.writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
console.log("Wrote", outPath);
console.log("PASS: API redact", res.status);
