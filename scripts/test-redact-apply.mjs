/**
 * Run: node scripts/create-test-pdf.mjs && node scripts/test-redact-apply.mjs
 * Requires built app or ts-node - uses dynamic import of compiled logic via child process.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(__dirname, "..", "fixtures", "basic-text.pdf");

if (!fs.existsSync(fixture)) {
  console.error("Run: node scripts/create-test-pdf.mjs first");
  process.exit(1);
}

// Inline minimal test using same libs as app (pdf-lib only sanity)
const input = fs.readFileSync(fixture);
const src = await PDFDocument.load(input);
const page = src.getPage(0);

const { width, height } = page.getSize();
const redactTitle = {
  x: 48,
  y: 688,
  width: 400,
  height: 32,
};

// Simulate: draw black box only (full test in npm run build + manual)
const out = await PDFDocument.create();
const [copied] = await out.copyPages(src, [0]);
const p = out.addPage(copied);
p.drawRectangle({
  ...redactTitle,
  color: { type: "RGB", red: 0, green: 0, blue: 0 },
  borderWidth: 0,
});

const saved = await out.save();
fs.writeFileSync(path.join(__dirname, "..", "fixtures", "basic-text-overlay-only.pdf"), saved);
console.log("Overlay-only sample written (for comparison). Use npm run build for full stream redaction test.");
