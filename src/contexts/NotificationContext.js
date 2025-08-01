import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');

  // Verificar suporte a notificações
  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Solicitar permissão para notificações
  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Notificações não são suportadas neste navegador');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notificações habilitadas! 🔔');
        return true;
      } else {
        toast.error('Permissão para notificações negada');
        return false;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao habilitar notificações');
      return false;
    }
  };

  // Enviar notificação no navegador
  const showBrowserNotification = (title, options = {}) => {
    if (permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'kryonix-notification',
      requireInteraction: false,
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close após 5 segundos
    setTimeout(() => {
      notification.close();
    }, 5000);
  };

  // Adicionar notificação interna
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Mostrar toast
    switch (notification.type) {
      case 'success':
        toast.success(notification.message);
        break;
      case 'error':
        toast.error(notification.message);
        break;
      case 'warning':
        toast(notification.message, { icon: '⚠️' });
        break;
      default:
        toast(notification.message);
    }

    // Mostrar notificação do navegador se permitido
    if (permission === 'granted' && notification.browser !== false) {
      showBrowserNotification(notification.title || 'KRYONIX', {
        body: notification.message,
        icon: notification.icon,
      });
    }
  };

  // Marcar notificação como lida
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Remover notificação
  const removeNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Limpar todas as notificações
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Notificações pré-definidas
  const notifySuccess = (message, options = {}) => {
    addNotification({
      type: 'success',
      title: 'Sucesso',
      message,
      ...options,
    });
  };

  const notifyError = (message, options = {}) => {
    addNotification({
      type: 'error',
      title: 'Erro',
      message,
      ...options,
    });
  };

  const notifyWarning = (message, options = {}) => {
    addNotification({
      type: 'warning',
      title: 'Atenção',
      message,
      ...options,
    });
  };

  const notifyInfo = (message, options = {}) => {
    addNotification({
      type: 'info',
      title: 'Informação',
      message,
      ...options,
    });
  };

  // Conectar com WebSocket para notificações em tempo real
  useEffect(() => {
    const token = localStorage.getItem('kryonix_token');
    if (!token) return;

    const wsUrl = process.env.REACT_APP_SOCKET_URL || 'wss://api.kryonix.com.br';
    const ws = new WebSocket(`${wsUrl}/notifications?token=${token}`);

    ws.onopen = () => {
      console.log('Conectado ao WebSocket de notificações');
    };

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        addNotification(notification);
      } catch (error) {
        console.error('Erro ao processar notificação:', error);
      }
    };

    ws.onclose = () => {
      console.log('Conexão WebSocket fechada');
    };

    ws.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const value = {
    notifications,
    unreadCount,
    isSupported,
    permission,
    requestPermission,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    showBrowserNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
