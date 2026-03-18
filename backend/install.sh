#!/bin/bash
# Installation Script for Loretto Admin Panel
# Run this to set everything up automatically

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  LORETTO CENTRAL SCHOOL — ADMIN PANEL INSTALLATION         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
echo "🔍 Checking for Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "📥 Please install Node.js from https://nodejs.org"
    echo "   Then run this script again."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
echo "🔍 Checking for npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "   This may take a minute..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies."
    exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    INSTALLATION COMPLETE!                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 READY TO START!"
echo ""
echo "   Command to start server:"
echo "   $ npm start"
echo ""
echo "   Then open in browser:"
echo "   http://localhost:3000/admin/admin-panel.html"
echo ""
echo "📚 For detailed setup instructions, see:"
echo "   • ADMIN_SETUP.md"
echo "   • QUICK_START.txt"
echo "   • MIGRATION_GUIDE.md"
echo ""
echo "💬 Need help? Contact: info@appvertex.in"
echo ""
