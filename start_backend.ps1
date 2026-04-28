$pythonExe = "$PSScriptRoot\.venv\Scripts\python.exe"

Write-Host "Starting AI Threat Detection SOC Backend..." -ForegroundColor Green
Write-Host ""

if (-not (Test-Path $pythonExe)) {
    Write-Host "ERROR: Virtual environment not found at $pythonExe" -ForegroundColor Red
    exit 1
}

Write-Host "Using Python: $pythonExe" -ForegroundColor Cyan
& $pythonExe backend_final.py
