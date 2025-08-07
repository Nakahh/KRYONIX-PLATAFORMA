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

// Initialize Next.js app with optimizations
const nextApp = next({
  dev,
  hostname,
  port,
  quiet: !dev,
  customServer: true,
  conf: {
    distDir: '.next',
    compress: true,
    poweredByHeader: false
  }
});
const handle = nextApp.getRequestHandler();

// Initialize Express app
const expressApp = express();

// Security middleware otimizado para produção
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

// Configuração de CSP otimizada
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Next.js precisa para hydration
      "'unsafe-eval'",   // Next.js dev mode
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
      "https://vercel.live", // Vercel analytics
      "https://vitals.vercel-analytics.com"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Tailwind CSS inline styles
      "https://fonts.googleapis.com"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:", // Permitir todas as imagens HTTPS
      "blob:"   // Para uploads de imagem
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
      "data:"
    ],
    connectSrc: [
      "'self'",
      "https://vitals.vercel-analytics.com",
      ...(isDevelopment ? ["ws://localhost:*", "http://localhost:*"] : []),
      "wss:",  // WebSockets
      "https:" // APIs externas
    ],
    frameSrc: ["'self'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: isProduction ? [] : null
  }
};

expressApp.use(helmet({
  contentSecurityPolicy: isProduction ? cspConfig : false,
  crossOriginEmbedderPolicy: false, // Next.js incompatibilidade
  hsts: isProduction ? {
    maxAge: 63072000, // 2 anos
    includeSubDomains: true,
    preload: true
  } : false,
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin"
  },
  xssFilter: true,
  noSniff: true,
  frameguard: {
    action: 'deny'
  },
  hidePoweredBy: true
}));

// CORS middleware otimizado
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ||
  (isProduction
    ? ['https://kryonix.com.br', 'https://kryonix-platform.vercel.app']
    : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:3001']
  );

// Configuração CORS dinâmica e segura
expressApp.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sem origin (Postman, mobile apps)
    if (!origin && !isProduction) return callback(null, true);

    // Verificar se origin está na lista permitida
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
  maxAge: isProduction ? 86400 : 0, // Cache preflight 24h em produção
  optionsSuccessStatus: 200 // Para IE11
}));

// Body parsing middleware com segurança
expressApp.use(bodyParser.json({
  limit: isProduction ? '5mb' : '10mb', // Menor em produção
  strict: true,
  type: 'application/json'
}));
expressApp.use(bodyParser.urlencoded({
  extended: true,
  limit: isProduction ? '5mb' : '10mb',
  parameterLimit: 1000 // Prevenir DoS
}));

// Rate limiting para produção
if (isProduction) {
  const rateLimit = require('express-rate-limit');

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // máximo 1000 requests por IP
    message: {
      error: 'Too many requests from this IP',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // máximo 50 requests por IP para endpoints sensíveis
    message: {
      error: 'Too many requests to sensitive endpoint',
      retryAfter: '15 minutes'
    }
  });

  expressApp.use('/api/', generalLimiter);
  expressApp.use('/api/auth/', strictLimiter);
  expressApp.use('/api/github-webhook', strictLimiter);
}

// Logging middleware
expressApp.use(morgan('combined'));

// Fast health check endpoint
expressApp.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'kryonix-platform',
    timestamp: Date.now(),
    uptime: process.uptime(),
    version: '2.0.0',
    port: port,
    environment: process.env.NODE_ENV || 'development',
    memory: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB'
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
// Validar variáveis de ambiente críticas
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) {
  console.warn('⚠️ WEBHOOK_SECRET não configurado - webhook GitHub desabilitado');
}
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

    // Verificar assinatura - obrigatória se WEBHOOK_SECRET estiver configurado
    if (WEBHOOK_SECRET) {
        if (!signature || !verifyGitHubSignature(payload, signature)) {
            console.log('❌ Webhook rejeitado - assinatura inválida ou ausente');
            return res.status(401).json({ error: 'Invalid or missing signature' });
        }
        console.log('✅ Assinatura do webhook verificada');
    } else {
        console.log('⚠️ Webhook aceito sem verificação - WEBHOOK_SECRET não configurado');
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
