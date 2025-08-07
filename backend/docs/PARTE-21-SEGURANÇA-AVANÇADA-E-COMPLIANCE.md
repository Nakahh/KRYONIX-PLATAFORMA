# 🔐 PARTE 21 - SEGURANÇA AVANÇADA E COMPLIANCE
*Agentes Responsáveis: Security Expert + Compliance Specialist + DevSecOps Engineer*

## 🎯 **OBJETIVO**
Implementar sistema completo de segurança avançada e compliance utilizando Keycloak (`keycloak.kryonix.com.br`), VaultWarden (`vault.kryonix.com.br`) e ferramentas de segurança modernas para garantir proteção máxima dos dados e conformidade com LGPD, GDPR e SOC 2.

## 🏗️ **ARQUITETURA DE SEGURANÇA**
```yaml
Security Architecture:
  Identity & Access Management:
    - Keycloak (keycloak.kryonix.com.br)
    - Multi-factor Authentication (TOTP, SMS, Email)
    - Role-based Access Control (RBAC)
    - Attribute-based Access Control (ABAC)
    - Session Management
    
  Secrets Management:
    - VaultWarden (vault.kryonix.com.br)
    - Encryption at rest (AES-256)
    - Key rotation automation
    - Secret sharing secure
    
  Network Security:
    - WAF (Web Application Firewall)
    - DDoS Protection via CloudFlare
    - VPN Access for admin operations
    - Network segmentation
    - Intrusion Detection System (IDS)
    
  Data Protection:
    - Database encryption (TDE)
    - Field-level encryption
    - Data masking/anonymization
    - Secure backup encryption
    - GDPR/LGPD compliance
    
  Monitoring & Incident Response:
    - Security Information Event Management (SIEM)
    - Real-time threat detection
    - Automated incident response
    - Security audit logging
    - Vulnerability scanning
```

