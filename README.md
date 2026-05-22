# redactpdf.org - Privacy-first PDF Redactor

> Redact PDFs 100% in your browser. No uploads. No servers. Open source.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://redactpdf.org)
[![GitHub Stars](https://img.shields.io/github/stars/danishwaqad/pdf-redaction)](https://github.com/danishwaqad/pdf-redaction/stargazers)

**[Live Demo → redactpdf.org](https://redactpdf.org)** | **[Report Bug](https://github.com/danishwaqad/pdf-redaction/issues)** | **[Request Feature](https://github.com/danishwaqad/pdf-redaction/issues)**

---

## 🔒 The Problem

Most "free" PDF redactors upload your sensitive documents to their servers:
- Tax returns
- Bank statements 
- Legal contracts
- Medical records

**That's a massive privacy risk.** Once uploaded, you lose control.

## ✅ Our Solution

**redactpdf.org runs entirely in your browser.** 

1. **Zero Uploads:** Your file never leaves your device. Open DevTools → Network → See zero requests during redaction.
2. **Permanent Redaction:** Actually burns pixels into the PDF. Not a black overlay that can be removed.
3. **Works Offline:** 100% client-side. Airplane mode me bhi chalega.
4. **Open Source:** Audit the code yourself. Self-host it. MIT licensed.

## 🚀 Demo

![Demo GIF](https://raw.githubusercontent.com/danishwaqad/pdf-redaction/main/demo.gif)

**Try it now:** Upload a PDF → Draw boxes → Download redacted file. Takes 10 seconds.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TailwindCSS
- **PDF Engine:** PDF-lib + WASM for client-side manipulation
- **Backend:** FastAPI (Python) - Optional, for advanced redaction only
- **Deployment:** Vercel

**Core redaction is 100% client-side.** Backend is only used if you enable "Smart Redaction" mode.

## 📦 Self-Hosting

### 1. Clone & Install
```bash
git clone https://github.com/danishwaqad/pdf-redaction.git
cd pdf-redaction
npm install
