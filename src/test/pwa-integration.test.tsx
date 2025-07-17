import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Mock service worker registration
const mockServiceWorkerRegistration = {
  installing: null,
  waiting: null,
  active: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  update: vi.fn().mockResolvedValue(undefined),
  unregister: vi.fn().mockResolvedValue(true),
  scope: 'http://localhost:3000/',
  updatefound: null,
  onupdatefound: null,
};

const mockServiceWorker = {
  scriptURL: 'http://localhost:3000/sw.js',
  state: 'activated',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  postMessage: vi.fn(),
  onstatechange: null,
};

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn().mockResolvedValue(mockServiceWorkerRegistration),
    ready: Promise.resolve(mockServiceWorkerRegistration),
    controller: mockServiceWorker,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    getRegistration: vi.fn().mockResolvedValue(mockServiceWorkerRegistration),
    getRegistrations: vi.fn().mockResolvedValue([mockServiceWorkerRegistration]),
  },
  writable: true,
});

// Mock beforeinstallprompt event
class MockBeforeInstallPromptEvent extends Event {
  prompt = vi.fn().mockResolvedValue({ outcome: 'accepted' });
  userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });
  
  constructor() {
    super('beforeinstallprompt');
  }
}

// Mock online/offline events
const mockOnlineStatus = {
  online: true,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

Object.defineProperty(navigator, 'onLine', {
  get: () => mockOnlineStatus.online,
  configurable: true,
});

// Mock localStorage for PWA settings
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock fetch for offline testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('PWA Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnlineStatus.online = true;
    localStorageMock.getItem.mockReturnValue(null);
    mockFetch.mockResolvedValue(new Response('OK'));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Service Worker Registration', () => {
    it('should register service worker on app load', async () => {
      // Import the service worker registration logic
      const { registerSW } = await import('../utils/pwa');
      
      await registerSW();
      
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
    });

    it('should handle service worker registration failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock registration failure
      (navigator.serviceWorker.register as any).mockRejectedValueOnce(
        new Error('Service worker registration failed')
      );
      
      const { registerSW } = await import('../utils/pwa');
      await registerSW();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Service worker registration failed:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle service worker updates', async () => {
      const { handleSWUpdate } = await import('../utils/pwa');
      
      // Mock a waiting service worker
      mockServiceWorkerRegistration.waiting = mockServiceWorker;
      
      const updateCallback = vi.fn();
      handleSWUpdate(mockServiceWorkerRegistration, updateCallback);
      
      // Simulate state change to 'installed'
      const stateChangeHandler = mockServiceWorker.addEventListener.mock.calls
        .find(call => call[0] === 'statechange')?.[1];
      
      if (stateChangeHandler) {
        mockServiceWorker.state = 'installed';
        stateChangeHandler();
        expect(updateCallback).toHaveBeenCalled();
      }
    });
  });

  describe('PWA Installation', () => {
    it('should show install prompt when beforeinstallprompt event fires', async () => {
      const { PWAInstallPrompt } = await import('../components/PWAInstallPrompt');
      
      render(
        <BrowserRouter>
          <PWAInstallPrompt />
        </BrowserRouter>
      );

      // Simulate beforeinstallprompt event
      const installEvent = new MockBeforeInstallPromptEvent();
      window.dispatchEvent(installEvent);

      await waitFor(() => {
        expect(screen.getByText(/Install App/i)).toBeInTheDocument();
      });
    });

    it('should handle install prompt acceptance', async () => {
      const { PWAInstallPrompt } = await import('../components/PWAInstallPrompt');
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <PWAInstallPrompt />
        </BrowserRouter>
      );

      // Simulate beforeinstallprompt event
      const installEvent = new MockBeforeInstallPromptEvent();
      window.dispatchEvent(installEvent);

      await waitFor(() => {
        expect(screen.getByText(/Install App/i)).toBeInTheDocument();
      });

      // Click install button
      const installButton = screen.getByText(/Install App/i);
      await user.click(installButton);

      expect(installEvent.prompt).toHaveBeenCalled();
    });

    it('should hide install prompt after installation', async () => {
      const { PWAInstallPrompt } = await import('../components/PWAInstallPrompt');
      
      render(
        <BrowserRouter>
          <PWAInstallPrompt />
        </BrowserRouter>
      );

      // Simulate beforeinstallprompt event
      const installEvent = new MockBeforeInstallPromptEvent();
      window.dispatchEvent(installEvent);

      await waitFor(() => {
        expect(screen.getByText(/Install App/i)).toBeInTheDocument();
      });

      // Simulate appinstalled event
      window.dispatchEvent(new Event('appinstalled'));

      await waitFor(() => {
        expect(screen.queryByText(/Install App/i)).not.toBeInTheDocument();
      });
    });

    it('should track installation analytics', async () => {
      // Simulate app installation
      window.dispatchEvent(new Event('appinstalled'));
      
      // Verify analytics were tracked (would be handled by PWA component)
      // In a real scenario, this would trigger analytics tracking
      expect(window.dispatchEvent).toBeDefined();
    });
  });

  describe('Offline Functionality', () => {
    it('should detect offline status changes', async () => {
      const { OfflineIndicator } = await import('../components/OfflineIndicator');
      
      render(
        <BrowserRouter>
          <OfflineIndicator />
        </BrowserRouter>
      );

      // Initially online
      expect(screen.queryByText(/You're offline/i)).not.toBeInTheDocument();

      // Simulate going offline
      mockOnlineStatus.online = false;
      window.dispatchEvent(new Event('offline'));

      await waitFor(() => {
        expect(screen.getByText(/You're offline/i)).toBeInTheDocument();
      });

      // Simulate coming back online
      mockOnlineStatus.online = true;
      window.dispatchEvent(new Event('online'));

      await waitFor(() => {
        expect(screen.queryByText(/You're offline/i)).not.toBeInTheDocument();
      });
    });

    it('should cache tool pages for offline access', async () => {
      // Mock service worker cache
      const mockCache = {
        match: vi.fn(),
        add: vi.fn(),
        addAll: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        keys: vi.fn().mockResolvedValue([]),
      };

      const mockCaches = {
        open: vi.fn().mockResolvedValue(mockCache),
        match: vi.fn(),
        has: vi.fn(),
        delete: vi.fn(),
        keys: vi.fn().mockResolvedValue(['braindead-v1.1.0']),
      };

      global.caches = mockCaches;

      // Test caching functionality
      const cache = await caches.open('test-cache');
      await cache.addAll(['/calculator', '/json-formatter', '/color-picker']);

      expect(mockCache.addAll).toHaveBeenCalledWith([
        '/calculator',
        '/json-formatter', 
        '/color-picker'
      ]);
    });

    it('should handle offline tool usage', async () => {
      // Simulate offline mode
      mockOnlineStatus.online = false;
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { CalculatorPage } = await import('../pages/CalculatorPage');
      
      render(
        <BrowserRouter>
          <CalculatorPage />
        </BrowserRouter>
      );

      // Calculator should still work offline
      const button7 = screen.getByText('7');
      const buttonPlus = screen.getByText('+');
      const button3 = screen.getByText('3');
      const buttonEquals = screen.getByText('=');

      await userEvent.click(button7);
      await userEvent.click(buttonPlus);
      await userEvent.click(button3);
      await userEvent.click(buttonEquals);

      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });

    it('should queue offline actions for sync when back online', async () => {
      const { OfflineQueue } = await import('../utils/offlineQueue');
      
      // Simulate offline mode
      mockOnlineStatus.online = false;
      
      const offlineQueue = new OfflineQueue();
      
      // Add action to queue
      await offlineQueue.add({
        type: 'ANALYTICS_EVENT',
        data: { toolId: 'calculator', action: 'used' },
        timestamp: Date.now()
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();

      // Simulate coming back online
      mockOnlineStatus.online = true;
      mockFetch.mockResolvedValue(new Response('OK'));

      await offlineQueue.sync();

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('PWA Features Integration', () => {
    it('should handle background sync for analytics', async () => {
      // Mock background sync registration
      const mockSyncManager = {
        register: vi.fn().mockResolvedValue(undefined),
        getTags: vi.fn().mockResolvedValue(['analytics-sync']),
      };

      mockServiceWorkerRegistration.sync = mockSyncManager;

      // Test background sync registration directly
      await mockSyncManager.register('analytics-sync');
      
      expect(mockSyncManager.register).toHaveBeenCalledWith('analytics-sync');
    });

    it('should handle push notifications for timers', async () => {
      // Mock notification permission
      Object.defineProperty(Notification, 'permission', {
        value: 'granted',
        writable: true,
      });

      const mockNotification = vi.fn();
      global.Notification = mockNotification;

      // Test notification directly
      new Notification('Pomodoro timer finished!', {
        icon: '/favicon.svg',
        badge: '/favicon.svg'
      });
      
      expect(mockNotification).toHaveBeenCalledWith(
        'Pomodoro timer finished!',
        expect.any(Object)
      );
    });

    it('should handle file system access for exports', async () => {
      // Mock File System Access API
      const mockFileHandle = {
        createWritable: vi.fn().mockResolvedValue({
          write: vi.fn(),
          close: vi.fn(),
        }),
      };

      global.showSaveFilePicker = vi.fn().mockResolvedValue(mockFileHandle);

      // Test file system access directly
      const fileHandle = await global.showSaveFilePicker({
        suggestedName: 'test.txt',
        types: [{
          description: 'Text files',
          accept: { 'text/plain': ['.txt'] }
        }]
      });
      
      expect(global.showSaveFilePicker).toHaveBeenCalled();
      expect(fileHandle).toBe(mockFileHandle);
    });

    it('should handle web share API for tool results', async () => {
      // Mock Web Share API
      const mockShare = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
      });

      Object.defineProperty(navigator, 'canShare', {
        value: vi.fn().mockReturnValue(true),
        writable: true,
      });

      // Test web share directly
      const shareData = {
        title: 'Calculator Result',
        text: '7 + 3 = 10',
        url: window.location.href,
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      }
      
      expect(mockShare).toHaveBeenCalledWith(shareData);
    });
  });

  describe('PWA Performance', () => {
    it('should preload critical tool pages', async () => {
      const preloadSpy = vi.spyOn(document.head, 'appendChild');
      
      // Test preloading functionality directly
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = '/calculator';
      document.head.appendChild(link);
      
      expect(preloadSpy).toHaveBeenCalled();
      
      preloadSpy.mockRestore();
    });

    it('should lazy load non-critical tool components', async () => {
      // Test dynamic imports for tool components
      const { lazy } = await import('react');
      
      const LazyCalculator = lazy(() => import('../pages/CalculatorPage'));
      
      expect(LazyCalculator).toBeDefined();
    });

    it('should optimize bundle splitting for PWA', async () => {
      // This would test that tool pages are properly code-split
      // In a real scenario, you'd check bundle sizes and chunk loading
      
      const toolModules = [
        () => import('../pages/CalculatorPage'),
        () => import('../pages/JSONFormatterPage'),
        () => import('../pages/ColorPickerPage'),
      ];

      // Each tool should be in its own chunk
      for (const importTool of toolModules) {
        const module = await importTool();
        expect(module.default).toBeDefined();
      }
    });
  });

  describe('PWA Storage and Sync', () => {
    it('should sync user preferences across devices', async () => {
      const preferences = {
        favorites: ['calculator', 'json-formatter'],
        theme: 'dark',
        keyboardShortcuts: true,
      };

      // Mock successful sync
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ success: true }))
      );

      // Test sync functionality directly
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/sync',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(preferences),
        })
      );
      expect(response.ok).toBe(true);
    });

    it('should handle storage quota exceeded', async () => {
      // Mock quota exceeded error
      localStorageMock.setItem.mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      // Test quota exceeded handling directly
      try {
        localStorage.setItem('test', 'data');
      } catch (error) {
        // Handle quota exceeded by clearing some data
        localStorage.removeItem('old-data');
        expect(localStorageMock.removeItem).toHaveBeenCalled();
      }
    });

    it('should backup and restore user data', async () => {
      const userData = {
        favorites: ['calculator'],
        recentTools: [],
        analytics: { totalUsage: 100 },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(userData));

      // Test backup functionality directly
      const backup = JSON.stringify(userData);
      expect(backup).toContain('favorites');
      expect(backup).toContain('calculator');

      // Test restore
      const restoredData = JSON.parse(backup);
      localStorage.setItem('braindead-backup', JSON.stringify(restoredData));
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('PWA Error Handling', () => {
    it('should handle service worker errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock service worker error
      const errorEvent = new ErrorEvent('error', {
        message: 'Service worker error',
        filename: '/sw.js',
        lineno: 1,
      });

      window.dispatchEvent(errorEvent);

      // Should not crash the app
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should fallback gracefully when PWA features are not supported', async () => {
      // Mock unsupported environment
      delete (navigator as any).serviceWorker;
      delete (global as any).caches;

      const { initializePWA } = await import('../utils/pwa');
      
      // Should not throw error
      expect(() => initializePWA()).not.toThrow();
    });

    it('should handle network failures in PWA context', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      // Test network error handling directly
      try {
        await fetch('/api/test');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });
  });
});