## 📊 **MODELO DE DADOS SEGURANÇA**
```sql
-- Schema para segurança e compliance
CREATE SCHEMA IF NOT EXISTS security;

-- Tipos de evento de segurança
CREATE TYPE security.event_type AS ENUM (
  'login_success', 'login_failure', 'logout', 'password_change', 'mfa_enabled', 'mfa_disabled',
  'permission_granted', 'permission_revoked', 'data_access', 'data_export', 'data_deletion',
  'suspicious_activity', 'brute_force_attempt', 'sql_injection_attempt', 'xss_attempt',
  'unauthorized_access', 'privilege_escalation', 'account_locked', 'account_unlocked'
);

CREATE TYPE security.risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE security.incident_status AS ENUM ('open', 'investigating', 'contained', 'resolved', 'false_positive');

-- Log de eventos de segurança
CREATE TABLE security.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Evento
    event_type security.event_type NOT NULL,
    event_category VARCHAR(50) NOT NULL, -- 'authentication', 'authorization', 'data_access', 'system'
    risk_level security.risk_level DEFAULT 'low',
    
    -- Usuário e contexto
    user_id UUID REFERENCES auth.users(id),
    target_user_id UUID REFERENCES auth.users(id), -- usuário afetado (para eventos admin)
    company_id UUID REFERENCES auth.companies(id),
    session_id VARCHAR(255),
    
    -- Detalhes técnicos
    ip_address INET NOT NULL,
    user_agent TEXT,
    endpoint VARCHAR(500),
    http_method VARCHAR(10),
    request_id VARCHAR(255),
    
    -- Geolocalização
    country VARCHAR(3), -- ISO code
    region VARCHAR(100),
    city VARCHAR(100),
    isp VARCHAR(255),
    
    -- Dados do evento
    event_data JSONB DEFAULT '{}',
    
    -- Resultado
    success BOOLEAN DEFAULT true,
    error_code VARCHAR(50),
    error_message TEXT,
    
    -- Timestamps
    occurred_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP DEFAULT NOW()
);

-- Sessões de usuário (para controle de sessão)
CREATE TABLE security.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255),
    
    -- Contexto da sessão
    ip_address INET NOT NULL,
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    
    -- Geolocalização
    country VARCHAR(3),
    region VARCHAR(100),
    city VARCHAR(100),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP DEFAULT NOW(),
    
    -- Configurações de segurança
    requires_mfa BOOLEAN DEFAULT false,
    mfa_verified BOOLEAN DEFAULT false,
    is_suspicious BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Tentativas de login falhadas (para detecção de brute force)
CREATE TABLE security.failed_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    email VARCHAR(255),
    ip_address INET NOT NULL,
    user_agent TEXT,
    
    -- Detalhes da tentativa
    failure_reason VARCHAR(100), -- 'invalid_password', 'user_not_found', 'account_locked', 'mfa_failed'
    attempt_count INTEGER DEFAULT 1,
    
    -- Geolocalização
    country VARCHAR(3),
    city VARCHAR(100),
    
    -- Timestamps
    first_attempt TIMESTAMP DEFAULT NOW(),
    last_attempt TIMESTAMP DEFAULT NOW(),
    blocked_until TIMESTAMP, -- quando o IP será desbloqueado
    
    UNIQUE(email, ip_address)
);

-- Configurações de segurança por empresa
CREATE TABLE security.company_security_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    company_id UUID REFERENCES auth.companies(id) ON DELETE CASCADE UNIQUE,
    
    -- Políticas de senha
    password_min_length INTEGER DEFAULT 8,
    password_require_uppercase BOOLEAN DEFAULT true,
    password_require_lowercase BOOLEAN DEFAULT true,
    password_require_numbers BOOLEAN DEFAULT true,
    password_require_symbols BOOLEAN DEFAULT false,
    password_expiry_days INTEGER DEFAULT 90,
    password_history_count INTEGER DEFAULT 5, -- não reutilizar últimas N senhas
    
    -- Políticas de sessão
    session_timeout_minutes INTEGER DEFAULT 480, -- 8 horas
    idle_timeout_minutes INTEGER DEFAULT 60,
    max_concurrent_sessions INTEGER DEFAULT 5,
    require_mfa BOOLEAN DEFAULT false,
    
    -- Políticas de acesso
    allow_password_reset BOOLEAN DEFAULT true,
    require_email_verification BOOLEAN DEFAULT true,
    lockout_threshold INTEGER DEFAULT 5, -- tentativas antes de bloquear
    lockout_duration_minutes INTEGER DEFAULT 30,
    
    -- Políticas de dados
    data_retention_days INTEGER DEFAULT 365,
    export_approval_required BOOLEAN DEFAULT false,
    anonymize_on_delete BOOLEAN DEFAULT true,
    
    -- Notificações de segurança
    notify_login_new_device BOOLEAN DEFAULT true,
    notify_password_change BOOLEAN DEFAULT true,
    notify_data_export BOOLEAN DEFAULT true,
    notify_admin_suspicious_activity BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Incidentes de segurança
CREATE TABLE security.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    incident_type VARCHAR(100) NOT NULL, -- 'data_breach', 'unauthorized_access', 'malware', 'ddos'
    severity security.risk_level NOT NULL,
    status security.incident_status DEFAULT 'open',
    
    -- Contexto
    affected_company_id UUID REFERENCES auth.companies(id),
    affected_user_count INTEGER DEFAULT 0,
    affected_data_types TEXT[], -- ['personal_data', 'financial_data', 'health_data']
    
    -- Detecção
    detected_by VARCHAR(100), -- 'automated_system', 'user_report', 'admin_review', 'external_report'
    detection_method VARCHAR(100),
    confidence_score DECIMAL(3,2), -- 0.00 a 1.00
    
    -- Timeline
    occurred_at TIMESTAMP,
    detected_at TIMESTAMP DEFAULT NOW(),
    contained_at TIMESTAMP,
    resolved_at TIMESTAMP,
    
    -- Resposta
    assigned_to UUID REFERENCES auth.users(id),
    response_actions JSONB DEFAULT '[]',
    root_cause TEXT,
    lessons_learned TEXT,
    
    -- Compliance
    regulatory_notification_required BOOLEAN DEFAULT false,
    regulatory_notified_at TIMESTAMP,
    customer_notification_required BOOLEAN DEFAULT false,
    customer_notified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vulnerabilidades identificadas
CREATE TABLE security.vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    cve_id VARCHAR(20), -- CVE identifier se aplicável
    severity security.risk_level NOT NULL,
    
    -- Localização
    affected_component VARCHAR(255), -- 'api', 'frontend', 'database', 'infrastructure'
    affected_version VARCHAR(50),
    
    -- CVSS Score
    cvss_score DECIMAL(3,1), -- 0.0 a 10.0
    cvss_vector VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'patched', 'mitigated', 'accepted'
    discovery_method VARCHAR(100), -- 'automated_scan', 'penetration_test', 'code_review', 'bug_bounty'
    
    -- Remediation
    remediation_steps TEXT,
    patch_available BOOLEAN DEFAULT false,
    patch_url VARCHAR(500),
    workaround TEXT,
    
    -- Timeline
    discovered_at TIMESTAMP DEFAULT NOW(),
    patched_at TIMESTAMP,
    verified_at TIMESTAMP,
    
    -- Responsável
    assigned_to UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Compliance e auditoria
CREATE TABLE security.compliance_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Framework de compliance
    framework VARCHAR(50) NOT NULL, -- 'LGPD', 'GDPR', 'SOC2', 'ISO27001'
    control_id VARCHAR(100) NOT NULL, -- ID do controle específico
    control_description TEXT NOT NULL,
    
    -- Resultado da verificação
    status VARCHAR(20) NOT NULL, -- 'compliant', 'non_compliant', 'partially_compliant', 'not_applicable'
    score DECIMAL(5,2), -- score de 0 a 100
    
    -- Evidências
    evidence JSONB DEFAULT '{}',
    findings TEXT,
    recommendations TEXT,
    
    -- Responsabilidade
    assessed_by UUID REFERENCES auth.users(id),
    
    -- Timeline
    assessment_date DATE NOT NULL,
    next_assessment_date DATE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Dados pessoais (para LGPD/GDPR)
CREATE TABLE security.personal_data_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Localização dos dados
    table_name VARCHAR(255) NOT NULL,
    column_name VARCHAR(255) NOT NULL,
    data_type VARCHAR(100) NOT NULL, -- 'personal_identifier', 'sensitive_personal', 'financial', 'health'
    
    -- Classificação
    sensitivity_level security.risk_level NOT NULL,
    purpose TEXT NOT NULL, -- finalidade do processamento
    legal_basis VARCHAR(100) NOT NULL, -- base legal LGPD/GDPR
    
    -- Retenção
    retention_period_days INTEGER,
    deletion_schedule VARCHAR(100),
    
    -- Processamento
    is_encrypted BOOLEAN DEFAULT false,
    encryption_method VARCHAR(100),
    is_pseudonymized BOOLEAN DEFAULT false,
    
    -- Transferências
    shared_with_third_parties BOOLEAN DEFAULT false,
    third_party_list TEXT[],
    cross_border_transfer BOOLEAN DEFAULT false,
    transfer_countries TEXT[],
    
    -- Consentimento
    requires_consent BOOLEAN DEFAULT true,
    consent_mechanism VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(table_name, column_name)
);

-- Índices para performance
CREATE INDEX idx_audit_log_user_occurred ON security.audit_log(user_id, occurred_at);
CREATE INDEX idx_audit_log_event_type_occurred ON security.audit_log(event_type, occurred_at);
CREATE INDEX idx_audit_log_risk_level ON security.audit_log(risk_level) WHERE risk_level IN ('high', 'critical');
CREATE INDEX idx_audit_log_ip_occurred ON security.audit_log(ip_address, occurred_at);
CREATE INDEX idx_user_sessions_user_active ON security.user_sessions(user_id, is_active);
CREATE INDEX idx_user_sessions_token ON security.user_sessions(session_token);
CREATE INDEX idx_failed_attempts_ip_blocked ON security.failed_login_attempts(ip_address, blocked_until);
CREATE INDEX idx_incidents_status_severity ON security.incidents(status, severity);
CREATE INDEX idx_vulnerabilities_status_severity ON security.vulnerabilities(status, severity);

-- Particionamento para logs (TimescaleDB)
SELECT create_hypertable('security.audit_log', 'occurred_at');
```

