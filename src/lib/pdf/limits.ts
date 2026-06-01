/** Shared upload limits (frontend uploader + Vercel /api/redact proxy). */
export const MAX_PDF_BYTES = 100 * 1024 * 1024;

export function isPdfMagicBytes(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  );
}
