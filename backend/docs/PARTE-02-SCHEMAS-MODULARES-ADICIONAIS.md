# 📦 SCHEMAS MODULARES PARA CADA CLIENTE - PARTE 02 EXTENSÃO

## 🚀 **SCRIPTS DE AUTO-CREATION**

### **🤖 SCRIPT MASTER DE CRIAÇÃO AUTOMÁTICA**
```bash
#!/bin/bash
# auto-create-tenant.sh
# Script IA para criação automática de clientes multi-tenant

set -e

CLIENTE_ID="$1"
CLIENTE_NOME="$2"
MODULOS_CONTRATADOS="$3" # "crm,whatsapp,agendamento"

if [ -z "$CLIENTE_ID" ] || [ -z "$CLIENTE_NOME" ] || [ -z "$MODULOS_CONTRATADOS" ]; then
    echo "❌ Uso: $0 <cliente_id> <nome> <modulos>"
    echo "📝 Exemplo: $0 siqueiracampos 'Siqueira Campos Imóveis' 'crm,whatsapp,agendamento'"
    exit 1
fi

echo "🚀 KRYONIX - Criação Automática Multi-Tenant"
echo "👤 Cliente: $CLIENTE_NOME"
echo "🆔 ID: $CLIENTE_ID"
echo "📦 Módulos: $MODULOS_CONTRATADOS"
echo "=================================================="

# Configurações
DB_HOST="postgresql.kryonix.com.br"
DB_MASTER="kryonix_core"
DB_CLIENTE="kryonix_cliente_${CLIENTE_ID}"
DB_USER="postgres"
DB_PASSWORD="${POSTGRES_PASSWORD:-kryonix_secure_2025}"

# Log início do processo
echo "📝 Registrando início do processo..."
psql -h $DB_HOST -U $DB_USER -d $DB_MASTER -c "
INSERT INTO tenant_management.logs_auto_creation (cliente_id, acao, status, detalhes)
VALUES ('$CLIENTE_ID', 'inicio_processo', 'em_progresso', '{\"timestamp\": \"$(date -Iseconds)\"}');"

# 1. CRIAR DATABASE DO CLIENTE
echo "📦 Criando database: $DB_CLIENTE"
psql -h $DB_HOST -U $DB_USER -d postgres -c "CREATE DATABASE $DB_CLIENTE;" || {
    echo "❌ Erro ao criar database"
    exit 1
}

# Log criação database
psql -h $DB_HOST -U $DB_USER -d $DB_MASTER -c "
INSERT INTO tenant_management.logs_auto_creation (cliente_id, acao, status, detalhes)
VALUES ('$CLIENTE_ID', 'create_database', 'sucesso', '{\"database\": \"$DB_CLIENTE\"}');"

# 2. APLICAR SCHEMAS MODULARES
echo "🏗️ Criando schemas modulares..."

# Converter módulos em array
IFS=',' read -ra MODULOS_ARRAY <<< "$MODULOS_CONTRATADOS"

for modulo in "${MODULOS_ARRAY[@]}"; do
    echo "📂 Aplicando schema: $modulo"
    
    # Aplicar schema específico do módulo
    if [ -f "/opt/kryonix/sql/schemas/${modulo}_schema.sql" ]; then
        psql -h $DB_HOST -U $DB_USER -d $DB_CLIENTE -f "/opt/kryonix/sql/schemas/${modulo}_schema.sql"
        
        # Log sucesso
        psql -h $DB_HOST -U $DB_USER -d $DB_MASTER -c "
        INSERT INTO tenant_management.logs_auto_creation (cliente_id, acao, status, detalhes)
        VALUES ('$CLIENTE_ID', 'create_schema_$modulo', 'sucesso', '{\"modulo\": \"$modulo\"}');"
    else
        echo "⚠️ Schema $modulo não encontrado"
    fi
done

# 3. CONFIGURAR USUÁRIO ESPECÍFICO DO CLIENTE
echo "👤 Criando usuário específico do cliente..."
CLIENT_USER="cliente_${CLIENTE_ID}_user"
CLIENT_PASS=$(openssl rand -base64 32)

psql -h $DB_HOST -U $DB_USER -d postgres -c "
CREATE USER $CLIENT_USER WITH PASSWORD '$CLIENT_PASS';
GRANT CONNECT ON DATABASE $DB_CLIENTE TO $CLIENT_USER;
"

# Conceder permissões nos schemas criados
for modulo in "${MODULOS_ARRAY[@]}"; do
    psql -h $DB_HOST -U $DB_USER -d $DB_CLIENTE -c "
    GRANT USAGE ON SCHEMA $modulo TO $CLIENT_USER;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA $modulo TO $CLIENT_USER;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA $modulo TO $CLIENT_USER;
    "
done

# 4. REGISTRAR CLIENTE NO MASTER
echo "📋 Registrando cliente no banco master..."
API_KEY="sk_${CLIENTE_ID}_$(openssl rand -hex 16)"

psql -h $DB_HOST -U $DB_USER -d $DB_MASTER -c "
INSERT INTO tenant_management.clientes (
    id, nome, database_name, subdomain, api_key, modulos_contratados
) VALUES (
    '$CLIENTE_ID',
    '$CLIENTE_NOME', 
    '$DB_CLIENTE',
    '$CLIENTE_ID',
    '$API_KEY',
    '[$(echo "$MODULOS_CONTRATADOS" | sed 's/,/","/g' | sed 's/^/"/; s/$/"/')]'
);"

# 5. CONFIGURAR MONITORAMENTO
echo "📊 Configurando monitoramento..."
cat > "/opt/kryonix/monitoring/configs/cliente_${CLIENTE_ID}.yml" <<EOF
cliente_id: $CLIENTE_ID
database: $DB_CLIENTE
user: $CLIENT_USER
schemas: [$(echo "$MODULOS_CONTRATADOS" | sed 's/,/, /g')]
alertas:
  - connections_max: 50
  - query_time_max: 10s
  - storage_usage_max: 80%
EOF

# 6. CONFIGURAR SDK
echo "🔗 Configurando SDK..."
cat > "/opt/kryonix/sdk-configs/${CLIENTE_ID}.env" <<EOF
CLIENTE_ID=$CLIENTE_ID
API_KEY=$API_KEY
DB_HOST=$DB_HOST
DB_NAME=$DB_CLIENTE
DB_USER=$CLIENT_USER
DB_PASSWORD=$CLIENT_PASS
MODULOS_ATIVADOS=$MODULOS_CONTRATADOS
EOF

# 7. FINALIZAR
TEMPO_TOTAL=$SECONDS
echo "✅ Cliente criado com sucesso!"
echo "⏱️ Tempo total: ${TEMPO_TOTAL} segundos"
echo "🔑 API Key: $API_KEY"
echo "🌐 Subdomínio: https://${CLIENTE_ID}.kryonix.com.br"
echo "📊 Database: $DB_CLIENTE"

# Log finalização
psql -h $DB_HOST -U $DB_USER -d $DB_MASTER -c "
INSERT INTO tenant_management.logs_auto_creation (cliente_id, acao, status, detalhes, tempo_execucao_segundos)
VALUES (
    '$CLIENTE_ID', 
    'processo_completo', 
    'sucesso', 
    '{\"api_key\": \"$API_KEY\", \"subdomain\": \"$CLIENTE_ID\"}',
    $TEMPO_TOTAL
);"

echo "=================================================="
```

