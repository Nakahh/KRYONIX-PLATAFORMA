// KRYONIX Advanced Service Worker - PWA Completo
// Otimizado para usuários brasileiros com funcionalidades offline avançadas

const CACHE_VERSION = "v2.0.0";
const CACHE_NAME = `kryonix-${CACHE_VERSION}`;

// Caches separados por categoria
const CACHES = {
  STATIC: `static-${CACHE_VERSION}`,
  DYNAMIC: `dynamic-${CACHE_VERSION}`,
  API: `api-${CACHE_VERSION}`,
  IMAGES: `images-${CACHE_VERSION}`,
  FONTS: `fonts-${CACHE_VERSION}`,
  OFFLINE: `offline-${CACHE_VERSION}`,
};

// URLs essenciais para funcionamento offline
const ESSENTIAL_URLS = [
  "/",
  "/dashboard",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// APIs críticas para cache offline
const CRITICAL_APIS = [
  "/api/auth/me",
  "/api/dashboard/stats",
  "/api/whatsapp/instances",
  "/api/billing/subscription",
];

// Dados que podem ser sincronizados em background
const BACKGROUND_SYNC_TAGS = {
  WHATSAPP_MESSAGES: "whatsapp-messages",
  ANALYTICS_DATA: "analytics-data",
  USER_PREFERENCES: "user-preferences",
  OFFLINE_ACTIONS: "offline-actions",
};

// IndexedDB para armazenamento offline avançado
class OfflineStorage {
  constructor() {
    this.dbName = "kryonix-offline";
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store para mensagens WhatsApp offline
        if (!db.objectStoreNames.contains("whatsapp_queue")) {
          const whatsappStore = db.createObjectStore("whatsapp_queue", {
            keyPath: "id",
            autoIncrement: true,
          });
          whatsappStore.createIndex("timestamp", "timestamp");
          whatsappStore.createIndex("status", "status");
        }

        // Store para dados de analytics offline
        if (!db.objectStoreNames.contains("analytics_queue")) {
          const analyticsStore = db.createObjectStore("analytics_queue", {
            keyPath: "id",
            autoIncrement: true,
          });
          analyticsStore.createIndex("timestamp", "timestamp");
        }

        // Store para ações do usuário offline
        if (!db.objectStoreNames.contains("user_actions")) {
          const actionsStore = db.createObjectStore("user_actions", {
            keyPath: "id",
            autoIncrement: true,
          });
          actionsStore.createIndex("timestamp", "timestamp");
          actionsStore.createIndex("type", "type");
        }

        // Store para configurações do usuário
        if (!db.objectStoreNames.contains("user_settings")) {
          db.createObjectStore("user_settings", { keyPath: "key" });
        }
      };
    });
  }

  async addToQueue(storeName, data) {
    if (!this.db) await this.init();

    const transaction = this.db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);

    return store.add({
      ...data,
      timestamp: Date.now(),
      synced: false,
    });
  }

  async getUnsynced(storeName) {
    if (!this.db) await this.init();

    const transaction = this.db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const items = request.result.filter((item) => !item.synced);
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async markAsSynced(storeName, id) {
    if (!this.db) await this.init();

    const transaction = this.db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);

    const item = await new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (item) {
      item.synced = true;
      return store.put(item);
    }
  }

  async clearSynced(storeName) {
    if (!this.db) await this.init();

    const transaction = this.db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const index = store.index("timestamp");

    // Remover itens sincronizados há mais de 7 dias
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const range = IDBKeyRange.upperBound(weekAgo);

    return new Promise((resolve, reject) => {
      const request = index.openCursor(range);
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && cursor.value.synced) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

const offlineStorage = new OfflineStorage();

// === INSTALAÇÃO ===
self.addEventListener("install", (event) => {
  console.log("🇧🇷 KRYONIX SW: Instalando versão avançada...");

  event.waitUntil(
    Promise.all([
      // Cache essencial
      caches.open(CACHES.STATIC).then((cache) => {
        console.log("📦 Cacheando recursos essenciais...");
        return cache.addAll(ESSENTIAL_URLS);
      }),

      // Cache APIs críticas
      caches.open(CACHES.API).then((cache) => {
        console.log("🔗 Pré-cacheando APIs críticas...");
        return Promise.allSettled(
          CRITICAL_APIS.map((url) =>
            fetch(url)
              .then((response) =>
                response.ok ? cache.put(url, response.clone()) : null,
              )
              .catch(() => console.log(`⚠️ Falha ao pré-cachear: ${url}`)),
          ),
        );
      }),

      // Inicializar storage offline
      offlineStorage.init(),

      // Pular espera para ativação imediata
      self.skipWaiting(),
    ]),
  );
});

// === ATIVAÇÃO ===
self.addEventListener("activate", (event) => {
  console.log("✅ KRYONIX SW: Ativado (versão avançada)!");

  event.waitUntil(
    Promise.all([
      // Limpeza de caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith("kryonix-") &&
                !Object.values(CACHES).includes(cacheName),
            )
            .map((cacheName) => {
              console.log(`🗑️ Removendo cache antigo: ${cacheName}`);
              return caches.delete(cacheName);
            }),
        );
      }),

      // Limpeza do storage offline
      offlineStorage.clearSynced("whatsapp_queue"),
      offlineStorage.clearSynced("analytics_queue"),
      offlineStorage.clearSynced("user_actions"),

      // Controle imediato
      self.clients.claim(),
    ]),
  );
});

