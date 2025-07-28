const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'development' ? false : {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// Servir arquivos estáticos (produção usa dist, desenvolvimento usa public)
const staticPath = NODE_ENV === 'production' ? 'dist/public' : 'public';
app.use(express.static(staticPath));

// Rotas para as páginas HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/progresso', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'progresso.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'KRYONIX Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    message: 'Página temporária - Parte 01 em desenvolvimento'
  });
});

// API endpoints básicos (serão expandidos nas próximas partes)
app.get('/api/status', (req, res) => {
  res.json({
    project: 'KRYONIX',
    progress: {
      current_part: 1,
      total_parts: 50,
      percentage: 2,
      status: 'Configurando estrutura básica'
    },
    modules: {
      completed: 0,
      total: 8,
      active: []
    },
    last_update: new Date().toISOString()
  });
});

app.get('/api/logs', (req, res) => {
  res.json({
    logs: [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '🚀 Servidor KRYONIX iniciado'
      },
      {
        timestamp: new Date().toISOString(),
        level: 'success', 
        message: '✅ Estrutura básica configurada'
      },
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '📋 Parte 01/50 em desenvolvimento'
      }
    ]
  });
});

// Fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 KRYONIX Platform rodando em http://localhost:${PORT}`);
  console.log(`📊 Progresso em: http://localhost:${PORT}/progresso`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Mobile-first otimizado para 80% usuários mobile`);
});
