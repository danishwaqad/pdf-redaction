/**
 * Verifies selective redaction: title removed, Introduction still searchable.
 * Run: node scripts/create-test-pdf.mjs && npx tsx scripts/verify-redact.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { PDFDocument, StandardFonts } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(__dirname, "..", "fixtures", "basic-text.pdf");

function clonePdfBytes(u8) {
  const c = new Uint8Array(u8.length);
  c.set(u8);
  return c;
}

import { pathToFileURL } from "url";
pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
  path.join(__dirname, "..", "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs")
).href;

async function extractText(bytes) {
  const doc = await pdfjs.getDocument({ data: bytes }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    text += tc.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
  }
  await doc.destroy();
  return text.replace(/\s+/g, " ").trim();
}

// Build redaction rect for title (from pdf.js positions)
const input = new Uint8Array(fs.readFileSync(fixture));
const doc = await pdfjs.getDocument({ data: input.slice() }).promise;
const page = await doc.getPage(1);
const tc = await page.getTextContent();
let titleRect = null;
for (const item of tc.items) {
  if ("str" in item && item.str.includes("Sample Document")) {
    const t = item.transform;
    const h = Math.hypot(t[2], t[3]) || 12;
    titleRect = {
      pageIndex: 0,
      x: t[4] - 2,
      y: t[5] - h * 0.2,
      width: (item.width || item.str.length * h * 0.5) + 4,
      height: h * 1.2 + 4,
      id: "test",
      source: "search",
    };
    break;
  }
}
await doc.destroy();

if (!titleRect) {
  console.error("Could not find title in PDF");
  process.exit(1);
}

// Dynamic import TS redact module
const { applyRedactionsPermanent } = await import("../src/lib/pdf/redact-apply.ts");

const out = await applyRedactionsPermanent(clonePdfBytes(input), [titleRect], 1);

const outText = await extractText(out);
const hasIntro = outText.includes("Introduction");
const hasSample = outText.includes("Sample Document");

console.log("Chars after redact:", outText.length);
console.log("Has Introduction:", hasIntro);
console.log("Has Sample (should be false):", hasSample);

if (hasIntro && !hasSample && outText.length > 50) {
  console.log("PASS: selective redaction OK");
  fs.writeFileSync(path.join(__dirname, "..", "fixtures", "basic-text-redacted.pdf"), out);
} else {
  console.error("FAIL");
  process.exit(1);
}