## 📊 **SCHEMAS MODULARES DETALHADOS**

### **🏠 MÓDULO 1: CRM**
```sql
-- /opt/kryonix/sql/schemas/crm_schema.sql
CREATE SCHEMA IF NOT EXISTS crm;

-- Leads (prospects)
CREATE TABLE crm.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dados pessoais
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    empresa VARCHAR(255),
    cargo VARCHAR(100),
    
    -- Origem
    fonte VARCHAR(100), -- whatsapp, site, indicacao, etc
    campanha VARCHAR(100),
    dispositivo_origem VARCHAR(20) DEFAULT 'mobile', -- mobile, desktop, tablet
    
    -- Qualificação
    score INTEGER DEFAULT 0, -- 0-100
    status VARCHAR(50) DEFAULT 'novo', -- novo, qualificado, oportunidade, cliente, perdido
    interesse TEXT,
    necessidade TEXT,
    orcamento DECIMAL(10,2),
    
    -- Mobile-first data
    prefere_whatsapp BOOLEAN DEFAULT true,
    melhor_horario_contato VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    -- Responsável
    responsavel_id UUID,
    data_ultimo_contato TIMESTAMP,
    proximo_follow_up TIMESTAMP,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Oportunidades (negócios em andamento)
CREATE TABLE crm.oportunidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES crm.leads(id),
    
    -- Dados do negócio
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    valor DECIMAL(12,2) NOT NULL,
    moeda VARCHAR(3) DEFAULT 'BRL',
    
    -- Pipeline
    estagio VARCHAR(100) DEFAULT 'qualificacao', -- qualificacao, proposta, negociacao, fechamento
    probabilidade INTEGER DEFAULT 50, -- 0-100%
    data_fechamento_prevista DATE,
    
    -- Mobile tracking
    contatos_via_mobile INTEGER DEFAULT 0,
    reunioes_virtuais INTEGER DEFAULT 0,
    documentos_enviados_mobile INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'ativa', -- ativa, ganha, perdida, pausada
    motivo_perda TEXT,
    concorrente VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Atividades/Interações
CREATE TABLE crm.atividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relacionamento
    lead_id UUID REFERENCES crm.leads(id),
    oportunidade_id UUID REFERENCES crm.oportunidades(id),
    
    -- Atividade
    tipo VARCHAR(50) NOT NULL, -- chamada, email, whatsapp, reuniao, proposta
    assunto VARCHAR(255),
    descricao TEXT,
    
    -- Mobile context
    feita_via_mobile BOOLEAN DEFAULT true,
    localizacao_gps POINT,
    dispositivo_usado VARCHAR(50),
    
    -- Timing
    data_atividade TIMESTAMP DEFAULT NOW(),
    duracao_minutos INTEGER,
    
    -- Resultado
    resultado VARCHAR(100), -- positivo, negativo, neutro, reagendar
    proxima_acao TEXT,
    data_proxima_acao TIMESTAMP,
    
    -- Responsável
    responsavel_id UUID,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance mobile
CREATE INDEX idx_leads_mobile ON crm.leads(dispositivo_origem, created_at DESC);
CREATE INDEX idx_leads_whatsapp ON crm.leads(prefere_whatsapp, telefone);
CREATE INDEX idx_oportunidades_valor ON crm.oportunidades(valor DESC, status);
CREATE INDEX idx_atividades_mobile ON crm.atividades(feita_via_mobile, data_atividade DESC);
```

