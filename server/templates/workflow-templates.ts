import { WorkflowType } from "../entities/WorkflowTemplate";

// Lead Qualification Workflow Template
export const LEAD_QUALIFICATION_TEMPLATE = {
  name: "Lead Qualification Workflow",
  description:
    "Automatically qualify leads from WhatsApp messages using AI scoring",
  type: WorkflowType.LEAD_QUALIFICATION,
  trigger: {
    type: "whatsapp_message",
    config: {
      eventFilter: {
        direction: "inbound",
        messageType: "text",
      },
    },
  },
  definition: {
    nodes: [
      {
        id: "webhook-trigger",
        name: "WhatsApp Message Trigger",
        type: "webhook",
        position: [100, 100],
        parameters: {
          httpMethod: "POST",
          path: "/webhook/whatsapp/lead",
          responseMode: "responseNode",
          responseData: "allEntries",
        },
      },
      {
        id: "extract-data",
        name: "Extract Lead Data",
        type: "function",
        position: [300, 100],
        parameters: {
          functionCode: `
            const message = $input.first().json;
            return [{
              json: {
                phone: message.contactPhone,
                message: message.content.text,
                timestamp: message.createdAt,
                instanceId: message.instanceId,
                tenantId: message.tenantId
              }
            }];
          `,
        },
      },
      {
        id: "ai-scoring",
        name: "AI Lead Scoring",
        type: "httpRequest",
        position: [500, 100],
        parameters: {
          url: "={{$parameter.aiServiceUrl || 'http://localhost:8080/api/v1/ai/score-lead'}}",
          method: "POST",
          sendHeaders: true,
          headerParameters: {
            Authorization: "Bearer {{$parameter.apiKey}}",
          },
          sendBody: true,
          bodyParameters: {
            message: "={{$node['extract-data'].json.message}}",
            phone: "={{$node['extract-data'].json.phone}}",
          },
        },
      },
      {
        id: "score-condition",
        name: "Check Lead Score",
        type: "if",
        position: [700, 100],
        parameters: {
          conditions: {
            number: [
              {
                value1: "={{$node['ai-scoring'].json.score}}",
                operation: "largerEqual",
                value2: 70,
              },
            ],
          },
        },
      },
      {
        id: "high-score-response",
        name: "Send Qualified Lead Response",
        type: "httpRequest",
        position: [900, 50],
        parameters: {
          url: "={{$parameter.frontendUrl}}/api/v1/whatsapp/instances/{{$node['extract-data'].json.instanceId}}/messages",
          method: "POST",
          sendHeaders: true,
          headerParameters: {
            Authorization: "Bearer {{$parameter.apiKey}}",
            "Content-Type": "application/json",
          },
          sendBody: true,
          bodyParameters: {
            contactPhone: "={{$node['extract-data'].json.phone}}",
            text: "Obrigado pelo seu interesse! Nossa equipe de vendas entrará em contato em breve. 🚀",
          },
        },
      },
      {
        id: "low-score-response",
        name: "Send Standard Response",
        type: "httpRequest",
        position: [900, 150],
        parameters: {
          url: "={{$parameter.frontendUrl}}/api/v1/whatsapp/instances/{{$node['extract-data'].json.instanceId}}/messages",
          method: "POST",
          sendHeaders: true,
          headerParameters: {
            Authorization: "Bearer {{$parameter.apiKey}}",
            "Content-Type": "application/json",
          },
          sendBody: true,
          bodyParameters: {
            contactPhone: "={{$node['extract-data'].json.phone}}",
            text: "Olá! Obrigado por entrar em contato. Como posso ajudá-lo hoje? 😊",
          },
        },
      },
      {
        id: "create-crm-lead",
        name: "Create CRM Lead",
        type: "httpRequest",
        position: [1100, 50],
        parameters: {
          url: "={{$parameter.crmApiUrl || $parameter.frontendUrl + '/api/v1/crm/leads'}}",
          method: "POST",
          sendHeaders: true,
          headerParameters: {
            Authorization: "Bearer {{$parameter.apiKey}}",
            "Content-Type": "application/json",
          },
          sendBody: true,
          bodyParameters: {
            phone: "={{$node['extract-data'].json.phone}}",
            source: "whatsapp",
            score: "={{$node['ai-scoring'].json.score}}",
            message: "={{$node['extract-data'].json.message}}",
            tenantId: "={{$node['extract-data'].json.tenantId}}",
          },
        },
      },
    ],
    connections: {
      "webhook-trigger": {
        main: [["extract-data"]],
      },
      "extract-data": {
        main: [["ai-scoring"]],
      },
      "ai-scoring": {
        main: [["score-condition"]],
      },
      "score-condition": {
        main: [["high-score-response"], ["low-score-response"]],
      },
      "high-score-response": {
        main: [["create-crm-lead"]],
      },
    },
    settings: {
      errorWorkflow: {
        enable: true,
      },
    },
  },
  settings: {
    maxExecutionsPerHour: 100,
    maxExecutionsPerDay: 1000,
    retrySettings: {
      enabled: true,
      maxRetries: 3,
      retryDelay: 5000,
    },
    notificationSettings: {
      onSuccess: false,
      onFailure: true,
      notifyEmails: [],
    },
    timeoutSettings: {
      enabled: true,
      timeoutMinutes: 5,
    },
  },
};

