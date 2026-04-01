#!/bin/bash
# This script starts both the backend and frontend servers in the background.

# Get the directory where the script is located
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo "[1/2] Starting Wagmi Backend..."
(
    cd "$ROOT_DIR/wagmi-backend" || exit
    source .venv/Scripts/activate 2>/dev/null || .venv/Scripts/activate
    python manage.py runserver
) &

echo "[2/2] Starting Wagmi Frontend (DApp)..."
(
    cd "$ROOT_DIR/wagmi-dapp" || exit
    npm run dev
) &

echo ""
echo "Both services are starting in the background."
echo "Press Ctrl+C to stop this script (it will not stop the background processes automatically)."
echo "Check http://127.0.0.1:8000 and http://localhost:5173"
echo ""

# Wait for both background processes
wait
