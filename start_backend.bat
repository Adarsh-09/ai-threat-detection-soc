@echo off
REM Start backend server
echo Starting AI Threat Detection SOC Backend...
echo.
cd /d "%~dp0"
REM Use the full path to Python in the virtual environment
"%~dp0.venv\Scripts\python.exe" backend_final.py
pause
