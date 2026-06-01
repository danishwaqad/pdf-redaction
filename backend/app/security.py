"""Production guards for the redaction API."""

from __future__ import annotations

import os
import secrets

from fastapi import HTTPException, Request

MAX_PDF_BYTES = 100 * 1024 * 1024
API_KEY_HEADER = "x-redact-api-key"


def _configured_api_key() -> str:
    return os.getenv("REDACT_API_KEY", "").strip()


def _is_railway_deploy() -> bool:
    return bool(os.getenv("RAILWAY_ENVIRONMENT_NAME") or os.getenv("RAILWAY_PUBLIC_DOMAIN"))


def _api_key_required() -> bool:
    force = os.getenv("REQUIRE_API_KEY", "").strip().lower()
    if force in ("1", "true", "yes"):
        return True
    return _is_railway_deploy()


def auth_status() -> dict[str, bool]:
    return {
        "api_key_configured": bool(_configured_api_key()),
        "api_key_required": _api_key_required(),
        "on_railway": _is_railway_deploy(),
    }


def require_api_key(request: Request) -> None:
    expected = _configured_api_key()
    required = _api_key_required()

    if required and not expected:
        raise HTTPException(
            status_code=503,
            detail="REDACT_API_KEY is not set. Add it in Railway Variables and redeploy.",
        )
    if not expected:
        return

    provided = request.headers.get(API_KEY_HEADER, "").strip()
    if not provided or not secrets.compare_digest(provided, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")


def validate_pdf_bytes(pdf_bytes: bytes) -> None:
    if len(pdf_bytes) > MAX_PDF_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 100 MB)")
    if not pdf_bytes.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Invalid PDF file")
