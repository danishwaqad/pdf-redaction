# Test Railway /redact API (PowerShell 5.1+)
# Usage:
#   cd D:\CSharp-Testing\pdf-redaction
#   .\scripts\test-railway-redact.ps1
#
# Optional: set API key before running (same as Railway/Vercel)
#   $env:REDACT_API_KEY = "your-secret-here"
#   .\scripts\test-railway-redact.ps1

$ErrorActionPreference = "Stop"

$ApiBase = if ($env:REDACT_API_URL) { $env:REDACT_API_URL.TrimEnd("/") } else { "https://pdf-redaction-production.up.railway.app" }
$RedactUri = "$ApiBase/redact"
$HealthUri = "$ApiBase/health"

$PdfPath = if ($env:TEST_PDF_PATH) { $env:TEST_PDF_PATH } else { "C:\Users\HP\Downloads\basic-text.pdf" }

# Redaction box (pdf.js coords, bottom-left origin) - adjust if needed
$RedactJson = '[{"pageIndex":0,"x":40,"y":680,"width":280,"height":50}]'

function Write-TestHeader([string]$Title) {
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host $Title -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Cyan
}

function Invoke-RedactRequest {
    param(
        [string]$Label,
        [hashtable]$ExtraHeaders = @{},
        [string]$OutFile = $null
    )

    if (-not (Test-Path -LiteralPath $PdfPath)) {
        throw "PDF not found: $PdfPath"
    }

    # curl on Windows mangles inline JSON quotes; send from temp files instead
    $redactFile = [System.IO.Path]::GetTempFileName()
    $optionsFile = [System.IO.Path]::GetTempFileName()
    try {
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($redactFile, $RedactJson, $utf8NoBom)
        [System.IO.File]::WriteAllText($optionsFile, "{}", $utf8NoBom)

        $curlArgs = @(
            "-s", "-S",
            "-w", "`nHTTP_STATUS:%{http_code}`n",
            "-X", "POST",
            $RedactUri
        )

        foreach ($key in $ExtraHeaders.Keys) {
            $curlArgs += @("-H", "${key}: $($ExtraHeaders[$key])")
        }

        $curlArgs += @(
            "-F", "file=@$PdfPath",
            "-F", "redactions=<$redactFile",
            "-F", "options=<$optionsFile"
        )

        if ($OutFile) {
            $curlArgs += @("-o", $OutFile)
        }

        Write-Host "Request: $Label"
        Write-Host "  URL:   $RedactUri"
        Write-Host "  PDF:   $PdfPath"

        $raw = & curl.exe @curlArgs 2>&1
    } finally {
        Remove-Item -LiteralPath $redactFile, $optionsFile -Force -ErrorAction SilentlyContinue
    }
    $text = ($raw | Out-String).Trim()

    if ($text -match "HTTP_STATUS:(\d+)") {
        $status = [int]$Matches[1]
        $body = ($text -replace "HTTP_STATUS:\d+\s*", "").Trim()
    } else {
        $status = 0
        $body = $text
    }

    $color = "Red"
    if ($status -ge 200 -and $status -lt 300) { $color = "Green" }
    elseif ($status -eq 401) { $color = "Yellow" }
    Write-Host "  Status: $status" -ForegroundColor $color
    if ($body) {
        $preview = if ($body.Length -gt 300) { $body.Substring(0, 300) + "..." } else { $body }
        Write-Host "  Body:   $preview"
    }
    if ($OutFile -and (Test-Path -LiteralPath $OutFile)) {
        $len = (Get-Item -LiteralPath $OutFile).Length
        Write-Host "  Saved:  $OutFile ($len bytes)" -ForegroundColor Green
    }

    return @{ Status = $status; Body = $body }
}

# --- Health ---
Write-TestHeader "Test 0 - Health check"
$health = & curl.exe -s -S $HealthUri 2>&1
Write-Host "  GET $HealthUri"
Write-Host "  $health"

if ($health -notmatch '"status"\s*:\s*"ok"') {
    Write-Host "WARNING: Health did not return ok. Fix Railway deploy first." -ForegroundColor Yellow
}
if ($health -match '"api_key_configured"\s*:\s*false') {
    Write-Host "WARNING: REDACT_API_KEY is NOT loaded in this Railway container." -ForegroundColor Red
    Write-Host "  Fix: Railway -> Variables -> REDACT_API_KEY -> Redeploy" -ForegroundColor Yellow
}
if ($health -notmatch '"api_key_configured"') {
    Write-Host "WARNING: Old backend deployed (no auth fields on /health). Push latest code + Redeploy." -ForegroundColor Red
}

# --- Test A: no API key (expect 401 if REDACT_API_KEY is set on Railway) ---
Write-TestHeader "Test 1 - No API key (expect 401)"
$r1 = Invoke-RedactRequest -Label "No x-redact-api-key header"
if ($r1.Status -eq 401) {
    Write-Host "PASS: Backend rejected request without key." -ForegroundColor Green
} elseif ($r1.Status -eq 200) {
    Write-Host "FAIL: Got 200 without key - REDACT_API_KEY may not be set on Railway." -ForegroundColor Red
} else {
    Write-Host "NOTE: Expected 401; got $($r1.Status). Check body above." -ForegroundColor Yellow
}

# --- Test B: wrong key (expect 401) ---
Write-TestHeader "Test 2 - Wrong API key (expect 401)"
$r2 = Invoke-RedactRequest -Label "Wrong key" -ExtraHeaders @{ "x-redact-api-key" = "wrong-key-on-purpose" }
if ($r2.Status -eq 401) {
    Write-Host "PASS: Backend rejected wrong key." -ForegroundColor Green
} else {
    Write-Host "NOTE: Expected 401; got $($r2.Status)." -ForegroundColor Yellow
}

# --- Test C: correct key (expect 200) ---
Write-TestHeader "Test 3 - Correct API key (expect 200 + PDF)"

$apiKey = $env:REDACT_API_KEY
if (-not $apiKey) {
    $envLocal = Join-Path (Split-Path -Parent $PSScriptRoot) ".env.local"
    if ($envLocal -and (Test-Path -LiteralPath $envLocal)) {
        Get-Content -LiteralPath $envLocal | ForEach-Object {
            if ($_ -match '^\s*REDACT_API_KEY\s*=\s*(.+)\s*$') {
                $apiKey = $Matches[1].Trim().Trim('"').Trim("'")
            }
        }
    }
}

if (-not $apiKey) {
    Write-Host "SKIP: Set `$env:REDACT_API_KEY or add REDACT_API_KEY to .env.local" -ForegroundColor Yellow
    Write-Host '  Example: $env:REDACT_API_KEY = "your-railway-secret"; .\scripts\test-railway-redact.ps1'
} else {
    $outPdf = Join-Path $env:USERPROFILE "Downloads\railway-redact-test-out.pdf"
    $r3 = Invoke-RedactRequest -Label "Valid key" -ExtraHeaders @{ "x-redact-api-key" = $apiKey } -OutFile $outPdf
    if ($r3.Status -eq 200 -and (Test-Path -LiteralPath $outPdf)) {
        Write-Host "PASS: Redacted PDF saved. Open and Ctrl+F to verify." -ForegroundColor Green
    } else {
        Write-Host "FAIL: Expected 200 and output file." -ForegroundColor Red
    }
}

Write-TestHeader "Done"
Write-Host "PDF used: $PdfPath"
Write-Host "API:    $ApiBase"
