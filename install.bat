@echo off
echo ========================================
echo RuralCare Connect - Installation Script
echo ========================================
echo.

echo Step 1: Installing Backend Dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Backend installation failed!
    pause
    exit /b %errorlevel%
)
echo Backend dependencies installed successfully!
echo.

echo Step 2: Installing Frontend Dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo Frontend installation failed!
    pause
    exit /b %errorlevel%
)
echo Frontend dependencies installed successfully!
echo.

cd ..
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo To start the application:
echo 1. Open terminal and run: cd server ^&^& npm start
echo 2. Open another terminal and run: cd client ^&^& npm start
echo.
echo Make sure MongoDB is running before starting the server!
echo.
pause
