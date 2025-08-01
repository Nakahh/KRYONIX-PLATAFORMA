const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 8082;

// Configurações
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'Kr7$n0x-V1t0r-2025-#Jwt$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8';

app.use(express.json());

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

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'kryonix-webhook-listener',
        timestamp: new Date().toISOString(),
        port: PORT,
        auto_update: true,
        version: '2.0.0'
    });
});

app.get('/status', (req, res) => {
    res.json({
        service: 'kryonix-webhook-listener',
        status: 'running',
        version: '2.0.0',
        features: ['auto-dependency-update', 'nuclear-cleanup', 'fresh-clone'],
        timestamp: new Date().toISOString()
    });
});

app.post('/webhook', (req, res) => {
    const payload = req.body;
    const signature = req.get('X-Hub-Signature-256');
    const event = req.get('X-GitHub-Event');
    
    console.log('🔗 Webhook KRYONIX recebido no listener:', {
        event: event || 'NONE',
        ref: payload.ref || 'N/A',
        timestamp: new Date().toISOString(),
        signature: signature ? 'PRESENT' : 'NONE'
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
        console.log('🚀 Iniciando deploy automático KRYONIX com auto-update...');
        
        // Executar deploy com auto-update de dependências
        exec('bash /app/webhook-deploy.sh webhook', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Erro no deploy KRYONIX:', error);
            } else {
                console.log('✅ Deploy KRYONIX executado com auto-update:', stdout);
            }
        });

        res.json({ 
            message: 'Deploy automático KRYONIX iniciado com auto-update de dependências', 
            status: 'accepted',
            ref: payload.ref,
            sha: payload.after || payload.head_commit?.id,
            timestamp: new Date().toISOString(),
            features: ['auto-dependency-update', 'nuclear-cleanup', 'fresh-clone']
        });
    } else {
        console.log('ℹ️ Evento KRYONIX ignorado:', { event, ref: payload.ref });
        
        res.json({
            message: 'Evento ignorado',
            status: 'ignored',
            event: event || 'undefined',
            ref: payload.ref || 'undefined',
            reason: !isValidEvent ? 'invalid_event' : 'invalid_ref'
        });
    }
});

app.get('/test', (req, res) => {
    res.json({
        message: 'Webhook listener KRYONIX funcionando com auto-update',
        timestamp: new Date().toISOString(),
        features: ['auto-dependency-update', 'nuclear-cleanup', 'fresh-clone'],
        version: '2.0.0'
    });
});

// Endpoint para testar deploy manual
app.post('/deploy', (req, res) => {
    console.log('🔄 Deploy manual solicitado via API');
    
    exec('bash /app/webhook-deploy.sh manual', (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Erro no deploy manual:', error);
            res.status(500).json({ 
                error: 'Deploy failed', 
                message: error.message,
                timestamp: new Date().toISOString()
            });
        } else {
            console.log('✅ Deploy manual executado:', stdout);
            res.json({ 
                message: 'Deploy manual executado com sucesso',
                output: stdout,
                timestamp: new Date().toISOString()
            });
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔗 KRYONIX Webhook listener v2.0 rodando em http://0.0.0.0:${PORT}`);
    console.log('✅ Funcionalidades ativas: auto-dependency-update, nuclear-cleanup, fresh-clone');
});
