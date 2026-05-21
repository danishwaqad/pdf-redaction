"""PyMuPDF redaction engine — Acrobat-style apply_redactions."""

from __future__ import annotations

import json
from typing import Any

import fitz


class RedactionMark:
    __slots__ = ("page_index", "x", "y", "width", "height")

    def __init__(self, page_index: int, x: float, y: float, width: float, height: float):
        self.page_index = page_index
        self.x = x
        self.y = y
        self.width = width
        self.height = height


def _parse_marks(raw: list[dict[str, Any]]) -> list[RedactionMark]:
    marks: list[RedactionMark] = []
    for item in raw:
        marks.append(
            RedactionMark(
                page_index=int(item["pageIndex"]),
                x=float(item["x"]),
                y=float(item["y"]),
                width=float(item["width"]),
                height=float(item["height"]),
            )
        )
    return marks


def _pdf_rect_to_fitz(page: fitz.Page, mark: RedactionMark) -> fitz.Rect:
    """Convert pdf.js / PDF user-space (origin bottom-left) to PyMuPDF (origin top-left)."""
    h = page.rect.height
    x0 = mark.x
    x1 = mark.x + mark.width
    y_bottom = mark.y
    y_top = mark.y + mark.height
    fitz_y0 = h - y_top
    fitz_y1 = h - y_bottom
    return fitz.Rect(x0, fitz_y0, x1, fitz_y1)


def apply_redactions_pymupdf(
    pdf_bytes: bytes,
    redactions_json: str,
    *,
    secure_image_pages: bool = False,
    hybrid_page_indices: list[int] | None = None,
) -> bytes:
    marks = _parse_marks(json.loads(redactions_json))
    if not marks:
        raise ValueError("No redaction marks provided")

    hybrid_set = set(hybrid_page_indices or [])
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    by_page: dict[int, list[RedactionMark]] = {}
    for m in marks:
        if m.page_index < 0 or m.page_index >= doc.page_count:
            continue
        by_page.setdefault(m.page_index, []).append(m)

    for page_index, page_marks in by_page.items():
        page = doc[page_index]
        use_secure = secure_image_pages and page_index in hybrid_set

        for mark in page_marks:
            rect = _pdf_rect_to_fitz(page, mark)
            if rect.is_empty or not rect.is_valid:
                continue
            page.add_redact_annot(rect, fill=(0, 0, 0))

        page.apply_redactions(
            images=fitz.PDF_REDACT_IMAGE_REMOVE if use_secure else fitz.PDF_REDACT_IMAGE_PIXELS,
            graphics=fitz.PDF_REDACT_LINE_ART_REMOVE_IF_COVERED,
            text=fitz.PDF_REDACT_TEXT_REMOVE,
        )

    meta = doc.metadata or {}
    doc.set_metadata(
        {
            **meta,
            "title": "Redacted Document",
            "author": "",
            "subject": "",
            "keywords": "",
            "creator": "RedactPDF",
            "producer": "RedactPDF",
        }
    )

    out = doc.tobytes(garbage=4, deflate=True)
    doc.close()
    return out
