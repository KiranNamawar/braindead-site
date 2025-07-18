// PWA utilities for service worker registration and management

interface PWAConfig {
  swUrl: string;
  scope: string;
  updateCheckInterval: number;
}

const defaultConfig: PWAConfig = {
  swUrl: '/sw.js',
  scope: '/',
  updateCheckInterval: 60000, // 1 minute
};

let swRegistration: ServiceWorkerRegistration | null = null;
let updateAvailable = false;

// Register service worker
export async function registerSW(config: Partial<PWAConfig> = {}): Promise<ServiceWorkerRegistration | null> {
  const finalConfig = { ...defaultConfig, ...config };

  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported');
    return null;
  }

  try {
    swRegistration = await navigator.serviceWorker.register(finalConfig.swUrl, {
      scope: finalConfig.scope,
    });

    console.log('Service worker registered successfully');

    // Handle updates
    handleSWUpdate(swRegistration, () => {
      updateAvailable = true;
      notifyUpdateAvailable();
    });

    // Check for updates periodically
    setInterval(() => {
      swRegistration?.update();
    }, finalConfig.updateCheckInterval);

    return swRegistration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

// Handle service worker updates
export function handleSWUpdate(
  registration: ServiceWorkerRegistration,
  onUpdateAvailable: () => void
): void {
  if (registration.waiting) {
    onUpdateAvailable();
    return;
  }

  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        onUpdateAvailable();
      }
    });
  });
}

// Apply service worker update
export function applyUpdate(): void {
  if (swRegistration?.waiting) {
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
}

// Notify user about available update
function notifyUpdateAvailable(): void {
  // Dispatch custom event for components to listen to
  window.dispatchEvent(new CustomEvent('sw-update-available', {
    detail: { updateAvailable: true }
  }));
}

// Check if app is running as PWA
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
}

// Get PWA installation status
export function getPWAInstallStatus(): {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
} {
  return {
    canInstall: 'beforeinstallprompt' in window,
    isInstalled: isPWA(),
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
  };
}

// Initialize PWA features
export function initializePWA(): void {
  // Register service worker
  registerSW();

  // Handle app installation
  handleAppInstallation();

  // Setup offline detection
  setupOfflineDetection();

  // Initialize background sync if supported
  initializeBackgroundSync();
}

// Handle app installation events
function handleAppInstallation(): void {
  let deferredPrompt: any = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Dispatch event for install prompt component
    window.dispatchEvent(new CustomEvent('pwa-install-available', {
      detail: { prompt: deferredPrompt }
    }));
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
    
    // Track installation
    trackPWAInstallation();
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
}

// Setup offline detection
function setupOfflineDetection(): void {
  window.addEventListener('online', () => {
    window.dispatchEvent(new CustomEvent('connectivity-change', {
      detail: { online: true }
    }));
  });

  window.addEventListener('offline', () => {
    window.dispatchEvent(new CustomEvent('connectivity-change', {
      detail: { online: false }
    }));
  });
}

// Initialize background sync
function initializeBackgroundSync(): void {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      // Register background sync for analytics
      registration.sync.register('analytics-sync').catch((error) => {
        console.warn('Background sync registration failed:', error);
      });
      
      // Register background sync for user preferences
      registration.sync.register('preferences-sync').catch((error) => {
        console.warn('Preferences sync registration failed:', error);
      });
      
      // Register background sync for timer notifications
      registration.sync.register('timer-notifications-sync').catch((error) => {
        console.warn('Timer notifications sync registration failed:', error);
      });
    });
  }
}

// Track PWA installation
function trackPWAInstallation(): void {
  try {
    const analytics = JSON.parse(localStorage.getItem('braindead-analytics') || '{}');
    analytics.pwaInstalled = true;
    analytics.pwaInstallDate = new Date().toISOString();
    localStorage.setItem('braindead-analytics', JSON.stringify(analytics));
  } catch (error) {
    console.warn('Failed to track PWA installation:', error);
  }
}

// Get cache status
export async function getCacheStatus(): Promise<{
  caches: Record<string, { size: number; keys: string[] }>;
  version: string;
  totalSize: number;
}> {
  if (!('caches' in window)) {
    return { caches: {}, version: 'unknown', totalSize: 0 };
  }

  try {
    const cacheNames = await caches.keys();
    const cacheStatus: Record<string, { size: number; keys: string[] }> = {};
    let totalSize = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      cacheStatus[cacheName] = {
        size: keys.length,
        keys: keys.map(req => req.url)
      };
      totalSize += keys.length;
    }

    return {
      caches: cacheStatus,
      version: 'v1.1.0',
      totalSize
    };
  } catch (error) {
    console.error('Failed to get cache status:', error);
    return { caches: {}, version: 'unknown', totalSize: 0 };
  }
}

// Clear all caches
export async function clearAllCaches(): Promise<boolean> {
  if (!('caches' in window)) {
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    return true;
  } catch (error) {
    console.error('Failed to clear caches:', error);
    return false;
  }
}

// Preload critical resources
export async function preloadCriticalResources(urls: string[]): Promise<void> {
  if (!('caches' in window)) {
    return;
  }

  try {
    const cache = await caches.open('critical-resources');
    await cache.addAll(urls);
  } catch (error) {
    console.warn('Failed to preload critical resources:', error);
  }
}

export { updateAvailable, swRegistration };

// Advanced PWA Features for Enhanced Service Worker