// Customer Support Automation Template
export const CUSTOMER_SUPPORT_TEMPLATE = {
  name: "Customer Support Automation",
  description:
    "Automatically handle customer support queries with AI classification and routing",
  type: WorkflowType.CUSTOMER_SUPPORT,
  trigger: {
    type: "whatsapp_message",
    config: {
      eventFilter: {
        direction: "inbound",
        messageType: "text",
      },
    },
  },
  definition: {
    nodes: [
      {
        id: "support-trigger",
        name: "Support Message Trigger",
        type: "webhook",
        position: [100, 100],
        parameters: {
          httpMethod: "POST",
          path: "/webhook/whatsapp/support",
        },
      },
      {
        id: "classify-intent",
        name: "Classify Customer Intent",
        type: "httpRequest",
        position: [300, 100],
        parameters: {
          url: "={{$parameter.aiServiceUrl}}/classify-intent",
          method: "POST",
          sendBody: true,
          bodyParameters: {
            message: "={{$node['support-trigger'].json.content.text}}",
            customerPhone: "={{$node['support-trigger'].json.contactPhone}}",
          },
        },
      },
      {
        id: "route-by-intent",
        name: "Route by Intent",
        type: "switch",
        position: [500, 100],
        parameters: {
          dataPropertyName: "intent",
          values: [
            { value: "billing", output: 0 },
            { value: "technical", output: 1 },
            { value: "general", output: 2 },
            { value: "complaint", output: 3 },
          ],
        },
      },
      {
        id: "handle-billing",
        name: "Handle Billing Query",
        type: "function",
        position: [700, 50],
        parameters: {
          functionCode: `
            const data = $input.first().json;
            return [{
              json: {
                response: "Para questões de cobrança, nossa equipe financeira entrará em contato. Pode nos informar seu CPF/CNPJ?",
                nextStep: "collect_document",
                department: "billing"
              }
            }];
          `,
        },
      },
      {
        id: "create-technical-ticket",
        name: "Create Technical Ticket",
        type: "httpRequest",
        position: [700, 100],
        parameters: {
          url: "={{$parameter.ticketSystemUrl || $parameter.frontendUrl + '/api/v1/support/tickets'}}",
          method: "POST",
          sendBody: true,
          bodyParameters: {
            type: "technical",
            priority: "medium",
            customerPhone: "={{$node['support-trigger'].json.contactPhone}}",
            description: "={{$node['support-trigger'].json.content.text}}",
          },
        },
      },
      {
        id: "send-faq",
        name: "Send FAQ Response",
        type: "function",
        position: [700, 150],
        parameters: {
          functionCode: `
            const faqs = [
              "🤔 Dúvidas frequentes:\\n\\n1. Como criar uma conta?\\n2. Como conectar WhatsApp?\\n3. Como cancelar assinatura?\\n\\nDigite o número da pergunta!"
            ];
            return [{ json: { response: faqs[0] } }];
          `,
        },
      },
      {
        id: "escalate-complaint",
        name: "Escalate Complaint",
        type: "httpRequest",
        position: [700, 200],
        parameters: {
          url: "={{$parameter.frontendUrl}}/api/v1/support/escalate",
          method: "POST",
          sendBody: true,
          bodyParameters: {
            type: "complaint",
            priority: "high",
            customerPhone: "={{$node['support-trigger'].json.contactPhone}}",
            description: "={{$node['support-trigger'].json.content.text}}",
          },
        },
      },
      {
        id: "send-response",
        name: "Send Response",
        type: "httpRequest",
        position: [900, 100],
        parameters: {
          url: "={{$parameter.frontendUrl}}/api/v1/whatsapp/instances/{{$node['support-trigger'].json.instanceId}}/messages",
          method: "POST",
          sendHeaders: true,
          headerParameters: {
            Authorization: "Bearer {{$parameter.apiKey}}",
          },
          sendBody: true,
          bodyParameters: {
            contactPhone: "={{$node['support-trigger'].json.contactPhone}}",
            text: "={{$node['handle-billing'].json.response || $node['send-faq'].json.response || 'Sua solicitação foi registrada. Nossa equipe retornará em breve.'}}",
          },
        },
      },
    ],
    connections: {
      "support-trigger": {
        main: [["classify-intent"]],
      },
      "classify-intent": {
        main: [["route-by-intent"]],
      },
      "route-by-intent": {
        main: [
          ["handle-billing"],
          ["create-technical-ticket"],
          ["send-faq"],
          ["escalate-complaint"],
        ],
      },
      "handle-billing": {
        main: [["send-response"]],
      },
      "send-faq": {
        main: [["send-response"]],
      },
    },
  },
  settings: {
    maxExecutionsPerHour: 200,
    maxExecutionsPerDay: 2000,
    retrySettings: {
      enabled: true,
      maxRetries: 2,
      retryDelay: 3000,
    },
    notificationSettings: {
      onSuccess: false,
      onFailure: true,
      notifyEmails: [],
    },
    timeoutSettings: {
      enabled: true,
      timeoutMinutes: 3,
    },
  },
};

