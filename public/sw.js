// KRYONIX Service Worker - Otimizado para usuários brasileiros
// Cache estratégico para redes 3G/4G brasileiras

const CACHE_NAME = 'kryonix-v1.0.0';
const STATIC_CACHE = 'kryonix-static-v1';
const DYNAMIC_CACHE = 'kryonix-dynamic-v1';
const API_CACHE = 'kryonix-api-v1';

// URLs críticas para cache (Core Shell + recursos brasileiros)
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html',
  // Fontes otimizadas para português brasileiro
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
];

// APIs críticas para cache
const API_ENDPOINTS = [
  '/api/auth/me',
  '/api/dashboard/stats',
  '/api/whatsapp/instances',
  '/api/billing/subscription',
];

// Recursos que podem ser atualizados em background
const BACKGROUND_SYNC_ENDPOINTS = [
  '/api/analytics',
  '/api/whatsapp/messages',
  '/api/notifications',
];

// Estratégias de cache por tipo de recurso
const CACHE_STRATEGIES = {
  // Cache First - Recursos estáticos
  static: ['js', 'css', 'woff2', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico'],
  
  // Network First - APIs críticas
  network: ['api/auth', 'api/payment', 'api/whatsapp/send'],
  
  // Stale While Revalidate - Dashboard e métricas
  stale: ['api/dashboard', 'api/analytics', 'api/stats'],
  
  // Cache Only - Recursos offline
  offline: ['offline.html', 'fallback']
};

// === INSTALAÇÃO DO SERVICE WORKER ===
self.addEventListener('install', event => {
  console.log('🇧🇷 KRYONIX SW: Instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cache de recursos estáticos
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Cacheando recursos estáticos...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cache de APIs críticas (pré-fetch para brasileiros)
      caches.open(API_CACHE).then(cache => {
        console.log('🔗 Pré-cacheando APIs críticas...');
        return Promise.allSettled(
          API_ENDPOINTS.map(url => 
            fetch(url)
              .then(response => response.ok ? cache.put(url, response.clone()) : null)
              .catch(() => console.log(`⚠️ Falha ao pré-cachear: ${url}`))
          )
        );
      }),
      
      // Auto-ativação
      self.skipWaiting()
    ])
  );
});

