# CONFIGURAÇÕES DE SEGURANÇA - KRYONIX PRODUÇÃO

## 🛡️ **HELMET - HEADERS DE SEGURANÇA**

### **Content Security Policy (CSP)**
```javascript
// Configuração otimizada para Next.js + Tailwind
{
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'", 
    "'unsafe-inline'", // Next.js hydration
    "https://vercel.live",
    "https://vitals.vercel-analytics.com"
  ],
  styleSrc: [
    "'self'", 
    "'unsafe-inline'", // Tailwind CSS
    "https://fonts.googleapis.com"
  ],
  imgSrc: ["'self'", "data:", "https:", "blob:"],
  connectSrc: ["'self'", "wss:", "https:"]
}
```

### **HSTS (HTTP Strict Transport Security)**
```javascript
// Força HTTPS por 2 anos
{
  maxAge: 63072000, // 2 anos
  includeSubDomains: true,
  preload: true
}
```

### **Headers Adicionais Configurados:**
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `X-Download-Options: noopen`
- ✅ `X-DNS-Prefetch-Control: off`
- ��� `X-Permitted-Cross-Domain-Policies: none`

---

## 🌐 **CORS - CONTROLE DE ACESSO**

### **Origins Permitidas**
```javascript
// Produção
[
  'https://kryonix.com.br',
  'https://kryonix-platform.vercel.app'
]

// Desenvolvimento  
[
  'http://localhost:3000',
  'http://localhost:8080', 
  'http://localhost:3001'
]
```

### **Configurações CORS Otimizadas:**
- ✅ **Origin Validation:** Função dinâmica que valida cada origin
- ✅ **Credentials:** Permitido para autenticação
- ✅ **Methods:** GET, POST, PUT, DELETE, OPTIONS
- ✅ **Headers:** Content-Type, Authorization, X-CSRF-Token
- ✅ **Preflight Cache:** 24h em produção, 0 em desenvolvimento
- ✅ **Error Logging:** CORS bloqueados são logados

---

## 🚦 **RATE LIMITING**

### **Limitação Geral (Todas APIs)**
```javascript
// 15 minutos = 1000 requests por IP
{
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP"
}
```

### **Limitação Rigorosa (Endpoints Sensíveis)**
```javascript
// 15 minutos = 50 requests por IP
// Aplicado a: /api/auth/, /api/github-webhook
{
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many requests to sensitive endpoint"
}
```

---

## 📊 **CONFIGURAÇÕES POR AMBIENTE**

### **🏭 PRODUÇÃO (NODE_ENV=production)**
- ✅ **CSP:** Habilitado com política restritiva
- ✅ **HSTS:** 2 anos com preload
- ✅ **Rate Limiting:** Ativo (1000/15min geral, 50/15min sensível)
- ✅ **Body Limit:** 5MB (reduzido)
- ✅ **CORS:** Apenas origins autorizadas
- ✅ **Logs:** Formato 'combined' (completo)

### **🧪 DESENVOLVIMENTO (NODE_ENV=development)**
- ⚠️ **CSP:** Desabilitado (compatibilidade)
- ⚠️ **HSTS:** Desabilitado
- ⚠️ **Rate Limiting:** Desabilitado
- ⚠️ **Body Limit:** 10MB (desenvolvimento)
- ⚠️ **CORS:** Localhost permitido
- ⚠️ **Logs:** Formato 'dev' (simplificado)

---

## 🔒 **PROTEÇÕES IMPLEMENTADAS**

### **1. Injection Attacks**
- ✅ **SQL Injection:** Prevenção via ORM/prepared statements
- ✅ **XSS:** Content Security Policy + headers
- ✅ **CSRF:** Headers validation + rate limiting

### **2. DoS/DDoS**
- ✅ **Rate Limiting:** IP-based com janelas deslizantes
- ✅ **Body Size Limit:** 5MB em produção
- ✅ **Parameter Limit:** Máximo 1000 parâmetros

### **3. Information Disclosure**
- ✅ **Server Info:** X-Powered-By removido
- ✅ **Error Details:** Não expostos em produção
- ✅ **Directory Listing:** Bloqueado

### **4. Man-in-the-Middle**
- ✅ **HTTPS Only:** HSTS forçado
- ✅ **Certificate Pinning:** Subdomínios inclusos
- ✅ **Mixed Content:** Bloqueado via CSP

---

## 🧪 **TESTES DE SEGURANÇA**

### **Validar CSP:**
```bash
# Testar Content Security Policy
curl -H "Content-Security-Policy-Report-Only: default-src 'self'" https://seu-dominio.com
```

### **Validar CORS:**
```bash
# Testar origin não autorizada
curl -H "Origin: https://malicious-site.com" https://seu-dominio.com/api/status
```

### **Validar Rate Limiting:**
```bash
# Fazer múltiplas requests
for i in {1..60}; do curl https://seu-dominio.com/api/auth/login; done
```

### **Security Headers Check:**
```bash
# Verificar todos os headers
curl -I https://seu-dominio.com
```

---

## 📋 **CHECKLIST DE DEPLOY**

### **Antes do Deploy:**
- [ ] `ALLOWED_ORIGINS` configurada no ambiente
- [ ] `NODE_ENV=production` definida
- [ ] SSL/TLS certificado instalado
- [ ] Rate limiting testado
- [ ] CSP validada em staging

### **Pós-Deploy:**
- [ ] Headers de segurança verificados
- [ ] CORS testado com diferentes origins
- [ ] Rate limiting funcionando
- [ ] Logs de segurança ativos
- [ ] Scan de vulnerabilidades executado

---

## 🔧 **VARIÁVEIS DE AMBIENTE NECESSÁRIAS**

```env
# Segurança
NODE_ENV=production
ALLOWED_ORIGINS=https://kryonix.com.br,https://kryonix-platform.vercel.app

# Rate Limiting (opcional - usa defaults se não definido)
RATE_LIMIT_WINDOW_MS=900000    # 15 minutos
RATE_LIMIT_MAX_REQUESTS=1000   # Máximo requests
RATE_LIMIT_SENSITIVE_MAX=50    # Máximo para endpoints sensíveis

# CSP Reporting (opcional)
CSP_REPORT_URI=https://seu-dominio.com/csp-report
```

**Status:** ✅ **CONFIGURAÇÕES DE SEGURANÇA OTIMIZADAS PARA PRODUÇÃO**