### **💬 MÓDULO 2: WHATSAPP**
```sql
-- /opt/kryonix/sql/schemas/whatsapp_schema.sql
CREATE SCHEMA IF NOT EXISTS whatsapp;

-- Configuração da instância Evolution API
CREATE TABLE whatsapp.configuracao_instancia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_instancia VARCHAR(100) UNIQUE NOT NULL, -- cliente_siqueiracampos
    
    -- Configurações técnicas
    numero_whatsapp VARCHAR(20) NOT NULL,
    qr_code TEXT,
    status_conexao VARCHAR(50) DEFAULT 'desconectado', -- conectado, desconectado, erro
    
    -- Configurações Evolution API
    evolution_api_url TEXT,
    evolution_api_key VARCHAR(255),
    webhook_url TEXT,
    
    -- Mobile-first config
    auto_reply_mobile BOOLEAN DEFAULT true,
    horario_atendimento_inicio TIME DEFAULT '08:00',
    horario_atendimento_fim TIME DEFAULT '18:00',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Contatos WhatsApp
CREATE TABLE whatsapp.contatos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    numero VARCHAR(20) NOT NULL,
    nome VARCHAR(255),
    nome_exibicao VARCHAR(255),
    
    -- Avatar/Foto
    foto_perfil_url TEXT,
    
    -- Dados adicionais
    sobre TEXT, -- status/sobre do WhatsApp
    eh_empresa BOOLEAN DEFAULT false,
    eh_verificado BOOLEAN DEFAULT false,
    
    -- Mobile behavior
    usa_whatsapp_business BOOLEAN DEFAULT false,
    horario_ativo_inicio TIME,
    horario_ativo_fim TIME,
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    -- Relacionamento CRM
    lead_id UUID, -- Referência para crm.leads se existir
    
    -- Configurações de contato
    bloqueado BOOLEAN DEFAULT false,
    permitir_auto_reply BOOLEAN DEFAULT true,
    tags JSONB DEFAULT '[]',
    
    -- Auditoria
    first_seen TIMESTAMP DEFAULT NOW(),
    last_seen TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_numero UNIQUE(numero)
);

-- Conversas/Chats
CREATE TABLE whatsapp.conversas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contato_id UUID REFERENCES whatsapp.contatos(id),
    
    -- Chat info
    chat_id VARCHAR(255) NOT NULL, -- ID do chat no WhatsApp
    tipo_chat VARCHAR(20) DEFAULT 'individual', -- individual, grupo
    nome_grupo VARCHAR(255), -- Se for grupo
    
    -- Status
    arquivada BOOLEAN DEFAULT false,
    silenciada BOOLEAN DEFAULT false,
    fixada BOOLEAN DEFAULT false,
    
    -- Última interação
    ultima_mensagem_id UUID,
    ultima_mensagem_timestamp TIMESTAMP,
    mensagens_nao_lidas INTEGER DEFAULT 0,
    
    -- Mobile context
    dispositivo_predominante VARCHAR(20) DEFAULT 'mobile',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_chat_id UNIQUE(chat_id)
);

-- Mensagens
CREATE TABLE whatsapp.mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversa_id UUID REFERENCES whatsapp.conversas(id),
    
    -- Identificação WhatsApp
    whatsapp_message_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Conteúdo
    tipo VARCHAR(20) NOT NULL, -- text, image, audio, video, document, location, contact
    conteudo TEXT, -- Texto da mensagem
    midia_url TEXT, -- URL se for mídia
    midia_filename VARCHAR(255),
    midia_mimetype VARCHAR(100),
    midia_size_bytes INTEGER,
    
    -- Mobile-specific
    midia_comprimida BOOLEAN DEFAULT false, -- Se foi comprimida para mobile
    transcricao_audio TEXT, -- Transcrição de áudio para acessibilidade
    
    -- Metadados
    timestamp_whatsapp TIMESTAMP NOT NULL,
    remetente_numero VARCHAR(20),
    eh_de_mim BOOLEAN DEFAULT false, -- Se foi enviada por nós
    
    -- Status de entrega
    status_entrega VARCHAR(20) DEFAULT 'enviando', -- enviando, entregue, lida, erro
    timestamp_entrega TIMESTAMP,
    timestamp_leitura TIMESTAMP,
    
    -- Contexto
    respondendo_a_id UUID, -- Se é resposta a outra mensagem
    mencionados JSONB DEFAULT '[]', -- Array de números mencionados
    
    -- Automação
    eh_automatica BOOLEAN DEFAULT false,
    campanha_id UUID, -- Se faz parte de alguma campanha
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (respondendo_a_id) REFERENCES whatsapp.mensagens(id)
);

-- Campanhas/Broadcasts
CREATE TABLE whatsapp.campanhas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Campanha
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Conteúdo
    tipo_mensagem VARCHAR(20) NOT NULL, -- text, image, template
    conteudo TEXT NOT NULL,
    midia_url TEXT,
    
    -- Segmentação
    contatos_alvo JSONB, -- Array de números ou critérios
    tags_alvo JSONB DEFAULT '[]',
    
    -- Mobile optimization
    otimizada_mobile BOOLEAN DEFAULT true,
    horario_envio_preferido TIME DEFAULT '14:00',
    
    -- Agendamento
    agendada_para TIMESTAMP,
    fuso_horario VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    -- Status
    status VARCHAR(50) DEFAULT 'rascunho', -- rascunho, agendada, enviando, concluida, erro
    total_contatos INTEGER DEFAULT 0,
    enviadas INTEGER DEFAULT 0,
    entregues INTEGER DEFAULT 0,
    lidas INTEGER DEFAULT 0,
    respondidas INTEGER DEFAULT 0,
    
    -- Timing
    iniciada_em TIMESTAMP,
    concluida_em TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID
);

-- Templates de mensagem
CREATE TABLE whatsapp.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(100), -- boas_vindas, follow_up, promocao, etc
    
    -- Conteúdo
    assunto VARCHAR(255),
    corpo TEXT NOT NULL,
    
    -- Variáveis (ex: {{nome}}, {{empresa}})
    variaveis JSONB DEFAULT '[]',
    
    -- Mobile-friendly
    versao_curta TEXT, -- Versão reduzida para mobile
    inclui_emoji BOOLEAN DEFAULT true,
    
    -- Configurações
    ativo BOOLEAN DEFAULT true,
    uso_automatico BOOLEAN DEFAULT false,
    
    -- Métricas
    vezes_usado INTEGER DEFAULT 0,
    taxa_resposta DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_mensagens_conversa_timestamp ON whatsapp.mensagens(conversa_id, timestamp_whatsapp DESC);
CREATE INDEX idx_mensagens_tipo_mobile ON whatsapp.mensagens(tipo, midia_comprimida);
CREATE INDEX idx_contatos_numero ON whatsapp.contatos(numero);
CREATE INDEX idx_campanhas_status ON whatsapp.campanhas(status, agendada_para);
```

