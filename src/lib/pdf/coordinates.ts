import type { RedactionRect } from "./types";

/** Convert screen overlay rect (top-left origin) to PDF coords (bottom-left origin). */
export function screenRectToPdf(
  left: number,
  top: number,
  width: number,
  height: number,
  pageHeight: number,
  scale: number
): Pick<RedactionRect, "x" | "y" | "width" | "height"> {
  const x = left / scale;
  const w = width / scale;
  const h = height / scale;
  const y = pageHeight - (top / scale) - h;
  return { x, y, width: w, height: h };
}

/** Convert PDF rect to screen overlay (top-left origin). */
export function pdfRectToScreen(
  rect: Pick<RedactionRect, "x" | "y" | "width" | "height">,
  pageHeight: number,
  scale: number
): { left: number; top: number; width: number; height: number } {
  const left = rect.x * scale;
  const width = rect.width * scale;
  const height = rect.height * scale;
  const top = (pageHeight - rect.y - rect.height) * scale;
  return { left, top, width, height };
}
