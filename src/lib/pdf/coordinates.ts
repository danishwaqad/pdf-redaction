import type { RedactionRect } from "./types";

export type ViewportTransform = [number, number, number, number, number, number];

export function viewportTransformFromPdfJs(transform: number[]): ViewportTransform {
  const t = transform.length >= 6 ? transform : [1, 0, 0, 1, 0, 0];
  return [t[0], t[1], t[2], t[3], t[4], t[5]];
}

function pdfToCanvas(px: number, py: number, m: ViewportTransform): [number, number] {
  return [m[0] * px + m[2] * py + m[4], m[1] * px + m[3] * py + m[5]];
}

function canvasToPdf(cx: number, cy: number, m: ViewportTransform): [number, number] {
  const det = m[0] * m[3] - m[1] * m[2];
  if (Math.abs(det) < 1e-10) return [cx, cy];
  const dx = cx - m[4];
  const dy = cy - m[5];
  return [
    (m[3] * dx - m[2] * dy) / det,
    (-m[1] * dx + m[0] * dy) / det,
  ];
}

export function screenRectToPdfWithViewport(
  left: number,
  top: number,
  width: number,
  height: number,
  transform: ViewportTransform
): Pick<RedactionRect, "x" | "y" | "width" | "height"> {
  const [x1, y1] = canvasToPdf(left, top, transform);
  const [x2, y2] = canvasToPdf(left + width, top + height, transform);
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

export function pdfRectToScreenWithViewport(
  rect: Pick<RedactionRect, "x" | "y" | "width" | "height">,
  transform: ViewportTransform
): { left: number; top: number; width: number; height: number } {
  const [sx1, sy1] = pdfToCanvas(rect.x, rect.y, transform);
  const [sx2, sy2] = pdfToCanvas(rect.x + rect.width, rect.y + rect.height, transform);
  return {
    left: Math.min(sx1, sx2),
    top: Math.min(sy1, sy2),
    width: Math.abs(sx2 - sx1),
    height: Math.abs(sy2 - sy1),
  };
}