### **📅 MÓDULO 3: AGENDAMENTO**
```sql
-- /opt/kryonix/sql/schemas/agendamento_schema.sql
CREATE SCHEMA IF NOT EXISTS agendamento;

-- Profissionais/Prestadores
CREATE TABLE agendamento.profissionais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dados pessoais
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    foto_perfil_url TEXT,
    
    -- Profissional
    especialidade VARCHAR(255),
    descricao TEXT,
    experiencia_anos INTEGER,
    
    -- Configurações mobile
    aceita_agendamento_mobile BOOLEAN DEFAULT true,
    confirma_por_whatsapp BOOLEAN DEFAULT true,
    
    -- Horários padrão
    horario_inicio TIME DEFAULT '08:00',
    horario_fim TIME DEFAULT '18:00',
    dias_trabalho JSONB DEFAULT '["1","2","3","4","5"]', -- 1=segunda, 7=domingo
    
    -- Configurações
    antecedencia_minima_horas INTEGER DEFAULT 2,
    intervalo_entre_consultas_minutos INTEGER DEFAULT 30,
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    aceita_novos_agendamentos BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Serviços oferecidos
CREATE TABLE agendamento.servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profissional_id UUID REFERENCES agendamento.profissionais(id),
    
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    descricao_curta VARCHAR(500), -- Para mobile
    
    -- Pricing
    preco DECIMAL(10,2),
    duracao_minutos INTEGER NOT NULL,
    
    -- Mobile-friendly
    popular BOOLEAN DEFAULT false,
    destaque_mobile BOOLEAN DEFAULT false,
    icone_emoji VARCHAR(10), -- Emoji para mobile
    
    -- Configurações
    permite_online BOOLEAN DEFAULT false,
    requer_preparo TEXT, -- Ex: "jejum de 8h"
    
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agendamentos
CREATE TABLE agendamento.consultas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relacionamentos
    profissional_id UUID REFERENCES agendamento.profissionais(id),
    servico_id UUID REFERENCES agendamento.servicos(id),
    
    -- Cliente
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_email VARCHAR(255),
    cliente_telefone VARCHAR(20) NOT NULL,
    cliente_lead_id UUID, -- Relaciona com CRM se existir
    
    -- Agendamento
    data_consulta DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    
    -- Mobile context
    agendado_via_mobile BOOLEAN DEFAULT true,
    dispositivo_agendamento VARCHAR(50),
    localizacao_cliente POINT, -- GPS se permitido
    
    -- Tipo
    tipo VARCHAR(20) DEFAULT 'presencial', -- presencial, online, domicilio
    link_online TEXT, -- Para consultas online
    endereco TEXT, -- Para atendimento domiciliar
    
    -- Status
    status VARCHAR(50) DEFAULT 'agendado', -- agendado, confirmado, realizado, cancelado, faltou
    confirmado BOOLEAN DEFAULT false,
    data_confirmacao TIMESTAMP,
    
    -- Comunicação
    lembrete_enviado BOOLEAN DEFAULT false,
    whatsapp_enviado BOOLEAN DEFAULT false,
    
    -- Observações
    observacoes TEXT,
    observacoes_internas TEXT,
    
    -- Financeiro
    valor DECIMAL(10,2),
    pago BOOLEAN DEFAULT false,
    forma_pagamento VARCHAR(50),
    
    -- Avaliação
    avaliacao_cliente INTEGER, -- 1-5 estrelas
    comentario_avaliacao TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_profissional_datetime UNIQUE(profissional_id, data_consulta, hora_inicio)
);

-- Bloqueios de agenda
CREATE TABLE agendamento.bloqueios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profissional_id UUID REFERENCES agendamento.profissionais(id),
    
    -- Período
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    hora_inicio TIME,
    hora_fim TIME,
    
    -- Detalhes
    motivo VARCHAR(255),
    tipo VARCHAR(50) DEFAULT 'bloqueio', -- bloqueio, ferias, feriado, capacitacao
    
    -- Mobile notification
    notificar_clientes BOOLEAN DEFAULT true,
    mensagem_clientes TEXT,
    
    recorrente BOOLEAN DEFAULT false,
    recorrencia_config JSONB, -- Para bloqueios recorrentes
    
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID
);

-- Lembretes e notificações
CREATE TABLE agendamento.lembretes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consulta_id UUID REFERENCES agendamento.consultas(id),
    
    -- Tipo de lembrete
    tipo VARCHAR(50) NOT NULL, -- whatsapp, sms, email, push
    
    -- Agendamento do lembrete
    enviar_quando INTERVAL NOT NULL, -- Ex: '1 day', '2 hours'
    data_envio_calculada TIMESTAMP NOT NULL,
    
    -- Status
    enviado BOOLEAN DEFAULT false,
    data_envio TIMESTAMP,
    sucesso BOOLEAN,
    erro_detalhes TEXT,
    
    -- Mobile optimization
    otimizado_mobile BOOLEAN DEFAULT true,
    template_mobile TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Configurações de disponibilidade personalizada
CREATE TABLE agendamento.disponibilidade_customizada (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profissional_id UUID REFERENCES agendamento.profissionais(id),
    
    -- Data específica
    data DATE NOT NULL,
    
    -- Horários customizados
    horario_inicio TIME,
    horario_fim TIME,
    disponivel BOOLEAN DEFAULT true,
    
    -- Motivo se indisponível
    motivo VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_profissional_data UNIQUE(profissional_id, data)
);

-- Índices para performance mobile
CREATE INDEX idx_consultas_data_hora ON agendamento.consultas(data_consulta, hora_inicio);
CREATE INDEX idx_consultas_telefone ON agendamento.consultas(cliente_telefone);
CREATE INDEX idx_consultas_mobile ON agendamento.consultas(agendado_via_mobile, data_consulta DESC);
CREATE INDEX idx_lembretes_envio ON agendamento.lembretes(data_envio_calculada, enviado);
CREATE INDEX idx_profissionais_ativo ON agendamento.profissionais(ativo, aceita_novos_agendamentos);
```

