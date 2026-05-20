import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const doc = await PDFDocument.create();
const page = doc.addPage([612, 792]);
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);

page.drawText("Sample Document for PDF Testing", { x: 50, y: 720, size: 22, font: bold });
page.drawText("Introduction", { x: 50, y: 680, size: 16, font: bold });
page.drawText(
  "This is a sample PDF document for testing redaction. It contains multiple sections.",
  { x: 50, y: 655, size: 11, font, maxWidth: 500 }
);
page.drawText("Text Formatting Examples", { x: 50, y: 610, size: 14, font: bold });
page.drawText("Bold and italic styles may appear in exported PDFs from other tools.", {
  x: 50,
  y: 585,
  size: 11,
  font,
  maxWidth: 500,
});
page.drawText("Lists", { x: 50, y: 540, size: 14, font: bold });
page.drawText("1. First ordered item\n2. Second ordered item\n• Bullet one\n• Bullet two", {
  x: 50,
  y: 480,
  size: 11,
  font,
  lineHeight: 16,
});

const bytes = await doc.save();
fs.writeFileSync(path.join(__dirname, "..", "fixtures", "basic-text.pdf"), bytes);
console.log("Wrote rich basic-text.pdf", bytes.length);
