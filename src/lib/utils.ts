import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function redactedFilename(original: string): string {
  const base = original.replace(/\.pdf$/i, "") || "document";
  return `REDACTED_${base}.pdf`;
}

export function certificateFilename(original: string): string {
  const base = original.replace(/\.pdf$/i, "") || "document";
  return `${base}_redaction_certificate.txt`;
}

/** Frontmatter date (YYYY-MM-DD) → e.g. "Jun 14, 2026" */
export function formatBlogDate(iso: string): string {
  const d = new Date(`${iso.trim()}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** readTime frontmatter → "14 min read" */
export function formatReadTime(readTime: string): string {
  const t = readTime.trim();
  if (!t) return "";
  return /\bread\b/i.test(t) ? t : `${t} read`;
}
