#!/bin/bash
echo "🚨 KRYONIX EMERGENCY SIMPLIFICATION STARTING..."
echo "==============================================="

# 1. Create backup directory
echo "💾 Creating safety backup..."
mkdir -p .emergency-backup
cp package.json .emergency-backup/package.json.original 2>/dev/null || true
cp next.config.js .emergency-backup/next.config.js.original 2>/dev/null || true
cp server.js .emergency-backup/server.js.original 2>/dev/null || true
cp -r app .emergency-backup/app-original 2>/dev/null || true

# 2. Move complex files aside temporarily
echo "🔄 Moving complex files aside..."
mkdir -p .temp-complex
mv backend .temp-complex/ 2>/dev/null || true
mv lib .temp-complex/ 2>/dev/null || true
mv middleware.ts .temp-complex/ 2>/dev/null || true
mv locales .temp-complex/ 2>/dev/null || true
mv scripts .temp-complex/ 2>/dev/null || true

# 3. Replace with emergency versions
echo "🔧 Installing emergency versions..."
cp package-emergency.json package.json
cp server-simple.js server.js
cp next.config-emergency.js next.config.js

# 4. Create minimal app structure if needed
if [ ! -d "app" ]; then
    echo "📁 Creating minimal app structure..."
    mkdir -p app
    
    # Create basic layout
    cat > app/layout.tsx << 'EOF'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-white">
        {children}
      </body>
    </html>
  )
}
EOF

    # Create basic page
    cat > app/page.tsx << 'EOF'
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            KRYONIX
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Plataforma SaaS 100% Autônoma por IA
          </p>
          <p className="text-gray-400 mb-8">
            Emergency Mode - Funcionando!
          </p>
          <a 
            href="https://wa.me/5517981805327" 
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            WhatsApp: +55 17 98180-5327
          </a>
        </div>
      </div>
    </div>
  );
}
EOF

    # Create basic globals.css
    cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
EOF
fi

# 5. Clean and reinstall minimal dependencies
echo "🧹 Cleaning and reinstalling minimal dependencies..."
rm -rf node_modules package-lock.json 2>/dev/null || true
npm cache clean --force 2>/dev/null || true
npm install --no-audit --no-fund

echo ""
echo "✅ EMERGENCY SIMPLIFICATION COMPLETE!"
echo "🚀 Test with: npm run dev"
echo "🌐 Should work on: http://localhost:3000"
echo ""
echo "📋 To restore full version later:"
echo "   bash emergency-restore.sh"