// === ATIVAÇÃO DO SERVICE WORKER ===
self.addEventListener('activate', event => {
  console.log('✅ KRYONIX SW: Ativado!');
  
  event.waitUntil(
    Promise.all([
      // Limpeza de caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== API_CACHE)
            .map(cacheName => {
              console.log(`🗑️ Removendo cache antigo: ${cacheName}`);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Controle imediato de clientes
      self.clients.claim()
    ])
  );
});

// === INTERCEPTAÇÃO DE REQUESTS ===
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests de outros domínios (exceto APIs conhecidas)
  if (!url.hostname.includes('localhost') && 
      !url.hostname.includes('kryonix.com.br') && 
      !url.hostname.includes('vercel.app')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

// === ESTRATÉGIAS DE CACHE ===
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const extension = pathname.split('.').pop();
  
  try {
    // 1. RECURSOS ESTÁTICOS - Cache First
    if (CACHE_STRATEGIES.static.includes(extension)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // 2. APIs CRÍTICAS - Network First com fallback
    if (pathname.includes('/api/auth') || 
        pathname.includes('/api/payment') || 
        pathname.includes('/api/whatsapp/send')) {
      return await networkFirst(request, API_CACHE);
    }
    
    // 3. DASHBOARD E MÉTRICAS - Stale While Revalidate
    if (pathname.includes('/api/dashboard') || 
        pathname.includes('/api/analytics') || 
        pathname.includes('/api/stats')) {
      return await staleWhileRevalidate(request, API_CACHE);
    }
    
    // 4. PÁGINAS HTML - Network First com fallback offline
    if (request.destination === 'document') {
      return await networkFirstWithOffline(request, DYNAMIC_CACHE);
    }
    
    // 5. OUTROS RECURSOS - Network First
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('❌ Erro no SW:', error);
    return await getOfflineFallback(request);
  }
}

// Cache First - Para recursos estáticos
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    // Atualizar em background se for crítico
    if (request.url.includes('main.css') || request.url.includes('bundle.js')) {
      fetch(request).then(response => {
        if (response.ok) cache.put(request, response.clone());
      }).catch(() => {}); // Silent fail para background updates
    }
    return cached;
  }
  
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// Network First - Para APIs e conteúdo dinâmico
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request, {
      // Timeout otimizado para redes brasileiras
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
    
  } catch (error) {
    console.log(`🔄 Network falhou, usando cache: ${request.url}`);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Fallback específico por tipo de API
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({
        error: 'Offline',
        message: 'Você está offline. Alguns dados podem estar desatualizados.',
        cached: true
      }), {
        status: 503,
        statusText: 'Service Unavailable (Offline)',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Stale While Revalidate - Para dashboard e métricas
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Fetch em background para atualizar
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    console.log(`🔄 Background update falhou: ${request.url}`);
  });
  
  // Retorna cache imediatamente se disponível
  if (cached) {
    return cached;
  }
  
  // Senão, espera o fetch
  return await fetchPromise;
}

// Network First com fallback offline para páginas HTML
async function networkFirstWithOffline(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request, {
      signal: AbortSignal.timeout(3000) // Timeout menor para páginas
    });
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
    
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // Página offline personalizada
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    // Fallback HTML mínimo
    return new Response(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>KRYONIX - Você está offline</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              text-align: center; 
              padding: 2rem;
              background: linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%);
              color: white;
              min-height: 100vh;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
            }
            .offline-container {
              background: white;
              color: #1f2937;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            .emoji { font-size: 3rem; margin-bottom: 1rem; }
            h1 { margin: 0 0 1rem 0; color: #22c55e; }
            button {
              background: #22c55e;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 1rem;
              margin-top: 1rem;
            }
            button:hover { background: #16a34a; }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="emoji">🇧🇷</div>
            <h1>KRYONIX</h1>
            <h2>Você está offline</h2>
            <p>Verifique sua conexão com a internet e tente novamente.</p>
            <button onclick="window.location.reload()">🔄 Tentar Novamente</button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

// Fallback offline genérico
async function getOfflineFallback(request) {
  if (request.destination === 'document') {
    return networkFirstWithOffline(request, DYNAMIC_CACHE);
  }
  
  // Para outros recursos, retorna erro
  return new Response('Offline', { 
    status: 503, 
    statusText: 'Service Unavailable' 
  });
}

// === BACKGROUND SYNC ===
self.addEventListener('sync', event => {
  console.log('🔄 Background Sync:', event.tag);
  
  if (event.tag === 'background-sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
  
  if (event.tag === 'background-sync-whatsapp') {
    event.waitUntil(syncWhatsAppMessages());
  }
});

async function syncAnalytics() {
  try {
    console.log('📊 Sincronizando analytics...');
    const response = await fetch('/api/analytics/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: Date.now() })
    });
    
    if (response.ok) {
      console.log('✅ Analytics sincronizado!');
    }
  } catch (error) {
    console.log('❌ Falha na sincronização de analytics:', error);
  }
}

async function syncWhatsAppMessages() {
  try {
    console.log('💬 Sincronizando mensagens WhatsApp...');
    // Implementar sincronização de mensagens offline
    const pendingMessages = await getStoredMessages();
    
    for (const message of pendingMessages) {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    }
    
    await clearStoredMessages();
    console.log('✅ Mensagens WhatsApp sincronizadas!');
  } catch (error) {
    console.log('❌ Falha na sincronização WhatsApp:', error);
  }
}

// === PUSH NOTIFICATIONS ===
self.addEventListener('push', event => {
  console.log('🔔 Push notification recebida');
  
  const options = {
    body: 'Você tem novas atualizações na sua conta KRYONIX!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    tag: 'kryonix-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: '🇧🇷 Abrir KRYONIX',
        icon: '/icons/action-open.png'
      },
      {
        action: 'dismiss',
        title: 'Dispensar',
        icon: '/icons/action-dismiss.png'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'KRYONIX';
    options.data = data;
  }
  
  event.waitUntil(
    self.registration.showNotification('KRYONIX', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
  console.log('🔔 Clique em notificação:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Se já tem uma janela aberta, foca nela
        for (const client of clientList) {
          if (client.url.includes('kryonix') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Senão, abre nova janela
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// === UTILIDADES ===
async function getStoredMessages() {
  // Implementar storage de mensagens offline
  return [];
}

async function clearStoredMessages() {
  // Implementar limpeza de mensagens
}

// === DEBUG ===
console.log('🇧🇷 KRYONIX Service Worker carregado! Versão:', CACHE_NAME);
