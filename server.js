const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar para desenvolvimento
}));

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.static('public'));

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

// Webhook GitHub para deploy automático
app.post('/api/github-webhook', (req, res) => {
  console.log('🔔 Webhook GitHub recebido:', new Date().toISOString());

  const payload = req.body;
  const event = req.headers['x-github-event'];
  const signature = req.headers['x-hub-signature-256'];

  // Log do payload para debug
  console.log('📋 Event:', event);
  console.log('📦 Payload ref:', payload?.ref);
  console.log('🏷️ Repository:', payload?.repository?.name);

  // Verificar se é push na branch main
  if (event === 'push' && payload?.ref === 'refs/heads/main') {
    console.log('✅ Push detectado na branch main - iniciando deploy automático');

    // Executar script de deploy
    const deployScript = '/opt/kryonix-platform/webhook-deploy.sh';

    if (fs.existsSync(deployScript)) {
      exec(`bash ${deployScript} auto`, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Erro no deploy automático:', error);
          return;
        }
        console.log('📋 Deploy output:', stdout);
        if (stderr) console.log('⚠️ Deploy stderr:', stderr);
      });

      res.json({
        message: 'Deploy automático iniciado',
        status: 'accepted',
        ref: payload.ref,
        timestamp: new Date().toISOString(),
        deploy_method: 'webhook_script'
      });
    } else {
      // Fallback para rebuild interno
      console.log('📋 Script não encontrado, usando rebuild interno');

      exec('cd /opt/kryonix-platform && docker build -t kryonix-plataforma:latest . && docker service update --image kryonix-plataforma:latest Kryonix_web', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Erro no rebuild:', error);
          return;
        }
        console.log('✅ Rebuild completado');
      });

      res.json({
        message: 'Deploy automático iniciado',
        status: 'accepted',
        ref: payload.ref,
        timestamp: new Date().toISOString(),
        deploy_method: 'internal_docker_rebuild'
      });
    }
  } else {
    console.log('ℹ️ Evento ignorado - não é push na main');
    res.json({
      message: 'Evento recebido mas ignorado',
      status: 'ignored',
      event: event,
      ref: payload?.ref,
      timestamp: new Date().toISOString()
    });
  }
});

// Fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 KRYONIX Platform rodando em http://0.0.0.0:${PORT}`);
  console.log(`📊 Progresso em: http://0.0.0.0:${PORT}/progresso`);
  console.log(`🔍 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`📱 Mobile-first otimizado para 80% usuários mobile`);
});
