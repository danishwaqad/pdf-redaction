import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "fixtures");
fs.mkdirSync(outDir, { recursive: true });

const doc = await PDFDocument.create();
const page = doc.addPage([612, 792]);
const font = await doc.embedFont(StandardFonts.Helvetica);

page.drawText("Sample Document for PDF Testing", { x: 50, y: 700, size: 24, font });
page.drawText("Introduction", { x: 50, y: 650, size: 12, font });
page.drawText(
  "This paragraph contains filler text to verify partial redaction. Only the title line should be removed.",
  { x: 50, y: 620, size: 11, font, maxWidth: 500 }
);

const bytes = await doc.save();
fs.writeFileSync(path.join(outDir, "basic-text.pdf"), bytes);
console.log("Wrote fixtures/basic-text.pdf", bytes.length, "bytes");
