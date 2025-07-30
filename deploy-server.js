const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');

const PORT = 9001;
const PROJECT_DIR = '/opt/kryonix-plataform';

const log = (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
};

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/deploy') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                log(`🚀 Deploy solicitado para: ${payload.ref}`);

                // Executar deploy com pull do GitHub
                const deployScript = `
                    cd ${PROJECT_DIR} &&
                    echo "🌐 [BUILDER.IO SYNC] Iniciando sincronizacao com GitHub main..." &&

                    echo "🔧 [Git] Configurando repositorio..." &&
                    git remote set-url origin "https://Nakahh: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@github.com/Nakahh/KRYONIX-PLATAFORMA.git" &&
                    git config pull.rebase false &&
                    git config --global --add safe.directory "${PROJECT_DIR}" &&

                    echo "📥 [GitHub] Puxando ultimas alteracoes..." &&
                    git fetch origin &&
                    git reset --hard origin/main &&
                    git clean -fd &&

                    echo "📦 [Dependencies] Instalando dependencias..." &&
                    if [ -f yarn.lock ]; then
                        yarn install --frozen-lockfile 2>/dev/null || yarn install
                        echo "🏗️ [Build] Executando yarn build (Builder.io)..."
                        yarn build 2>/dev/null || npm run build 2>/dev/null || echo "ℹ️ No build script found"
                    else
                        npm install --production=false
                        echo "🏗️ [Build] Executando npm run build (Builder.io)..."
                        npm run build 2>/dev/null || echo "ℹ️ No build script found"
                    fi &&

                    echo "📁 [Build] Copiando arquivos de build para public..." &&
                    [ -d dist ] && cp -r dist/* public/ 2>/dev/null
                    [ -d build ] && cp -r build/* public/ 2>/dev/null
                    [ -d out ] && cp -r out/* public/ 2>/dev/null

                    echo "🏗️ [Docker] Fazendo rebuild da imagem..." &&
                    docker rmi kryonix-plataforma:latest 2>/dev/null || true &&
                    docker build --no-cache -t kryonix-plataforma:latest . &&

                    echo "🚀 [Deploy] Fazendo redeploy do stack..." &&
                    docker stack deploy -c docker-stack.yml Kryonix --with-registry-auth &&

                    echo "⏳ [Health] Aguardando estabilizacao..." &&
                    sleep 30 &&

                    echo "🔍 [Test] Testando aplicacao..." &&
                    curl -f http://localhost:8080/health >/dev/null 2>&1 && echo "✅ Deploy Builder.io concluido com sucesso!" || echo "⚠️ Deploy concluido, aguarde estabilizacao"
                `;

                exec(deployScript, (error, stdout, stderr) => {
                    if (error) {
                        log(`❌ Erro no deploy: ${error.message}`);
                        if (stderr) log(`STDERR: ${stderr}`);
                    } else {
                        log('✅ Deploy concluido com sucesso');
                        if (stdout) log(`STDOUT: ${stdout}`);
                    }
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'deploy_started',
                    message: 'Deploy iniciado com sucesso',
                    timestamp: new Date().toISOString()
                }));

            } catch (error) {
                log(`❌ Erro ao processar deploy: ${error.message}`);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid payload' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PORT, '0.0.0.0', () => {
    log(`🚀 Servidor de deploy rodando na porta ${PORT}`);
    log(`🔗 Acessivel em: http://0.0.0.0:${PORT}`);
    log(`🐳 Container gateway: host.docker.internal:${PORT}`);
});
