"""FastAPI PDF redaction service (PyMuPDF)."""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path


def _load_dotenv() -> None:
    env_file = Path(__file__).resolve().parent.parent / ".env"
    if not env_file.is_file():
        return
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    load_dotenv(env_file)


_load_dotenv()

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.redact_engine import apply_redactions_pymupdf
from app.security import require_api_key, validate_pdf_bytes

logger = logging.getLogger(__name__)

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
    request: Request,
    file: UploadFile = File(...),
    redactions: str = Form(...),
    options: str = Form(default="{}"),
):
    require_api_key(request)

    if file.content_type and "pdf" not in file.content_type.lower():
        raise HTTPException(400, "Upload must be a PDF file")

    try:
        opts = json.loads(options) if options else {}
    except json.JSONDecodeError as e:
        raise HTTPException(400, f"Invalid options JSON: {e}") from e

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(400, "Empty PDF file")

    validate_pdf_bytes(pdf_bytes)

    try:
        out = apply_redactions_pymupdf(
            pdf_bytes,
            redactions,
            secure_image_pages=bool(opts.get("secureImagePages")),
            hybrid_page_indices=opts.get("hybridPageIndices") or [],
        )
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except Exception:
        logger.exception("Redaction failed")
        raise HTTPException(500, "Internal redaction error") from None

    return Response(
        content=out,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="redacted.pdf"'},
    )
