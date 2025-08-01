// 💬 KRYONIX - Integração WhatsApp com Evolution API
// Autenticação e notificações via WhatsApp
// Sistema inteligente para usuários brasileiros

class WhatsAppAuth {
    constructor() {
        this.apiUrl = 'https://api.kryonix.com.br';
        this.globalApiKey = '2f4d6967043b87b5ebee57b872e0223a';
        this.instanceName = 'kryonix-auth';
        this.adminPhone = '5517981805327';
        
        this.config = {
            webhook: 'https://www.kryonix.com.br/api/whatsapp-webhook',
            webhookByEvents: false,
            webhookBase64: false,
            chatwootAccountId: false,
            chatwootToken: false,
            chatwootUrl: false,
            chatwootSignMsg: false,
            chatwootReopenConversation: false,
            chatwootConversationPending: false
        };
    }

    // 🚀 Inicializar instância WhatsApp
    async inicializar() {
        try {
            console.log('🔄 Inicializando instância WhatsApp...');
            
            const response = await fetch(`${this.apiUrl}/instance/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.globalApiKey
                },
                body: JSON.stringify({
                    instanceName: this.instanceName,
                    token: this.globalApiKey,
                    qrcode: true,
                    markMessagesRead: true,
                    delayMessage: 1000,
                    msgRetryCounterValue: 3,
                    webhook: this.config.webhook,
                    webhookByEvents: this.config.webhookByEvents,
                    webhookBase64: this.config.webhookBase64,
                    chatwootAccountId: this.config.chatwootAccountId,
                    chatwootToken: this.config.chatwootToken,
                    chatwootUrl: this.config.chatwootUrl,
                    chatwootSignMsg: this.config.chatwootSignMsg
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                console.log('✅ Instância WhatsApp criada com sucesso');
                return result;
            } else {
                console.error('❌ Erro ao criar instância:', result);
                return null;
            }
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            return null;
        }
    }

    // 📱 Obter QR Code para conectar
    async obterQRCode() {
        try {
            const response = await fetch(`${this.apiUrl}/instance/connect/${this.instanceName}`, {
                method: 'GET',
                headers: {
                    'apikey': this.globalApiKey
                }
            });

            const result = await response.json();
            
            if (response.ok && result.base64) {
                console.log('📱 QR Code obtido com sucesso');
                return result.base64;
            } else {
                console.error('❌ Erro ao obter QR Code:', result);
                return null;
            }
        } catch (error) {
            console.error('❌ Erro ao obter QR Code:', error);
            return null;
        }
    }

    // 🔐 Enviar código de autenticação via WhatsApp
    async enviarCodigoAuth(telefone, codigo) {
        const numero = this.formatarTelefone(telefone);
        
        const mensagem = `🔐 *KRYONIX - Código de Verificação*\n\n` +
                        `Seu código de acesso é: *${codigo}*\n\n` +
                        `⏰ Este código expira em 5 minutos\n` +
                        `🔒 Não compartilhe este código com ninguém\n\n` +
                        `Se você não solicitou este código, ignore esta mensagem.\n\n` +
                        `_Mensagem automática do sistema KRYONIX_`;

        return await this.enviarMensagem(numero, mensagem);
    }

    // 🎉 Notificar login bem-sucedido
    async notificarLoginSucesso(telefone, nomeUsuario, dispositivo = 'Web') {
        const numero = this.formatarTelefone(telefone);
        
        const mensagem = `🎉 *Login realizado com sucesso!*\n\n` +
                        `👋 Olá *${nomeUsuario}*!\n\n` +
                        `✅ Você acabou de fazer login na plataforma KRYONIX\n` +
                        `📱 Dispositivo: ${dispositivo}\n` +
                        `⏰ Horário: ${new Date().toLocaleString('pt-BR')}\n\n` +
                        `🚀 Sua plataforma de IA está pronta para uso!\n\n` +
                        `Acesse: https://www.kryonix.com.br\n\n` +
                        `_Sistema de segurança KRYONIX_`;

        return await this.enviarMensagem(numero, mensagem);
    }

    // ⚠️ Notificar tentativa de login suspeita
    async notificarLoginSuspeito(telefone, ip, localizacao) {
        const numero = this.formatarTelefone(telefone);
        
        const mensagem = `⚠️ *ALERTA DE SEGURANÇA*\n\n` +
                        `Detectamos uma tentativa de login na sua conta KRYONIX:\n\n` +
                        `📍 IP: ${ip}\n` +
                        `🌍 Localização: ${localizacao}\n` +
                        `⏰ Horário: ${new Date().toLocaleString('pt-BR')}\n\n` +
                        `❓ Foi você quem tentou fazer login?\n\n` +
                        `Se sim, ignore esta mensagem.\n` +
                        `Se não, recomendamos trocar sua senha imediatamente.\n\n` +
                        `🔒 Sua segurança é nossa prioridade!\n\n` +
                        `_Sistema de segurança KRYONIX_`;

        return await this.enviarMensagem(numero, mensagem);
    }

    // 📊 Notificar administrador sobre eventos importantes
    async notificarAdmin(evento, detalhes) {
        const mensagem = `🤖 *KRYONIX - Notificação do Sistema*\n\n` +
                        `📋 Evento: ${evento}\n` +
                        `📝 Detalhes: ${detalhes}\n` +
                        `⏰ Horário: ${new Date().toLocaleString('pt-BR')}\n\n` +
                        `_Monitoramento automático ativo_`;

        return await this.enviarMensagem(this.adminPhone, mensagem);
    }

    // 💬 Enviar mensagem genérica
    async enviarMensagem(numero, mensagem) {
        try {
            const response = await fetch(`${this.apiUrl}/message/sendText/${this.instanceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.globalApiKey
                },
                body: JSON.stringify({
                    number: numero,
                    text: mensagem,
                    delay: 1000
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                console.log(`✅ Mensagem enviada para ${numero}`);
                return true;
            } else {
                console.error('❌ Erro ao enviar mensagem:', result);
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            return false;
        }
    }

    // 📱 Formatar número de telefone brasileiro
    formatarTelefone(telefone) {
        // Remove caracteres especiais
        let numero = telefone.replace(/\D/g, '');
        
        // Adiciona código do país se não tiver
        if (!numero.startsWith('55')) {
            numero = '55' + numero;
        }
        
        // Adiciona 9 no celular se necessário
        if (numero.length === 12 && !numero.substr(4, 1) === '9') {
            numero = numero.substr(0, 4) + '9' + numero.substr(4);
        }
        
        return numero + '@s.whatsapp.net';
    }

    // 📊 Verificar status da instância
    async verificarStatus() {
        try {
            const response = await fetch(`${this.apiUrl}/instance/connectionState/${this.instanceName}`, {
                method: 'GET',
                headers: {
                    'apikey': this.globalApiKey
                }
            });

            const result = await response.json();
            
            if (response.ok) {
                return result.instance.state === 'open';
            } else {
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao verificar status:', error);
            return false;
        }
    }

    // 🔄 Reconectar instância se necessário
    async reconectar() {
        try {
            console.log('🔄 Tentando reconectar instância WhatsApp...');
            
            const response = await fetch(`${this.apiUrl}/instance/restart/${this.instanceName}`, {
                method: 'PUT',
                headers: {
                    'apikey': this.globalApiKey
                }
            });

            if (response.ok) {
                console.log('✅ Instância reconectada com sucesso');
                return true;
            } else {
                console.error('❌ Erro ao reconectar instância');
                return false;
            }
        } catch (error) {
            console.error('❌ Erro na reconexão:', error);
            return false;
        }
    }

    // 🤖 Monitoramento automático da conexão
    iniciarMonitoramento() {
        console.log('🤖 Iniciando monitoramento automático WhatsApp...');
        
        setInterval(async () => {
            const status = await this.verificarStatus();
            
            if (!status) {
                console.log('⚠️ WhatsApp desconectado, tentando reconectar...');
                await this.reconectar();
                
                // Notificar admin sobre a reconexão
                await this.notificarAdmin(
                    'WhatsApp Reconectado',
                    'Sistema WhatsApp foi reconectado automaticamente'
                );
            }
        }, 300000); // Verificar a cada 5 minutos
    }
}

// 🚀 Inicializar WhatsApp Auth automaticamente
let whatsappAuth;

async function inicializarWhatsAppAuth() {
    whatsappAuth = new WhatsAppAuth();
    
    // Tentar inicializar a instância
    const result = await whatsappAuth.inicializar();
    
    if (result) {
        console.log('✅ WhatsApp Auth inicializado com sucesso');
        
        // Iniciar monitoramento automático
        whatsappAuth.iniciarMonitoramento();
        
        // Notificar admin que o sistema está ativo
        await whatsappAuth.notificarAdmin(
            'Sistema Iniciado',
            'KRYONIX Parte 1 - Sistema de autenticação WhatsApp ativo'
        );
    } else {
        console.error('❌ Falha ao inicializar WhatsApp Auth');
    }
}

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WhatsAppAuth, inicializarWhatsAppAuth };
}

// Auto-inicializar se estiver no browser
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', inicializarWhatsAppAuth);
}

console.log('📱 WhatsApp Auth carregado - KRYONIX Parte 1');
