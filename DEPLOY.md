# Deploy RedactPDF (Vercel + PyMuPDF API)

Vercel **sirf Next.js frontend** host karta hai. **PyMuPDF backend** alag service par chalega (Railway ya Render — free tier se start).

```
User browser
    → your-app.vercel.app (Next.js)
    → /api/redact (Vercel serverless proxy)
    → api.railway.app (FastAPI + PyMuPDF)
    → redacted PDF download
```

---

## Step 1 — GitHub par code push

```bash
git add .
git commit -m "Add PyMuPDF redaction stack"
git push origin main
```

---

## Step 2 — Backend deploy (Railway — recommended)

1. [railway.app](https://railway.app) → Login with GitHub  
2. **New Project** → **Deploy from GitHub repo** → yeh repo select karo  
3. **Root directory** set karo: `backend`  
4. Railway Dockerfile detect karega (`backend/Dockerfile`)  
5. **Variables** tab mein add karo:

   | Variable | Example |
   |----------|---------|
   | `CORS_ORIGINS` | `https://your-app.vercel.app,https://redactpdf.io` |
   | `REDACT_API_KEY` | long random secret (`openssl rand -hex 32`) |
   | `PORT` | Railway auto-set karta hai — mat chhedo |

6. **Settings** → **Networking** → **Generate Domain**  
   - URL milega jaise: `https://redactpdf-api-production.up.railway.app`  
   - **Yeh copy karo** — yeh `REDACT_API_URL` hai  

7. Test: browser mein `https://YOUR-RAILWAY-URL/health` → `{"status":"ok","engine":"pymupdf"}`

### Render (alternative)

1. [render.com](https://render.com) → New **Web Service**  
2. Connect repo, **Root Directory**: `backend`  
3. Build: `pip install -r requirements.txt`  
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`  
5. Env: `CORS_ORIGINS` = your Vercel URL  
6. Copy public URL for Step 3  

---

## Step 3 — Vercel par frontend deploy

1. [vercel.com](https://vercel.com) → **Add New Project** → GitHub repo import  
2. **Framework**: Next.js (auto)  
3. **Root Directory**: `.` (repo root)  
4. **Environment Variables**:

   | Name | Value |
   |------|--------|
   | `REDACT_API_URL` | `https://YOUR-RAILWAY-URL` (no trailing slash) |
   | `REDACT_API_KEY` | same secret as Railway |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |
   | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | optional analytics |

5. **Deploy**  

6. Deploy ke baad **Settings → Environment Variables** mein `CORS_ORIGINS` wale Railway URL ko update karo agar pehle placeholder tha — Railway par **exact** Vercel domain add karo:

   ```
   https://redactpdf-xxx.vercel.app,https://redactpdf.io
   ```

7. Railway service **redeploy** (env change ke baad)

---

## Step 4 — Production test

1. `https://your-app.vercel.app/tool` kholo  
2. PDF upload → boxes → **Apply Redactions**  
3. Download → Ctrl+F se redacted text search (nahi milna chahiye)  

---

## Vercel limits (important)

| Plan | `/api/redact` timeout | Large PDF |
|------|----------------------|-----------|
| Hobby | ~10s | Choti files OK |
| Pro | 120s (code mein set) | Bari files better |

Bari PDFs (50MB+) ke liye Vercel **Pro** ya backend ko directly call karna (future).

---

## Custom domain

1. Vercel: domain add → `redactpdf.io`  
2. Railway `CORS_ORIGINS` mein `https://redactpdf.io` add karo  
3. `NEXT_PUBLIC_SITE_URL` update karo  

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Redaction server is offline" | `REDACT_API_URL` galat / Railway sleep — health URL check |
| CORS error | Railway `CORS_ORIGINS` mein exact Vercel URL |
| 502 timeout | PDF choti try karo ya Vercel Pro |
| Railway build fail | Root = `backend`, Python 3.12 |

---

## Local dev (reminder)

```bash
# Terminal 1
npm run dev:api

# Terminal 2
npm run dev
```

`.env.local`:
```
REDACT_API_URL=http://127.0.0.1:8000
```