// === INTERCEPTAÇÃO DE REQUESTS ===
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests externos (exceto APIs conhecidas)
  if (
    !url.hostname.includes("localhost") &&
    !url.hostname.includes("kryonix.com.br") &&
    !url.hostname.includes("vercel.app") &&
    !url.hostname.includes("netlify.app")
  ) {
    return;
  }

  event.respondWith(handleAdvancedRequest(request));
});

// === ESTRATÉGIAS AVANÇADAS DE CACHE ===
async function handleAdvancedRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // 1. RECURSOS ESTÁTICOS - Cache First com update em background
    if (isStaticResource(pathname)) {
      return await cacheFirstWithBackgroundUpdate(request, CACHES.STATIC);
    }

    // 2. IMAGENS - Cache com compressão inteligente
    if (isImageResource(pathname)) {
      return await imageOptimizedCache(request, CACHES.IMAGES);
    }

    // 3. FONTES - Cache permanente
    if (isFontResource(pathname)) {
      return await cacheFirst(request, CACHES.FONTS);
    }

    // 4. APIs CRÍTICAS - Network first com fallback offline inteligente
    if (isCriticalAPI(pathname)) {
      return await networkFirstWithOfflineSupport(request, CACHES.API);
    }

    // 5. APIs NORMAIS - Stale while revalidate
    if (pathname.startsWith("/api/")) {
      return await staleWhileRevalidate(request, CACHES.API);
    }

    // 6. PÁGINAS - Network first com offline page
    if (request.destination === "document") {
      return await networkFirstWithOfflinePage(request, CACHES.DYNAMIC);
    }

    // 7. OUTROS RECURSOS - Network first
    return await networkFirst(request, CACHES.DYNAMIC);
  } catch (error) {
    console.error("❌ Erro no SW:", error);
    return await getOfflineFallback(request);
  }
}

// Verificadores de tipo de recurso
function isStaticResource(pathname) {
  return (
    /\.(js|css|woff2|woff|ttf|eot)$/.test(pathname) ||
    pathname.includes("/static/") ||
    pathname === "/manifest.json"
  );
}

function isImageResource(pathname) {
  return /\.(png|jpg|jpeg|gif|svg|webp|avif|ico)$/.test(pathname);
}