## 🔧 **SERVIÇO DE SEGURANÇA**
```typescript
// services/security.service.ts
export class SecurityService {
  private keycloakAdmin: KcAdminClient;
  private vaultWardenClient: VaultWardenClient;
  private geoIpService: GeoIpService;

  constructor() {
    this.keycloakAdmin = new KcAdminClient({
      baseUrl: 'https://keycloak.kryonix.com.br',
      realmName: 'KRYONIX-SAAS'
    });

    this.vaultWardenClient = new VaultWardenClient({
      baseUrl: 'https://vault.kryonix.com.br',
      token: process.env.VAULTWARDEN_TOKEN
    });

    this.geoIpService = new GeoIpService();
  }

  // ========== AUTENTICAÇÃO SEGURA ==========

  async authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
    const clientIp = credentials.ipAddress;
    const userAgent = credentials.userAgent;

    try {
      // 1. Verificar se IP está bloqueado
      await this.checkIpBlocked(clientIp, credentials.email);

      // 2. Verificar tentativas de login falhadas
      const failedAttempts = await this.getFailedAttempts(credentials.email, clientIp);
      
      if (failedAttempts.attempt_count >= 5) {
        await this.blockIp(clientIp, credentials.email, 30); // 30 minutos
        throw new SecurityError('IP temporariamente bloqueado por muitas tentativas falhadas');
      }

      // 3. Buscar usuário
      const user = await this.getUserByEmail(credentials.email);
      if (!user) {
        await this.recordFailedAttempt(credentials.email, clientIp, 'user_not_found');
        throw new AuthenticationError('Credenciais inválidas');
      }

      // 4. Verificar se conta está bloqueada
      if (user.locked_until && new Date() < user.locked_until) {
        await this.logSecurityEvent({
          eventType: 'login_failure',
          userId: user.id,
          ipAddress: clientIp,
          eventData: { reason: 'account_locked' }
        });
        throw new AuthenticationError('Conta temporariamente bloqueada');
      }

      // 5. Verificar senha com Keycloak
      const authResult = await this.keycloakAdmin.auth({
        username: credentials.email,
        password: credentials.password,
        grantType: 'password'
      });

      if (!authResult.access_token) {
        await this.recordFailedAttempt(credentials.email, clientIp, 'invalid_password');
        await this.incrementUserFailedAttempts(user.id);
        throw new AuthenticationError('Credenciais inválidas');
      }

      // 6. Verificar se é novo dispositivo/localização
      const deviceRisk = await this.assessDeviceRisk(user.id, clientIp, userAgent);
      
      // 7. Verificar se MFA é necessário
      const requiresMfa = await this.shouldRequireMfa(user, deviceRisk);

      if (requiresMfa && !credentials.mfaToken) {
        // Enviar código MFA
        await this.sendMfaCode(user);
        return {
          success: false,
          requiresMfa: true,
          mfaMethod: user.mfa_method || 'email'
        };
      }

      if (requiresMfa && credentials.mfaToken) {
        const mfaValid = await this.verifyMfaToken(user.id, credentials.mfaToken);
        if (!mfaValid) {
          await this.logSecurityEvent({
            eventType: 'login_failure',
            userId: user.id,
            ipAddress: clientIp,
            eventData: { reason: 'invalid_mfa' }
          });
          throw new AuthenticationError('Código MFA inválido');
        }
      }

      // 8. Criar sessão segura
      const session = await this.createSecureSession(user, clientIp, userAgent, deviceRisk);

      // 9. Limpar tentativas falhadas
      await this.clearFailedAttempts(credentials.email, clientIp);
      await this.resetUserFailedAttempts(user.id);

      // 10. Log de sucesso
      await this.logSecurityEvent({
        eventType: 'login_success',
        userId: user.id,
        ipAddress: clientIp,
        sessionId: session.id,
        eventData: {
          newDevice: deviceRisk.isNewDevice,
          riskScore: deviceRisk.riskScore,
          mfaVerified: requiresMfa
        }
      });

      // 11. Notificar se novo dispositivo
      if (deviceRisk.isNewDevice) {
        await this.notifyNewDeviceLogin(user, deviceRisk);
      }

      return {
        success: true,
        user,
        session,
        tokens: {
          accessToken: authResult.access_token,
          refreshToken: authResult.refresh_token
        }
      };

    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof SecurityError) {
        throw error;
      }
      
      console.error('Erro na autenticação:', error);
      throw new AuthenticationError('Erro interno de autenticação');
    }
  }

  private async assessDeviceRisk(userId: string, ipAddress: string, userAgent: string): Promise<DeviceRisk> {
    // Verificar se é IP conhecido
    const knownIp = await this.db.query(`
      SELECT COUNT(*) as count
      FROM security.user_sessions 
      WHERE user_id = $1 AND ip_address = $2 AND created_at > NOW() - INTERVAL '30 days'
    `, [userId, ipAddress]);

    // Verificar se é device conhecido (fingerprint)
    const deviceFingerprint = this.generateDeviceFingerprint(userAgent, ipAddress);
    const knownDevice = await this.db.query(`
      SELECT COUNT(*) as count
      FROM security.user_sessions 
      WHERE user_id = $1 AND device_fingerprint = $2
    `, [userId, deviceFingerprint]);

    // Buscar informações geográficas
    const geoInfo = await this.geoIpService.lookup(ipAddress);
    
    // Verificar padrão geográfico do usuário
    const userGeoPattern = await this.getUserGeoPattern(userId);
    
    let riskScore = 0;
    const isNewDevice = knownDevice.rows[0].count === '0';
    const isNewIp = knownIp.rows[0].count === '0';
    const isNewLocation = !userGeoPattern.includes(geoInfo.country);

    if (isNewDevice) riskScore += 30;
    if (isNewIp) riskScore += 20;
    if (isNewLocation) riskScore += 40;
    
    // Verificar se IP está em lista de reputação ruim
    const ipReputation = await this.checkIpReputation(ipAddress);
    if (ipReputation.isMalicious) riskScore += 50;

    return {
      isNewDevice,
      isNewIp,
      isNewLocation,
      riskScore: Math.min(riskScore, 100),
      geoInfo,
      deviceFingerprint,
      ipReputation
    };
  }

  // ========== GESTÃO DE SESSÕES ==========

  async createSecureSession(user: User, ipAddress: string, userAgent: string, deviceRisk: DeviceRisk): Promise<UserSession> {
    // Limitar sessões simultâneas
    const securityConfig = await this.getCompanySecurityConfig(user.company_id);
    await this.limitConcurrentSessions(user.id, securityConfig.max_concurrent_sessions);

    const sessionToken = this.generateSecureToken(32);
    const refreshToken = this.generateSecureToken(32);
    const expiresAt = new Date(Date.now() + securityConfig.session_timeout_minutes * 60 * 1000);

    const session = await this.db.query(`
      INSERT INTO security.user_sessions 
        (user_id, session_token, refresh_token, ip_address, user_agent, device_fingerprint,
         country, region, city, expires_at, requires_mfa, mfa_verified, is_suspicious)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      user.id,
      sessionToken,
      refreshToken,
      ipAddress,
      userAgent,
      deviceRisk.deviceFingerprint,
      deviceRisk.geoInfo.country,
      deviceRisk.geoInfo.region,
      deviceRisk.geoInfo.city,
      expiresAt,
      deviceRisk.riskScore > 50,
      deviceRisk.riskScore <= 50, // Se baixo risco, considera MFA verificado
      deviceRisk.riskScore > 70
    ]);

    return session.rows[0];
  }

  async validateSession(sessionToken: string): Promise<SessionValidation> {
    const session = await this.db.query(`
      SELECT s.*, u.id as user_id, u.email, u.is_active as user_active
      FROM security.user_sessions s
      JOIN auth.users u ON s.user_id = u.id
      WHERE s.session_token = $1 AND s.is_active = true
    `, [sessionToken]);

    if (session.rows.length === 0) {
      return { valid: false, reason: 'session_not_found' };
    }

    const sessionData = session.rows[0];

    // Verificar expiração
    if (new Date() > new Date(sessionData.expires_at)) {
      await this.invalidateSession(sessionToken);
      return { valid: false, reason: 'session_expired' };
    }

    // Verificar se usuário ainda está ativo
    if (!sessionData.user_active) {
      await this.invalidateSession(sessionToken);
      return { valid: false, reason: 'user_inactive' };
    }

    // Verificar idle timeout
    const securityConfig = await this.getCompanySecurityConfig(sessionData.company_id);
    const idleTime = Date.now() - new Date(sessionData.last_activity).getTime();
    const idleTimeoutMs = securityConfig.idle_timeout_minutes * 60 * 1000;

    if (idleTime > idleTimeoutMs) {
      await this.invalidateSession(sessionToken);
      return { valid: false, reason: 'idle_timeout' };
    }

    // Atualizar última atividade
    await this.updateSessionActivity(sessionToken);

    return {
      valid: true,
      session: sessionData,
      user: {
        id: sessionData.user_id,
        email: sessionData.email
      }
    };
  }

  // ========== MONITORAMENTO DE SEGURANÇA ==========

  async detectSuspiciousActivity(): Promise<SuspiciousActivityReport> {
    const suspiciousPatterns = [
      // Múltiplos logins falhados de IPs diferentes
      await this.detectDistributedBruteForce(),
      
      // Acessos de localizações anômalas
      await this.detectAnomalousLocations(),
      
      // Tentativas de SQL injection
      await this.detectSqlInjectionAttempts(),
      
      // Acessos a endpoints sensíveis
      await this.detectSensitiveDataAccess(),
      
      // Padrões de bot/scraping
      await this.detectBotActivity()
    ];

    const incidents = suspiciousPatterns.filter(pattern => pattern.riskLevel >= 50);

    // Criar incidentes automáticos para atividades de alto risco
    for (const incident of incidents.filter(i => i.riskLevel >= 80)) {
      await this.createSecurityIncident(incident);
    }

    return {
      totalPatterns: suspiciousPatterns.length,
      highRiskPatterns: incidents.length,
      criticalIncidents: incidents.filter(i => i.riskLevel >= 90).length,
      patterns: suspiciousPatterns
    };
  }

  private async detectDistributedBruteForce(): Promise<SuspiciousPattern> {
    const result = await this.db.query(`
      SELECT 
        email,
        COUNT(DISTINCT ip_address) as unique_ips,
        COUNT(*) as total_attempts,
        MAX(last_attempt) as latest_attempt
      FROM security.failed_login_attempts 
      WHERE last_attempt > NOW() - INTERVAL '1 hour'
      GROUP BY email
      HAVING COUNT(DISTINCT ip_address) > 5 AND COUNT(*) > 20
    `);

    return {
      type: 'distributed_brute_force',
      riskLevel: result.rows.length > 0 ? 85 : 0,
      affectedAccounts: result.rows.length,
      details: result.rows,
      recommendations: result.rows.length > 0 ? [
        'Bloquear temporariamente os IPs envolvidos',
        'Forçar reset de senha das contas afetadas',
        'Ativar MFA obrigatório para as contas'
      ] : []
    };
  }

  // ========== COMPLIANCE E AUDITORIA ==========

  async performComplianceCheck(framework: ComplianceFramework): Promise<ComplianceReport> {
    const checks = await this.getComplianceChecks(framework);
    const results = [];

    for (const check of checks) {
      const result = await this.executeComplianceCheck(check);
      results.push(result);

      // Salvar resultado
      await this.db.query(`
        INSERT INTO security.compliance_checks 
          (framework, control_id, control_description, status, score, evidence, findings, recommendations, assessed_by, assessment_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        framework,
        check.controlId,
        check.description,
        result.status,
        result.score,
        JSON.stringify(result.evidence),
        result.findings,
        result.recommendations,
        'system', // assessment automático
        new Date()
      ]);
    }

    const overallScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const compliantControls = results.filter(r => r.status === 'compliant').length;

    return {
      framework,
      overallScore,
      compliantControls,
      totalControls: results.length,
      compliancePercentage: (compliantControls / results.length) * 100,
      results,
      assessmentDate: new Date(),
      nextAssessmentDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 dias
    };
  }

  // ========== GESTÃO DE DADOS PESSOAIS (LGPD/GDPR) ==========

  async handleDataSubjectRequest(request: DataSubjectRequest): Promise<DataSubjectResponse> {
    const user = await this.getUserByEmail(request.email);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    switch (request.type) {
      case 'access':
        return await this.handleDataAccessRequest(user);
      
      case 'portability':
        return await this.handleDataPortabilityRequest(user);
      
      case 'rectification':
        return await this.handleDataRectificationRequest(user, request.corrections);
      
      case 'erasure':
        return await this.handleDataErasureRequest(user);
      
      case 'restriction':
        return await this.handleDataRestrictionRequest(user);
      
      default:
        throw new Error(`Tipo de solicitação não suportado: ${request.type}`);
    }
  }

  private async handleDataAccessRequest(user: User): Promise<DataSubjectResponse> {
    // Buscar todos os dados pessoais do usuário
    const personalData = await this.collectUserPersonalData(user.id);
    
    // Criar relatório estruturado
    const report = {
      userData: personalData.userData,
      activityLog: personalData.activityLog,
      preferences: personalData.preferences,
      consents: personalData.consents,
      dataProcessingPurposes: personalData.processingPurposes,
      dataRetentionPeriods: personalData.retentionPeriods,
      thirdPartySharing: personalData.thirdPartySharing
    };

    // Log da solicitação
    await this.logSecurityEvent({
      eventType: 'data_access',
      userId: user.id,
      eventData: { requestType: 'access', dataCategories: Object.keys(report) }
    });

    return {
      success: true,
      data: report,
      format: 'json',
      deliveryMethod: 'secure_download'
    };
  }

  private async handleDataErasureRequest(user: User): Promise<DataSubjectResponse> {
    // Verificar se há impedimentos legais para exclusão
    const legalHolds = await this.checkLegalHolds(user.id);
    
    if (legalHolds.length > 0) {
      return {
        success: false,
        reason: 'legal_impediment',
        details: 'Dados não podem ser excluídos devido a obrigações legais',
        legalHolds
      };
    }

    // Anonimizar dados em vez de excluir (para preservar integridade)
    await this.anonymizeUserData(user.id);

    // Marcar usuário como excluído
    await this.db.query(`
      UPDATE auth.users 
      SET is_active = false, deleted_at = NOW(), deletion_reason = 'user_request'
      WHERE id = $1
    `, [user.id]);

    // Log da exclusão
    await this.logSecurityEvent({
      eventType: 'data_deletion',
      userId: user.id,
      eventData: { requestType: 'erasure', method: 'anonymization' }
    });

    return {
      success: true,
      message: 'Dados anonimizados com sucesso conforme LGPD/GDPR'
    };
  }

  // ========== CRIPTOGRAFIA E PROTEÇÃO DE DADOS ==========

  async encryptSensitiveField(value: string, context: EncryptionContext): Promise<EncryptedData> {
    const key = await this.getOrCreateEncryptionKey(context);
    
    const cipher = crypto.createCipher('aes-256-gcm', key);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();

    return {
      encryptedValue: encrypted,
      authTag: authTag.toString('hex'),
      keyId: context.keyId,
      algorithm: 'aes-256-gcm',
      version: 1
    };
  }

  async decryptSensitiveField(encryptedData: EncryptedData): Promise<string> {
    const key = await this.getEncryptionKey(encryptedData.keyId);
    
    const decipher = crypto.createDecipher('aes-256-gcm', key);
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encryptedValue, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // ========== INTEGRAÇÃO COM VAULTWARDEN ==========

  async storeSecretInVault(secret: SecretData): Promise<VaultEntry> {
    const vaultEntry = await this.vaultWardenClient.createSecret({
      name: secret.name,
      notes: secret.description,
      fields: secret.fields,
      organizationId: secret.organizationId,
      folderId: secret.folderId
    });

    // Log do armazenamento seguro
    await this.logSecurityEvent({
      eventType: 'data_access',
      eventData: { 
        action: 'vault_store',
        secretType: secret.type,
        vaultId: vaultEntry.id
      }
    });

    return vaultEntry;
  }

  async rotateApiKeys(): Promise<KeyRotationResult> {
    const apiKeys = await this.getAllApiKeys();
    const rotationResults = [];

    for (const apiKey of apiKeys) {
      try {
        // Gerar nova chave
        const newKey = this.generateApiKey();
        
        // Atualizar no banco
        await this.updateApiKey(apiKey.id, newKey);
        
        // Armazenar no vault
        await this.storeSecretInVault({
          name: `API_KEY_${apiKey.service}`,
          description: `Chave API rotacionada automaticamente para ${apiKey.service}`,
          fields: [{ name: 'api_key', value: newKey }],
          type: 'api_key'
        });

        rotationResults.push({
          service: apiKey.service,
          success: true,
          rotatedAt: new Date()
        });

      } catch (error) {
        rotationResults.push({
          service: apiKey.service,
          success: false,
          error: error.message
        });
      }
    }

    return {
      totalKeys: apiKeys.length,
      successfulRotations: rotationResults.filter(r => r.success).length,
      results: rotationResults
    };
  }
}
```

## 🎨 **COMPONENTES FRONTEND DE SEGURANÇA**
```tsx
// components/security/SecurityDashboard.tsx
export const SecurityDashboard = () => {
  const { securityMetrics, loading } = useSecurityMetrics();
  const { alerts } = useSecurityAlerts();
  const [timeRange, setTimeRange] = useState('24h');

  const securityCards = [
    {
      title: 'Score de Segurança',
      value: `${securityMetrics?.securityScore || 0}/100`,
      status: securityMetrics?.securityScore >= 80 ? 'good' : 'warning',
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      description: 'Pontuação geral de segurança'
    },
    {
      title: 'Alertas Ativos',
      value: alerts?.filter(a => a.status === 'active').length || 0,
      status: alerts?.filter(a => a.severity === 'critical').length > 0 ? 'error' : 'good',
      icon: <AlertTriangleIcon className="h-6 w-6" />,
      description: 'Alertas de segurança pendentes'
    },
    {
      title: 'Usuários com MFA',
      value: `${securityMetrics?.mfaAdoption || 0}%`,
      status: securityMetrics?.mfaAdoption >= 90 ? 'good' : 'warning',
      icon: <SmartphoneIcon className="h-6 w-6" />,
      description: 'Adoção de autenticação multifator'
    },
    {
      title: 'Sessões Suspeitas',
      value: securityMetrics?.suspiciousSessions || 0,
      status: securityMetrics?.suspiciousSessions === 0 ? 'good' : 'warning',
      icon: <EyeIcon className="h-6 w-6" />,
      description: 'Sessões marcadas como suspeitas'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Segurança</h1>
          <p className="text-gray-600">Monitoramento e controle de seguran��a da plataforma</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Última hora</SelectItem>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Security Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityCards.map((card, index) => (
          <SecurityMetricCard key={index} {...card} />
        ))}
      </div>

      {/* Security Alerts */}
      {alerts && alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangleIcon className="h-5 w-5 mr-2 text-yellow-600" />
              Alertas de Segurança Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SecurityAlertsTable alerts={alerts} />
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Eventos de Segurança</CardTitle>
            <CardDescription>Distribuição de eventos por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <SecurityEventsChart timeRange={timeRange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tentativas de Login</CardTitle>
            <CardDescription>Sucessos vs falhas</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginAttemptsChart timeRange={timeRange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição Geográfica</CardTitle>
            <CardDescription>Acessos por localização</CardDescription>
          </CardHeader>
          <CardContent>
            <GeographicAccessChart timeRange={timeRange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vulnerabilidades</CardTitle>
            <CardDescription>Status das vulnerabilidades identificadas</CardDescription>
          </CardHeader>
          <CardContent>
            <VulnerabilitiesChart />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>IPs Mais Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <TopIPsTable timeRange={timeRange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuários com Mais Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <TopUsersSecurityTable timeRange={timeRange} />
          </CardContent>
        </Card>
      </div>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status de Compliance</CardTitle>
          <CardDescription>Conformidade com frameworks de segurança</CardDescription>
        </CardHeader>
        <CardContent>
          <ComplianceStatus />
        </CardContent>
      </Card>
    </div>
  );
};

// components/security/SecurityAlertsTable.tsx
export const SecurityAlertsTable = ({ alerts }: { alerts: SecurityAlert[] }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100';
      case 'high': return 'text-orange-700 bg-orange-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      default: return 'text-blue-700 bg-blue-100';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Severidade
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Título
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descrição
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Detectado em
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {alerts.map((alert) => (
            <tr key={alert.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={cn(
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  getSeverityColor(alert.severity)
                )}>
                  {alert.severity.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {alert.title}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500 max-w-xs truncate">
                  {alert.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: ptBR })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm">
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Resolver
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// components/security/ComplianceStatus.tsx
export const ComplianceStatus = () => {
  const { complianceData, loading } = useComplianceStatus();

  const frameworks = [
    { id: 'LGPD', name: 'LGPD', description: 'Lei Geral de Proteção de Dados' },
    { id: 'GDPR', name: 'GDPR', description: 'General Data Protection Regulation' },
    { id: 'SOC2', name: 'SOC 2', description: 'Service Organization Control 2' },
    { id: 'ISO27001', name: 'ISO 27001', description: 'Information Security Management' }
  ];

  return (
    <div className="space-y-6">
      {frameworks.map(framework => {
        const compliance = complianceData?.find(c => c.framework === framework.id);
        const score = compliance?.overallScore || 0;
        const status = score >= 90 ? 'compliant' : score >= 70 ? 'partially_compliant' : 'non_compliant';
        
        return (
          <div key={framework.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{framework.name}</h4>
                <p className="text-sm text-gray-500">{framework.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {score.toFixed(0)}%
                </div>
                <div className={cn(
                  'text-xs font-medium',
                  status === 'compliant' ? 'text-green-600' :
                  status === 'partially_compliant' ? 'text-yellow-600' : 'text-red-600'
                )}>
                  {status === 'compliant' ? 'Conforme' :
                   status === 'partially_compliant' ? 'Parcialmente Conforme' : 'Não Conforme'}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  'h-2 rounded-full transition-all duration-500',
                  status === 'compliant' ? 'bg-green-500' :
                  status === 'partially_compliant' ? 'bg-yellow-500' : 'bg-red-500'
                )}
                style={{ width: `${score}%` }}
              />
            </div>
            
            {compliance && (
              <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                <span>{compliance.compliantControls} de {compliance.totalControls} controles</span>
                <span>Última avaliação: {format(new Date(compliance.assessmentDate), 'dd/MM/yyyy')}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
```

## 🔧 **COMANDOS DE EXECUÇÃO**
```bash
# 1. Criar schema de segurança
psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -f security-schema.sql

# 2. Configurar Keycloak realm
curl -X POST https://keycloak.kryonix.com.br/admin/realms \
  -H "Authorization: Bearer $KEYCLOAK_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "realm": "KRYONIX-SAAS",
    "enabled": true,
    "sslRequired": "external",
    "registrationAllowed": false,
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false,
    "bruteForceProtected": true,
    "failureFactor": 5,
    "waitIncrementSeconds": 60,
    "quickLoginCheckMilliSeconds": 1000,
    "maxFailureWaitSeconds": 900
  }'

# 3. Configurar TimescaleDB para logs de segurança
psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -c "
  SELECT create_hypertable('security.audit_log', 'occurred_at');
  SELECT add_retention_policy('security.audit_log', INTERVAL '2 years');
"

# 4. Configurar VaultWarden
curl -X POST https://vault.kryonix.com.br/api/organizations \
  -H "Authorization: Bearer $VAULTWARDEN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "KRYONIX",
    "billingEmail": "admin@kryonix.com.br"
  }'

# 5. Testar detecção de ameaças
curl -X POST https://api.kryonix.com.br/security/test-threats \
  -H "Authorization: Bearer $JWT_TOKEN"

# 6. Verificar compliance LGPD
curl -X GET https://api.kryonix.com.br/security/compliance/LGPD \
  -H "Authorization: Bearer $JWT_TOKEN"

# 7. Executar scan de vulnerabilidades
curl -X POST https://api.kryonix.com.br/security/vulnerability-scan \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## ✅ **CHECKLIST DE VALIDAÇÃO**
- [ ] Schema de segurança criado
- [ ] Keycloak realm configurado
- [ ] VaultWarden integrado
- [ ] Logs de auditoria funcionando
- [ ] MFA implementado
- [ ] Detecção de brute force ativa
- [ ] Monitoramento de sessões funcionando
- [ ] Compliance LGPD implementado
- [ ] Gestão de dados pessoais ativa
- [ ] Criptografia de campos sensíveis
- [ ] Alertas de segurança configurados
- [ ] Scan de vulnerabilidades automático
- [ ] Rotação de chaves implementada
- [ ] Dashboard de segurança criado

## 🧪 **TESTES (QA Expert)**
```bash
# Teste de autenticação
npm run test:security:authentication

# Teste de autorização
npm run test:security:authorization

# Teste de detecção de ameaças
npm run test:security:threat-detection

# Teste de compliance
npm run test:security:compliance

# Teste de criptografia
npm run test:security:encryption

# Teste de logs de auditoria
npm run test:security:audit-logs

# Penetration testing
npm run test:security:pentest
```

---
