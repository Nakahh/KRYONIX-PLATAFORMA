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

// Webhook do GitHub - APENAS AS CORREÇÕES MÍNIMAS NECESSÁRIAS
const crypto = require('crypto');
const { spawn } = require('child_process');
const fs = require('fs');
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'Kr7$n0x-V1t0r-2025-#Jwt$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8';

// Função para verificar assinatura (CORRIGIDA)
const verifyGitHubSignature = (payload, signature) => {
    if (!signature) {
        console.log('⚠️ Webhook sem assinatura - rejeitando por segurança');
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

        console.log(`🔐 Assinatura: ${isValid ? '✅ Válida' : '❌ Inválida'}`);
        return isValid;
    } catch (error) {
        console.error('❌ Erro na verificação:', error.message);
        return false;
    }
};

// Endpoint webhook (CORRIGIDO com filtros específicos)
app.post('/api/github-webhook', (req, res) => {
    console.log('🔔 Webhook recebido:', new Date().toISOString());

    const payload = req.body;
    const event = req.headers['x-github-event'];
    const signature = req.headers['x-hub-signature-256'];

    console.log(`📋 Event: ${event || 'NONE'}, Ref: ${payload?.ref || 'N/A'}`);

    // CORREÇÃO 1: Verificação de assinatura obrigatória
    if (!verifyGitHubSignature(payload, signature)) {
        console.log('❌ Webhook rejeitado: assinatura inválida');
        return res.status(401).json({ 
            error: 'Invalid signature',
            timestamp: new Date().toISOString()
        });
    }

    // CORREÇÃO 2: Filtros específicos para push na main
    const isValidEvent = event === 'push';
    const isValidRef = payload?.ref === 'refs/heads/main';

    if (!isValidEvent) {
        console.log(`ℹ️ Evento ignorado: ${event} (esperado: push)`);
        return res.json({
            message: 'Evento ignorado - apenas push aceito',
            event: event,
            status: 'ignored'
        });
    }

    if (!isValidRef) {
        console.log(`ℹ️ Branch ignorada: ${payload?.ref} (esperado: main)`);
        return res.json({
            message: 'Branch ignorada - apenas main aceita',
            ref: payload?.ref,
            status: 'ignored'
        });
    }

    console.log('✅ Push válido na main - iniciando deploy');

    // CORREÇÃO 3: Usar path relativo correto
    const deployScriptPath = './webhook-deploy.sh';
    
    if (!fs.existsSync(deployScriptPath)) {
        console.error('❌ Script não encontrado:', deployScriptPath);
        return res.status(500).json({
            error: 'Deploy script not found',
            path: deployScriptPath
        });
    }

    console.log('🚀 Executando deploy...');

    const deployProcess = spawn('bash', [deployScriptPath, 'webhook'], {
        cwd: process.cwd(),
        stdio: 'pipe'
    });

    deployProcess.stdout.on('data', (data) => {
        console.log('📋 Deploy:', data.toString().trim());
    });

    deployProcess.stderr.on('data', (data) => {
        console.error('⚠️ Deploy stderr:', data.toString().trim());
    });

    deployProcess.on('close', (code) => {
        console.log(`🔄 Deploy finalizado com código: ${code}`);
    });

    // Resposta imediata
    res.json({
        message: 'Deploy iniciado com sucesso',
        status: 'accepted',
        ref: payload?.ref,
        sha: payload?.after,
        timestamp: new Date().toISOString()
    });
});

// Endpoint para teste
app.post('/api/webhook-test', (req, res) => {
    console.log('🧪 Teste webhook:', req.body);
    res.json({
        message: 'Teste recebido',
        timestamp: new Date().toISOString()
    });
});

// Fallback para SPA (DEVE SER O ÚLTIMO)
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
