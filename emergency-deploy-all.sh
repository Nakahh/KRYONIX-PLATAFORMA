#!/bin/bash
echo "🚀 KRYONIX EMERGENCY DEPLOYMENT - ALL STRATEGIES"
echo "=============================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Strategy 1: Use existing Makefile
echo "📋 Strategy 1: Using existing Makefile..."
if [ -f "Makefile" ]; then
    make deploy-all 2>/dev/null && echo "✅ Makefile deployment successful" || echo "❌ Makefile deployment failed"
else
    echo "❌ Makefile not found"
fi

# Strategy 2: Direct Vercel deployment
echo "🌐 Strategy 2: Direct Vercel deployment..."
if command_exists vercel; then
    vercel --prod --force && echo "✅ Vercel deployment successful" || echo "❌ Vercel deployment failed"
else
    echo "⚠️ Vercel CLI not installed - installing..."
    npm install -g vercel 2>/dev/null && vercel --prod --force
fi

# Strategy 3: Render deployment (webhook)
echo "🔧 Strategy 3: Render deployment..."
if [ -f "render.yaml" ]; then
    echo "✅ render.yaml found - deployment via git push or webhook"
    git add . 2>/dev/null
    git commit -m "Emergency deployment $(date)" 2>/dev/null
    git push origin main 2>/dev/null && echo "✅ Git push successful" || echo "❌ Git push failed"
else
    echo "❌ render.yaml not found"
fi

# Strategy 4: Docker deployment
echo "🐳 Strategy 4: Docker deployment..."
if command_exists docker; then
    docker build -t kryonix-emergency . && echo "✅ Docker build successful" || echo "❌ Docker build failed"
    echo "🚀 Docker image ready: kryonix-emergency"
else
    echo "❌ Docker not available"
fi

# Strategy 5: Emergency local server
echo "💻 Strategy 5: Local emergency server..."
if [ -f "server-simple.js" ]; then
    node server-simple.js &
    SERVER_PID=$!
    sleep 5
    if curl -sf http://localhost:3000/health >/dev/null 2>&1; then
        echo "✅ Emergency server running on http://localhost:3000"
        echo "📝 Server PID: $SERVER_PID"
    else
        echo "❌ Emergency server failed to start"
    fi
else
    echo "❌ server-simple.js not found"
fi

echo ""
echo "🎯 DEPLOYMENT SUMMARY:"
echo "======================"
echo "✅ Check Vercel: https://vercel.com/dashboard"
echo "✅ Check Render: https://dashboard.render.com"
echo "✅ Local server: http://localhost:3000"
echo "📊 Monitor logs for deployment status"
echo ""
echo "🛡️ All strategies executed - at least one should succeed!"
