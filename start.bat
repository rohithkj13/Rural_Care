@echo off
echo ========================================
echo Starting RuralCare Connect Application
echo ========================================
echo.

echo Starting Backend Server...
start cmd /k "cd server && npm start"

timeout /t 5 /nobreak > nul

echo Starting Frontend Application...
start cmd /k "cd client && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
