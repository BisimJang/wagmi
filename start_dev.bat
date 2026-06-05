@echo off
set "ROOT_DIR=%~dp0"

echo [1/2] Starting Wagmi Backend...
start "Wagmi Backend" cmd /k "cd /d %ROOT_DIR%wagmi-backend && .venv\Scripts\activate && python manage.py runserver"

echo [2/2] Starting Wagmi Frontend (DApp)...
start "Wagmi DApp" cmd /k "cd /d %ROOT_DIR%wagmi-dapp && node node_modules/vite/bin/vite.js --port 5174"


echo.
echo Both services are now starting in separate terminal windows.
echo - Backend: http://127.0.0.1:8000
echo - Frontend: http://localhost:5174
echo.
pause
