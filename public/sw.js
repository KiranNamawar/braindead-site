const CACHE_NAME = 'braindead-v1.2.0';
const STATIC_CACHE = 'braindead-static-v1.2.0';
const DYNAMIC_CACHE = 'braindead-dynamic-v1.2.0';
const TOOL_DATA_CACHE = 'braindead-tool-data-v1.2.0';
const OFFLINE_QUEUE_CACHE = 'braindead-offline-queue-v1.2.0';
const USER_PREFERENCES_CACHE = 'braindead-preferences-v1.2.0';
const TIMER_NOTIFICATIONS_CACHE = 'braindead-timer-notifications-v1.2.0';
const BACKGROUND_SYNC_CACHE = 'braindead-background-sync-v1.2.0';

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

// Advanced caching strategies configuration
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Cache configuration for different resource types
const CACHE_CONFIG = {
  static: { strategy: CACHE_STRATEGIES.CACHE_FIRST, maxAge: 86400000 }, // 24 hours
  tools: { strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE, maxAge: 3600000 }, // 1 hour
  api: { strategy: CACHE_STRATEGIES.NETWORK_FIRST, maxAge: 300000 }, // 5 minutes
  preferences: { strategy: CACHE_STRATEGIES.CACHE_FIRST, maxAge: 604800000 }, // 7 days
  notifications: { strategy: CACHE_STRATEGIES.CACHE_FIRST, maxAge: 86400000 } // 24 hours
};

// Install event - Enhanced with advanced caching and initialization
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets with versioning
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      // Initialize tool data cache with offline capabilities
      caches.open(TOOL_DATA_CACHE).then((cache) => {
        return cache.put('/api/tools-offline', new Response(JSON.stringify({
          timestamp: Date.now(),
          tools: TOOL_PAGES,
          version: CACHE_NAME,
          offlineCapabilities: {
            calculators: ['basic-math', 'scientific', 'conversions'],
            textTools: ['processing', 'analysis', 'formatting'],
            timers: ['countdown', 'stopwatch', 'pomodoro', 'notifications'],
            generators: ['uuid', 'passwords', 'qr-codes', 'lorem-ipsum'],
            converters: ['base64', 'url', 'number-bases', 'units']
          }
        })));
      }),
      // Initialize user preferences cache
      caches.open(USER_PREFERENCES_CACHE).then((cache) => {
        return cache.put('/api/preferences-schema', new Response(JSON.stringify({
          version: '1.0.0',
          schema: {
            favorites: { type: 'array', default: [] },
            recentTools: { type: 'array', default: [] },
            theme: { type: 'string', default: 'dark' },
            notifications: { type: 'boolean', default: true },
            keyboardShortcuts: { type: 'boolean', default: true },
            analytics: { type: 'object', default: {} }
          }
        })));
      }),
      // Initialize timer notifications cache
      caches.open(TIMER_NOTIFICATIONS_CACHE).then((cache) => {
        return cache.put('/api/notification-templates', new Response(JSON.stringify({
          pomodoro: {
            workComplete: {
              title: '🍅 Work Session Complete!',
              body: 'Time for a well-deserved break. You\'ve earned it!',
              icon: '/icon-192.svg',
              badge: '/favicon.svg',
              tag: 'pomodoro-work-complete'
            },
            breakComplete: {
              title: '⏰ Break Time Over!',
              body: 'Ready to get back to being productive? Let\'s go!',
              icon: '/icon-192.svg',
              badge: '/favicon.svg',
              tag: 'pomodoro-break-complete'
            }
          },
          timer: {
            complete: {
              title: '⏰ Timer Complete!',
              body: 'Your timer has finished. Time to check what\'s next!',
              icon: '/icon-192.svg',
              badge: '/favicon.svg',
              tag: 'timer-complete'
            }
          },
          countdown: {
            complete: {
              title: '🎯 Countdown Finished!',
              body: 'The moment you\'ve been waiting for has arrived!',
              icon: '/icon-192.svg',
              badge: '/favicon.svg',
              tag: 'countdown-complete'
            }
          }
        })));
      }),
      // Initialize background sync cache
      caches.open(BACKGROUND_SYNC_CACHE),
      // Initialize offline queue cache
      caches.open(OFFLINE_QUEUE_CACHE)
    ]).then(() => {
      // Request notification permission during install
      if ('Notification' in self && 'permission' in Notification) {
        console.log('Service Worker ready for notifications');
      }
      return self.skipWaiting();
    })
  );
});