### **💰 MÓDULO 4: FINANCEIRO**
```sql
-- /opt/kryonix/sql/schemas/financeiro_schema.sql
CREATE SCHEMA IF NOT EXISTS financeiro;

-- Planos de cobrança
CREATE TABLE financeiro.planos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Pricing
    valor_mensal DECIMAL(10,2),
    valor_anual DECIMAL(10,2),
    moeda VARCHAR(3) DEFAULT 'BRL',
    
    -- Recursos incluídos
    usuarios_incluidos INTEGER DEFAULT 1,
    storage_gb INTEGER DEFAULT 5,
    whatsapp_mensagens_mes INTEGER DEFAULT 1000,
    
    -- Mobile features
    app_mobile_incluido BOOLEAN DEFAULT true,
    notificacoes_push_incluidas BOOLEAN DEFAULT true,
    
    -- Configurações
    trial_dias INTEGER DEFAULT 7,
    ativo BOOLEAN DEFAULT true,
    publico BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Assinaturas dos clientes (se for B2B)
CREATE TABLE financeiro.assinaturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plano_id UUID REFERENCES financeiro.planos(id),
    
    -- Cliente
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_email VARCHAR(255) NOT NULL,
    cliente_documento VARCHAR(20), -- CPF/CNPJ
    cliente_telefone VARCHAR(20),
    
    -- Assinatura
    data_inicio DATE NOT NULL,
    data_fim DATE,
    status VARCHAR(50) DEFAULT 'ativa', -- ativa, cancelada, suspensa, trial
    
    -- Cobrança
    dia_vencimento INTEGER DEFAULT 1, -- Dia do mês para cobrança
    forma_pagamento VARCHAR(50), -- cartao, boleto, pix
    
    -- Mobile preferences
    prefere_cobranca_whatsapp BOOLEAN DEFAULT true,
    aceita_push_cobranca BOOLEAN DEFAULT true,
    
    -- Trial
    em_trial BOOLEAN DEFAULT false,
    trial_termina_em DATE,
    
    -- Customizações
    desconto_percentual DECIMAL(5,2) DEFAULT 0,
    valor_customizado DECIMAL(10,2),
    observacoes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Faturas/Cobranças
CREATE TABLE financeiro.faturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assinatura_id UUID REFERENCES financeiro.assinaturas(id),
    
    -- Identificação
    numero_fatura VARCHAR(50) UNIQUE NOT NULL,
    
    -- Período
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    
    -- Valores
    valor_bruto DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    valor_liquido DECIMAL(10,2) NOT NULL,
    impostos DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(10,2) NOT NULL,
    
    -- Cobrança
    data_vencimento DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente', -- pendente, paga, vencida, cancelada
    
    -- Mobile payment
    qr_code_pix TEXT,
    link_pagamento_mobile TEXT,
    
    -- Pagamento
    data_pagamento TIMESTAMP,
    forma_pagamento VARCHAR(50),
    comprovante_url TEXT,
    
    -- Comunicação
    enviada_whatsapp BOOLEAN DEFAULT false,
    enviada_email BOOLEAN DEFAULT false,
    lembretes_enviados INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transações/Movimentações
CREATE TABLE financeiro.transacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fatura_id UUID REFERENCES financeiro.faturas(id),
    
    -- Transação
    tipo VARCHAR(50) NOT NULL, -- receita, despesa, estorno
    categoria VARCHAR(100),
    descricao TEXT,
    
    -- Valores
    valor DECIMAL(12,2) NOT NULL,
    moeda VARCHAR(3) DEFAULT 'BRL',
    
    -- Payment gateway
    gateway VARCHAR(50), -- stripe, mercadopago, pagseguro
    transaction_id VARCHAR(255), -- ID no gateway
    
    -- Mobile context
    pago_via_mobile BOOLEAN DEFAULT false,
    metodo_pagamento VARCHAR(50), -- cartao, pix, boleto, dinheiro
    
    -- Dados do pagamento
    data_transacao TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'processando', -- processando, aprovada, rejeitada, estornada
    
    -- Detalhes gateway
    gateway_fee DECIMAL(10,2) DEFAULT 0,
    gateway_response JSONB,
    
    -- Conciliação
    conciliada BOOLEAN DEFAULT false,
    data_conciliacao TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Relatórios financeiros automáticos
CREATE TABLE financeiro.relatorios_mensais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Período
    ano INTEGER NOT NULL,
    mes INTEGER NOT NULL, -- 1-12
    
    -- Receitas
    receita_total DECIMAL(12,2) DEFAULT 0,
    receita_recorrente DECIMAL(12,2) DEFAULT 0,
    receita_nova DECIMAL(12,2) DEFAULT 0,
    
    -- Métricas
    clientes_ativos INTEGER DEFAULT 0,
    clientes_novos INTEGER DEFAULT 0,
    clientes_cancelados INTEGER DEFAULT 0,
    churn_rate DECIMAL(5,2) DEFAULT 0, -- Taxa de cancelamento
    
    -- Mobile metrics
    pagamentos_mobile INTEGER DEFAULT 0,
    percentual_pagamentos_mobile DECIMAL(5,2) DEFAULT 0,
    
    -- MRR (Monthly Recurring Revenue)
    mrr DECIMAL(12,2) DEFAULT 0,
    mrr_crescimento DECIMAL(5,2) DEFAULT 0,
    
    -- Inadimplência
    faturas_vencidas INTEGER DEFAULT 0,
    valor_inadimplencia DECIMAL(12,2) DEFAULT 0,
    
    gerado_em TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_ano_mes UNIQUE(ano, mes)
);

-- Configurações de cobrança
CREATE TABLE financeiro.configuracoes_cobranca (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Empresa
    nome_empresa VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    endereco TEXT,
    
    -- Configurações de cobrança
    dias_vencimento INTEGER DEFAULT 7,
    juros_mes DECIMAL(5,2) DEFAULT 2.0,
    multa_atraso DECIMAL(5,2) DEFAULT 10.0,
    
    -- Mobile settings
    whatsapp_cobranca BOOLEAN DEFAULT true,
    template_whatsapp_cobranca TEXT,
    push_notification_cobranca BOOLEAN DEFAULT true,
    
    -- Templates de mensagem
    template_fatura_criada TEXT,
    template_fatura_vencendo TEXT,
    template_fatura_vencida TEXT,
    template_pagamento_confirmado TEXT,
    
    -- Gateway padrão
    gateway_principal VARCHAR(50) DEFAULT 'mercadopago',
    gateway_config JSONB DEFAULT '{}',
    
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_faturas_vencimento ON financeiro.faturas(data_vencimento, status);
CREATE INDEX idx_faturas_assinatura ON financeiro.faturas(assinatura_id, data_vencimento DESC);
CREATE INDEX idx_transacoes_data ON financeiro.transacoes(data_transacao DESC);
CREATE INDEX idx_transacoes_mobile ON financeiro.transacoes(pago_via_mobile, data_transacao DESC);
CREATE INDEX idx_assinaturas_status ON financeiro.assinaturas(status, data_fim);
```

