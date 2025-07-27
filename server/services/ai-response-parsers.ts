/**
 * Parser para respostas do Ollama AI
 * Extrai informações estruturadas da resposta em linguagem natural
 */
export function parseOllamaResponse(response: string): any {
  const defaultResult = {
    severity: "medium",
    recommendation: "Monitorar sistema por mais tempo",
    confidence: 0.5,
    reasoning: "Análise automática baseada em padrões",
  };

  try {
    // Extrair gravidade
    let severity: "low" | "medium" | "high" = "medium";
    if (/gravidade.*(alta|high|crítica|urgente)/i.test(response)) {
      severity = "high";
    } else if (/gravidade.*(baixa|low|leve|menor)/i.test(response)) {
      severity = "low";
    }

    // Extrair recomendação
    let recommendation = "Continuar monitoramento";
    const recomendacaoMatch = response.match(
      /recomenda[çc][ãa]o[:\s]*(.*?)(?:\n|$)/i,
    );
    if (recomendacaoMatch) {
      recommendation = recomendacaoMatch[1].trim();
    } else if (/reiniciar|restart/i.test(response)) {
      recommendation = "Reiniciar serviço imediatamente";
    } else if (/escalar|aumentar.*recursos/i.test(response)) {
      recommendation = "Escalar recursos do container";
    } else if (/investigar|analisar.*logs/i.test(response)) {
      recommendation = "Investigar logs detalhados";
    }

    // Extrair confiança
    let confidence = 0.7;
    const confidenceMatch = response.match(/confian[çc]a[:\s]*([0-9]+)%?/i);
    if (confidenceMatch) {
      confidence = parseInt(confidenceMatch[1]) / 100;
    } else if (/muito.*confiante|certeza/i.test(response)) {
      confidence = 0.9;
    } else if (/pouco.*confiante|incerto/i.test(response)) {
      confidence = 0.4;
    }

    // Extrair raciocínio
    let reasoning = response.substring(0, 200);
    const raciocinioMatch = response.match(
      /porque|devido.*?[:]\s*(.*?)(?:\n|$)/i,
    );
    if (raciocinioMatch) {
      reasoning = raciocinioMatch[1].trim();
    }

    return {
      severity,
      recommendation,
      confidence: Math.max(0.1, Math.min(1.0, confidence)),
      reasoning: reasoning.substring(0, 200),
    };
  } catch (error) {
    console.error("Erro parsing resposta Ollama:", error);
    return defaultResult;
  }
}

/**
 * Parser para respostas do Dify AI
 * Processa formato estruturado ou linguagem natural
 */
export function parseDifyResponse(response: string): any {
  const defaultResult = {
    severity: "medium",
    recommendation: "Monitorar sistema por mais tempo",
    confidence: 0.6,
    reasoning: "Análise automática Dify AI",
  };

  try {
    // Tentar parsing JSON estruturado primeiro
    if (response.trim().startsWith("{")) {
      const parsed = JSON.parse(response);
      return {
        severity: parsed.severity || "medium",
        recommendation: parsed.recommendation || "Continuar monitoramento",
        confidence: parsed.confidence || 0.6,
        reasoning: parsed.reasoning || "Análise Dify",
      };
    }

    // Fallback para parsing de linguagem natural
    let severity: "low" | "medium" | "high" = "medium";
    if (/\b(crítico|alto|urgente|grave)\b/i.test(response)) {
      severity = "high";
    } else if (/\b(baixo|leve|menor|normal)\b/i.test(response)) {
      severity = "low";
    }

    // Extrair ação recomendada
    let recommendation = "Continuar monitoramento do sistema";
    if (/reiniciar.*container|restart.*service/i.test(response)) {
      recommendation = "Reiniciar container da stack";
    } else if (/aumentar.*recursos|scale.*up/i.test(response)) {
      recommendation = "Aumentar recursos alocados";
    } else if (/verificar.*logs|check.*logs/i.test(response)) {
      recommendation = "Verificar logs detalhados da aplicação";
    } else if (/otimizar.*configuração/i.test(response)) {
      recommendation = "Otimizar configurações da stack";
    }

    // Extrair nível de confiança
    let confidence = 0.6;
    const percentMatch = response.match(/(\d+)%.*confian[çc]a/i);
    if (percentMatch) {
      confidence = parseInt(percentMatch[1]) / 100;
    } else if (/alta.*confian[çc]a/i.test(response)) {
      confidence = 0.85;
    } else if (/\b(baixa|pouca)\b.*confian[çc]a/i.test(response)) {
      confidence = 0.4;
    }

    // Extrair justificativa
    const reasoning =
      response.length > 150 ? response.substring(0, 150) + "..." : response;

    return {
      severity,
      recommendation,
      confidence: Math.max(0.1, Math.min(1.0, confidence)),
      reasoning,
    };
  } catch (error) {
    console.error("Erro parsing resposta Dify:", error);
    return defaultResult;
  }
}

/**
 * Análise básica baseada em métricas quando IA não está disponível
 */
export function generateBasicAnalysis(problem: any): any {
  const metrics = problem.metrics;

  if (!metrics) {
    return {
      severity: "medium",
      recommendation: "Verificar conectividade da stack",
      confidence: 0.3,
      reasoning:
        "Métricas não disponíveis - possível problema de conectividade",
    };
  }

  // Análise baseada em thresholds
  let severity: "low" | "medium" | "high" = "low";
  let recommendation = "Sistema funcionando normalmente";
  let confidence = 0.8;

  // CPU crítico
  if (metrics.cpuUsage > 90) {
    severity = "high";
    recommendation = "Reiniciar container - CPU crítico";
    confidence = 0.9;
  } else if (metrics.cpuUsage > 70) {
    severity = "medium";
    recommendation = "Monitorar CPU - considerar otimização";
    confidence = 0.7;
  }

  // Memória crítica
  if (metrics.memoryUsage > 95) {
    severity = "high";
    recommendation = "Reiniciar container - memória esgotada";
    confidence = 0.95;
  } else if (metrics.memoryUsage > 80) {
    severity = severity === "low" ? "medium" : severity;
    recommendation = "Otimizar uso de memória";
    confidence = 0.8;
  }

  // Tempo de resposta alto
  if (metrics.responseTime > 5000) {
    severity = "high";
    recommendation = "Investigar lentidão - tempo resposta crítico";
    confidence = 0.85;
  } else if (metrics.responseTime > 2000) {
    severity = severity === "low" ? "medium" : severity;
    recommendation = "Otimizar performance da aplicação";
    confidence = 0.7;
  }

  // Taxa de erro alta
  if (metrics.errorRate > 20) {
    severity = "high";
    recommendation = "Investigar erros urgentemente";
    confidence = 0.9;
  } else if (metrics.errorRate > 5) {
    severity = severity === "low" ? "medium" : severity;
    recommendation = "Monitorar erros da aplicação";
    confidence = 0.6;
  }

  const reasoning = `CPU: ${metrics.cpuUsage}%, Memória: ${metrics.memoryUsage}%, Resposta: ${metrics.responseTime}ms, Erros: ${metrics.errorRate}%`;

  return {
    severity,
    recommendation,
    confidence,
    reasoning,
  };
}