// Initialize background sync functionality
function initializeBackgroundSync() {
  if ('sync' in self.registration) {
    console.log('Background sync initialized');
    
    // Schedule periodic sync for user preferences
    self.registration.sync.register('preferences-sync').catch(error => {
      console.warn('Failed to register preferences sync:', error);
    });
    
    // Schedule periodic sync for analytics (privacy-focused)
    self.registration.sync.register('analytics-sync').catch(error => {
      console.warn('Failed to register analytics sync:', error);
    });
  }
}
// Activate event - Enhanced cache management with new cache types
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
                cacheName !== OFFLINE_QUEUE_CACHE &&
                cacheName !== USER_PREFERENCES_CACHE &&
                cacheName !== TIMER_NOTIFICATIONS_CACHE &&
                cacheName !== BACKGROUND_SYNC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Initialize background sync for user preferences
        initializeBackgroundSync();
        
        // Notify clients about the update
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_UPDATED',
              version: CACHE_NAME,
              features: ['advanced-caching', 'background-sync', 'push-notifications', 'offline-first']
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
// Enhancedbackground sync for offline queue, preferences, and analytics
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  switch (event.tag) {
    case 'offline-queue-sync':
      event.waitUntil(syncOfflineQueue());
      break;
    case 'preferences-sync':
      event.waitUntil(syncUserPreferences());
      break;
    case 'analytics-sync':
      event.waitUntil(syncAnalytics());
      break;
    case 'timer-notifications-sync':
      event.waitUntil(syncTimerNotifications());
      break;
    default:
      console.log('Unknown sync tag:', event.tag);
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

// Sync user preferences (offline-first approach)
async function syncUserPreferences() {
  try {
    const cache = await caches.open(USER_PREFERENCES_CACHE);
    const syncCache = await caches.open(BACKGROUND_SYNC_CACHE);
    
    // Get pending preference updates
    const pendingUpdates = await syncCache.keys();
    const preferenceUpdates = pendingUpdates.filter(req => 
      req.url.includes('/api/preferences-sync')
    );
    
    console.log(`Syncing ${preferenceUpdates.length} preference updates`);
    
    for (const updateRequest of preferenceUpdates) {
      try {
        const response = await syncCache.match(updateRequest);
        if (response) {
          const updateData = await response.json();
          
          // Apply preference updates locally (since we're privacy-focused)
          await cache.put('/api/user-preferences', new Response(JSON.stringify({
            ...updateData,
            lastSync: Date.now(),
            syncStatus: 'completed'
          })));
          
          // Remove from sync queue
          await syncCache.delete(updateRequest);
          
          // Notify clients about successful sync
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'PREFERENCES_SYNC_SUCCESS',
                data: updateData
              });
            });
          });
        }
      } catch (error) {
        console.warn('Failed to sync individual preference update:', error);
      }
    }
  } catch (error) {
    console.warn('User preferences sync failed:', error);
  }
}
// Sync timer notifications
async function syncTimerNotifications() {
  try {
    const cache = await caches.open(TIMER_NOTIFICATIONS_CACHE);
    const syncCache = await caches.open(BACKGROUND_SYNC_CACHE);
    
    // Get pending notification updates
    const pendingNotifications = await syncCache.keys();
    const notificationUpdates = pendingNotifications.filter(req => 
      req.url.includes('/api/timer-notifications')
    );
    
    console.log(`Processing ${notificationUpdates.length} timer notifications`);
    
    for (const notificationRequest of notificationUpdates) {
      try {
        const response = await syncCache.match(notificationRequest);
        if (response) {
          const notificationData = await response.json();
          
          // Process timer notification
          await processTimerNotification(notificationData);
          
          // Remove from sync queue
          await syncCache.delete(notificationRequest);
        }
      } catch (error) {
        console.warn('Failed to process timer notification:', error);
      }
    }
  } catch (error) {
    console.warn('Timer notifications sync failed:', error);
  }
}

