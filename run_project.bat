@echo off
echo ===================================================
echo Starting Linguantuk Semantic Web Project
echo ===================================================

echo [1/2] Starting Python FastAPI Backend...
cd backend
start cmd /k "title Linguantuk Backend && python main.py"

echo [2/2] Starting Next.js Frontend...
cd ..\frontend
start cmd /k "title Linguantuk Frontend && npm run dev"

echo.
echo ===================================================
echo All services started!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo ===================================================
pause