function isFontResource(pathname) {
  return /\.(woff2|woff|ttf|eot)$/.test(pathname);
}

function isCriticalAPI(pathname) {
  return CRITICAL_APIS.some((api) => pathname.startsWith(api));
}

// Cache First com update em background
async function cacheFirstWithBackgroundUpdate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    // Atualizar em background
    updateInBackground(request, cache);
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// Update em background
async function updateInBackground(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
      console.log(`🔄 Background update: ${request.url}`);
    }
  } catch (error) {
    console.log(`❌ Background update failed: ${request.url}`);
  }
}

// Cache otimizado para imagens
async function imageOptimizedCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) return cached;

  try {
    const response = await fetch(request);

    if (response.ok) {
      // Só cachear imagens menores que 1MB
      const contentLength = response.headers.get("content-length");
      if (!contentLength || parseInt(contentLength) < 1024 * 1024) {
        cache.put(request, response.clone());
      }
    }

    return response;
  } catch (error) {
    // Retornar placeholder se offline
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Offline</text></svg>',
      { headers: { "Content-Type": "image/svg+xml" } },
    );
  }
}

// Network first com suporte offline inteligente
async function networkFirstWithOfflineSupport(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request, {
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      cache.put(request, response.clone());
      return response;
    }

    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.log(`🔄 Network falhou, tentando cache: ${request.url}`);

    const cached = await cache.match(request);
    if (cached) {
      // Adicionar header indicando que é cache
      const headers = new Headers(cached.headers);
      headers.set("X-Served-By", "service-worker-cache");
      headers.set("X-Cache-Date", cached.headers.get("date") || "unknown");

      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: headers,
      });
    }

    // Fallback para dados offline específicos
    return await getOfflineAPIFallback(request);
  }
}

// Fallback offline para APIs
async function getOfflineAPIFallback(request) {
  const url = new URL(request.url);

  // Fallbacks específicos por endpoint
  const fallbacks = {
    "/api/auth/me": {
      user: {
        id: "offline",
        name: "Usuário Offline",
        email: "offline@kryonix.com.br",
      },
      offline: true,
    },
    "/api/dashboard/stats": {
      stats: {
        whatsapp: { sent: 0, received: 0 },
        revenue: { total: 0, monthly: 0 },
        users: { active: 0, total: 0 },
      },
      offline: true,
      message: "Dados salvos localmente",
    },
    "/api/whatsapp/instances": {
      instances: [],
      offline: true,
      message: "Conecte-se à internet para ver instâncias",
    },
  };

  const fallbackData = fallbacks[url.pathname];

  if (fallbackData) {
    return new Response(JSON.stringify(fallbackData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Served-By": "service-worker-offline",
        "X-Offline-Fallback": "true",
      },
    });
  }

  // Fallback genérico
  return new Response(
    JSON.stringify({
      error: "Offline",
      message: "Você está offline. Alguns dados podem estar desatualizados.",
      offline: true,
    }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    },
  );
}

// Cache First padrão
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || (await fetchPromise);
}

// Network First padrão
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

