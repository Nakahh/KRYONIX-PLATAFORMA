import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  TestTube,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Shield,
  Zap,
  Clock,
  Globe,
  Key,
  HelpCircle,
  BookOpen,
  Video,
  MessageCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { useToast } from '../hooks/use-toast';

interface StackConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'email' | 'number' | 'boolean' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  description?: string;
  validation?: string;
  options?: { value: string; label: string }[];
  group?: string;
  sensitive?: boolean;
}

interface StackConfiguration {
  id?: string;
  stackType: string;
  status: string;
  configuration: Record<string, any>;
  notes?: string;
  lastTestResult?: {
    success: boolean;
    message: string;
    responseTime?: number;
    details?: string;
  };
  requiredFields: StackConfigField[];
  isFullyConfigured: boolean;
}

// Configurações específicas por stack
const stackConfigurations: Record<string, {
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  documentation: string;
  tutorialVideo?: string;
  fields: StackConfigField[];
  helpText: string;
  examples: Record<string, string>;
}> = {
  evolution_api: {
    name: 'Evolution API',
    description: 'API para automação completa do WhatsApp Business com múltiplas instâncias',
    icon: <MessageCircle className="w-6 h-6" />,
    category: 'Comunicação',
    documentation: 'https://doc.evolution-api.com',
    tutorialVideo: 'https://youtube.com/watch?v=exemplo',
    helpText: 'A Evolution API permite criar e gerenciar múltiplas instâncias do WhatsApp Business de forma automatizada. É perfeita para automação de atendimento, marketing e vendas.',
    examples: {
      baseUrl: 'https://api.meuboot.site',
      globalApiKey: 'd976b5140c7a3709bc75f34cfdbfd9b7'
    },
    fields: [
      {
        key: 'baseUrl',
        label: 'URL da API',
        type: 'url',
        required: true,
        placeholder: 'https://api.meuboot.site',
        description: 'URL base da sua instância Evolution API',
        group: 'Conexão'
      },
      {
        key: 'globalApiKey',
        label: 'Chave API Global',
        type: 'password',
        required: true,
        placeholder: 'Sua chave API global',
        description: 'Chave de acesso global para gerenciar todas as instâncias',
        sensitive: true,
        group: 'Autenticação'
      },
      {
        key: 'webhookUrl',
        label: 'URL do Webhook',
        type: 'url',
        required: false,
        placeholder: 'https://seu-site.com/webhook',
        description: 'URL para receber eventos do WhatsApp (opcional)',
        group: 'Webhooks'
      },
      {
        key: 'timeout',
        label: 'Timeout (segundos)',
        type: 'number',
        required: false,
        placeholder: '30',
        description: 'Tempo limite para requisições',
        group: 'Configurações'
      }
    ]
  },
  n8n: {
    name: 'N8N Workflows',
    description: 'Plataforma de automação visual para criar workflows complexos sem código',
    icon: <Zap className="w-6 h-6" />,
    category: 'Automação',
    documentation: 'https://docs.n8n.io',
    helpText: 'O N8N permite criar automações visuais conectando diferentes serviços. Perfeito para integrar sistemas, automatizar tarefas e criar fluxos de trabalho complexos.',
    examples: {
      baseUrl: 'https://n8n.meuboot.site',
      apiKey: 'n8n_api_key_exemplo'
    },
    fields: [
      {
        key: 'baseUrl',
        label: 'URL do N8N',
        type: 'url',
        required: true,
        placeholder: 'https://n8n.meuboot.site',
        description: 'URL da sua instância N8N',
        group: 'Conexão'
      },
      {
        key: 'apiKey',
        label: 'Chave API',
        type: 'password',
        required: true,
        placeholder: 'Sua chave API do N8N',
        description: 'Chave para autenticação na API do N8N',
        sensitive: true,
        group: 'Autenticação'
      },
      {
        key: 'webhookBaseUrl',
        label: 'URL Base dos Webhooks',
        type: 'url',
        required: false,
        placeholder: 'https://webhook.meuboot.site',
        description: 'URL base para webhooks do N8N',
        group: 'Webhooks'
      }
    ]
  },
  typebot: {
    name: 'Typebot',
    description: 'Criador visual de chatbots conversacionais com IA integrada',
    icon: <MessageCircle className="w-6 h-6" />,
    category: 'Chatbots',
    documentation: 'https://docs.typebot.io',
    helpText: 'O Typebot permite criar chatbots visuais e conversacionais. Ideal para atendimento automatizado, qualificação de leads e suporte ao cliente.',
    examples: {
      builderUrl: 'https://typebot.meuboot.site',
      viewerUrl: 'https://bot.meuboot.site',
      apiKey: 'typebot_api_key_exemplo'
    },
    fields: [
      {
        key: 'builderUrl',
        label: 'URL do Builder',
        type: 'url',
        required: true,
        placeholder: 'https://typebot.meuboot.site',
        description: 'URL do editor visual de bots',
        group: 'Conexão'
      },
      {
        key: 'viewerUrl',
        label: 'URL do Viewer',
        type: 'url',
        required: true,
        placeholder: 'https://bot.meuboot.site',
        description: 'URL onde os bots são executados',
        group: 'Conexão'
      },
      {
        key: 'apiKey',
        label: 'Chave API',
        type: 'password',
        required: true,
        placeholder: 'Sua chave API do Typebot',
        description: 'Token de autenticação da API',
        sensitive: true,
        group: 'Autenticação'
      }
    ]
  }
};