// Sync analytics data (privacy-focused, local only)
async function syncAnalytics() {
  try {
    const syncCache = await caches.open(BACKGROUND_SYNC_CACHE);
    const analyticsRequests = await syncCache.keys();
    const analyticsUpdates = analyticsRequests.filter(req => 
      req.url.includes('/api/analytics-sync')
    );
    
    console.log(`Processing ${analyticsUpdates.length} analytics updates`);
    
    for (const analyticsRequest of analyticsUpdates) {
      try {
        const response = await syncCache.match(analyticsRequest);
        if (response) {
          const analyticsData = await response.json();
          
          // Process analytics locally (no external tracking)
          await processLocalAnalytics(analyticsData);
          
          // Remove from sync queue
          await syncCache.delete(analyticsRequest);
          
          // Notify clients about analytics update
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'ANALYTICS_SYNC_SUCCESS',
                data: analyticsData
              });
            });
          });
        }
      } catch (error) {
        console.warn('Failed to process analytics update:', error);
      }
    }
  } catch (error) {
    console.warn('Analytics sync failed:', error);
  }
}

// Process timer notification
async function processTimerNotification(notificationData) {
  try {
    const { type, timerType, duration, customMessage } = notificationData;
    
    // Get notification templates
    const templatesCache = await caches.open(TIMER_NOTIFICATIONS_CACHE);
    const templatesResponse = await templatesCache.match('/api/notification-templates');
    
    if (!templatesResponse) {
      console.warn('Notification templates not found');
      return;
    }
    
    const templates = await templatesResponse.json();
    let notificationConfig;
    
    // Select appropriate notification template
    switch (timerType) {
      case 'pomodoro':
        notificationConfig = type === 'work-complete' 
          ? templates.pomodoro.workComplete 
          : templates.pomodoro.breakComplete;
        break;
      case 'timer':
        notificationConfig = templates.timer.complete;
        break;
      case 'countdown':
        notificationConfig = templates.countdown.complete;
        break;
      default:
        notificationConfig = templates.timer.complete;
    }
    
    // Customize notification if custom message provided
    if (customMessage) {
      notificationConfig = {
        ...notificationConfig,
        body: customMessage
      };
    }
    
    // Show notification if permission granted
    if ('Notification' in self && Notification.permission === 'granted') {
      await self.registration.showNotification(notificationConfig.title, {
        body: notificationConfig.body,
        icon: notificationConfig.icon,
        badge: notificationConfig.badge,
        tag: notificationConfig.tag,
        requireInteraction: true,
        actions: [
          {
            action: 'dismiss',
            title: 'Dismiss'
          },
          {
            action: 'view',
            title: 'View Timer'
          }
        ],
        data: {
          timerType,
          duration,
          timestamp: Date.now()
        }
      });
      
      console.log(`Timer notification shown: ${timerType}`);
    }
  } catch (error) {
    console.error('Failed to process timer notification:', error);
  }
}
// Process local analytics (privacy-focused)
async function processLocalAnalytics(analyticsData) {
  try {
    const { event, toolId, duration, timestamp, metadata } = analyticsData;
    
    // Get existing analytics data
    const cache = await caches.open(USER_PREFERENCES_CACHE);
    let analyticsResponse = await cache.match('/api/local-analytics');
    let analytics = {};
    
    if (analyticsResponse) {
      analytics = await analyticsResponse.json();
    }
    
    // Initialize analytics structure if needed
    if (!analytics.tools) analytics.tools = {};
    if (!analytics.sessions) analytics.sessions = [];
    if (!analytics.summary) analytics.summary = {
      totalToolsUsed: 0,
      totalTimeSaved: 0,
      mostUsedTool: null,
      productivityScore: 0,
      lastUpdated: Date.now()
    };
    
    // Process different types of analytics events
    switch (event) {
      case 'tool-used':
        // Track tool usage
        if (!analytics.tools[toolId]) {
          analytics.tools[toolId] = {
            usageCount: 0,
            totalDuration: 0,
            lastUsed: timestamp,
            timeSaved: 0
          };
        }
        
        analytics.tools[toolId].usageCount++;
        analytics.tools[toolId].totalDuration += duration || 0;
        analytics.tools[toolId].lastUsed = timestamp;
        
        // Estimate time saved (rough calculation)
        const timeSavedEstimate = getTimeSavedEstimate(toolId, duration);
        analytics.tools[toolId].timeSaved += timeSavedEstimate;
        
        break;
        
      case 'session-start':
        // Track session
        analytics.sessions.push({
          id: `session-${timestamp}`,
          startTime: timestamp,
          tools: [],
          duration: 0
        });
        break;
        
      case 'session-end':
        // Update last session
        if (analytics.sessions.length > 0) {
          const lastSession = analytics.sessions[analytics.sessions.length - 1];
          lastSession.duration = timestamp - lastSession.startTime;
        }
        break;
    }
    
    // Update summary statistics
    updateAnalyticsSummary(analytics);
    
    // Store updated analytics
    await cache.put('/api/local-analytics', new Response(JSON.stringify(analytics)));
    
    console.log('Local analytics processed:', event, toolId);
  } catch (error) {
    console.error('Failed to process local analytics:', error);
  }
}