// Network first com página offline
async function networkFirstWithOfflinePage(request, cacheName) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cache = await caches.open(CACHES.STATIC);
    const offlinePage = await cache.match("/offline.html");

    if (offlinePage) {
      return offlinePage;
    }

    // Página offline mínima
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>KRYONIX - Offline</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
              margin: 0; padding: 2rem; text-align: center;
              background: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%);
              color: white; min-height: 100vh;
              display: flex; align-items: center; justify-content: center;
            }
            .container { background: white; color: #1f2937; padding: 2rem; border-radius: 1rem; max-width: 400px; }
            .logo { font-size: 2rem; font-weight: bold; margin-bottom: 1rem; color: #0ea5e9; }
            button { background: #22c55e; color: white; border: none; padding: 0.75rem 1.5rem; 
                     border-radius: 0.5rem; cursor: pointer; font-size: 1rem; margin-top: 1rem; }
            button:hover { background: #16a34a; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🇧🇷 KRYONIX</div>
            <h2>Você está offline</h2>
            <p>Verifique sua conexão com a internet para acessar todos os recursos.</p>
            <p>Algumas funcionalidades podem estar disponíveis offline.</p>
            <button onclick="window.location.reload()">🔄 Tentar Novamente</button>
            <button onclick="window.location.href='/dashboard'">📊 Ir ao Dashboard</button>
          </div>
        </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }
}

// Fallback offline genérico
async function getOfflineFallback(request) {
  if (request.destination === "document") {
    return networkFirstWithOfflinePage(request, CACHES.DYNAMIC);
  }

  return new Response("Offline", {
    status: 503,
    statusText: "Service Unavailable",
  });
}

// === BACKGROUND SYNC ===
self.addEventListener("sync", (event) => {
  console.log("🔄 Background Sync:", event.tag);

  switch (event.tag) {
    case BACKGROUND_SYNC_TAGS.WHATSAPP_MESSAGES:
      event.waitUntil(syncWhatsAppMessages());
      break;
    case BACKGROUND_SYNC_TAGS.ANALYTICS_DATA:
      event.waitUntil(syncAnalyticsData());
      break;
    case BACKGROUND_SYNC_TAGS.USER_PREFERENCES:
      event.waitUntil(syncUserPreferences());
      break;
    case BACKGROUND_SYNC_TAGS.OFFLINE_ACTIONS:
      event.waitUntil(syncOfflineActions());
      break;
  }
});

// Sincronização de mensagens WhatsApp
async function syncWhatsAppMessages() {
  try {
    console.log("💬 Sincronizando mensagens WhatsApp...");

    const messages = await offlineStorage.getUnsynced("whatsapp_queue");

    for (const message of messages) {
      try {
        const response = await fetch(
          "/api/v1/whatsapp/instances/" + message.instanceId + "/messages",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message.data),
          },
        );

        if (response.ok) {
          await offlineStorage.markAsSynced("whatsapp_queue", message.id);
          console.log(`✅ Mensagem ${message.id} sincronizada`);
        }
      } catch (error) {
        console.log(`❌ Falha ao sincronizar mensagem ${message.id}:`, error);
      }
    }
  } catch (error) {
    console.log("❌ Falha na sincronização WhatsApp:", error);
  }
}

// Sincronização de dados analytics
async function syncAnalyticsData() {
  try {
    console.log("📊 Sincronizando dados de analytics...");

    const analyticsData = await offlineStorage.getUnsynced("analytics_queue");

    for (const data of analyticsData) {
      try {
        const response = await fetch("/api/v1/analytics/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data.events),
        });

        if (response.ok) {
          await offlineStorage.markAsSynced("analytics_queue", data.id);
        }
      } catch (error) {
        console.log(`❌ Falha ao sincronizar analytics ${data.id}:`, error);
      }
    }
  } catch (error) {
    console.log("❌ Falha na sincronização de analytics:", error);
  }
}

// Sincronização de preferências do usuário
async function syncUserPreferences() {
  try {
    console.log("⚙️ Sincronizando preferências...");

    const preferences = await offlineStorage.getUnsynced("user_settings");

    if (preferences.length > 0) {
      const response = await fetch("/api/v1/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });

      if (response.ok) {
        for (const pref of preferences) {
          await offlineStorage.markAsSynced("user_settings", pref.id);
        }
      }
    }
  } catch (error) {
    console.log("❌ Falha na sincronização de preferências:", error);
  }
}

// Sincronização de ações offline
async function syncOfflineActions() {
  try {
    console.log("🔄 Sincronizando ações offline...");

    const actions = await offlineStorage.getUnsynced("user_actions");

    for (const action of actions) {
      try {
        const response = await fetch("/api/v1/actions/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action),
        });

        if (response.ok) {
          await offlineStorage.markAsSynced("user_actions", action.id);
        }
      } catch (error) {
        console.log(`❌ Falha ao sincronizar ação ${action.id}:`, error);
      }
    }
  } catch (error) {
    console.log("❌ Falha na sincronização de ações:", error);
  }
}

