# SEO, Google Analytics & AdSense — redactpdf.org

This project is **Next.js** (no `index.html`). Meta tags live in `src/lib/seo.ts` and `src/app/layout.tsx`.

## 1. Vercel environment variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | `https://redactpdf.org` | Canonical, sitemap, OG |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | code from Search Console | Site ownership |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Google Analytics 4 |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | `ca-pub-...` | AdSense script |

Redeploy after changing env vars.

## 2. Google Search Console

1. [search.google.com/search-console](https://search.google.com/search-console)
2. Add property `https://redactpdf.org`
3. **HTML tag** method → copy verification code
4. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in Vercel
5. Redeploy → Verify in Search Console
6. Submit sitemap: `https://redactpdf.org/sitemap.xml`

## 3. Google Analytics 4

1. [analytics.google.com](https://analytics.google.com) → create property
2. Copy Measurement ID `G-...`
3. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel
4. Redeploy

## 4. Google AdSense

1. Apply at [adsense.google.com](https://adsense.google.com) with `redactpdf.org`
2. After approval, copy **Publisher ID** `ca-pub-...`
3. Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` in Vercel
4. Create ad units in AdSense dashboard
5. Paste `<ins class="adsbygoogle" ...>` into `src/components/layout/adsense-slot.tsx` (marked comment areas)
6. Ads show on **blog** and **about** only — not on `/tool`

## 5. Files map (your task list)

| You asked for | Implemented as |
|---------------|----------------|
| `index.html` `<head>` | `src/lib/seo.ts` + `layout.tsx` + `JsonLd` |
| `public/sitemap.xml` | `public/sitemap.xml` + dynamic `src/app/sitemap.ts` (includes blog) |
| `public/robots.txt` | `public/robots.txt` + `src/app/robots.ts` |
| `privacy-policy.html` | Next.js page `/privacy-policy` |
| `about.html` | Next.js page `/about` |
| `contact.html` | Next.js page `/contact` |
| Footer links | `src/components/layout/footer.tsx` |

## 6. Social image

- Live OG image: `https://redactpdf.org/opengraph-image` (auto-generated)
- Redirect: `/og-image.png` → `/opengraph-image`