// Schedule timer notification through service worker
export async function scheduleTimerNotification(notificationData: {
  type: string;
  timerType: 'pomodoro' | 'timer' | 'countdown';
  duration?: number;
  customMessage?: string;
}): Promise<void> {
  if (!swRegistration?.active) {
    console.warn('Service worker not available for timer notifications');
    return;
  }

  try {
    swRegistration.active.postMessage({
      type: 'SCHEDULE_TIMER_NOTIFICATION',
      notificationData
    });
    console.log('Timer notification scheduled:', notificationData.timerType);
  } catch (error) {
    console.error('Failed to schedule timer notification:', error);
  }
}

// Sync user preferences through service worker
export async function syncUserPreferences(preferences: any): Promise<void> {
  if (!swRegistration?.active) {
    console.warn('Service worker not available for preferences sync');
    return;
  }

  try {
    swRegistration.active.postMessage({
      type: 'SYNC_USER_PREFERENCES',
      preferences
    });
    console.log('User preferences queued for sync');
  } catch (error) {
    console.error('Failed to sync user preferences:', error);
  }
}

// Track analytics through service worker
export async function trackAnalytics(analyticsData: {
  event: string;
  toolId: string;
  duration?: number;
  timestamp?: number;
  metadata?: any;
}): Promise<void> {
  if (!swRegistration?.active) {
    console.warn('Service worker not available for analytics tracking');
    return;
  }

  try {
    const dataWithTimestamp = {
      ...analyticsData,
      timestamp: analyticsData.timestamp || Date.now()
    };

    swRegistration.active.postMessage({
      type: 'TRACK_ANALYTICS',
      analyticsData: dataWithTimestamp
    });
    console.log('Analytics data queued for processing');
  } catch (error) {
    console.error('Failed to track analytics:', error);
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
}

// Check if notifications are supported and enabled
export function getNotificationStatus(): {
  supported: boolean;
  permission: NotificationPermission;
  enabled: boolean;
} {
  const supported = 'Notification' in window;
  const permission = supported ? Notification.permission : 'denied';
  const enabled = supported && permission === 'granted';

  return { supported, permission, enabled };
}

// Get enhanced cache status with new cache types
export async function getEnhancedCacheStatus(): Promise<{
  caches: Record<string, { size: number; keys: string[] }>;
  version: string;
  totalSize: number;
  features: string[];
}> {
  if (!swRegistration?.active) {
    return { caches: {}, version: 'unknown', totalSize: 0, features: [] };
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data);
    };

    swRegistration!.active!.postMessage(
      { type: 'GET_CACHE_STATUS' },
      [messageChannel.port2]
    );
  });
}

// Clear specific cache through service worker
export async function clearSpecificCache(cacheName: string): Promise<boolean> {
  if (!swRegistration?.active) {
    return false;
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data.success);
    };

    swRegistration!.active!.postMessage(
      { type: 'CLEAR_CACHE', cacheName },
      [messageChannel.port2]
    );
  });
}

// Listen for service worker messages
export function setupServiceWorkerMessageListener(): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.addEventListener('message', (event) => {
    const { data } = event;
    
    switch (data?.type) {
      case 'SW_UPDATED':
        console.log('Service worker updated:', data.version);
        window.dispatchEvent(new CustomEvent('sw-updated', {
          detail: { version: data.version, features: data.features }
        }));
        break;
        
      case 'OFFLINE_SYNC_SUCCESS':
        console.log('Offline sync successful:', data.request);
        window.dispatchEvent(new CustomEvent('offline-sync-success', {
          detail: { request: data.request }
        }));
        break;
        
      case 'PREFERENCES_SYNC_SUCCESS':
        console.log('Preferences sync successful');
        window.dispatchEvent(new CustomEvent('preferences-sync-success', {
          detail: { data: data.data }
        }));
        break;
        
      case 'ANALYTICS_SYNC_SUCCESS':
        console.log('Analytics sync successful');
        window.dispatchEvent(new CustomEvent('analytics-sync-success', {
          detail: { data: data.data }
        }));
        break;
        
      case 'NOTIFICATION_CLICK':
        console.log('Notification clicked:', data.action, data.timerType);
        window.dispatchEvent(new CustomEvent('notification-click', {
          detail: { action: data.action, timerType: data.timerType, url: data.url }
        }));
        break;
        
      default:
        console.log('Unknown service worker message:', data?.type);
    }
  });
}

// Initialize enhanced PWA features
export function initializeEnhancedPWA(): void {
  // Initialize basic PWA features
  initializePWA();
  
  // Setup service worker message listener
  setupServiceWorkerMessageListener();
  
  // Request notification permission if not already granted
  if (getNotificationStatus().supported && getNotificationStatus().permission === 'default') {
    // Don't request immediately, let the user interact first
    console.log('Notification permission available to request');
  }
}

// Utility function to check if advanced PWA features are available
export function getAdvancedPWACapabilities(): {
  backgroundSync: boolean;
  notifications: boolean;
  offlineFirst: boolean;
  advancedCaching: boolean;
} {
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasBackgroundSync = hasServiceWorker && 'sync' in window.ServiceWorkerRegistration.prototype;
  const hasNotifications = 'Notification' in window;
  const hasCaches = 'caches' in window;

  return {
    backgroundSync: hasBackgroundSync,
    notifications: hasNotifications,
    offlineFirst: hasServiceWorker && hasCaches,
    advancedCaching: hasCaches
  };
}