export default function StackConfig() {
  const { stackType } = useParams<{ stackType: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [config, setConfig] = useState<StackConfiguration | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stackConfig = stackType ? stackConfigurations[stackType] : null;

  useEffect(() => {
    if (stackType) {
      fetchConfiguration();
    }
  }, [stackType]);

  const fetchConfiguration = async () => {
    try {
      const response = await fetch(`/api/v1/stack-config/${stackType}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.data);
        setFormData(data.data.configuration || {});
        setNotes(data.data.notes || '');
      } else if (response.status === 404) {
        // Configuração não existe ainda, criar nova
        setConfig({
          stackType: stackType!,
          status: 'not_configured',
          configuration: {},
          requiredFields: stackConfig?.fields || [],
          isFullyConfigured: false
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: "Erro ao carregar configuração",
        description: "Não foi possível carregar os dados da stack",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateField = (field: StackConfigField, value: any): string | null => {
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label} é obrigatório`;
    }

    if (value && field.type === 'url') {
      try {
        new URL(value);
      } catch {
        return `${field.label} deve ser uma URL válida`;
      }
    }

    if (value && field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return `${field.label} deve ser um email válido`;
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    stackConfig?.fields.forEach(field => {
      const error = validateField(field, formData[field.key]);
      if (error) {
        newErrors[field.key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Dados inválidos",
        description: "Corrija os erros antes de salvar",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/v1/stack-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          stackType,
          configuration: formData,
          notes
        })
      });

      if (response.ok) {
        toast({
          title: "Configuração salva!",
          description: "Stack configurada com sucesso",
        });
        await fetchConfiguration(); // Recarregar dados
      } else {
        throw new Error('Erro ao salvar');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a configuração",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(`/api/v1/stack-config/${stackType}/test`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.data.success) {
        toast({
          title: "Teste bem-sucedido!",
          description: data.data.message,
        });
      } else {
        toast({
          title: "Falha no teste",
          description: data.data.message,
          variant: "destructive",
        });
      }

      await fetchConfiguration(); // Recarregar para mostrar resultado
    } catch (error) {
      console.error('Erro no teste:', error);
      toast({
        title: "Erro no teste",
        description: "Não foi possível testar a conexão",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Valor copiado para a área de transferência",
    });
  };

  const groupedFields = stackConfig?.fields.reduce((groups, field) => {
    const group = field.group || 'Geral';
    if (!groups[group]) groups[group] = [];
    groups[group].push(field);
    return groups;
  }, {} as Record<string, StackConfigField[]>) || {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configuração...</p>
        </div>
      </div>
    );
  }

  if (!stackConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Stack não encontrada</h2>
            <p className="text-gray-600 mb-4">A stack solicitada não foi encontrada</p>
            <Button onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  {stackConfig.icon}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{stackConfig.name}</h1>
                  <p className="text-sm text-gray-600">{stackConfig.category}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {config?.isFullyConfigured && (
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={isTesting}
                  className="flex items-center space-x-2"
                >
                  {isTesting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                  <span>Testar Conexão</span>
                </Button>
              )}
              
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Configuração
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
        <Tabs defaultValue="configuration" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="configuration">Configuração</TabsTrigger>
            <TabsTrigger value="testing">Testes</TabsTrigger>
            <TabsTrigger value="documentation">Documentação</TabsTrigger>
            <TabsTrigger value="examples">Exemplos</TabsTrigger>
          </TabsList>

          {/* Aba de Configuração */}
          <TabsContent value="configuration" className="space-y-6">
            {/* Status atual */}
            {config && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>Status da Configuração</span>
                      </CardTitle>
                      <CardDescription>
                        Estado atual da stack e último teste de conexão
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={`
                        ${config.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                          config.status === 'error' ? 'bg-red-100 text-red-800 border-red-200' :
                          config.status === 'configured' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'}
                      `}
                    >
                      {config.status === 'active' ? 'Ativo' :
                       config.status === 'error' ? 'Erro' :
                       config.status === 'configured' ? 'Configurado' :
                       'Não Configurado'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {config.lastTestResult && (
                    <Alert variant={config.lastTestResult.success ? "default" : "destructive"}>
                      <div className="flex items-center space-x-2">
                        {config.lastTestResult.success ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        <AlertDescription>
                          <strong>
                            {config.lastTestResult.success ? 'Teste bem-sucedido:' : 'Falha no teste:'}
                          </strong>{' '}
                          {config.lastTestResult.message}
                          {config.lastTestResult.responseTime && (
                            <span className="ml-2 text-sm">
                              ({config.lastTestResult.responseTime}ms)
                            </span>
                          )}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Informações da Stack */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="w-5 h-5" />
                  <span>Sobre esta Stack</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{stackConfig.helpText}</p>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" asChild>
                    <a href={stackConfig.documentation} target="_blank" rel="noopener noreferrer">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Documentação
                    </a>
                  </Button>
                  {stackConfig.tutorialVideo && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={stackConfig.tutorialVideo} target="_blank" rel="noopener noreferrer">
                        <Video className="w-4 h-4 mr-2" />
                        Tutorial em Vídeo
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Formulário de configuração */}
            <div className="space-y-6">
              {Object.entries(groupedFields).map(([groupName, fields]) => (
                <Card key={groupName}>
                  <CardHeader>
                    <CardTitle className="text-lg">{groupName}</CardTitle>
                    <CardDescription>
                      Configure as informações de {groupName.toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key} className="flex items-center space-x-2">
                          <span>{field.label}</span>
                          {field.required && <span className="text-red-500">*</span>}
                          {field.sensitive && <Shield className="w-3 h-3 text-amber-500" />}
                        </Label>
                        
                        <div className="relative">
                          {field.type === 'textarea' ? (
                            <Textarea
                              id={field.key}
                              value={formData[field.key] || ''}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, [field.key]: e.target.value }));
                                if (errors[field.key]) {
                                  setErrors(prev => ({ ...prev, [field.key]: '' }));
                                }
                              }}
                              placeholder={field.placeholder}
                              className={errors[field.key] ? 'border-red-500' : ''}
                            />
                          ) : (
                            <Input
                              id={field.key}
                              type={field.sensitive && !showSensitive[field.key] ? 'password' : 'text'}
                              value={formData[field.key] || ''}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, [field.key]: e.target.value }));
                                if (errors[field.key]) {
                                  setErrors(prev => ({ ...prev, [field.key]: '' }));
                                }
                              }}
                              placeholder={field.placeholder}
                              className={errors[field.key] ? 'border-red-500' : ''}
                            />
                          )}
                          
                          {field.sensitive && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSensitive(prev => ({ 
                                  ...prev, 
                                  [field.key]: !prev[field.key] 
                                }))}
                              >
                                {showSensitive[field.key] ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                              {formData[field.key] && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(formData[field.key])}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {field.description && (
                          <p className="text-xs text-gray-500 flex items-start space-x-1">
                            <HelpCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{field.description}</span>
                          </p>
                        )}

                        {errors[field.key] && (
                          <p className="text-xs text-red-600 flex items-center space-x-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{errors[field.key]}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Anotações */}
            <Card>
              <CardHeader>
                <CardTitle>Anotações</CardTitle>
                <CardDescription>
                  Adicione observações sobre esta configuração
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Escreva suas anotações aqui..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Testes */}
          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Teste de Conexão</CardTitle>
                <CardDescription>
                  Verifique se a configuração está funcionando corretamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config?.lastTestResult ? (
                  <Alert variant={config.lastTestResult.success ? "default" : "destructive"}>
                    <div className="flex items-center space-x-2">
                      {config.lastTestResult.success ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <div>
                        <AlertDescription>
                          <strong>
                            {config.lastTestResult.success ? 'Teste bem-sucedido:' : 'Falha no teste:'}
                          </strong>{' '}
                          {config.lastTestResult.message}
                        </AlertDescription>
                        {config.lastTestResult.details && (
                          <p className="text-sm mt-2">{config.lastTestResult.details}</p>
                        )}
                        {config.lastTestResult.responseTime && (
                          <p className="text-sm mt-1">
                            Tempo de resposta: {config.lastTestResult.responseTime}ms
                          </p>
                        )}
                      </div>
                    </div>
                  </Alert>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum teste realizado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Execute um teste para verificar a conexão
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleTest}
                  disabled={isTesting || !config?.isFullyConfigured}
                  className="w-full"
                >
                  {isTesting ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <TestTube className="w-4 h-4 mr-2" />
                  )}
                  {isTesting ? 'Testando...' : 'Executar Teste'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Documentação */}
          <TabsContent value="documentation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentação e Ajuda</CardTitle>
                <CardDescription>
                  Links úteis e informações sobre {stackConfig.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                    <a href={stackConfig.documentation} target="_blank" rel="noopener noreferrer">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-6 h-6 text-blue-500" />
                        <div className="text-left">
                          <p className="font-medium">Documentação Oficial</p>
                          <p className="text-sm text-gray-600">Guia completo da API</p>
                        </div>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </div>
                    </a>
                  </Button>

                  {stackConfig.tutorialVideo && (
                    <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                      <a href={stackConfig.tutorialVideo} target="_blank" rel="noopener noreferrer">
                        <div className="flex items-center space-x-3">
                          <Video className="w-6 h-6 text-red-500" />
                          <div className="text-left">
                            <p className="font-medium">Tutorial em Vídeo</p>
                            <p className="text-sm text-gray-600">Aprenda no YouTube</p>
                          </div>
                          <ExternalLink className="w-4 h-4 ml-auto" />
                        </div>
                      </a>
                    </Button>
                  )}
                </div>

                <div className="prose prose-sm max-w-none">
                  <h3>Como configurar o {stackConfig.name}</h3>
                  <p>{stackConfig.helpText}</p>
                  
                  <h4>Passos para configuração:</h4>
                  <ol>
                    <li>Acesse sua instância do {stackConfig.name}</li>
                    <li>Gere uma chave API nas configurações</li>
                    <li>Copie a URL base da sua instância</li>
                    <li>Configure os campos obrigatórios</li>
                    <li>Teste a conexão</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Exemplos */}
          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exemplos de Configuração</CardTitle>
                <CardDescription>
                  Valores de exemplo para configurar {stackConfig.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stackConfig.examples).map(([key, value]) => {
                    const field = stackConfig.fields.find(f => f.key === key);
                    return (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{field?.label || key}</p>
                          <p className="text-sm text-gray-600 font-mono">{value}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, [key]: value }));
                            copyToClipboard(value);
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