// Follow-up Sequence Template
export const FOLLOW_UP_SEQUENCE_TEMPLATE = {
  name: "Follow-up Sequence",
  description: "Automated follow-up sequence for leads and customers",
  type: WorkflowType.FOLLOW_UP_SEQUENCE,
  trigger: {
    type: "schedule",
    config: {
      cronSchedule: "0 9 * * *", // Daily at 9 AM
    },
  },
  definition: {
    nodes: [
      {
        id: "schedule-trigger",
        name: "Daily Follow-up Trigger",
        type: "cron",
        position: [100, 100],
        parameters: {
          cronExpression: "0 9 * * *",
        },
      },
      {
        id: "get-pending-followups",
        name: "Get Pending Follow-ups",
        type: "httpRequest",
        position: [300, 100],
        parameters: {
          url: "={{$parameter.frontendUrl}}/api/v1/crm/followups/pending",
          method: "GET",
          sendHeaders: true,
          headerParameters: {
            Authorization: "Bearer {{$parameter.apiKey}}",
          },
        },
      },
      {
        id: "process-followups",
        name: "Process Each Follow-up",
        type: "splitInBatches",
        position: [500, 100],
        parameters: {
          batchSize: 10,
        },
      },
      {
        id: "check-followup-type",
        name: "Check Follow-up Type",
        type: "switch",
        position: [700, 100],
        parameters: {
          dataPropertyName: "type",
          values: [
            { value: "welcome", output: 0 },
            { value: "reminder", output: 1 },
            { value: "reactivation", output: 2 },
          ],
        },
      },
      {
        id: "send-welcome",
        name: "Send Welcome Message",
        type: "httpRequest",
        position: [900, 50],
        parameters: {
          url: "={{$parameter.frontendUrl}}/api/v1/whatsapp/instances/{{$parameter.defaultInstanceId}}/messages",
          method: "POST",
          sendBody: true,
          bodyParameters: {
            contactPhone: "={{$item.customerPhone}}",
            text: "🎉 Bem-vindo ao KRYONIX! Estamos felizes em tê-lo conosco. Como podemos ajudá-lo a começar?",
          },
        },
      },
      {
        id: "send-reminder",
        name: "Send Reminder",
        type: "httpRequest",
        position: [900, 100],
        parameters: {
          url: "={{$parameter.frontendUrl}}/api/v1/whatsapp/instances/{{$parameter.defaultInstanceId}}/messages",
          method: "POST",
          sendBody: true,
          bodyParameters: {
            contactPhone: "={{$item.customerPhone}}",
            text: "📅 Lembrete: {{$item.reminderText}} - Precisa de ajuda? Estamos aqui!",
          },
        },
      },
      {
        id: "send-reactivation",
        name: "Send Reactivation",
        type: "httpRequest",
        position: [900, 150],
        parameters: {
          url: "={{$parameter.frontendUrl}}/api/v1/whatsapp/instances/{{$parameter.defaultInstanceId}}/messages",
          method: "POST",
          sendBody: true,
          bodyParameters: {
            contactPhone: "={{$item.customerPhone}}",
            text: "💡 Sentimos sua falta! Temos novidades incríveis. Que tal dar uma olhada?",
          },
        },
      },
      {
        id: "update-followup-status",
        name: "Update Follow-up Status",
        type: "httpRequest",
        position: [1100, 100],
        parameters: {
          url: "={{$parameter.frontendUrl}}/api/v1/crm/followups/{{$item.id}}",
          method: "PATCH",
          sendHeaders: true,
          headerParameters: {
            Authorization: "Bearer {{$parameter.apiKey}}",
          },
          sendBody: true,
          bodyParameters: {
            status: "sent",
            sentAt: "={{new Date().toISOString()}}",
          },
        },
      },
    ],
    connections: {
      "schedule-trigger": {
        main: [["get-pending-followups"]],
      },
      "get-pending-followups": {
        main: [["process-followups"]],
      },
      "process-followups": {
        main: [["check-followup-type"]],
      },
      "check-followup-type": {
        main: [["send-welcome"], ["send-reminder"], ["send-reactivation"]],
      },
      "send-welcome": {
        main: [["update-followup-status"]],
      },
      "send-reminder": {
        main: [["update-followup-status"]],
      },
      "send-reactivation": {
        main: [["update-followup-status"]],
      },
    },
  },
  settings: {
    maxExecutionsPerHour: 10,
    maxExecutionsPerDay: 10,
    retrySettings: {
      enabled: true,
      maxRetries: 3,
      retryDelay: 10000,
    },
    notificationSettings: {
      onSuccess: false,
      onFailure: true,
      notifyEmails: [],
    },
    timeoutSettings: {
      enabled: true,
      timeoutMinutes: 30,
    },
  },
};

