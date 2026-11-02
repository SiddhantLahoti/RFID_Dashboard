@echo off
cd /d "%~dp0"
title RFID STOCK DASHBOARD (Port 8003)
color 0B

echo ========================================================
echo  [1/3] Building React Frontend (Vite)...
echo ========================================================
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed! Check your React code.
    pause
    exit /b %errorlevel%
)
cd ..

echo ========================================================
echo  [2/3] Launching Web Browser on Port 8003...
echo ========================================================
start "" cmd /c "timeout /t 2 >nul && start http://127.0.0.1:8003"

echo ========================================================
echo  [3/3] Starting FastAPI Backend on Port 8003...
echo ========================================================
python -m uvicorn app:app --host 0.0.0.0 --port 8003

pause