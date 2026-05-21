# RedactPDF — PyMuPDF API

Professional PDF redaction engine (Acrobat-style `apply_redactions`).

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Health: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service status |
| POST | `/redact` | multipart: `file` (PDF), `redactions` (JSON array), `options` (JSON) |

Redactions JSON shape:

```json
[
  { "pageIndex": 0, "x": 72, "y": 700, "width": 200, "height": 24 }
]
```

Coordinates: PDF user space, origin **bottom-left** (same as the web viewer).
