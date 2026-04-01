@echo off
:: This script starts both the backend and frontend in separate command windows.
set "ROOT_DIR=%~dp0"

echo [1/2] Starting Wagmi Backend...
start "Wagmi Backend" cmd /k "cd /d %ROOT_DIR%wagmi-backend && .venv\Scripts\activate && python manage.py runserver"

echo [2/2] Starting Wagmi Frontend (DApp)...
start "Wagmi DApp" cmd /k "cd /d %ROOT_DIR%wagmi-dapp && npm run dev"

echo.
echo Both services are now starting in separate terminal windows.
echo - Backend: http://127.0.0.1:8000
echo - Frontend: http://localhost:5173 (usually)
echo.
pause
