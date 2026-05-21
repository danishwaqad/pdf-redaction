"""FastAPI PDF redaction service (PyMuPDF)."""

from __future__ import annotations

import json
import os

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.redact_engine import apply_redactions_pymupdf

app = FastAPI(title="RedactPDF API", version="1.0.0")

_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "engine": "pymupdf"}


@app.post("/redact")
async def redact(
    file: UploadFile = File(...),
    redactions: str = Form(...),
    options: str = Form(default="{}"),
):
    if file.content_type and "pdf" not in file.content_type.lower():
        raise HTTPException(400, "Upload must be a PDF file")

    try:
        opts = json.loads(options) if options else {}
    except json.JSONDecodeError as e:
        raise HTTPException(400, f"Invalid options JSON: {e}") from e

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(400, "Empty PDF file")

    try:
        out = apply_redactions_pymupdf(
            pdf_bytes,
            redactions,
            secure_image_pages=bool(opts.get("secureImagePages")),
            hybrid_page_indices=opts.get("hybridPageIndices") or [],
        )
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except Exception as e:
        raise HTTPException(500, f"Redaction failed: {e}") from e

    return Response(
        content=out,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="redacted.pdf"'},
    )
