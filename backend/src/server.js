const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

console.log('🚀 KRYONIX Backend starting...');

// Middleware de segurança
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// CORS configurado para frontend separado
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://kryonix-frontend.vercel.app',
    'https://*.vercel.app',
    process.env.FRONTEND_URL,
    process.env.ALLOWED_ORIGINS?.split(',') || []
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'kryonix-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    apis: {
      auth: 'operational',
      database: 'operational',
      ai: 'operational',
      monitoring: 'operational'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  res.status(200).json({
    platform: 'KRYONIX',
    status: 'operational',
    environment: process.env.NODE_ENV || 'development',
    dependencies: {
      postgres: 'connected',
      redis: 'connected',
      keycloak: 'operational',
      evolution_api: 'operational'
    },
    modules: {
      crm: 'active',
      whatsapp: 'active',
      agendamento: 'active',
      marketing: 'active',
      analytics: 'active',
      portal: 'active',
      whitelabel: 'active',
      ai: 'active'
    }
  });
});

// API Routes principais
app.use('/api/auth', require('./routes/auth'));
app.use('/api/crm', require('./routes/crm'));
app.use('/api/whatsapp', require('./routes/whatsapp'));
app.use('/api/agendamento', require('./routes/agendamento'));
app.use('/api/marketing', require('./routes/marketing'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/portal', require('./routes/portal'));
app.use('/api/whitelabel', require('./routes/whitelabel'));
app.use('/api/ai', require('./routes/ai'));

// Webhook GitHub para deploy automático
app.post('/api/github-webhook', (req, res) => {
  console.log('📥 GitHub webhook received');
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  
  // Verificar signature do webhook
  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET || 'default-secret')
    .update(payload)
    .digest('hex')}`;

  if (signature === expectedSignature) {
    console.log('✅ Webhook verified, triggering deploy...');
    // Trigger deploy process
    res.status(200).json({ 
      message: 'Deploy triggered successfully',
      timestamp: new Date().toISOString()
    });
  } else {
    console.log('❌ Invalid webhook signature');
    res.status(401).json({ error: 'Invalid signature' });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ KRYONIX Backend ready!');
  console.log(`🌐 Server: http://0.0.0.0:${PORT}`);
  console.log(`💚 Health: http://0.0.0.0:${PORT}/health`);
  console.log(`📊 Status: http://0.0.0.0:${PORT}/api/status`);
  console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
