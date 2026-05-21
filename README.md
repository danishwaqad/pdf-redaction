# RedactPDF

Professional PDF redaction — draw boxes, search, detect PII, apply permanent redaction.

## Stack

| Layer | Technology |
|-------|------------|
| UI | Next.js 14, pdf.js, Zustand |
| Redaction | FastAPI + **PyMuPDF** |
| Preview & marks | Browser |

## Features

- Manual redaction boxes with undo/redo
- Text search (regex) and PII auto-detect
- Permanent redaction (text removed from the PDF, not only covered)
- Scanned PDF OCR (browser Tesseract)
- Hybrid PDF detection (Canva-style) + optional secure page mode

## Local development

**Terminal 1 — redaction API**

```bash
npm run dev:api
```

**Terminal 2 — website**

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000/tool](http://localhost:3000/tool).

`.env.local`:

```env
REDACT_API_URL=http://127.0.0.1:8000
```

## Project layout

```
backend/           FastAPI + PyMuPDF
src/
  app/api/redact/  Proxy to backend
  components/pdf/  Viewer, toolbar, sidebar
  lib/pdf/         Viewer helpers + API client
  store/           App state
```

## Deploy

See [DEPLOY.md](./DEPLOY.md) — Vercel (frontend) + Railway/Render (API).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js |
| `npm run dev:api` | PyMuPDF API |
| `node scripts/test-pymupdf-redact.mjs` | API smoke test (API must be running) |
