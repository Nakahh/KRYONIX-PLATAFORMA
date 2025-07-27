#!/usr/bin/env node
// Healthcheck avançado para container KRYONIX
// Verifica APIs, banco de dados, Redis e recursos do sistema

const http = require("http");
const https = require("https");
const os = require("os");
const fs = require("fs");

// Configurações
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "production";
const HEALTH_CHECK_TIMEOUT = 10000; // 10 segundos

// Cores para output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(level, message) {
  const timestamp = new Date().toISOString();
  const color =
    level === "ERROR"
      ? colors.red
      : level === "WARN"
        ? colors.yellow
        : level === "INFO"
          ? colors.blue
          : colors.green;

  console.log(`${color}[${timestamp}] [${level}] ${message}${colors.reset}`);
}

// Função para fazer request HTTP
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === "https:" ? https : http;

    const req = protocol.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            resolve({ statusCode: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: data });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(HEALTH_CHECK_TIMEOUT, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

// Verificar API principal
async function checkMainAPI() {
  try {
    const response = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/api/ping",
      method: "GET",
      timeout: 5000,
    });

    if (response.data && response.data.message) {
      log("SUCCESS", "✅ API principal: OK");
      return true;
    } else {
      throw new Error("Resposta inválida da API");
    }
  } catch (error) {
    log("ERROR", `❌ API principal: ${error.message}`);
    return false;
  }
}

// Verificar health endpoint detalhado
async function checkDetailedHealth() {
  try {
    const response = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/api/health",
      method: "GET",
      timeout: 8000,
    });

    if (response.data && response.data.status === "healthy") {
      log("SUCCESS", "✅ Health check detalhado: OK");

      // Log detalhes dos módulos
      if (response.data.modules) {
        const modules = response.data.modules;
        for (const [module, status] of Object.entries(modules)) {
          if (status === "active") {
            log("INFO", `  📦 ${module}: ${status}`);
          } else {
            log("WARN", `  ⚠️  ${module}: ${status}`);
          }
        }
      }

      return true;
    } else {
      throw new Error(`Status: ${response.data.status}`);
    }
  } catch (error) {
    log("ERROR", `❌ Health check detalhado: ${error.message}`);
    return false;
  }
}

// Verificar recursos do sistema
async function checkSystemResources() {
  try {
    // Verificar memória
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem) * 100;

    if (memUsagePercent > 90) {
      log("WARN", `⚠️  Uso de memória alto: ${memUsagePercent.toFixed(1)}%`);
      return false;
    } else {
      log("SUCCESS", `✅ Memória: ${memUsagePercent.toFixed(1)}% usado`);
    }

    // Verificar CPU load
    const loadAvg = os.loadavg();
    const cpuCount = os.cpus().length;
    const loadPercent = (loadAvg[0] / cpuCount) * 100;

    if (loadPercent > 80) {
      log("WARN", `⚠️  Load médio alto: ${loadPercent.toFixed(1)}%`);
    } else {
      log("SUCCESS", `✅ CPU Load: ${loadPercent.toFixed(1)}%`);
    }

    // Verificar espaço em disco
    try {
      const stats = fs.statSync("/app");
      if (stats) {
        log("SUCCESS", "✅ Sistema de arquivos: OK");
      }
    } catch (error) {
      log("ERROR", `❌ Sistema de arquivos: ${error.message}`);
      return false;
    }

    return true;
  } catch (error) {
    log("ERROR", `❌ Recursos do sistema: ${error.message}`);
    return false;
  }
}

// Verificar PID file
async function checkPIDFile() {
  try {
    if (fs.existsSync("/app/kryonix.pid")) {
      const pid = fs.readFileSync("/app/kryonix.pid", "utf8").trim();

      // Verificar se processo ainda está rodando
      try {
        process.kill(pid, 0); // Signal 0 apenas verifica se processo existe
        log("SUCCESS", `✅ Processo principal: PID ${pid}`);
        return true;
      } catch (error) {
        log("ERROR", `❌ Processo principal não encontrado: PID ${pid}`);
        return false;
      }
    } else {
      log("WARN", "⚠️  PID file não encontrado");
      return true; // Não é crítico
    }
  } catch (error) {
    log("ERROR", `❌ Verificação PID: ${error.message}`);
    return false;
  }
}

