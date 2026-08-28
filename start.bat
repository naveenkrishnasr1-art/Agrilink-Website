@echo off
echo =======================================================
echo          🌾 AGRI-LINK PLATFORM LAUNCHER 🌾
echo =======================================================
echo.
echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000...
start "" python start_server.py
timeout /t 2 > nul
echo.
echo [2/2] Launching Frontend Interface in Default Browser...
start "" index.html
echo.
echo AgriLink is running! Press any key to close this window.
pause
