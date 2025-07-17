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