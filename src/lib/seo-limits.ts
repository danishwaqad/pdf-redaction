/** Bing/Google SERP limits used across the site */
export const SEO_TITLE_MAX = 60;
export const SEO_DESC_MAX = 160;
export const SEO_DESC_MIN = 25;

export function clampSeoTitle(title: string, max = SEO_TITLE_MAX): string {
  const t = title.trim();
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const cut =
    lastSpace > Math.floor(max * 0.55) ? slice.slice(0, lastSpace) : slice.slice(0, max - 1);
  return cut.replace(/[—\-:,|]+$/, "").trim();
}

export function clampSeoDescription(description: string, max = SEO_DESC_MAX): string {
  const d = description.trim();
  if (d.length <= max) return d;
  const slice = d.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return (
    lastSpace > Math.floor(max * 0.55) ? slice.slice(0, lastSpace) : slice.slice(0, max - 1)
  ).trim();
}
