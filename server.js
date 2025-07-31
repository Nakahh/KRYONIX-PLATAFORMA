import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { exec } from 'child_process';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        message: 'Servidor KRYONIX iniciado'
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
const crypto = require('crypto');
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'Kr7$n0x-V1t0r-2025-#Jwt$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8';

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

app.post('/api/github-webhook', (req, res) => {
  console.log('🔔 Webhook GitHub recebido:', new Date().toISOString());

  const payload = req.body;
  const event = req.headers['x-github-event'];
  const signature = req.headers['x-hub-signature-256'];

  // Log do payload para debug
  console.log('📋 Event:', event || 'NONE');
  console.log('📦 Payload ref:', payload?.ref || 'N/A');
  console.log('🏷️ Repository:', payload?.repository?.name || 'N/A');
  console.log('🔑 Signature:', signature ? 'PRESENT' : 'NONE');

  // Verificar assinatura se configurada
  if (WEBHOOK_SECRET && signature) {
    if (!verifyGitHubSignature(payload, signature)) {
      console.log('❌ Assinatura inválida do webhook');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    console.log('✅ Assinatura do webhook verificada');
  }

  // Verificar se é push na branch main ou master
  const isValidEvent = !event || event === 'push';
  const isValidRef = payload?.ref === 'refs/heads/main' || payload?.ref === 'refs/heads/master';

  if (isValidEvent && isValidRef) {
    console.log('✅ Push detectado na branch principal - iniciando deploy automático');

    // Executar script de deploy
    const deployScript = '/opt/kryonix-plataform/webhook-deploy.sh';

    if (fs.existsSync(deployScript)) {
      console.log('🚀 Executando script de deploy webhook...');

      // Usar spawn para melhor controle do processo
      const spawn = require('child_process').spawn;
      const deployProcess = spawn('bash', [deployScript, 'webhook', JSON.stringify(payload)], {
        cwd: '/opt/kryonix-plataform',
        stdio: 'pipe'
      });

      deployProcess.stdout.on('data', (data) => {
        console.log('📋 Deploy output:', data.toString());
      });

      deployProcess.stderr.on('data', (data) => {
        console.log('⚠️ Deploy stderr:', data.toString());
      });

      deployProcess.on('close', (code) => {
        console.log(`🔄 Deploy process finalizado com código: ${code}`);
      });

      // Responder imediatamente
      res.json({
        message: 'Deploy automático iniciado',
        status: 'accepted',
        ref: payload?.ref,
        sha: payload?.after || payload?.head_commit?.id,
        timestamp: new Date().toISOString(),
        deploy_method: 'webhook_script',
        webhook_url: process.env.WEBHOOK_URL || 'https://kryonix.com.br/api/github-webhook'
      });
    } else {
      // Fallback para rebuild interno mais robusto
      console.log('📋 Script não encontrado, usando rebuild interno avançado');

      const rebuildCommand = `
        cd /opt/kryonix-plataform &&
        git config --global --add safe.directory /opt/kryonix-plataform &&
        git fetch origin --force &&
        git reset --hard origin/main &&
        npm install --production &&
        docker build --no-cache -t kryonix-plataforma:latest . &&
        docker service update --force --image kryonix-plataforma:latest Kryonix_web
      `;

      exec(rebuildCommand, { timeout: 300000 }, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Erro no rebuild interno:', error);
          return;
        }
        console.log('✅ Rebuild interno completado');
        console.log('📋 Stdout:', stdout);
        if (stderr) console.log('⚠️ Stderr:', stderr);
      });

      res.json({
        message: 'Deploy automático iniciado (rebuild interno)',
        status: 'accepted',
        ref: payload?.ref,
        sha: payload?.after || payload?.head_commit?.id,
        timestamp: new Date().toISOString(),
        deploy_method: 'internal_docker_rebuild_advanced'
      });
    }
  } else {
    console.log('ℹ️ Evento ignorado:', { event, ref: payload?.ref });
    res.json({
      message: 'Evento recebido mas ignorado',
      status: 'ignored',
      event: event || 'undefined',
      ref: payload?.ref || 'undefined',
      reason: !isValidEvent ? 'invalid_event' : 'invalid_ref',
      timestamp: new Date().toISOString()
    });
  }
});

// Fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`KRYONIX Platform rodando em http://0.0.0.0:${PORT}`);
  console.log(`📊 Progresso em: http://0.0.0.0:${PORT}/progresso`);
  console.log(`🔍 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`📱 Mobile-first otimizado para 80% usuários mobile`);
});
