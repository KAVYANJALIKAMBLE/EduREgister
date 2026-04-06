@echo off
chcp 65001 >nul
echo 🔍 Checking for Node.js and npm...

where node >nul 2>nul
if %ERRORLEVEL% equ 0 goto node_installed

echo ⚠️ Node.js is not installed. Attempting to install Node.js using winget...
winget install OpenJS.NodeJS -e --accept-source-agreements --accept-package-agreements
if %ERRORLEVEL% neq 0 (
    echo ❌ Could not install Node.js automatically.
    echo Please download and install it manually from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js installed successfully! 
echo 🔄 Refreshing PATH variable so we can use Node immediately...
set "PATH=%PATH%;%ProgramFiles%\nodejs"

:node_installed
echo ✅ Node.js is ready.

echo 📦 Installing project dependencies...
call npm install express body-parser cors sqlite3

echo 🚀 Starting Node.js backend server...
start "EduRegister Backend" node server.js

echo ⏳ Waiting for server to start...
timeout /t 3 /nobreak >nul

echo 🌐 Opening EduRegister.html in your default web browser...
start "" "EduRegister.html"

echo ✅ All set! The server is running in a separate window.
echo 🛑 Close the other Command Prompt window to stop the server.
pause
