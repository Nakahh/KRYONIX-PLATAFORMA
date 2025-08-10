import { Metadata } from 'next'

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Builder.io Debug - KRYONIX',
  description: 'Página de debug para testar conectividade Builder.io',
  robots: 'noindex, follow',
  other: {
    'X-Frame-Options': 'ALLOWALL',
    'X-Builder-Discoverable': 'true'
  }
}

export default function BuilderDebugPage() {
  return (
    <html lang="pt-BR">
      <head>
        <meta httpEquiv="X-Frame-Options" content="ALLOWALL" />
        <meta name="builder-discoverable" content="true" />
        <style>{`
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            text-align: center;
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            max-width: 600px;
          }
          .status {
            background: #10b981;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            margin-bottom: 20px;
            font-weight: 600;
          }
          .links a {
            display: block;
            color: #93c5fd;
            text-decoration: none;
            margin: 10px 0;
            padding: 10px;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            transition: all 0.3s;
          }
          .links a:hover {
            background: rgba(255,255,255,0.2);
            transform: translateY(-2px);
          }
          .timestamp {
            color: #d1d5db;
            font-size: 0.8em;
            margin-top: 20px;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <h1>🚀 KRYONIX Builder.io Ready!</h1>
          
          <div className="status">
            ✅ Página Detectável no Builder.io
          </div>
          
          <p>
            Esta é uma página especial criada para testar a conectividade com Builder.io.
            Se você está vendo isso, significa que o servidor está funcionando!
          </p>
          
          <div className="links">
            <h3>🔗 Páginas Disponíveis:</h3>
            <a href="/pt-br/">🏠 Home Principal</a>
            <a href="/pt-br/progresso">📊 Progresso do Desenvolvimento</a>
            <a href="/pt-br/parcerias-empresariais-contato">🤝 Parcerias Empresariais</a>
            <a href="/pt-br/dashboard">📈 Dashboard</a>
            <a href="/pt-br/login">🔐 Login</a>
            <a href="/pt-br/fila-de-espera">⏰ Fila de Espera</a>
            <a href="/pt-br/test-builderio">🧪 Teste Builder.io</a>
          </div>
          
          <div className="timestamp">
            ⏰ Página gerada em: {new Date().toLocaleString('pt-BR')}
          </div>
          
          <div style={{marginTop: '20px', fontSize: '0.9em', opacity: 0.8}}>
            🔧 Headers: X-Frame-Options = ALLOWALL<br/>
            🌐 CSP: frame-ancestors permitidos<br/>
            📡 Discoverable: Habilitado<br/>
            ⚡ Rendering: Estático
          </div>
        </div>
      </body>
    </html>
  )
}
