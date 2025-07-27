import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useWhatsAppStats } from '../hooks/use-brazilian-kpis';
import { formatLargeNumber } from '../lib/brazilian-formatters';
import { 
  MessageCircle, 
  Users, 
  Send, 
  ArrowLeft,
  Upload,
  Image,
  FileText,
  Calendar,
  Clock,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Página de Campanhas WhatsApp - Envio em massa para base brasileira
 * KRYONIX - Marketing direto no canal preferido dos brasileiros
 */

export default function WhatsAppBroadcast() {
  const { data: whatsappStats } = useWhatsAppStats();
  const navigate = useNavigate();
  
  const [campaignData, setCampaignData] = useState({
    name: '',
    message: '',
    target: 'all',
    mediaUrl: '',
    scheduledFor: '',
    instance: '',
  });
  
  const [step, setStep] = useState(1);
  const [isPreview, setIsPreview] = useState(false);

  const handleSendCampaign = () => {
    // TODO: Implementar envio real via Evolution API
    console.log('Enviando campanha:', campaignData);
    alert('🚀 Campanha enviada com sucesso! Os resultados aparecerão no Analytics.');
    navigate('/whatsapp/analytics');
  };

  const estimatedReach = whatsappStats?.active_contacts || 0;
  const estimatedCost = Math.ceil(estimatedReach * 0.05); // R$ 0,05 por mensagem

  return (
    <AppLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <MessageCircle className="h-8 w-8 text-green-600 mr-3" />
                Campanha WhatsApp
              </h1>
              <p className="text-gray-600 mt-2">
                Envie mensagens personalizadas para sua base de clientes
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Users className="h-3 w-3 mr-1" />
              {formatLargeNumber(estimatedReach)} contatos
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Target className="h-3 w-3 mr-1" />
              Alcance estimado: {formatLargeNumber(estimatedReach * 0.8)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário da Campanha */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step >= stepNumber 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`flex-1 h-1 ${
                      step > stepNumber ? 'bg-green-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Passo 1: Conteúdo da Mensagem
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Campanha
                    </label>
                    <Input
                      placeholder="Ex: Promoção Black Friday 2024"
                      value={campaignData.name}
                      onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem
                    </label>
                    <Textarea
                      placeholder="🎉 Olá! Temos uma oferta especial para você..."
                      rows={6}
                      value={campaignData.message}
                      onChange={(e) => setCampaignData({...campaignData, message: e.target.value})}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {campaignData.message.length}/1000 caracteres
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mídia (Opcional)
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="URL da imagem ou vídeo"
                        value={campaignData.mediaUrl}
                        onChange={(e) => setCampaignData({...campaignData, mediaUrl: e.target.value})}
                      />
                      <Button variant="outline">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setStep(2)}
                    disabled={!campaignData.name || !campaignData.message}
                  >
                    Próximo: Selecionar Público
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Passo 2: Público-Alvo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="target"
                        value="all"
                        checked={campaignData.target === 'all'}
                        onChange={(e) => setCampaignData({...campaignData, target: e.target.value})}
                      />
                      <div className="flex-1">
                        <div className="font-medium">Todos os Contatos</div>
                        <div className="text-sm text-gray-600">
                          {formatLargeNumber(estimatedReach)} contatos ativos
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="target"
                        value="recent"
                        checked={campaignData.target === 'recent'}
                        onChange={(e) => setCampaignData({...campaignData, target: e.target.value})}
                      />
                      <div className="flex-1">
                        <div className="font-medium">Contatos Recentes</div>
                        <div className="text-sm text-gray-600">
                          Conversaram nos últimos 30 dias ({formatLargeNumber(Math.floor(estimatedReach * 0.6))} contatos)
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="target"
                        value="segments"
                        checked={campaignData.target === 'segments'}
                        onChange={(e) => setCampaignData({...campaignData, target: e.target.value})}
                      />
                      <div className="flex-1">
                        <div className="font-medium">Segmentos Específicos</div>
                        <div className="text-sm text-gray-600">
                          Clientes, leads, prospects... (configurar filtros)
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instância WhatsApp
                    </label>
                    <select 
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={campaignData.instance}
                      onChange={(e) => setCampaignData({...campaignData, instance: e.target.value})}
                    >
                      <option value="">Selecione a instância</option>
                      <option value="main">Atendimento Principal (+55 17 98180-5327)</option>
                      <option value="sales">Vendas (+55 17 99999-9999)</option>
                      <option value="support">Suporte (+55 17 88888-8888)</option>
                    </select>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Voltar
                    </Button>
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => setStep(3)}
                      disabled={!campaignData.instance}
                    >
                      Próximo: Agendar Envio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Passo 3: Agendamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="schedule"
                        value="now"
                        checked={!campaignData.scheduledFor}
                        onChange={() => setCampaignData({...campaignData, scheduledFor: ''})}
                      />
                      <div className="flex-1">
                        <div className="font-medium flex items-center">
                          <Zap className="h-4 w-4 mr-1 text-orange-600" />
                          Enviar Agora
                        </div>
                        <div className="text-sm text-gray-600">
                          Campanha será enviada imediatamente
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="schedule"
                        value="later"
                        checked={!!campaignData.scheduledFor}
                        onChange={() => setCampaignData({...campaignData, scheduledFor: new Date().toISOString().slice(0, 16)})}
                      />
                      <div className="flex-1">
                        <div className="font-medium flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-blue-600" />
                          Agendar Para Depois
                        </div>
                        <div className="text-sm text-gray-600">
                          Escolha data e horário ideal
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  {campaignData.scheduledFor && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data e Horário
                      </label>
                      <Input
                        type="datetime-local"
                        value={campaignData.scheduledFor}
                        onChange={(e) => setCampaignData({...campaignData, scheduledFor: e.target.value})}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                      <div className="text-xs text-blue-600 mt-1">
                        💡 Melhor horário: 14:00-18:00 (horário de pico dos brasileiros)
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1"
                    >
                      Voltar
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setIsPreview(true)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleSendCampaign}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {campaignData.scheduledFor ? 'Agendar' : 'Enviar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resumo da Campanha */}
          <div className="space-y-6">
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="text-green-700">Resumo da Campanha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Nome</div>
                  <div className="font-medium">{campaignData.name || 'Sem nome'}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Público-alvo</div>
                  <div className="font-medium">
                    {campaignData.target === 'all' && `Todos (${formatLargeNumber(estimatedReach)})`}
                    {campaignData.target === 'recent' && `Recentes (${formatLargeNumber(Math.floor(estimatedReach * 0.6))})`}
                    {campaignData.target === 'segments' && 'Segmentos específicos'}
                    {!campaignData.target && 'Não selecionado'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Instância</div>
                  <div className="font-medium">
                    {campaignData.instance === 'main' && 'Atendimento Principal'}
                    {campaignData.instance === 'sales' && 'Vendas'}
                    {campaignData.instance === 'support' && 'Suporte'}
                    {!campaignData.instance && 'Não selecionada'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Agendamento</div>
                  <div className="font-medium">
                    {campaignData.scheduledFor 
                      ? new Date(campaignData.scheduledFor).toLocaleString('pt-BR')
                      : 'Envio imediato'
                    }
                  </div>
                </div>
                
                <hr />
                
                <div>
                  <div className="text-sm text-gray-600">Custo estimado</div>
                  <div className="font-medium text-green-600">R$ {estimatedCost.toFixed(2)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Alcance estimado</div>
                  <div className="font-medium text-blue-600">
                    {formatLargeNumber(Math.floor(estimatedReach * 0.8))} pessoas
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dicas */}
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="text-amber-700 text-sm">💡 Dicas para Melhor Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Use emojis para chamar atenção</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Personalize com o nome do cliente</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Inclua call-to-action claro</span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Evite palavras que podem ser spam</span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Respeite horário comercial brasileiro</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Modal */}
        {isPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Preview da Mensagem</h3>
                <Button variant="outline" size="sm" onClick={() => setIsPreview(false)}>
                  ✕
                </Button>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">KRYONIX</div>
                    <div className="text-xs text-gray-600">agora</div>
                  </div>
                </div>
                
                {campaignData.mediaUrl && (
                  <div className="mb-2">
                    <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                )}
                
                <div className="text-sm">
                  {campaignData.message || 'Sua mensagem aparecerá aqui...'}
                </div>
              </div>
              
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setIsPreview(false)}
              >
                Fechar Preview
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