## 📱 **CONFIGURAÇÕES MOBILE-FIRST**

### **🎯 OTIMIZAÇÕES POSTGRESQL PARA 80% MOBILE**
```sql
-- /opt/kryonix/sql/optimizations/mobile_optimizations.sql

-- 1. CONFIGURAÇÕES ESPECÍFICAS PARA MOBILE
-- Timeout menor para conexões mobile
ALTER SYSTEM SET statement_timeout = '30s'; -- Mobile não aguarda muito
ALTER SYSTEM SET lock_timeout = '10s';
ALTER SYSTEM SET idle_in_transaction_session_timeout = '60s';

-- 2. CACHE OTIMIZADO PARA QUERIES MOBILE FREQUENTES
ALTER SYSTEM SET shared_buffers = '512MB'; -- Cache maior
ALTER SYSTEM SET effective_cache_size = '2GB';
ALTER SYSTEM SET work_mem = '8MB'; -- Memory para ordenação
ALTER SYSTEM SET maintenance_work_mem = '128MB';

-- 3. CONFIGURAÇÕES DE CHECKPOINT MOBILE
ALTER SYSTEM SET checkpoint_timeout = '15min'; -- Checkpoints frequentes
ALTER SYSTEM SET checkpoint_warning = '30s';

SELECT pg_reload_conf(); -- Aplicar configurações

-- 4. ÍNDICES OTIMIZADOS PARA MOBILE
-- Índices parciais para dados recentes (mobile acessa dados recentes)
CREATE INDEX IF NOT EXISTS idx_mobile_recent_data 
ON audit.activity_logs (created_at DESC) 
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Índices para queries mobile comuns
CREATE INDEX IF NOT EXISTS idx_mobile_user_sessions 
ON analytics.user_sessions (user_id, session_start DESC) 
WHERE session_start >= NOW() - INTERVAL '7 days';

-- 5. PARTICIONAMENTO PARA PERFORMANCE MOBILE
-- Particionar por data para acesso rápido mobile
CREATE TABLE IF NOT EXISTS mobile_sessions_current PARTITION OF analytics.user_sessions
FOR VALUES FROM (CURRENT_DATE) TO (CURRENT_DATE + INTERVAL '1 month');

-- 6. VIEWS OTIMIZADAS PARA MOBILE
CREATE OR REPLACE VIEW mobile_dashboard_data AS
SELECT 
    u.id as user_id,
    u.first_name,
    COUNT(s.id) as sessions_today,
    MAX(s.session_start) as last_access,
    AVG(s.actions_count) as avg_actions
FROM auth.users u
LEFT JOIN analytics.user_sessions s ON u.id = s.user_id 
    AND s.session_start >= CURRENT_DATE
WHERE u.is_active = true
GROUP BY u.id, u.first_name;

-- 7. STORED PROCEDURES PARA QUERIES MOBILE COMUNS
CREATE OR REPLACE FUNCTION get_mobile_user_summary(user_uuid UUID)
RETURNS TABLE(
    user_name TEXT,
    last_session TIMESTAMP,
    total_actions INTEGER,
    mobile_usage_percent DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.first_name || ' ' || u.last_name as user_name,
        MAX(s.session_start) as last_session,
        SUM(s.actions_count)::INTEGER as total_actions,
        ROUND(
            (COUNT(*) FILTER (WHERE s.user_agent ILIKE '%mobile%') * 100.0 / COUNT(*))::DECIMAL, 
            2
        ) as mobile_usage_percent
    FROM auth.users u
    LEFT JOIN analytics.user_sessions s ON u.id = s.user_id
    WHERE u.id = user_uuid
      AND s.session_start >= NOW() - INTERVAL '30 days'
    GROUP BY u.id, u.first_name, u.last_name;
END;
$$ LANGUAGE plpgsql;

-- 8. TRIGGERS PARA LIMPEZA AUTOMÁTICA (PERFORMANCE MOBILE)
CREATE OR REPLACE FUNCTION clean_old_mobile_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Limpar sessões antigas para manter performance
    DELETE FROM analytics.user_sessions 
    WHERE session_start < NOW() - INTERVAL '90 days';
    
    -- Limpar logs antigos
    DELETE FROM audit.activity_logs 
    WHERE created_at < NOW() - INTERVAL '180 days';
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger diário para limpeza
CREATE TRIGGER trigger_clean_old_data
    AFTER INSERT ON analytics.user_sessions
    FOR EACH STATEMENT
    WHEN (EXTRACT(hour FROM NOW()) = 3) -- Executar às 3h da manhã
    EXECUTE FUNCTION clean_old_mobile_data();
```