// Get time saved estimate for different tools
function getTimeSavedEstimate(toolId, duration) {
  const timeSavedMap = {
    'calculator': 30, // 30 seconds saved vs manual calculation
    'tip-calculator': 60, // 1 minute saved vs manual calculation
    'age-calculator': 120, // 2 minutes saved vs manual calculation
    'bmi-calculator': 90, // 1.5 minutes saved
    'loan-calculator': 300, // 5 minutes saved vs spreadsheet
    'percentage-calculator': 45, // 45 seconds saved
    'grade-calculator': 180, // 3 minutes saved
    'word-counter': 60, // 1 minute saved vs manual counting
    'text-case-converter': 120, // 2 minutes saved vs manual editing
    'lorem-ipsum': 180, // 3 minutes saved vs writing placeholder text
    'diff-checker': 300, // 5 minutes saved vs manual comparison
    'text-summarizer': 600, // 10 minutes saved vs manual summarization
    'gradient-generator': 240, // 4 minutes saved vs CSS coding
    'ascii-art-generator': 300, // 5 minutes saved vs manual creation
    'favicon-generator': 600, // 10 minutes saved vs design tools
    'pomodoro-timer': 0, // Time management tool, no direct time saved
    'world-clock': 60, // 1 minute saved vs searching timezones
    'stopwatch-timer': 30, // 30 seconds saved vs phone/watch
    'countdown-timer': 60, // 1 minute saved vs setting up timer
    'base64-encoder': 120, // 2 minutes saved vs coding
    'url-encoder': 90, // 1.5 minutes saved vs manual encoding
    'markdown-editor': 300, // 5 minutes saved vs learning markdown
    'uuid-generator': 60, // 1 minute saved vs coding
    'jwt-decoder': 180, // 3 minutes saved vs manual decoding
    'number-converter': 120, // 2 minutes saved vs manual conversion
    'roman-numeral': 90 // 1.5 minutes saved vs lookup
  };
  
  return timeSavedMap[toolId] || 60; // Default 1 minute saved
}

