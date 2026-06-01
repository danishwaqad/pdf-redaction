# Fly.io par backend deploy (free tier friendly)

Backend: FastAPI + PyMuPDF — same code as Railway, different host.

## Region (Pakistan ke liye)

Fly dashboard → **sin** (Singapore) — Asia Pacific, Pakistan se achha latency.

Alternatives: `bom` (Mumbai) agar `sin` na mile.

## Pehli dafa (one-time)

1. Account: [fly.io](https://fly.io) → Sign up (card optional on free tier, verification hold ho sakta hai)
2. Install CLI (optional): `flyctl auth login`
3. Repo connect: GitHub → `danishwaqad/pdf-redaction`

## Deploy steps (dashboard — easiest)

1. **Dashboard** → **Launch an App** → **Import from GitHub**
2. Repo: `danishwaqad/pdf-redaction`
3. **Branch:** `main`
4. **App name:** `redactpdf-api`
5. **Region:** `Singapore (sin)` ya jo AP mein available ho
6. **Configure:**
   - **Dockerfile path:** `backend/Dockerfile`
   - **Internal port:** `8000` (Dockerfile `EXPOSE 8000` — **8080 mat use karo**)
7. **Environment variables** (Secrets):

| Key | Value |
|-----|--------|
| `PORT` | `8000` |
| `CORS_ORIGINS` | `https://redactpdf.org,https://www.redactpdf.org` (Vercel URLs apne domain ke hisaab se) |

8. **Deploy** click karo
9. Public URL milega: `https://redactpdf-api.fly.dev` (ya custom domain baad mein)

## CLI se deploy (repo root se)

```bash
cd D:\CSharp-Testing\pdf-redaction
fly launch --config backend/fly.toml
```

Pehli deploy ke baad env:

```bash
fly secrets set CORS_ORIGINS="https://redactpdf.org,https://www.redactpdf.org" -a redactpdf-api
```

## Health check

```text
https://redactpdf-api.fly.dev/health
```

Expected: `{"status":"ok","engine":"pymupdf"}`

## Vercel connect

Vercel → Environment Variables:

```
REDACT_API_URL=https://redactpdf-api.fly.dev
```

(ya apna custom domain jab Fly par point karo)

Redeploy frontend.

## Free tier notes

- Fly free allowance chhota hai; low traffic API ke liye months tak free reh sakta hai
- Machine **sleep** ho jati hai inactivity ke baad (pehli request slow)
- **Always-on** chahiye to `min_machines_running = 1` fly.toml mein set kar sakte ho (cost badhega)

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fail | Logs dekho; `backend` root + Dockerfile path confirm karo |
| 502 on /redact | Logs → app crash; `PORT` env check karo |
| CORS error | `CORS_ORIGINS` exact Vercel URL + Fly redeploy |
| PyMuPDF heavy | `VM.Standard.A1.Flex` 1 OCPU 6GB enough for start |

## Railway band karna

Fly deploy ke baad Railway service **pause/delete** karo taake accidental charge na aaye.