## 🔗 **INTEGRAÇÃO SDK @kryonix/sdk**

### **💻 SDK TYPESCRIPT MULTI-TENANT**
```typescript
// /opt/kryonix/sdk/database-manager.ts
import { Pool, PoolClient } from 'pg';

export class DatabaseManager {
    private pools: Map<string, Pool> = new Map();
    
    constructor() {
        this.initializePools();
    }
    
    private async initializePools() {
        // Pool para banco master
        const masterPool = new Pool({
            host: process.env.DB_HOST,
            database: 'kryonix_core',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        
        this.pools.set('master', masterPool);
    }
    
    async getClientPool(clienteId: string): Promise<Pool> {
        if (this.pools.has(clienteId)) {
            return this.pools.get(clienteId)!;
        }
        
        // Buscar configuração do cliente no banco master
        const masterPool = this.pools.get('master')!;
        const result = await masterPool.query(
            'SELECT database_name FROM tenant_management.clientes WHERE id = $1',
            [clienteId]
        );
        
        if (result.rows.length === 0) {
            throw new Error(`Cliente ${clienteId} não encontrado`);
        }
        
        const databaseName = result.rows[0].database_name;
        
        // Criar pool específico do cliente
        const clientPool = new Pool({
            host: process.env.DB_HOST,
            database: databaseName,
            user: `cliente_${clienteId}_user`,
            password: process.env[`DB_PASSWORD_${clienteId.toUpperCase()}`],
            max: 10, // Menor pool por cliente
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
            // Otimizações mobile
            application_name: `kryonix_client_${clienteId}`,
            statement_timeout: 30000, // 30s timeout para mobile
        });
        
        this.pools.set(clienteId, clientPool);
        return clientPool;
    }
    
    // Método específico para queries mobile-optimized
    async executeMobileQuery(
        clienteId: string, 
        query: string, 
        params: any[] = []
    ): Promise<any> {
        const pool = await this.getClientPool(clienteId);
        
        // Adicionar hints de performance para mobile
        const optimizedQuery = `
            /*+ IndexHint(mobile_optimized) */
            SET statement_timeout = '15s';
            ${query}
        `;
        
        const start = Date.now();
        const result = await pool.query(optimizedQuery, params);
        const duration = Date.now() - start;
        
        // Log performance para otimização
        if (duration > 5000) { // Queries > 5s
            console.warn(`Slow mobile query for ${clienteId}: ${duration}ms`);
        }
        
        return result;
    }
    
    async closeAllPools(): Promise<void> {
        for (const [clienteId, pool] of this.pools) {
            await pool.end();
        }
        this.pools.clear();
    }
}

// SDK Principal Multi-tenant
export class KryonixSDK {
    private dbManager: DatabaseManager;
    private clienteId: string;
    
    constructor(config: { apiKey: string }) {
        this.clienteId = this.extractClienteId(config.apiKey);
        this.dbManager = new DatabaseManager();
    }
    
    private extractClienteId(apiKey: string): string {
        // Extrair cliente_id do formato: sk_siqueiracampos_abc123
        const parts = apiKey.split('_');
        if (parts.length < 3) {
            throw new Error('Invalid API key format');
        }
        return parts[1];
    }
    
    async query(sql: string, params: any[] = []): Promise<any> {
        return this.dbManager.executeMobileQuery(this.clienteId, sql, params);
    }
    
    // Módulos específicos
    get crm() {
        return new CRMModule(this.dbManager, this.clienteId);
    }
    
    get whatsapp() {
        return new WhatsAppModule(this.dbManager, this.clienteId);
    }
    
    get agendamento() {
        return new AgendamentoModule(this.dbManager, this.clienteId);
    }
    
    // ... outros módulos
}

// Exemplo de módulo CRM
class CRMModule {
    constructor(
        private dbManager: DatabaseManager,
        private clienteId: string
    ) {}
    
    async criarLead(dados: any) {
        const sql = `
            INSERT INTO crm.leads (nome, email, telefone, dispositivo_origem)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const result = await this.dbManager.executeMobileQuery(
            this.clienteId,
            sql,
            [dados.nome, dados.email, dados.telefone, dados.dispositivo || 'mobile']
        );
        
        return result.rows[0];
    }
    
    async listarLeads(filtros: any = {}) {
        let sql = `
            SELECT id, nome, email, telefone, score, status, created_at
            FROM crm.leads 
            WHERE 1=1
        `;
        
        const params: any[] = [];
        let paramCount = 0;
        
        if (filtros.status) {
            sql += ` AND status = $${++paramCount}`;
            params.push(filtros.status);
        }
        
        if (filtros.apenasMobile) {
            sql += ` AND dispositivo_origem = 'mobile'`;
        }
        
        sql += ` ORDER BY created_at DESC LIMIT 50`; // Limite para mobile
        
        const result = await this.dbManager.executeMobileQuery(
            this.clienteId,
            sql,
            params
        );
        
        return result.rows;
    }
}
```
