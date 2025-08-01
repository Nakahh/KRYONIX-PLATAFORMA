const express = require('express');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = process.env.PORT || 8080;

// Initialize Next.js app
const nextApp = next({ dev, hostname, port });
const handle = nextApp.getRequestHandler();

// Initialize Express app
const expressApp = express();

// Security middleware
expressApp.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS middleware
expressApp.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'https://kryonix.com.br'],
  credentials: true
}));

// Body parsing middleware
expressApp.use(bodyParser.json({ limit: '10mb' }));
expressApp.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
expressApp.use(morgan('combined'));

// Health check endpoint
expressApp.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'kryonix-platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    port: port,
    environment: process.env.NODE_ENV || 'development'
  });
});

// API status endpoint
expressApp.get('/api/status', (req, res) => {
  res.json({
    platform: 'KRYONIX',
    status: 'running',
    services: {
      web: 'active',
      api: 'active',
      next: 'active',
      webhook: 'active',
      auto_update: 'enabled'
    },
    version: '2.0.0',
    features: ['auto-dependency-update', 'nuclear-cleanup', 'fresh-clone'],
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Webhook do GitHub configurado automaticamente pelo instalador KRYONIX
const crypto = require('crypto');
const { exec } = require('child_process');
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'Kr7$n0x-V1t0r-2025-#Jwt$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8';
const DEPLOY_SCRIPT = path.join(__dirname, 'webhook-deploy.sh');

// Função para verificar assinatura do GitHub
const verifyGitHubSignature = (payload, signature) => {
    if (!signature) return false;

    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    hmac.update(JSON.stringify(payload));
    const calculatedSignature = 'sha256=' + hmac.digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(calculatedSignature)
    );
};

// Endpoint webhook do GitHub com deploy automático e auto-update
expressApp.post('/api/github-webhook', (req, res) => {
    const payload = req.body;
    const signature = req.get('X-Hub-Signature-256');
    const event = req.get('X-GitHub-Event');

    console.log('🔗 Webhook KRYONIX recebido:', {
        event: event || 'NONE',
        ref: payload.ref || 'N/A',
        repository: payload.repository?.name || 'N/A',
        signature: signature ? 'PRESENT' : 'NONE',
        timestamp: new Date().toISOString(),
        auto_update: true
    });

    // Verificar assinatura se configurada
    if (WEBHOOK_SECRET && signature) {
        if (!verifyGitHubSignature(payload, signature)) {
            console.log('❌ Assinatura inválida do webhook');
            return res.status(401).json({ error: 'Invalid signature' });
        }
        console.log('✅ Assinatura do webhook verificada');
    }

    // Processar apenas push events na main/master
    const isValidEvent = !event || event === 'push';
    const isValidRef = payload.ref === 'refs/heads/main' || payload.ref === 'refs/heads/master';

    if (isValidEvent && isValidRef) {
        console.log('🚀 Deploy automático KRYONIX iniciado para:', payload.ref);
        console.log('📦 Auto-update de dependências será executado');

        // Executar deploy automático com atualização de dependências
        exec('bash ' + DEPLOY_SCRIPT + ' webhook', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Erro no deploy automático KRYONIX:', error);
            } else {
                console.log('✅ Deploy automático KRYONIX executado com auto-update:', stdout);
            }
        });

        res.json({
            message: 'Deploy automático KRYONIX iniciado com auto-update de dependências',
            status: 'accepted',
            ref: payload.ref,
            sha: payload.after || payload.head_commit?.id,
            timestamp: new Date().toISOString(),
            webhook_url: 'https://kryonix.com.br/api/github-webhook',
            features: ['auto-dependency-update', 'nuclear-cleanup', 'fresh-clone'],
            auto_update: true,
            version: '2.0.0'
        });
    } else {
        console.log('ℹ️ Evento KRYONIX ignorado:', { event, ref: payload.ref });

        res.json({
            message: 'Evento ignorado',
            status: 'ignored',
            event: event || 'undefined',
            ref: payload.ref || 'undefined',
            reason: !isValidEvent ? 'invalid_event' : 'invalid_ref',
            auto_update: false
        });
    }
});

// Prepare Next.js and start server
nextApp.prepare().then(() => {
  console.log('🚀 KRYONIX Platform starting...');
  console.log(`📦 Dependencies loaded successfully`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Handle all other requests with Next.js
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  // Create HTTP server
  const server = createServer(expressApp);

  server.listen(port, hostname, (err) => {
    if (err) {
      console.error('❌ Server failed to start:', err);
      process.exit(1);
    }

    console.log(`✅ KRYONIX Platform ready!`);
    console.log(`🌐 Server: http://${hostname}:${port}`);
    console.log(`💚 Health: http://${hostname}:${port}/health`);
    console.log(`📊 Status: http://${hostname}:${port}/api/status`);
    console.log(`🎯 All dependencies loaded and ready`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Process terminated');
      process.exit(0);
    });
  });

}).catch((err) => {
  console.error('❌ Failed to start KRYONIX Platform:', err);
  console.error('🔍 Check if all dependencies are installed correctly');
  process.exit(1);
});