// Update analytics summary
function updateAnalyticsSummary(analytics) {
  const tools = analytics.tools;
  const toolIds = Object.keys(tools);
  
  // Calculate total tools used
  analytics.summary.totalToolsUsed = toolIds.length;
  
  // Calculate total time saved
  analytics.summary.totalTimeSaved = toolIds.reduce((total, toolId) => {
    return total + (tools[toolId].timeSaved || 0);
  }, 0);
  
  // Find most used tool
  let mostUsedTool = null;
  let maxUsage = 0;
  
  toolIds.forEach(toolId => {
    if (tools[toolId].usageCount > maxUsage) {
      maxUsage = tools[toolId].usageCount;
      mostUsedTool = toolId;
    }
  });
  
  analytics.summary.mostUsedTool = mostUsedTool;
  
  // Calculate productivity score (arbitrary but fun metric)
  const avgTimeSaved = analytics.summary.totalTimeSaved / Math.max(analytics.summary.totalToolsUsed, 1);
  const toolDiversity = Math.min(analytics.summary.totalToolsUsed / 10, 1); // Max score at 10+ tools
  analytics.summary.productivityScore = Math.round((avgTimeSaved / 60) * toolDiversity * 100); // Score out of 100
  
  analytics.summary.lastUpdated = Date.now();
}
// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const { action } = event;
  const { timerType, timestamp } = event.notification.data || {};
  
  if (action === 'view') {
    // Open the timer tool
    const timerUrls = {
      'pomodoro': '/pomodoro-timer',
      'timer': '/stopwatch-timer',
      'countdown': '/countdown-timer'
    };
    
    const url = timerUrls[timerType] || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              action: 'view',
              timerType,
              url
            });
            return;
          }
        }
        
        // Open new window if app not open
        return clients.openWindow(url);
      })
    );
  }
  
  // Track notification interaction
  const analyticsData = {
    event: 'notification-click',
    toolId: timerType,
    timestamp: Date.now(),
    metadata: { action, originalTimestamp: timestamp }
  };
  
  processLocalAnalytics(analyticsData);
});

// Schedule timer notification
async function scheduleTimerNotification(notificationData) {
  try {
    const cache = await caches.open(BACKGROUND_SYNC_CACHE);
    const notificationKey = `/api/timer-notifications/${Date.now()}-${Math.random()}`;
    
    await cache.put(notificationKey, new Response(JSON.stringify(notificationData)));
    
    // Register background sync for timer notifications
    if ('sync' in self.registration) {
      await self.registration.sync.register('timer-notifications-sync');
    }
    
    console.log('Timer notification scheduled:', notificationData.timerType);
  } catch (error) {
    console.error('Failed to schedule timer notification:', error);
  }
}

// Queue preferences for background sync
async function queuePreferencesSync(preferences) {
  try {
    const cache = await caches.open(BACKGROUND_SYNC_CACHE);
    const preferencesKey = `/api/preferences-sync/${Date.now()}-${Math.random()}`;
    
    await cache.put(preferencesKey, new Response(JSON.stringify(preferences)));
    
    // Register background sync for preferences
    if ('sync' in self.registration) {
      await self.registration.sync.register('preferences-sync');
    }
    
    console.log('Preferences queued for sync');
  } catch (error) {
    console.error('Failed to queue preferences sync:', error);
  }
}

// Queue analytics for background sync
async function queueAnalyticsSync(analyticsData) {
  try {
    const cache = await caches.open(BACKGROUND_SYNC_CACHE);
    const analyticsKey = `/api/analytics-sync/${Date.now()}-${Math.random()}`;
    
    await cache.put(analyticsKey, new Response(JSON.stringify(analyticsData)));
    
    // Register background sync for analytics
    if ('sync' in self.registration) {
      await self.registration.sync.register('analytics-sync');
    }
    
    console.log('Analytics queued for sync');
  } catch (error) {
    console.error('Failed to queue analytics sync:', error);
  }
}
// Handle messages from the main thread
self.addEventListener('message', (event) => {
  const { data } = event;
  
  switch (data?.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache(data.cacheName).then(success => {
        event.ports[0].postMessage({ success });
      });
      break;
      
    case 'SCHEDULE_TIMER_NOTIFICATION':
      // Schedule a timer notification
      scheduleTimerNotification(data.notificationData);
      break;
      
    case 'SYNC_USER_PREFERENCES':
      // Queue user preferences for background sync
      queuePreferencesSync(data.preferences);
      break;
      
    case 'TRACK_ANALYTICS':
      // Queue analytics data for background sync
      queueAnalyticsSync(data.analyticsData);
      break;
      
    default:
      console.log('Unknown message type:', data?.type);
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
      toolPages: TOOL_PAGES.length,
      features: ['advanced-caching', 'background-sync', 'push-notifications', 'offline-first']
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