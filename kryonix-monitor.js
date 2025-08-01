const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8084;

app.use(express.json());

// Função para verificar atualizações de dependências disponíveis
const checkDependencyUpdates = () => {
    return new Promise((resolve) => {
        exec('ncu --jsonUpgraded', (error, stdout, stderr) => {
            if (error) {
                resolve({ available: 0, error: error.message });
                return;
            }
            
            try {
                const updates = JSON.parse(stdout);
                const updateCount = Object.keys(updates).length;
                resolve({ available: updateCount, updates });
            } catch (e) {
                resolve({ available: 0, error: 'Parse error' });
            }
        });
    });
};

// Função para verificar status dos serviços
const checkServicesHealth = async () => {
    const services = {
        web: { port: 8080, status: 'unknown' },
        webhook: { port: 8082, status: 'unknown' },
        monitor: { port: 8084, status: 'self' }
    };

    for (const [name, service] of Object.entries(services)) {
        if (service.status === 'self') {
            service.status = 'healthy';
            continue;
        }

        try {
            await new Promise((resolve, reject) => {
                exec(`curl -f -s http://localhost:${service.port}/health`, (error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });
            service.status = 'healthy';
        } catch (e) {
            service.status = 'unhealthy';
        }
    }

    return services;
};

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'kryonix-monitor',
        timestamp: new Date().toISOString(),
        port: PORT,
        version: '2.0.0',
        features: ['dependency-monitoring', 'auto-update-check', 'service-health']
    });
});

app.get('/metrics', async (req, res) => {
    const dependencyUpdates = await checkDependencyUpdates();
    const servicesHealth = await checkServicesHealth();
    
    res.json({
        timestamp: new Date().toISOString(),
        status: 'monitoring',
        services: servicesHealth,
        dependencies: {
            updates_available: dependencyUpdates.available,
            last_check: new Date().toISOString(),
            auto_update_enabled: true
        },
        version: '2.0.0',
        uptime: process.uptime()
    });
});

app.get('/status', (req, res) => {
    res.json({
        service: 'kryonix-monitor',
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        features: ['dependency-monitoring', 'auto-update-check', 'service-health']
    });
});

app.get('/dashboard', async (req, res) => {
    const dependencyUpdates = await checkDependencyUpdates();
    const servicesHealth = await checkServicesHealth();
    
    res.json({
        platform: 'KRYONIX v2.0',
        services: servicesHealth,
        dependencies: {
            updates_available: dependencyUpdates.available,
            auto_update: true,
            last_check: new Date().toISOString()
        },
        system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            node_version: process.version
        },
        timestamp: new Date().toISOString()
    });
});

// Endpoint para forçar verificação de dependências
app.get('/check-dependencies', async (req, res) => {
    console.log('🔍 Verificação manual de dependências solicitada');
    
    try {
        const result = await checkDependencyUpdates();
        
        res.json({
            message: 'Verificação de dependências concluída',
            result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Falha na verificação de dependências',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Endpoint para forçar atualização de dependências
app.post('/update-dependencies', (req, res) => {
    console.log('🔄 Atualização manual de dependências solicitada');
    
    exec('bash /app/webhook-deploy.sh manual', (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Erro na atualização manual:', error);
            res.status(500).json({ 
                error: 'Update failed', 
                message: error.message,
                timestamp: new Date().toISOString()
            });
        } else {
            console.log('✅ Atualização manual executada:', stdout);
            res.json({ 
                message: 'Atualização de dependências executada com sucesso',
                output: stdout,
                timestamp: new Date().toISOString()
            });
        }
    });
});

// Endpoint para logs do sistema
app.get('/logs', (req, res) => {
    const logFiles = [
        '/var/log/kryonix-deploy.log',
        '/var/log/kryonix-deps-monitor.log',
        './deploy.log'
    ];
    
    const logs = {};
    
    logFiles.forEach(file => {
        try {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                const lines = content.split('\n').slice(-50); // Últimas 50 linhas
                logs[file] = lines;
            }
        } catch (e) {
            logs[file] = [`Erro ao ler log: ${e.message}`];
        }
    });
    
    res.json({
        logs,
        timestamp: new Date().toISOString()
    });
});

// Monitoramento contínuo em background
setInterval(async () => {
    const dependencyUpdates = await checkDependencyUpdates();
    
    if (dependencyUpdates.available > 0) {
        console.log(`📦 ${dependencyUpdates.available} atualizações de dependências disponíveis`);
        
        // Log para arquivo se possível
        const logMessage = `[${new Date().toISOString()}] ${dependencyUpdates.available} atualizações disponíveis\n`;
        fs.appendFile('/var/log/kryonix-deps-monitor.log', logMessage, () => {});
    }
}, 3600000); // A cada hora

app.listen(PORT, '0.0.0.0', () => {
    console.log(`📊 KRYONIX Monitor v2.0 rodando em http://0.0.0.0:${PORT}`);
    console.log('✅ Funcionalidades ativas: dependency-monitoring, auto-update-check, service-health');
});
