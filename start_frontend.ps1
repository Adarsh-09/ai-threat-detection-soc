$pythonExe = "$PSScriptRoot\.venv\Scripts\python.exe"

Write-Host "Starting AI Threat Detection SOC Frontend..." -ForegroundColor Green
Write-Host ""

Set-Location "$PSScriptRoot\frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting Vite dev server..." -ForegroundColor Cyan
npm run dev
