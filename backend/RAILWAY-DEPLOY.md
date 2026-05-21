# Railway — Backend deploy (copy-paste)

## 1) New project

1. [railway.app](https://railway.app) → GitHub login  
2. **New Project** → **Deploy from GitHub repo** → `danishwaqad/pdf-redaction`  
3. Service open karo → **Settings**

## 2) Service settings (table)

| Field | Value |
|--------|--------|
| **Root Directory** | `backend` |
| **Builder** | Dockerfile (auto — `backend/Dockerfile`) |
| **Config file** | `railway.toml` (auto, same folder) |
| **Start Command** | *(khali rakho — `railway.toml` / Dockerfile use karega)* |
| **Healthcheck** | `/health` *(railway.toml mein already)* |

Agar Railway **Nixpacks** dikhaye (Dockerfile na mile):

| Field | Value |
|--------|--------|
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

Dockerfile wala route **preferred** (PyMuPDF stable).

## 3) Variables (table)

| Key | Value | Note |
|-----|--------|------|
| `CORS_ORIGINS` | `https://YOUR-APP.vercel.app` | Vercel deploy ke baad exact URL; comma se multiple |
| `PORT` | **mat add karo** | Railway khud set karta hai |

Example:

```
https://pdf-redaction.vercel.app
```

## 4) Public URL

1. **Settings** → **Networking** → **Generate Domain**  
2. URL copy karo, e.g. `https://pdf-redaction-production.up.railway.app`  
3. Test browser: `https://YOUR-URL/health`  

Expected:

```json
{"status":"ok","engine":"pymupdf"}
```

## 5) Vercel frontend

| Key | Value |
|-----|--------|
| `REDACT_API_URL` | `https://YOUR-URL.up.railway.app` *(no trailing `/`)* |

Vercel redeploy → phir Railway par `CORS_ORIGINS` mein wahi Vercel URL → Railway **Redeploy**.

## 6) Free / card

- Railway **trial credits** deta hai; khatam hone par card / plan.  
- Sleep kam hota hai Render se; pehli request tez.  
- Card nahi dena → `docs/DEPLOY-FREE-NO-CARD.md` (Hugging Face / tunnel).

## 7) Build fail?

| Error | Fix |
|-------|-----|
| `ModuleNotFoundError: app` | Root Directory `backend` set karo |
| Health check fail | `/health` open karo; logs mein uvicorn port `$PORT` dekho |
| CORS error in browser | `CORS_ORIGINS` = exact Vercel URL, redeploy Railway |
| `Redaction server offline` | Vercel `REDACT_API_URL` = Railway domain (https) |
