#!/bin/bash

echo "🔍 Checking for Node.js and npm..."
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "⚠️ Node.js is not installed. Attempting to install it now..."
    echo "🔑 You may be prompted for your sudo password."
    if command -v dnf &> /dev/null; then
        sudo dnf install -y nodejs npm
    elif command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y nodejs npm
    elif command -v yum &> /dev/null; then
        sudo yum install -y nodejs npm
    elif command -v pacman &> /dev/null; then
        sudo pacman -Sy --noconfirm nodejs npm
    else
        echo "❌ Could not detect package manager (apt/dnf/yum/pacman). Please install Node.js manually."
        exit 1
    fi
else
    echo "✅ Node.js is already installed ($(node -v))."
fi

echo "📦 Installing project dependencies..."
npm install express body-parser cors sqlite3

echo "🚀 Starting Node.js backend server..."
node server.js &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 2

echo "🌐 Opening EduRegister.html in your default web browser..."
xdg-open EduRegister.html || echo "Could not detect default browser. Please open EduRegister.html manually."

echo "✅ All set! The server is running in the background (PID: $SERVER_PID)."
echo "Press Ctrl+C to stop the server when you are done."

# Maintain the process
wait $SERVER_PID
