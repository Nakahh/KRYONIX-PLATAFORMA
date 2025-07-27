# 📧 PARTE 17 - EMAIL MARKETING E AUTOMAÇÃO
*Agentes Responsáveis: Email Expert + Marketing Automation + Analytics*

## 🎯 **OBJETIVO**
Implementar sistema completo de email marketing utilizando Mautic (`mautic.kryonix.com.br`) integrado com SendGrid para envios, criando campanhas automatizadas, segmentação inteligente e análise de performance.

## 🏗️ **ARQUITETURA EMAIL MARKETING**
```yaml
Email Marketing Stack:
  Platform: Mautic (mautic.kryonix.com.br)
  SMTP: SendGrid (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)
  Templates: Strapi CMS integration
  Analytics: Metabase dashboards
  Automation: N8N workflows
  
Integration Points:
  - Lead capture: Typebot forms
  - CRM sync: PostgreSQL
  - Tracking: Custom events
  - Deliverability: SendGrid analytics
  - Personalization: User data sync
```

## 📊 **MODELO DE DADOS INTEGRADO**
```sql
-- Schema para email marketing
CREATE SCHEMA IF NOT EXISTS email_marketing;

-- Campanhas de email
CREATE TABLE email_marketing.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mautic_id INTEGER UNIQUE, -- ID no Mautic
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    from_name VARCHAR(100) DEFAULT 'KRYONIX',
    from_email VARCHAR(255) DEFAULT 'marketing@kryonix.com.br',
    reply_to VARCHAR(255) DEFAULT 'contato@kryonix.com.br',
    
    -- Conteúdo
    template_id UUID,
    content_html TEXT,
    content_text TEXT,
    
    -- Configurações
    type VARCHAR(50) DEFAULT 'broadcast', -- 'broadcast', 'drip', 'trigger'
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'paused'
    
    -- Agendamento
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    
    -- Segmentação
    segment_criteria JSONB,
    target_audience_count INTEGER DEFAULT 0,
    
    -- Métricas
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    
    -- Auditoria
    company_id UUID REFERENCES auth.companies(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Listas de contatos
CREATE TABLE email_marketing.lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mautic_id INTEGER UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'static', -- 'static', 'dynamic', 'smart'
    
    -- Critérios para listas dinâmicas
    filter_criteria JSONB,
    
    -- Estatísticas
    contact_count INTEGER DEFAULT 0,
    active_count INTEGER DEFAULT 0,
    
    -- Configurações
    is_public BOOLEAN DEFAULT false,
    is_global BOOLEAN DEFAULT false,
    
    company_id UUID REFERENCES auth.companies(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Contatos sincronizados
CREATE TABLE email_marketing.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mautic_id INTEGER UNIQUE,
    
    -- Dados pessoais
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    phone VARCHAR(20),
    
    -- Dados comportamentais
    lead_score INTEGER DEFAULT 0,
    last_activity TIMESTAMP,
    total_emails_sent INTEGER DEFAULT 0,
    total_emails_opened INTEGER DEFAULT 0,
    total_emails_clicked INTEGER DEFAULT 0,
    
    -- Segmentação
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'unsubscribed', 'bounced', 'blocked'
    subscribed_at TIMESTAMP DEFAULT NOW(),
    unsubscribed_at TIMESTAMP,
    
    -- Origem
    source VARCHAR(100), -- 'typebot', 'manual', 'import', 'api'
    source_details JSONB,
    
    -- Relações
    user_id UUID REFERENCES auth.users(id), -- se for usuário registrado
    company_id UUID REFERENCES auth.companies(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Relacionamento lista-contato
CREATE TABLE email_marketing.list_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID REFERENCES email_marketing.lists(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES email_marketing.contacts(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    added_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(list_id, contact_id)
);

-- Templates de email
CREATE TABLE email_marketing.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mautic_id INTEGER,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Conteúdo
    subject_template VARCHAR(255),
    html_content TEXT,
    text_content TEXT,
    
    -- Design
    thumbnail_url VARCHAR(500),
    is_responsive BOOLEAN DEFAULT true,
    
    -- Categorização
    category VARCHAR(100),
    tags JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    
    company_id UUID REFERENCES auth.companies(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Eventos de email (tracking)
CREATE TABLE email_marketing.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES email_marketing.campaigns(id),
    contact_id UUID REFERENCES email_marketing.contacts(id),
    
    event_type VARCHAR(50) NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed'
    event_data JSONB,
    
    -- SendGrid data
    sendgrid_message_id VARCHAR(255),
    sendgrid_event_id VARCHAR(255),
    
    -- Detalhes do evento
    ip_address INET,
    user_agent TEXT,
    url_clicked VARCHAR(500), -- para clicks
    bounce_reason TEXT, -- para bounces
    
    occurred_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_campaigns_company_status ON email_marketing.campaigns(company_id, status);
CREATE INDEX idx_contacts_email ON email_marketing.contacts(email);
CREATE INDEX idx_contacts_company_status ON email_marketing.contacts(company_id, status);
CREATE INDEX idx_events_campaign_type ON email_marketing.events(campaign_id, event_type);
CREATE INDEX idx_events_contact_type ON email_marketing.events(contact_id, event_type);
CREATE INDEX idx_events_occurred_at ON email_marketing.events(occurred_at);
```

