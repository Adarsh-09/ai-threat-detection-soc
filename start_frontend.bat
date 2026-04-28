@echo off
REM Start frontend development server
echo Starting AI Threat Detection SOC Frontend...
echo.
cd /d "%~dp0frontend"
call npm run dev
pause