// === PUSH NOTIFICATIONS AVANÇADAS ===
self.addEventListener("push", (event) => {
  console.log("🔔 Push notification recebida");

  let data = {
    title: "KRYONIX",
    body: "Você tem uma nova notificação!",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge.png",
    tag: "kryonix-notification",
    data: {},
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      data = { ...data, ...pushData };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  // Configurações avançadas de notificação
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    timestamp: Date.now(),
    data: data.data,

    // Actions customizadas
    actions: [
      {
        action: "open",
        title: "🔗 Abrir",
        icon: "/icons/action-open.png",
      },
      {
        action: "dismiss",
        title: "✖️ Dispensar",
        icon: "/icons/action-dismiss.png",
      },
    ],

    // Configurações visuais
    image: data.image,
    vibrate: data.vibrate || [200, 100, 200],

    // Configurações brasileiras
    lang: "pt-BR",
    dir: "ltr",
  };

  // Adicionar actions específicas baseadas no tipo
  if (data.type === "whatsapp") {
    options.actions.unshift({
      action: "reply",
      title: "💬 Responder",
      icon: "/icons/action-reply.png",
    });
  }

  if (data.type === "billing") {
    options.actions.unshift({
      action: "pay",
      title: "💳 Pagar",
      icon: "/icons/action-pay.png",
    });
  }

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Click em notificação
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Clique em notificação:", event.action);

  event.notification.close();

  const data = event.notification.data || {};
  let url = data.url || "/dashboard";

  // Ações específicas
  switch (event.action) {
    case "open":
      url = data.url || "/dashboard";
      break;
    case "reply":
      url = "/whatsapp/chat/" + (data.chatId || "");
      break;
    case "pay":
      url = "/billing?action=pay&invoice=" + (data.invoiceId || "");
      break;
    case "dismiss":
      return; // Apenas fechar
    default:
      url = data.url || "/dashboard";
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Verificar se já tem uma janela aberta
        for (const client of clientList) {
          if (client.url.includes("kryonix") && "focus" in client) {
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              action: event.action,
              data: data,
              url: url,
            });
            return client.focus();
          }
        }

        // Abrir nova janela se necessário
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});

// Close de notificação
self.addEventListener("notificationclose", (event) => {
  console.log("🔔 Notificação fechada:", event.notification.tag);

  // Analytics de notificação fechada
  const data = event.notification.data || {};
  if (data.trackClose) {
    fetch("/api/v1/analytics/notification-closed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tag: event.notification.tag,
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
});

// === MENSAGENS DO CLIENT ===
self.addEventListener("message", (event) => {
  const { type, data } = event.data || {};

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "QUEUE_WHATSAPP_MESSAGE":
      offlineStorage.addToQueue("whatsapp_queue", data);
      break;

    case "QUEUE_ANALYTICS_DATA":
      offlineStorage.addToQueue("analytics_queue", data);
      break;

    case "QUEUE_USER_ACTION":
      offlineStorage.addToQueue("user_actions", data);
      break;

    case "GET_CACHE_STATUS":
      getCacheStatus().then((status) => {
        event.ports[0].postMessage(status);
      });
      break;

    case "CLEAR_CACHE":
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});

// Status do cache
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = keys.length;
  }

  return status;
}

// Limpar todos os caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
}

// Debug log
console.log("🇧🇷 KRYONIX Advanced Service Worker loaded!", {
  version: CACHE_VERSION,
  caches: Object.keys(CACHES),
  backgroundSyncTags: Object.values(BACKGROUND_SYNC_TAGS),
});
