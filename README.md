# RedactPDF

Free, browser-only PDF redaction. No upload, no signup — built with Next.js 14, pdf.js, pdf-lib, and Zustand.

## Features

- Drag-drop PDF upload (max 100MB) with pdf.js viewer
- Manual redaction rectangles (click + drag)
- Text search with optional regex — Redact All
- Auto-detect: email, phone, credit card (Luhn), dates, SSN
- Permanent redaction via page rasterization (copy-paste safe)
- Redaction certificate `.txt` download
- SEO landing page, blog, FAQ schema, Plausible analytics hook

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel)

1. Import repo to Vercel
2. Set `NEXT_PUBLIC_SITE_URL` and optional `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
3. Deploy — static + edge OG image, no backend required

## Chrome extension

Copy `public/extension-manifest.json` to `manifest.json` in an unpacked extension folder along with `extension-background.js` and icons.

## Site pages (21 routes)

| Path | Purpose |
|------|---------|
| `/` | SEO landing (no ads) |
| `/tool` | Redaction editor (no ads) |
| `/blog` + 5 MDX posts | Content + AdSense placeholders |
| `/about` | Trust page (ads allowed) |
| `/privacy-policy`, `/terms-of-service`, `/disclaimer`, `/contact` | Legal / AdSense trust |
| `/faq`, `/security` | SEO + trust |

## Project structure

```
content/blog/       # MDX posts (1500+ words)
src/
├── app/              # Next.js routes, OG image, sitemap
├── components/
│   ├── app/          # Editor shell
│   ├── landing/      # Marketing sections
│   ├── layout/       # Header, footer, privacy banner
│   ├── pdf/          # Viewer, uploader, tools
│   └── ui/           # shadcn-style primitives
├── lib/pdf/          # pdf.js loader, patterns, redact engine
└── store/            # Zustand + immer undo/redo
```