## 🔧 **SERVIÇO DE EMAIL MARKETING**
```typescript
// services/email-marketing.service.ts
import { MauticConnector } from './mautic-connector';
import { SendGridService } from './sendgrid.service';

export class EmailMarketingService {
  private mautic: MauticConnector;
  private sendgrid: SendGridService;

  constructor() {
    this.mautic = new MauticConnector({
      baseUrl: 'https://mautic.kryonix.com.br',
      username: 'kryonix',
      password: 'Vitor@123456'
    });
    
    this.sendgrid = new SendGridService({
      apiKey: process.env.SENDGRID_API_KEY
    });
  }

  // ========== GESTÃO DE CONTATOS ==========
  
  async syncContact(contactData: ContactData): Promise<Contact> {
    try {
      // 1. Criar/atualizar no Mautic
      const mauticContact = await this.mautic.createOrUpdateContact({
        email: contactData.email,
        firstname: contactData.firstName,
        lastname: contactData.lastName,
        company: contactData.company,
        phone: contactData.phone,
        tags: contactData.tags || [],
        custom_fields: contactData.customFields || {}
      });

      // 2. Sincronizar com nosso banco
      const contact = await this.db.query(`
        INSERT INTO email_marketing.contacts 
          (mautic_id, email, first_name, last_name, company, phone, tags, custom_fields, source, source_details, company_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (email) 
        DO UPDATE SET
          mautic_id = EXCLUDED.mautic_id,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          tags = EXCLUDED.tags,
          custom_fields = EXCLUDED.custom_fields,
          updated_at = NOW()
        RETURNING *
      `, [
        mauticContact.id,
        contactData.email,
        contactData.firstName,
        contactData.lastName,
        contactData.company,
        contactData.phone,
        JSON.stringify(contactData.tags || []),
        JSON.stringify(contactData.customFields || {}),
        contactData.source || 'api',
        JSON.stringify(contactData.sourceDetails || {}),
        contactData.companyId
      ]);

      return contact.rows[0];
    } catch (error) {
      console.error('Erro ao sincronizar contato:', error);
      throw error;
    }
  }

  async addContactToList(contactId: string, listId: string, addedBy: string): Promise<void> {
    // Buscar IDs no Mautic
    const contact = await this.getContactById(contactId);
    const list = await this.getListById(listId);

    // Adicionar no Mautic
    await this.mautic.addContactToSegment(contact.mautic_id, list.mautic_id);

    // Registrar no nosso banco
    await this.db.query(`
      INSERT INTO email_marketing.list_contacts (list_id, contact_id, added_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (list_id, contact_id) 
      DO UPDATE SET is_active = true, added_at = NOW()
    `, [listId, contactId, addedBy]);
  }

  async segmentContacts(criteria: SegmentationCriteria): Promise<Contact[]> {
    let whereConditions = ['c.status = $1'];
    let params = ['active'];
    let paramCount = 1;

    // Construir query dinâmica baseada nos critérios
    if (criteria.tags && criteria.tags.length > 0) {
      paramCount++;
      whereConditions.push(`c.tags ?| $${paramCount}`);
      params.push(criteria.tags);
    }

    if (criteria.lastActivityDays) {
      paramCount++;
      whereConditions.push(`c.last_activity >= NOW() - INTERVAL '${criteria.lastActivityDays} days'`);
    }

    if (criteria.minLeadScore) {
      paramCount++;
      whereConditions.push(`c.lead_score >= $${paramCount}`);
      params.push(criteria.minLeadScore.toString());
    }

    if (criteria.company) {
      paramCount++;
      whereConditions.push(`c.company ILIKE $${paramCount}`);
      params.push(`%${criteria.company}%`);
    }

    const query = `
      SELECT c.* FROM email_marketing.contacts c
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY c.lead_score DESC, c.last_activity DESC
      LIMIT ${criteria.limit || 1000}
    `;

    const result = await this.db.query(query, params);
    return result.rows;
  }

  // ========== GESTÃO DE CAMPANHAS ==========

  async createCampaign(campaignData: CampaignData): Promise<Campaign> {
    try {
      // 1. Criar template no Mautic se necessário
      let mauticTemplateId = null;
      if (campaignData.templateHtml) {
        const template = await this.mautic.createEmailTemplate({
          name: `Template ${campaignData.name}`,
          content: campaignData.templateHtml
        });
        mauticTemplateId = template.id;
      }

      // 2. Criar email no Mautic
      const mauticEmail = await this.mautic.createEmail({
        name: campaignData.name,
        subject: campaignData.subject,
        fromName: campaignData.fromName || 'KRYONIX',
        fromEmail: campaignData.fromEmail || 'marketing@kryonix.com.br',
        replyTo: campaignData.replyTo || 'contato@kryonix.com.br',
        template: mauticTemplateId,
        content: campaignData.templateHtml,
        textContent: campaignData.templateText
      });

      // 3. Salvar no nosso banco
      const campaign = await this.db.query(`
        INSERT INTO email_marketing.campaigns 
          (mautic_id, name, subject, from_name, from_email, reply_to, template_id, content_html, content_text, type, segment_criteria, company_id, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        mauticEmail.id,
        campaignData.name,
        campaignData.subject,
        campaignData.fromName || 'KRYONIX',
        campaignData.fromEmail || 'marketing@kryonix.com.br',
        campaignData.replyTo || 'contato@kryonix.com.br',
        campaignData.templateId,
        campaignData.templateHtml,
        campaignData.templateText,
        campaignData.type || 'broadcast',
        JSON.stringify(campaignData.segmentCriteria || {}),
        campaignData.companyId,
        campaignData.createdBy
      ]);

      return campaign.rows[0];
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      throw error;
    }
  }

  async scheduleCampaign(campaignId: string, scheduledAt: Date): Promise<void> {
    const campaign = await this.getCampaignById(campaignId);
    
    // Agendar no Mautic
    await this.mautic.scheduleEmail(campaign.mautic_id, scheduledAt);

    // Atualizar no nosso banco
    await this.db.query(`
      UPDATE email_marketing.campaigns 
      SET scheduled_at = $1, status = 'scheduled', updated_at = NOW()
      WHERE id = $2
    `, [scheduledAt, campaignId]);

    // Criar job no sistema de filas para processar no horário certo
    await this.queueService.add('process-campaign', {
      campaignId,
      action: 'send'
    }, {
      delay: scheduledAt.getTime() - Date.now()
    });
  }

  async sendCampaign(campaignId: string): Promise<CampaignSendResult> {
    const campaign = await this.getCampaignById(campaignId);
    
    try {
      // 1. Obter lista de contatos baseada na segmentação
      const contacts = await this.segmentContacts(campaign.segment_criteria);
      
      // 2. Atualizar contagem de audiência
      await this.db.query(`
        UPDATE email_marketing.campaigns 
        SET target_audience_count = $1, status = 'sending', updated_at = NOW()
        WHERE id = $2
      `, [contacts.length, campaignId]);

      // 3. Enviar via Mautic
      const sendResult = await this.mautic.sendEmail(campaign.mautic_id, {
        contacts: contacts.map(c => c.mautic_id)
      });

      // 4. Registrar eventos de envio
      for (const contact of contacts) {
        await this.registerEmailEvent({
          campaignId,
          contactId: contact.id,
          eventType: 'sent',
          eventData: { mauticEmailId: campaign.mautic_id }
        });
      }

      // 5. Atualizar status da campanha
      await this.db.query(`
        UPDATE email_marketing.campaigns 
        SET status = 'sent', sent_at = NOW(), total_sent = $1, updated_at = NOW()
        WHERE id = $2
      `, [contacts.length, campaignId]);

      return {
        success: true,
        totalSent: contacts.length,
        mauticResult: sendResult
      };

    } catch (error) {
      // Marcar campanha como falha
      await this.db.query(`
        UPDATE email_marketing.campaigns 
        SET status = 'failed', updated_at = NOW()
        WHERE id = $1
      `, [campaignId]);

      throw error;
    }
  }

  // ========== AUTOMAÇÃO E WORKFLOWS ==========

  async createDripCampaign(dripData: DripCampaignData): Promise<DripCampaign> {
    // Criar sequência de emails automatizada
    const campaign = await this.createCampaign({
      ...dripData,
      type: 'drip'
    });

    // Configurar triggers no N8N
    await this.n8nService.createWorkflow({
      name: `Drip Campaign: ${dripData.name}`,
      triggers: [{
        type: 'webhook',
        event: 'contact_added_to_list',
        listId: dripData.triggerListId
      }],
      actions: dripData.emails.map((email, index) => ({
        type: 'send_email',
        delay: email.delayDays * 24 * 60 * 60 * 1000, // converter para ms
        campaignId: campaign.id,
        templateId: email.templateId
      }))
    });

    return campaign;
  }

  async createTriggerCampaign(triggerData: TriggerCampaignData): Promise<Campaign> {
    const campaign = await this.createCampaign({
      ...triggerData,
      type: 'trigger'
    });

    // Configurar trigger automático
    await this.mautic.createCampaign({
      name: `Trigger: ${triggerData.name}`,
      description: triggerData.description,
      events: [{
        type: triggerData.triggerEvent,
        condition: triggerData.triggerCondition,
        action: {
          type: 'send_email',
          emailId: campaign.mautic_id
        }
      }]
    });

    return campaign;
  }

  // ========== ANÁLISE E RELATÓRIOS ==========

  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
    const analytics = await this.db.query(`
      WITH campaign_stats AS (
        SELECT 
          c.id,
          c.name,
          c.total_sent,
          COUNT(CASE WHEN e.event_type = 'delivered' THEN 1 END) as delivered,
          COUNT(CASE WHEN e.event_type = 'opened' THEN 1 END) as opened,
          COUNT(CASE WHEN e.event_type = 'clicked' THEN 1 END) as clicked,
          COUNT(CASE WHEN e.event_type = 'bounced' THEN 1 END) as bounced,
          COUNT(CASE WHEN e.event_type = 'unsubscribed' THEN 1 END) as unsubscribed,
          COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.contact_id END) as unique_opens,
          COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN e.contact_id END) as unique_clicks
        FROM email_marketing.campaigns c
        LEFT JOIN email_marketing.events e ON c.id = e.campaign_id
        WHERE c.id = $1
        GROUP BY c.id, c.name, c.total_sent
      )
      SELECT 
        *,
        CASE WHEN total_sent > 0 THEN (delivered::float / total_sent * 100) ELSE 0 END as delivery_rate,
        CASE WHEN delivered > 0 THEN (unique_opens::float / delivered * 100) ELSE 0 END as open_rate,
        CASE WHEN unique_opens > 0 THEN (unique_clicks::float / unique_opens * 100) ELSE 0 END as click_rate,
        CASE WHEN total_sent > 0 THEN (bounced::float / total_sent * 100) ELSE 0 END as bounce_rate,
        CASE WHEN total_sent > 0 THEN (unsubscribed::float / total_sent * 100) ELSE 0 END as unsubscribe_rate
      FROM campaign_stats
    `, [campaignId]);

    return analytics.rows[0];
  }

  async getContactJourney(contactId: string): Promise<ContactJourney> {
    const journey = await this.db.query(`
      SELECT 
        e.event_type,
        e.event_data,
        e.occurred_at,
        c.name as campaign_name,
        c.subject as campaign_subject
      FROM email_marketing.events e
      JOIN email_marketing.campaigns c ON e.campaign_id = c.id
      WHERE e.contact_id = $1
      ORDER BY e.occurred_at DESC
      LIMIT 50
    `, [contactId]);

    return {
      contactId,
      events: journey.rows,
      totalEvents: journey.rows.length
    };
  }

  // ========== INTEGRAÇÃO COM SENDGRID WEBHOOKS ==========

  async processSendGridWebhook(webhookData: SendGridWebhookEvent[]): Promise<void> {
    for (const event of webhookData) {
      await this.registerEmailEvent({
        campaignId: await this.getCampaignIdByMessageId(event.sg_message_id),
        contactId: await this.getContactIdByEmail(event.email),
        eventType: this.mapSendGridEventType(event.event),
        eventData: event,
        sendgridMessageId: event.sg_message_id,
        sendgridEventId: event.sg_event_id,
        ipAddress: event.ip,
        userAgent: event.useragent,
        urlClicked: event.url,
        bounceReason: event.reason,
        occurredAt: new Date(event.timestamp * 1000)
      });
    }
  }

  private async registerEmailEvent(eventData: EmailEventData): Promise<void> {
    await this.db.query(`
      INSERT INTO email_marketing.events 
        (campaign_id, contact_id, event_type, event_data, sendgrid_message_id, sendgrid_event_id, ip_address, user_agent, url_clicked, bounce_reason, occurred_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      eventData.campaignId,
      eventData.contactId,
      eventData.eventType,
      JSON.stringify(eventData.eventData || {}),
      eventData.sendgridMessageId,
      eventData.sendgridEventId,
      eventData.ipAddress,
      eventData.userAgent,
      eventData.urlClicked,
      eventData.bounceReason,
      eventData.occurredAt || new Date()
    ]);

    // Atualizar estatísticas da campanha
    await this.updateCampaignStats(eventData.campaignId, eventData.eventType);
  }

  private async updateCampaignStats(campaignId: string, eventType: string): Promise<void> {
    const field = this.getStatsFieldByEventType(eventType);
    if (field) {
      await this.db.query(`
        UPDATE email_marketing.campaigns 
        SET ${field} = ${field} + 1, updated_at = NOW()
        WHERE id = $1
      `, [campaignId]);
    }
  }
}
```

## 🎨 **COMPONENTES FRONTEND**
```tsx
// components/email-marketing/CampaignBuilder.tsx
export const CampaignBuilder = () => {
  const [campaign, setCampaign] = useState<CampaignDraft>({
    name: '',
    subject: '',
    fromName: 'KRYONIX',
    fromEmail: 'marketing@kryonix.com.br',
    type: 'broadcast'
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const { templates } = useEmailTemplates();
  const { lists } = useContactLists();

  const steps = [
    { id: 1, name: 'Configuração Básica', component: BasicSettings },
    { id: 2, name: 'Template', component: TemplateSelector },
    { id: 3, name: 'Audiência', component: AudienceSelector },
    { id: 4, name: 'Agendamento', component: ScheduleSettings },
    { id: 5, name: 'Revisão', component: ReviewAndSend }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Criar Nova Campanha</h1>
        <p className="text-gray-600">Configure sua campanha de email marketing passo a passo</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className={cn(
                stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '',
                'relative'
              )}>
                <div className="flex items-center">
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                    currentStep === step.id 
                      ? 'bg-blue-600 text-white'
                      : currentStep > step.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-700'
                  )}>
                    {currentStep > step.id ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {step.name}
                  </span>
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-4 left-4 -ml-px mt-0.5 h-0.5 w-full bg-gray-300" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <Card className="min-h-96">
        <CardContent className="p-6">
          {steps.find(s => s.id === currentStep)?.component && (
            <CurrentStepComponent 
              campaign={campaign}
              setCampaign={setCampaign}
              templates={templates}
              lists={lists}
            />
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>
          
          <Button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            disabled={currentStep === steps.length}
          >
            {currentStep === steps.length ? 'Enviar Campanha' : 'Próximo'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// components/email-marketing/TemplateSelector.tsx
export const TemplateSelector = ({ campaign, setCampaign, templates }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(campaign.templateId);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Escolher Template</h3>
        <p className="text-sm text-gray-500">
          Selecione um template ou crie do zero
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Templates Disponíveis</h4>
            <Button variant="outline" size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              Criar Novo
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                className={cn(
                  'border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow',
                  selectedTemplate === template.id && 'border-blue-500 ring-2 ring-blue-200'
                )}
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setCampaign({ ...campaign, templateId: template.id });
                }}
              >
                <div className="aspect-[4/3] bg-gray-100 rounded mb-2">
                  {template.thumbnail_url ? (
                    <img 
                      src={template.thumbnail_url} 
                      alt={template.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <h5 className="font-medium text-sm">{template.name}</h5>
                <p className="text-xs text-gray-500">{template.category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Preview</h4>
            <div className="flex items-center space-x-2">
              <Button
                variant={previewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('desktop')}
              >
                <MonitorIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('mobile')}
              >
                <SmartphoneIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className={cn(
            'border rounded-lg bg-white shadow-sm',
            previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
          )}>
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium">De:</span>
                <span>{campaign.fromName} &lt;{campaign.fromEmail}&gt;</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium">Assunto:</span>
                <span>{campaign.subject || 'Adicione um assunto'}</span>
              </div>
            </div>
            
            <div className="p-4 min-h-96">
              {selectedTemplate ? (
                <EmailPreview 
                  templateId={selectedTemplate}
                  variables={campaign.variables || {}}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <div className="text-center">
                    <MailIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>Selecione um template para ver o preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// components/email-marketing/CampaignAnalytics.tsx
export const CampaignAnalytics = ({ campaignId }: { campaignId: string }) => {
  const { analytics, loading } = useCampaignAnalytics(campaignId);

  if (loading) {
    return <div>Carregando analytics...</div>;
  }

  const metrics = [
    {
      name: 'Enviados',
      value: analytics.total_sent,
      icon: <SendIcon className="h-5 w-5" />,
      color: 'blue'
    },
    {
      name: 'Taxa de Entrega',
      value: `${analytics.delivery_rate?.toFixed(1)}%`,
      icon: <CheckCircleIcon className="h-5 w-5" />,
      color: 'green'
    },
    {
      name: 'Taxa de Abertura',
      value: `${analytics.open_rate?.toFixed(1)}%`,
      icon: <EyeIcon className="h-5 w-5" />,
      color: 'purple'
    },
    {
      name: 'Taxa de Clique',
      value: `${analytics.click_rate?.toFixed(1)}%`,
      icon: <MousePointerIcon className="h-5 w-5" />,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(metric => (
          <Card key={metric.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={cn(
                  'p-2 rounded-lg',
                  metric.color === 'blue' && 'bg-blue-100 text-blue-600',
                  metric.color === 'green' && 'bg-green-100 text-green-600',
                  metric.color === 'purple' && 'bg-purple-100 text-purple-600',
                  metric.color === 'orange' && 'bg-orange-100 text-orange-600'
                )}>
                  {metric.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeSeriesChart data={analytics.timeSeriesData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={[
              { name: 'Entregues', value: analytics.delivered, color: '#10B981' },
              { name: 'Abertos', value: analytics.unique_opens, color: '#8B5CF6' },
              { name: 'Clicados', value: analytics.unique_clicks, color: '#F59E0B' },
              { name: 'Bounced', value: analytics.bounced, color: '#EF4444' }
            ]} />
          </CardContent>
        </Card>
      </div>

      {/* Detalhes por dispositivo */}
      <Card>
        <CardHeader>
          <CardTitle>Análise por Dispositivo</CardTitle>
        </CardHeader>
        <CardContent>
          <DeviceAnalyticsTable data={analytics.deviceBreakdown} />
        </CardContent>
      </Card>
    </div>
  );
};
```

## 🔧 **COMANDOS DE EXECUÇÃO**
```bash
# 1. Verificar Mautic funcionando
curl -I https://mautic.kryonix.com.br
curl -u kryonix:Vitor@123456 https://mautic.kryonix.com.br/api/contacts

# 2. Criar schema de email marketing
psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -f email-marketing-schema.sql

# 3. Configurar webhook SendGrid
curl -X POST https://api.sendgrid.com/v3/user/webhooks/event/settings \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "url": "https://api.kryonix.com.br/webhooks/sendgrid",
    "group_resubscribe": true,
    "delivered": true,
    "group_unsubscribe": true,
    "spam_report": true,
    "bounce": true,
    "deferred": true,
    "unsubscribe": true,
    "processed": true,
    "open": true,
    "click": true,
    "dropped": true
  }'

# 4. Testar envio de campanha
curl -X POST https://api.kryonix.com.br/v1/email-marketing/campaigns \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d @campaign-test.json
```

## ✅ **CHECKLIST DE VALIDAÇÃO**
- [ ] Mautic conectado e configurado
- [ ] SendGrid webhooks funcionando
- [ ] Schema de email marketing criado
- [ ] Sincronização de contatos operacional
- [ ] Templates de email carregados
- [ ] Sistema de segmentação funcionando
- [ ] Campanhas podem ser criadas e enviadas
- [ ] Analytics e relatórios funcionando
- [ ] Automações básicas configuradas
- [ ] Interface de criação de campanhas
- [ ] Tracking de eventos implementado
- [ ] Compliance com LGPD

## 🧪 **TESTES (QA Expert)**
```bash
# Teste de criação de contato
npm run test:email:contact-sync

# Teste de envio de campanha
npm run test:email:campaign-send

# Teste de analytics
npm run test:email:analytics

# Teste de webhooks
npm run test:email:webhooks

# Teste de templates
npm run test:email:templates

# Teste de segmentação
npm run test:email:segmentation
```

## 📊 **INTEGRAÇÃO COM METABASE**
```sql
-- Views para Metabase
CREATE VIEW email_marketing.v_campaign_performance AS
SELECT 
  c.name,
  c.subject,
  c.sent_at,
  c.total_sent,
  c.total_delivered,
  c.total_opened,
  c.total_clicked,
  CASE WHEN c.total_sent > 0 THEN (c.total_delivered::float / c.total_sent * 100) ELSE 0 END as delivery_rate,
  CASE WHEN c.total_delivered > 0 THEN (c.total_opened::float / c.total_delivered * 100) ELSE 0 END as open_rate,
  CASE WHEN c.total_opened > 0 THEN (c.total_clicked::float / c.total_opened * 100) ELSE 0 END as click_rate,
  comp.name as company_name
FROM email_marketing.campaigns c
JOIN auth.companies comp ON c.company_id = comp.id
WHERE c.status = 'sent';

CREATE VIEW email_marketing.v_contact_engagement AS
SELECT 
  c.email,
  c.first_name,
  c.last_name,
  c.lead_score,
  c.total_emails_sent,
  c.total_emails_opened,
  c.total_emails_clicked,
  CASE WHEN c.total_emails_sent > 0 THEN (c.total_emails_opened::float / c.total_emails_sent * 100) ELSE 0 END as engagement_rate,
  c.last_activity,
  comp.name as company_name
FROM email_marketing.contacts c
JOIN auth.companies comp ON c.company_id = comp.id
WHERE c.status = 'active';
```

---
*Parte 17 de 50 - Projeto KRYONIX SaaS Platform*
*Próxima Parte: 18 - Analytics e Business Intelligence*
