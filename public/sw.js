const CACHE_NAME = 'braindead-v1.1.0';
const STATIC_CACHE = 'braindead-static-v1.1.0';
const DYNAMIC_CACHE = 'braindead-dynamic-v1.1.0';
const TOOL_DATA_CACHE = 'braindead-tool-data-v1.1.0';
const OFFLINE_QUEUE_CACHE = 'braindead-offline-queue-v1.1.0';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Tool pages that should be cached for offline access
const TOOL_PAGES = [
  '/calculator',
  '/color-picker',
  '/qr-generator',
  '/text-tools',
  '/password-generator',
  '/hash-generator',
  '/image-optimizer',
  '/timestamp-converter',
  '/json-formatter',
  '/random-generator',
  '/unit-converter',
  '/tip-calculator',
  '/age-calculator',
  '/bmi-calculator',
  '/loan-calculator',
  '/percentage-calculator',
  '/grade-calculator',
  '/word-counter',
  '/text-case-converter',
  '/lorem-ipsum',
  '/diff-checker',
  '/text-summarizer',
  '/gradient-generator',
  '/ascii-art-generator',
  '/favicon-generator',
  '/pomodoro-timer',
  '/world-clock',
  '/stopwatch-timer',
  '/countdown-timer',
  '/base64-encoder',
  '/url-encoder',
  '/markdown-editor',
  '/uuid-generator',
  '/jwt-decoder',
  '/number-converter',
  '/roman-numeral'
];

// Install event - Enhanced with tool pages caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      // Initialize tool data cache
      caches.open(TOOL_DATA_CACHE).then((cache) => {
        // Pre-cache essential tool data structures
        return cache.put('/api/tools-offline', new Response(JSON.stringify({
          timestamp: Date.now(),
          tools: TOOL_PAGES,
          version: CACHE_NAME
        })));
      }),
      // Initialize offline queue cache
      caches.open(OFFLINE_QUEUE_CACHE)
    ]).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - Enhanced cache management
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Keep current version caches, delete old ones
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== TOOL_DATA_CACHE && 
                cacheName !== OFFLINE_QUEUE_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Notify clients about the update
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_UPDATED',
              version: CACHE_NAME
            });
          });
        });
        return self.clients.claim();
      })
  );
});

// Enhanced fetch event with offline-first tool operations
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    // Handle POST requests for offline queue
    if (request.method === 'POST' && url.pathname.startsWith('/api/')) {
      event.respondWith(handleOfflineQueue(request));
    }
    return;
  }

  // Skip external requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (isToolPage(url.pathname)) {
    event.respondWith(handleToolPageRequest(request));
  } else if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAssetRequest(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
  } else {
    event.respondWith(handleGeneralRequest(request));
  }
});

// Check if the request is for a tool page
function isToolPage(pathname) {
  return TOOL_PAGES.includes(pathname) || pathname === '/';
}

// Check if the request is for a static asset
function isStaticAsset(pathname) {
  return pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

// Handle tool page requests with cache-first strategy
async function handleToolPageRequest(request) {
  try {
    // Try cache first for tool pages (they work offline)
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If not in cache, fetch and cache
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // If offline and not cached, return the main page (SPA fallback)
    const fallbackResponse = await caches.match('/');
    if (fallbackResponse) {
      return fallbackResponse;
    }
    
    // Last resort: return a basic offline page
    return new Response(
      createOfflinePage(),
      { 
        headers: { 'Content-Type': 'text/html' },
        status: 200
      }
    );
  }
}

// Handle static asset requests with cache-first strategy
async function handleStaticAssetRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return cached version if available
    return caches.match(request) || new Response('Asset not available offline', { status: 404 });
  }
}

