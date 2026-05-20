/**
 * Ensures redacting all "Sample" matches removes searchable Sample text.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { pathToFileURL } from "url";
import { extractAllTextSpans } from "../src/lib/pdf/text-extract.ts";
import { searchTextSpans } from "../src/lib/pdf/text-search.ts";
import { applyRedactionsPermanent } from "../src/lib/pdf/redact-apply.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(__dirname, "..", "fixtures", "basic-text.pdf");
const input = fs.readFileSync(fixture);

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

const doc = await pdfjs.getDocument({ data: new Uint8Array(input) }).promise;
const spans = await extractAllTextSpans(doc);
await doc.destroy();

const rects = searchTextSpans(spans, "Sample", false);
console.log("search rects for Sample:", rects.length);

const out = await applyRedactionsPermanent(
  input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength),
  rects,
  1
);

const outText = await extractText(out);
const sampleCount = (outText.match(/sample/gi) || []).length;
console.log("Chars after:", outText.length);
console.log("Sample matches remaining:", sampleCount);

if (sampleCount === 0) {
  console.log("PASS: no searchable Sample remains");
} else {
  console.error("FAIL");
  process.exit(1);
}
