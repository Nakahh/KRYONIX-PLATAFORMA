import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Bot, 
  Users, 
  Send,
  Phone,
  MoreVertical,
  Archive,
  Clock,
  CheckCheck
} from 'lucide-react';

const WhatsApp = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de conversas
    const loadConversations = async () => {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockConversations = [
        {
          id: 1,
          name: 'Maria Silva',
          avatar: '👩‍💼',
          lastMessage: 'Olá! Gostaria de saber mais sobre os planos',
          timestamp: '10:30',
          unread: 2,
          online: true,
          type: 'customer'
        },
        {
          id: 2,
          name: 'João Santos',
          avatar: '👨‍💻',
          lastMessage: 'Perfeito! Vou finalizar a compra agora',
          timestamp: '09:45',
          unread: 0,
          online: false,
          type: 'customer'
        },
        {
          id: 3,
          name: 'Bot Assistant',
          avatar: '🤖',
          lastMessage: 'Automatizei 5 novos atendimentos',
          timestamp: '09:20',
          unread: 1,
          online: true,
          type: 'bot'
        },
        {
          id: 4,
          name: 'Ana Costa',
          avatar: '👩‍🎨',
          lastMessage: 'Obrigada pelo ótimo atendimento!',
          timestamp: 'Ontem',
          unread: 0,
          online: false,
          type: 'customer'
        }
      ];
      
      setConversations(mockConversations);
      setIsLoading(false);
    };

    loadConversations();
  }, []);

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    
    // Aqui você implementaria o envio da mensagem
    console.log('Enviando mensagem:', newMessage, 'para:', selectedChat.name);
    setNewMessage('');
  };

  const ConversationItem = ({ conversation, isSelected, onClick }) => (
    <div
      onClick={() => onClick(conversation)}
      className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
        isSelected ? 'bg-kryonix-50 dark:bg-kryonix-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg">
            {conversation.avatar}
          </div>
          {conversation.online && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          )}
          {conversation.type === 'bot' && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot size={10} className="text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {conversation.name}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {conversation.timestamp}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {conversation.lastMessage}
            </p>
            {conversation.unread > 0 && (
              <span className="bg-kryonix-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
                {conversation.unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <MessageCircle size={20} className="text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  WhatsApp Business
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {conversations.length} conversas ativas
                </p>
              </div>
            </div>
            
            <button className="w-10 h-10 bg-kryonix-600 text-white rounded-xl flex items-center justify-center hover:bg-kryonix-700 transition-colors">
              <Plus size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Conversations List */}
        <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-kryonix-500 focus:border-kryonix-500 text-sm"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <Users size={16} className="mx-auto text-blue-600 mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Ativos</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">156</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <Bot size={16} className="mx-auto text-green-600 mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Bots</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">8</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <Archive size={16} className="mx-auto text-purple-600 mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Arquiv.</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">23</p>
              </div>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full loading-shimmer"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded loading-shimmer mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded loading-shimmer w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              filteredConversations.map(conversation => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={selectedChat?.id === conversation.id}
                  onClick={setSelectedChat}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col bg-white dark:bg-gray-800">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    {selectedChat.avatar}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {selectedChat.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedChat.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Phone size={20} />
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                <div className="space-y-4">
                  {/* Mensagem recebida */}
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm">
                      {selectedChat.avatar}
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md p-3 max-w-xs shadow-sm">
                      <p className="text-gray-900 dark:text-white text-sm">
                        Olá! Gostaria de saber mais sobre os planos disponíveis.
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          10:30
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mensagem enviada */}
                  <div className="flex items-start justify-end space-x-2">
                    <div className="bg-kryonix-600 text-white rounded-2xl rounded-tr-md p-3 max-w-xs">
                      <p className="text-sm">
                        Claro! Temos planos personalizados para cada necessidade. Posso te ajudar a encontrar o ideal para você.
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-kryonix-100">
                          10:32
                        </span>
                        <CheckCheck size={14} className="text-kryonix-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-kryonix-500 focus:border-kryonix-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 bg-kryonix-600 text-white rounded-full flex items-center justify-center hover:bg-kryonix-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Escolha uma conversa para começar a conversar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsApp;