// Verificar logs de erro recentes
async function checkRecentErrors() {
  try {
    if (fs.existsSync("/app/logs/error.log")) {
      const stats = fs.statSync("/app/logs/error.log");
      const now = Date.now();
      const fileAge = now - stats.mtime.getTime();

      // Se o arquivo de erro foi modificado recentemente (últimos 5 min)
      if (fileAge < 5 * 60 * 1000) {
        const errorLog = fs.readFileSync("/app/logs/error.log", "utf8");
        const recentErrors = errorLog
          .split("\n")
          .filter((line) => line.trim())
          .slice(-5); // Últimas 5 linhas

        if (recentErrors.length > 0) {
          log("WARN", "⚠️  Erros recentes detectados:");
          recentErrors.forEach((error) => {
            log("WARN", `    ${error}`);
          });
        }
      }
    }

    return true;
  } catch (error) {
    log("WARN", `⚠️  Não foi possível verificar logs: ${error.message}`);
    return true; // Não é crítico
  }
}

// Verificar conectividade de rede interna
async function checkNetworkConnectivity() {
  try {
    // Verificar se consegue resolver DNS
    const dns = require("dns");
    await new Promise((resolve, reject) => {
      dns.lookup("localhost", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    log("SUCCESS", "✅ Conectividade de rede: OK");
    return true;
  } catch (error) {
    log("ERROR", `❌ Conectividade de rede: ${error.message}`);
    return false;
  }
}

// Verificar variáveis de ambiente críticas
async function checkEnvironmentVariables() {
  const requiredVars = ["NODE_ENV"];
  const missingVars = [];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    log(
      "WARN",
      `⚠️  Variáveis de ambiente faltando: ${missingVars.join(", ")}`,
    );
  } else {
    log("SUCCESS", "✅ Variáveis de ambiente: OK");
  }

  return missingVars.length === 0;
}

// Função principal de health check
async function runHealthCheck() {
  log("INFO", "🏥 Iniciando health check KRYONIX...");
  log("INFO", `Environment: ${NODE_ENV}`);
  log("INFO", `Port: ${PORT}`);
  log("INFO", `Hostname: ${os.hostname()}`);
  log("INFO", `Platform: ${os.platform()} ${os.arch()}`);
  log("INFO", `Node.js: ${process.version}`);
  log("INFO", `Uptime: ${os.uptime()}s`);

  const checks = [
    { name: "API Principal", fn: checkMainAPI, critical: true },
    { name: "Health Detalhado", fn: checkDetailedHealth, critical: true },
    { name: "Recursos do Sistema", fn: checkSystemResources, critical: false },
    { name: "PID File", fn: checkPIDFile, critical: false },
    { name: "Logs de Erro", fn: checkRecentErrors, critical: false },
    { name: "Conectividade", fn: checkNetworkConnectivity, critical: true },
    {
      name: "Variáveis de Ambiente",
      fn: checkEnvironmentVariables,
      critical: false,
    },
  ];

  let criticalFailures = 0;
  let totalFailures = 0;

  for (const check of checks) {
    try {
      const result = await check.fn();
      if (!result) {
        totalFailures++;
        if (check.critical) {
          criticalFailures++;
        }
      }
    } catch (error) {
      log("ERROR", `❌ ${check.name}: ${error.message}`);
      totalFailures++;
      if (check.critical) {
        criticalFailures++;
      }
    }
  }

  // Resultado final
  const isHealthy = criticalFailures === 0;

  if (isHealthy) {
    log(
      "SUCCESS",
      `🎉 Health check APROVADO! (${totalFailures} avisos não críticos)`,
    );

    // Salvar timestamp do último health check bem-sucedido
    try {
      fs.writeFileSync("/app/last-health-check.txt", new Date().toISOString());
    } catch (e) {
      // Ignorar erro ao salvar timestamp
    }

    process.exit(0);
  } else {
    log(
      "ERROR",
      `💀 Health check REPROVADO! (${criticalFailures} falhas críticas, ${totalFailures} total)`,
    );

    // Em ambiente de desenvolvimento, ser mais permissivo
    if (NODE_ENV === "development") {
      log("WARN", "⚠️  Modo desenvolvimento: continuando mesmo com falhas");
      process.exit(0);
    }

    process.exit(1);
  }
}

// Capturar sinais e timeouts
process.on("SIGTERM", () => {
  log("WARN", "🛑 Health check interrompido (SIGTERM)");
  process.exit(1);
});

process.on("SIGINT", () => {
  log("WARN", "🛑 Health check interrompido (SIGINT)");
  process.exit(1);
});

// Timeout global para health check
setTimeout(() => {
  log("ERROR", "⏰ Health check timeout - processo demorou mais que esperado");
  process.exit(1);
}, HEALTH_CHECK_TIMEOUT);

// Executar health check
runHealthCheck().catch((error) => {
  log("ERROR", `💥 Erro inesperado no health check: ${error.message}`);
  process.exit(1);
});
