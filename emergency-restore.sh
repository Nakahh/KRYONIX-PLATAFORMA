#!/bin/bash
echo "🔄 KRYONIX EMERGENCY RESTORATION STARTING..."
echo "==========================================="

# Check if backup exists
if [ ! -d ".emergency-backup" ]; then
    echo "❌ No emergency backup found!"
    echo "💡 Original files may have been lost during simplification"
    exit 1
fi

# Restore original files
echo "📦 Restoring original files..."
cp .emergency-backup/package.json.original package.json 2>/dev/null && echo "✅ package.json restored" || echo "❌ package.json not found"
cp .emergency-backup/next.config.js.original next.config.js 2>/dev/null && echo "✅ next.config.js restored" || echo "❌ next.config.js not found"
cp .emergency-backup/server.js.original server.js 2>/dev/null && echo "✅ server.js restored" || echo "❌ server.js not found"

# Restore app directory if backed up
if [ -d ".emergency-backup/app-original" ]; then
    rm -rf app 2>/dev/null || true
    cp -r .emergency-backup/app-original app
    echo "✅ app directory restored"
else
    echo "⚠️ app directory backup not found, keeping current"
fi

# Restore complex components
echo "🔧 Restoring complex components..."
if [ -d ".temp-complex" ]; then
    mv .temp-complex/* . 2>/dev/null || true
    rmdir .temp-complex 2>/dev/null || true
    echo "✅ Complex components restored"
else
    echo "⚠️ Complex components not found"
fi

# Reinstall full dependencies
echo "📦 Reinstalling full dependencies..."
rm -rf node_modules package-lock.json 2>/dev/null || true
npm cache clean --force 2>/dev/null || true
npm install

echo ""
echo "✅ RESTORATION COMPLETE!"
echo "🧪 Test with: npm run dev"
echo "🔍 Check if all features work correctly"
echo ""
echo "📋 If issues persist:"
echo "   - Check .emergency-backup/ for missing files"
echo "   - Run emergency-simplify.sh again if needed"
echo "   - Contact support with backup files"
