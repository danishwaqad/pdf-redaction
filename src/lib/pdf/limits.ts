/** Shared upload limits (browser + Railway API). */
export const MAX_PDF_BYTES = 100 * 1024 * 1024;

export function compactRedactionsForApi(
  redactions: {
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }[]
) {
  return redactions.map((r) => ({
    pageIndex: r.pageIndex,
    x: Math.round(r.x * 10) / 10,
    y: Math.round(r.y * 10) / 10,
    width: Math.round(r.width * 10) / 10,
    height: Math.round(r.height * 10) / 10,
  }));
}

export function isPdfMagicBytes(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  );
}