// Handle API requests with network-first strategy and offline queue
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful API responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(TOOL_DATA_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Try to return cached API response
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline indicator for API requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This request will be processed when you\'re back online',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle general requests with network-first strategy
async function handleGeneralRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // For navigation requests, return the main app
    if (request.mode === 'navigate') {
      return caches.match('/') || new Response(createOfflinePage(), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    return new Response('Not available offline', { status: 404 });
  }
}

// Handle offline queue for POST requests
async function handleOfflineQueue(request) {
  try {
    // Try to make the request
    return await fetch(request);
  } catch (error) {
    // If offline, add to queue
    const cache = await caches.open(OFFLINE_QUEUE_CACHE);
    const queueKey = `offline-${Date.now()}-${Math.random()}`;
    
    // Store the request for later processing
    await cache.put(queueKey, request.clone());
    
    // Register background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      self.registration.sync.register('offline-queue-sync');
    }
    
    return new Response(JSON.stringify({
      queued: true,
      message: 'Request queued for when you\'re back online'
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Create a basic offline page
function createOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BrainDead.site - Offline</title>
      <style>
        body { 
          font-family: system-ui, -apple-system, sans-serif; 
          text-align: center; 
          padding: 2rem; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        .container {
          max-width: 500px;
          background: rgba(255,255,255,0.1);
          padding: 2rem;
          border-radius: 1rem;
          backdrop-filter: blur(10px);
        }
        h1 { margin-bottom: 1rem; }
        p { margin-bottom: 1.5rem; opacity: 0.9; }
        button {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
        }
        button:hover { background: rgba(255,255,255,0.3); }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🧠💀 You're Offline!</h1>
        <p>Don't worry, most tools still work offline. That's the beauty of not needing the cloud for everything.</p>
        <p>Try refreshing the page or check your connection.</p>
        <button onclick="window.location.reload()">Retry</button>
      </div>
    </body>
    </html>
  `;
}

// Enhanced background sync for offline queue and analytics
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-queue-sync') {
    event.waitUntil(syncOfflineQueue());
  } else if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

// Sync offline queue when back online
async function syncOfflineQueue() {
  try {
    const cache = await caches.open(OFFLINE_QUEUE_CACHE);
    const requests = await cache.keys();
    
    console.log(`Syncing ${requests.length} offline requests`);
    
    for (const cachedRequest of requests) {
      try {
        // Get the original request from cache
        const response = await cache.match(cachedRequest);
        if (response) {
          // Recreate the original request
          const originalRequest = await response.clone();
          
          // Try to execute the request
          const result = await fetch(originalRequest);
          
          if (result.ok) {
            // Success - remove from queue
            await cache.delete(cachedRequest);
            console.log('Successfully synced offline request');
            
            // Notify clients about successful sync
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  type: 'OFFLINE_SYNC_SUCCESS',
                  request: cachedRequest.url
                });
              });
            });
          } else {
            console.warn('Failed to sync request:', result.status);
          }
        }
      } catch (error) {
        console.warn('Failed to sync individual request:', error);
        // Keep the request in queue for next sync attempt
      }
    }
  } catch (error) {
    console.warn('Offline queue sync failed:', error);
  }
}

// Sync analytics data
async function syncAnalytics() {
  try {
    const cache = await caches.open('analytics-cache');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.warn('Failed to sync analytics:', error);
      }
    }
  } catch (error) {
    console.warn('Analytics sync failed:', error);
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    // Send cache status back to client
    getCacheStatus().then(status => {
      event.ports[0].postMessage(status);
    });
  } else if (event.data && event.data.type === 'CLEAR_CACHE') {
    // Clear specific cache
    clearCache(event.data.cacheName).then(success => {
      event.ports[0].postMessage({ success });
    });
  }
});

// Get cache status information
async function getCacheStatus() {
  try {
    const cacheNames = await caches.keys();
    const status = {};
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      status[cacheName] = {
        size: keys.length,
        keys: keys.map(req => req.url)
      };
    }
    
    return {
      caches: status,
      version: CACHE_NAME,
      toolPages: TOOL_PAGES.length
    };
  } catch (error) {
    return { error: error.message };
  }
}

// Clear specific cache
async function clearCache(cacheName) {
  try {
    if (cacheName === 'all') {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      return true;
    } else {
      return await caches.delete(cacheName);
    }
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return false;
  }
}