const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware de segurança
app.use(helmet({
    contentSecurityPolicy: false
}));

// Middleware básico
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rotas básicas
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'KRYONIX',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        port: PORT,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
    });
});

app.get('/api/status', (req, res) => {
    res.json({
        service: 'KRYONIX',
        status: 'operational',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV
    });
});

// Fallback para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KRYONIX server running on port ${PORT}`);
    console.log(`🌐 Environment: ${NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

// Webhook do GitHub - VERSÃO CORRIGIDA PARA FUNCIONAMENTO IMEDIATO
const crypto = require('crypto');
const { spawn } = require('child_process');
const fs = require('fs');
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'Kr7$n0x-V1t0r-2025-#Jwt$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8';

// Função para verificar assinatura do GitHub
const verifyGitHubSignature = (payload, signature) => {
    if (!signature) {
        console.log('⚠️ Nenhuma assinatura fornecida');
        return false;
    }

    try {
        const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
        hmac.update(JSON.stringify(payload));
        const calculatedSignature = 'sha256=' + hmac.digest('hex');

        const isValid = crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(calculatedSignature)
        );

        console.log(`🔐 Verificação de assinatura: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
        return isValid;
    } catch (error) {
        console.error('❌ Erro na verificação de assinatura:', error.message);
        return false;
    }
};

// Endpoint webhook do GitHub - CORRIGIDO
app.post('/api/github-webhook', (req, res) => {
    const startTime = Date.now();
    console.log('🔔 Webhook GitHub recebido:', new Date().toISOString());

    const payload = req.body;
    const event = req.headers['x-github-event'];
    const signature = req.headers['x-hub-signature-256'];
    const userAgent = req.headers['user-agent'];

    // Log detalhado para debug
    console.log('📋 Dados do webhook:');
    console.log(`   Event: ${event || 'NONE'}`);
    console.log(`   Ref: ${payload?.ref || 'N/A'}`);
    console.log(`   Repository: ${payload?.repository?.name || 'N/A'}`);
    console.log(`   User-Agent: ${userAgent || 'N/A'}`);
    console.log(`   Signature: ${signature ? 'PRESENT' : 'NONE'}`);

    // PROBLEMA 1 CORRIGIDO: Verificação de assinatura obrigatória
    if (!verifyGitHubSignature(payload, signature)) {
        console.log('❌ Assinatura inválida ou ausente - rejeitando webhook');
        return res.status(401).json({ 
            error: 'Unauthorized - Invalid signature',
            timestamp: new Date().toISOString()
        });
    }

    // PROBLEMA 2 CORRIGIDO: Filtros específicos
    const isValidEvent = event === 'push';
    const isValidRef = payload?.ref === 'refs/heads/main';
    const isValidRepo = payload?.repository?.name === 'KRYONIX-PLATAFORMA';

    if (!isValidEvent) {
        console.log(`ℹ️ Evento ignorado: ${event} (esperado: push)`);
        return res.json({
            message: 'Evento ignorado - não é push',
            event: event,
            status: 'ignored',
            reason: 'invalid_event'
        });
    }

    if (!isValidRef) {
        console.log(`ℹ️ Branch ignorada: ${payload?.ref} (esperado: refs/heads/main)`);
        return res.json({
            message: 'Branch ignorada - não é main',
            ref: payload?.ref,
            status: 'ignored',
            reason: 'invalid_branch'
        });
    }

    console.log('✅ Push válido na branch main detectado - iniciando deploy');

    // PROBLEMA 3 CORRIGIDO: Script de deploy simplificado
    const deployScriptPath = './webhook-deploy.sh';
    
    if (!fs.existsSync(deployScriptPath)) {
        console.error('❌ Script de deploy não encontrado:', deployScriptPath);
        return res.status(500).json({
            error: 'Deploy script not found',
            path: deployScriptPath,
            timestamp: new Date().toISOString()
        });
    }

    if (!(fs.statSync(deployScriptPath).mode & parseInt('111', 8))) {
        console.error('❌ Script de deploy não é executável:', deployScriptPath);
        return res.status(500).json({
            error: 'Deploy script not executable',
            path: deployScriptPath,
            timestamp: new Date().toISOString()
        });
    }

    console.log('🚀 Executando deploy automático...');

    // Executar deploy com timeout e logs
    const deployProcess = spawn('bash', [deployScriptPath, 'webhook'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        timeout: 300000 // 5 minutos
    });

    let deployOutput = '';
    let deployError = '';

    deployProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('📋 Deploy:', output.trim());
        deployOutput += output;
    });

    deployProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.error('⚠️ Deploy stderr:', error.trim());
        deployError += error;
    });

    deployProcess.on('close', (code) => {
        const duration = Date.now() - startTime;
        console.log(`🔄 Deploy finalizado em ${duration}ms com código: ${code}`);
        
        if (code === 0) {
            console.log('✅ Deploy executado com sucesso');
        } else {
            console.error('❌ Deploy falhou');
        }
    });

    deployProcess.on('error', (error) => {
        console.error('❌ Erro ao executar deploy:', error.message);
    });

    // Resposta imediata
    res.json({
        message: 'Deploy automático iniciado com sucesso',
        status: 'accepted',
        data: {
            ref: payload?.ref,
            sha: payload?.after || payload?.head_commit?.id,
            repository: payload?.repository?.name,
            pusher: payload?.pusher?.name,
            timestamp: new Date().toISOString(),
            deploy_script: deployScriptPath
        }
    });
});

// Endpoint de status para GitHub verificar webhook
app.get('/api/github-webhook', (req, res) => {
    console.log('📡 GitHub verificando webhook endpoint via GET');
    res.status(200).json({
        message: 'KRYONIX GitHub Webhook Endpoint',
        status: 'online',
        timestamp: new Date().toISOString(),
        webhook_secret_configured: !!process.env.WEBHOOK_SECRET,
        accepted_methods: ['POST'],
        ready_for_github: true,
        troubleshooting_mode: false,
        signature_validation: 'enabled'
    });
});

// Endpoint para testar webhook manualmente
app.post('/api/webhook-test', (req, res) => {
    console.log('🧪 Teste manual do webhook:', req.body);
    res.json({
        message: 'Teste do webhook recebido',
        timestamp: new Date().toISOString(),
        payload: req.body
    });
});
