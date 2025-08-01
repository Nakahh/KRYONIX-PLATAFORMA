// 📱 KRYONIX - Service Worker PWA
// Mobile-first, offline-first, inteligência integrada

const CACHE_NAME = 'kryonix-pwa-v1.0.0';
const OFFLINE_PAGE = '/offline.html';

// Recursos essenciais para cache
const ESSENTIAL_RESOURCES = [
  '/',
  '/progresso',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Recursos de API para cache inteligente
const API_RESOURCES = [
  '/api/status',
  '/health',
  '/api/progress'
];

// 🚀 Instalação do SW
self.addEventListener('install', event => {
  console.log('🔧 KRYONIX PWA: Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 KRYONIX PWA: Fazendo cache dos recursos essenciais');
        return cache.addAll(ESSENTIAL_RESOURCES);
      })
      .then(() => {
        console.log('✅ KRYONIX PWA: Service Worker instalado com sucesso');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ KRYONIX PWA: Erro na instalação:', error);
      })
  );
});

// 🔄 Ativação do SW
self.addEventListener('activate', event => {
  console.log('🔄 KRYONIX PWA: Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ KRYONIX PWA: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ KRYONIX PWA: Service Worker ativado');
        return self.clients.claim();
      })
  );
});

// 🌐 Interceptação de requisições - Estratégia inteligente
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignorar requisições não HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // Estratégias diferentes por tipo de recurso
  if (url.pathname.startsWith('/api/')) {
    // API: Network First com fallback
    event.respondWith(networkFirstWithFallback(request));
  } else if (url.pathname.includes('.')) {
    // Assets estáticos: Cache First
    event.respondWith(cacheFirstWithUpdate(request));
  } else {
    // Páginas HTML: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request));
  }
});

// 📶 Network First - Para APIs críticas
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Atualizar cache com resposta da rede
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Resposta da rede não OK');
  } catch (error) {
    console.log('🔄 KRYONIX PWA: Usando cache para API:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para offline
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Dados não disponíveis offline',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 🏪 Cache First - Para assets estáticos
async function cacheFirstWithUpdate(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Atualizar cache em background
    fetch(request).then(response => {
      if (response.ok) {
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, response);
        });
      }
    }).catch(() => {
      // Ignora erros de atualização em background
    });
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('❌ KRYONIX PWA: Falha ao carregar:', request.url);
    
    // Fallback genérico
    if (request.url.includes('.html')) {
      return caches.match(OFFLINE_PAGE);
    }
    
    return new Response('Recurso não disponível offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// 🔄 Stale While Revalidate - Para páginas HTML
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Buscar versão atualizada em background
  const networkPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => {
      // Ignora erros de rede
    });
  
  // Retornar cache imediatamente se disponível
  if (cachedResponse) {
    networkPromise; // Continua em background
    return cachedResponse;
  }
  
  try {
    return await networkPromise;
  } catch (error) {
    console.log('🔄 KRYONIX PWA: Usando página offline');
    return cache.match(OFFLINE_PAGE);
  }
}

// 📱 Notificações Push - Preparado para futuro
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Nova atualização na KRYONIX',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: data.tag || 'kryonix-notification',
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Abrir KRYONIX',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'KRYONIX',
      options
    )
  );
});

// 🎯 Cliques em notificações
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(clientList => {
          // Se já tem uma janela aberta, focar nela
          for (const client of clientList) {
            if (client.url.includes('kryonix.com.br') && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Senão, abrir nova janela
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// 📊 Mensagens do aplicativo
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    caches.open(CACHE_NAME)
      .then(cache => cache.keys())
      .then(keys => {
        event.ports[0].postMessage({
          type: 'CACHE_SIZE',
          size: keys.length
        });
      });
  }
});

// 🔧 Sincronização em background (futuro)
self.addEventListener('sync', event => {
  if (event.tag === 'kryonix-sync') {
    event.waitUntil(
      syncKryonixData()
    );
  }
});

async function syncKryonixData() {
  try {
    console.log('🔄 KRYONIX PWA: Sincronizando dados...');
    
    // Implementar sincronização inteligente
    const pendingData = await getPendingSync();
    
    if (pendingData.length > 0) {
      await Promise.all(
        pendingData.map(data => uploadData(data))
      );
      
      await clearPendingSync();
      console.log('✅ KRYONIX PWA: Sincronização completa');
    }
  } catch (error) {
    console.error('❌ KRYONIX PWA: Erro na sincronização:', error);
  }
}

// Funções auxiliares (implementar conforme necessário)
async function getPendingSync() {
  // Implementar: buscar dados pendentes de sincronização
  return [];
}

async function uploadData(data) {
  // Implementar: enviar dados para servidor
  return fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

async function clearPendingSync() {
  // Implementar: limpar dados sincronizados
  console.log('🗑️ KRYONIX PWA: Limpando dados sincronizados');
}

console.log('🚀 KRYONIX PWA Service Worker carregado - Mobile-First Ready!');
