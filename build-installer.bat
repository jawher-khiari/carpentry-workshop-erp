@echo off
echo ============================================
echo  Carpentry Workshop ERP - Build Installer
echo ============================================
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed. Please install Node.js 20+ first.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

:: Install root dependencies (electron + electron-builder)
echo [1/4] Installing build dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)

:: Install backend dependencies
echo [2/4] Installing backend dependencies...
cd backend
call npm install
cd ..
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies.
    pause
    exit /b 1
)

:: Build frontend
echo [3/4] Building frontend...
cd frontend
call npm install
call npm run build
cd ..
if errorlevel 1 (
    echo ERROR: Failed to build frontend.
    pause
    exit /b 1
)

:: Build Windows NSIS installer
echo [4/4] Building Windows installer (setup.exe)...
call npx electron-builder --win --x64 -c.win.target=nsis
if errorlevel 1 (
    echo ERROR: Failed to build installer.
    echo Trying portable build instead...
    call npx electron-builder --win --x64
)

echo.
echo ============================================
echo  Build complete!
echo  Check the installer-output/ folder
echo ============================================
dir installer-output\*.exe
pause