// Marketing Campaign Template
export const MARKETING_CAMPAIGN_TEMPLATE = {
  name: "Marketing Campaign Automation",
  description:
    "Automated marketing campaign with segmentation and personalization",
  type: WorkflowType.MARKETING_CAMPAIGN,
  trigger: {
    type: "manual",
    config: {},
  },
  definition: {
    nodes: [
      {
        id: "manual-trigger",
        name: "Start Campaign",
        type: "manualTrigger",
        position: [100, 100],
      },
      {
        id: "get-target-audience",
        name: "Get Target Audience",
        type: "httpRequest",
        position: [300, 100],
        parameters: {
          url: "={{$parameter.frontendUrl}}/api/v1/crm/contacts/segments/{{$parameter.segmentId}}",
          method: "GET",
        },
      },
      {
        id: "filter-contacts",
        name: "Filter Active Contacts",
        type: "function",
        position: [500, 100],
        parameters: {
          functionCode: `
            const contacts = $input.first().json.contacts || [];
            const filtered = contacts.filter(contact => 
              contact.status === 'active' && 
              contact.optedIn === true &&
              contact.phone
            );
            return filtered.map(contact => ({ json: contact }));
          `,
        },
      },
      {
        id: "personalize-message",
        name: "Personalize Message",
        type: "function",
        position: [700, 100],
        parameters: {
          functionCode: `
            const contact = $input.first().json;
            const template = $parameter.messageTemplate || "Olá {{name}}, temos uma oferta especial para você!";
            const personalizedMessage = template.replace(/{{name}}/g, contact.name || 'amigo');
            
            return [{
              json: {
                ...contact,
                personalizedMessage
              }
            }];
          `,
        },
      },
      {
        id: "send-campaign-message",
        name: "Send Campaign Message",
        type: "httpRequest",
        position: [900, 100],
        parameters: {
          url: "={{$parameter.frontendUrl}}/api/v1/whatsapp/instances/{{$parameter.campaignInstanceId}}/messages",
          method: "POST",
          sendBody: true,
          bodyParameters: {
            contactPhone: "={{$item.phone}}",
            text: "={{$item.personalizedMessage}}",
          },
        },
      },
      {
        id: "track-delivery",
        name: "Track Message Delivery",
        type: "httpRequest",
        position: [1100, 100],
        parameters: {
          url: "={{$parameter.frontendUrl}}/api/v1/campaigns/{{$parameter.campaignId}}/track",
          method: "POST",
          sendBody: true,
          bodyParameters: {
            contactId: "={{$item.id}}",
            messageId: "={{$node['send-campaign-message'].json.id}}",
            status: "sent",
          },
        },
      },
      {
        id: "wait-for-response",
        name: "Wait for Response",
        type: "wait",
        position: [1100, 200],
        parameters: {
          amount: 24,
          unit: "hours",
        },
      },
      {
        id: "check-engagement",
        name: "Check Engagement",
        type: "httpRequest",
        position: [1300, 200],
        parameters: {
          url: "={{$parameter.frontendUrl}}/api/v1/campaigns/{{$parameter.campaignId}}/engagement/{{$item.id}}",
          method: "GET",
        },
      },
    ],
    connections: {
      "manual-trigger": {
        main: [["get-target-audience"]],
      },
      "get-target-audience": {
        main: [["filter-contacts"]],
      },
      "filter-contacts": {
        main: [["personalize-message"]],
      },
      "personalize-message": {
        main: [["send-campaign-message"]],
      },
      "send-campaign-message": {
        main: [["track-delivery", "wait-for-response"]],
      },
      "wait-for-response": {
        main: [["check-engagement"]],
      },
    },
  },
  settings: {
    maxExecutionsPerHour: 50,
    maxExecutionsPerDay: 100,
    retrySettings: {
      enabled: true,
      maxRetries: 2,
      retryDelay: 30000,
    },
    notificationSettings: {
      onSuccess: true,
      onFailure: true,
      notifyEmails: [],
    },
    timeoutSettings: {
      enabled: true,
      timeoutMinutes: 60,
    },
  },
};

// Export all templates
export const WORKFLOW_TEMPLATES = {
  LEAD_QUALIFICATION: LEAD_QUALIFICATION_TEMPLATE,
  CUSTOMER_SUPPORT: CUSTOMER_SUPPORT_TEMPLATE,
  FOLLOW_UP_SEQUENCE: FOLLOW_UP_SEQUENCE_TEMPLATE,
  MARKETING_CAMPAIGN: MARKETING_CAMPAIGN_TEMPLATE,
};

export const getTemplateByType = (type: WorkflowType) => {
  return WORKFLOW_TEMPLATES[type] || null;
};

export const getAllTemplates = () => {
  return Object.values(WORKFLOW_TEMPLATES);
};
