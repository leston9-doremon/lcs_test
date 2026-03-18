@echo off
REM Installation Script for Loretto Admin Panel (Windows)

echo.
echo ======================================================================
echo.
echo   LORETTO CENTRAL SCHOOL - ADMIN PANEL INSTALLATION (Windows)
echo.
echo ======================================================================
echo.

REM Check if Node.js is installed
echo Checking for Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Node.js is not installed.
    echo.
    echo Please download and install Node.js from:
    echo   https://nodejs.org
    echo.
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js found: %NODE_VERSION%

REM Check if npm is installed
echo Checking for npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm found: %NPM_VERSION%

echo.
echo ======================================================================
echo Installing dependencies... (This may take a minute)
echo ======================================================================
echo.

call npm install

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to install dependencies.
    echo.
    pause
    exit /b 1
)

echo.
echo ======================================================================
echo.
echo   INSTALLATION COMPLETE!
echo.
echo ======================================================================
echo.
echo [READY TO START]
echo.
echo   1. Run the server:
echo      $ npm start
echo.
echo   2. Open in browser:
echo      http://localhost:3000/admin-panel.html
echo.
echo ======================================================================
echo.
echo [DOCUMENTATION]
echo   • ADMIN_SETUP.md      - Complete setup guide
echo   • QUICK_START.txt     - Quick reference
echo   • MIGRATION_GUIDE.md  - How to migrate from Strapi
echo.
echo [SUPPORT]
echo   Developer: appvertex.in
echo   Email: info@appvertex.in
echo.
echo ======================================================================
echo.
pause
