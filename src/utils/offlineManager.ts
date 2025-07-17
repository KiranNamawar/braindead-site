// Enhanced offline functionality manager for tool operations
import { storageManager } from './storage';
import { ToolCategory } from '../types';

interface OfflineQueueItem {
  id: string;
  type: 'analytics' | 'preferences' | 'tool-data' | 'export';
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

interface OfflineCapability {
  toolId: string;
  offlineFeatures: string[];
  requiresNetwork: string[];
  fallbackBehavior: 'cache' | 'local-only' | 'queue';
}

class OfflineManager {
  private isOnline: boolean = navigator.onLine;
  private offlineQueue: OfflineQueueItem[] = [];
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  // Define offline capabilities for each tool category
  private offlineCapabilities: Record<ToolCategory, OfflineCapability[]> = {
    [ToolCategory.CALCULATOR]: [
      {
        toolId: 'calculator',
        offlineFeatures: ['basic-math', 'scientific-functions', 'history'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'tip-calculator',
        offlineFeatures: ['tip-calculation', 'bill-splitting', 'currency-formatting'],
        requiresNetwork: ['exchange-rates'],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'age-calculator',
        offlineFeatures: ['age-calculation', 'date-math', 'timezone-basic'],
        requiresNetwork: ['timezone-data-updates'],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'bmi-calculator',
        offlineFeatures: ['bmi-calculation', 'health-categories', 'unit-conversion'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'loan-calculator',
        offlineFeatures: ['payment-calculation', 'amortization-schedule', 'interest-calculation'],
        requiresNetwork: ['current-rates'],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'percentage-calculator',
        offlineFeatures: ['percentage-math', 'increase-decrease', 'ratio-calculation'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'grade-calculator',
        offlineFeatures: ['grade-calculation', 'gpa-calculation', 'weighted-grades'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      }
    ],
    [ToolCategory.TEXT_WRITING]: [
      {
        toolId: 'word-counter',
        offlineFeatures: ['word-count', 'character-count', 'reading-time', 'keyword-density'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'text-case-converter',
        offlineFeatures: ['case-conversion', 'batch-processing', 'preview'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'lorem-ipsum',
        offlineFeatures: ['text-generation', 'word-count-control', 'paragraph-generation'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'diff-checker',
        offlineFeatures: ['text-comparison', 'line-diff', 'word-diff', 'character-diff'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'text-summarizer',
        offlineFeatures: ['extractive-summarization', 'key-sentence-extraction'],
        requiresNetwork: ['ai-summarization'],
        fallbackBehavior: 'local-only'
      }
    ],
    [ToolCategory.CREATIVE_DESIGN]: [
      {
        toolId: 'gradient-generator',
        offlineFeatures: ['gradient-creation', 'color-picker', 'css-generation', 'preview'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'ascii-art-generator',
        offlineFeatures: ['text-to-ascii', 'font-styles', 'templates'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'favicon-generator',
        offlineFeatures: ['favicon-creation', 'size-generation', 'preview'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      }
    ],
    [ToolCategory.TIME_PRODUCTIVITY]: [
      {
        toolId: 'pomodoro-timer',
        offlineFeatures: ['timer-functionality', 'session-tracking', 'notifications', 'statistics'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'world-clock',
        offlineFeatures: ['timezone-display', 'time-conversion', 'basic-timezones'],
        requiresNetwork: ['timezone-updates', 'dst-changes'],
        fallbackBehavior: 'cache'
      },
      {
        toolId: 'stopwatch-timer',
        offlineFeatures: ['stopwatch', 'lap-times', 'countdown-timer', 'multiple-timers'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'countdown-timer',
        offlineFeatures: ['countdown-functionality', 'event-management', 'notifications'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      }
    ],
    [ToolCategory.DEVELOPER]: [
      {
        toolId: 'base64-encoder',
        offlineFeatures: ['encoding', 'decoding', 'file-processing', 'batch-operations'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'url-encoder',
        offlineFeatures: ['url-encoding', 'url-decoding', 'component-parsing'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'markdown-editor',
        offlineFeatures: ['markdown-editing', 'live-preview', 'syntax-highlighting', 'export'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'uuid-generator',
        offlineFeatures: ['uuid-generation', 'multiple-versions', 'bulk-generation'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'jwt-decoder',
        offlineFeatures: ['jwt-parsing', 'payload-display', 'header-analysis'],
        requiresNetwork: ['signature-verification'],
        fallbackBehavior: 'local-only'
      }
    ],
    [ToolCategory.NUMBER_CONVERSION]: [
      {
        toolId: 'number-converter',
        offlineFeatures: ['base-conversion', 'step-explanation', 'batch-conversion'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      },
      {
        toolId: 'roman-numeral',
        offlineFeatures: ['roman-conversion', 'validation', 'historical-context'],
        requiresNetwork: [],
        fallbackBehavior: 'local-only'
      }
    ],
    [ToolCategory.EVERYDAY_LIFE]: [],
    [ToolCategory.UTILITY]: []
  };

  constructor() {
    this.initializeOfflineManager();
    this.setupEventListeners();
    this.loadOfflineQueue();
  }

  private initializeOfflineManager(): void {
    // Register service worker if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          this.serviceWorkerRegistration = registration;
          console.log('Service Worker registered successfully');
          
          // Listen for service worker messages
          navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  this.emit('sw-update-available');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('Service Worker registration failed:', error);
        });
    }
  }

  private setupEventListeners(): void {
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('online');
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('offline');
    });

    // Page visibility for background sync
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.processOfflineQueue();
      }
    });
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event;
    
    switch (data.type) {
      case 'SW_UPDATED':
        this.emit('sw-updated', data.version);
        break;
      case 'OFFLINE_SYNC_SUCCESS':
        this.emit('sync-success', data.request);
        break;
      case 'CACHE_UPDATED':
        this.emit('cache-updated', data.cache);
        break;
    }
  }

  // Event emitter functionality
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Offline queue management
  private loadOfflineQueue(): void {
    try {
      const stored = localStorage.getItem('braindead-offline-queue');
      if (stored) {
        this.offlineQueue = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  private saveOfflineQueue(): void {
    try {
      localStorage.setItem('braindead-offline-queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.warn('Failed to save offline queue:', error);
    }
  }

  public addToOfflineQueue(type: OfflineQueueItem['type'], data: any): string {
    const id = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const item: OfflineQueueItem = {
      id,
      type,
      data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3
    };

    this.offlineQueue.push(item);
    this.saveOfflineQueue();
    
    // Try to process immediately if online
    if (this.isOnline) {
      setTimeout(() => this.processOfflineQueue(), 100);
    }

    return id;
  }

  private async processOfflineQueue(): Promise<void> {
    if (!this.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    const itemsToProcess = [...this.offlineQueue];
    
    for (const item of itemsToProcess) {
      try {
        const success = await this.processQueueItem(item);
        
        if (success) {
          // Remove from queue
          this.offlineQueue = this.offlineQueue.filter(q => q.id !== item.id);
          this.emit('queue-item-processed', { item, success: true });
        } else {
          // Increment retry count
          item.retryCount++;
          if (item.retryCount >= item.maxRetries) {
            // Remove failed item after max retries
            this.offlineQueue = this.offlineQueue.filter(q => q.id !== item.id);
            this.emit('queue-item-failed', { item, reason: 'max-retries' });
          }
        }
      } catch (error) {
        console.warn('Failed to process queue item:', error);
        item.retryCount++;
        if (item.retryCount >= item.maxRetries) {
          this.offlineQueue = this.offlineQueue.filter(q => q.id !== item.id);
          this.emit('queue-item-failed', { item, reason: 'error', error });
        }
      }
    }

    this.saveOfflineQueue();
  }

  private async processQueueItem(item: OfflineQueueItem): Promise<boolean> {
    switch (item.type) {
      case 'analytics':
        return this.syncAnalytics(item.data);
      case 'preferences':
        return this.syncPreferences(item.data);
      case 'tool-data':
        return this.syncToolData(item.data);
      case 'export':
        return this.syncExport(item.data);
      default:
        return false;
    }
  }

  private async syncAnalytics(data: any): Promise<boolean> {
    // Since we're privacy-focused, analytics are local-only
    // This would typically sync with a privacy-respecting analytics service
    return true;
  }

  private async syncPreferences(data: any): Promise<boolean> {
    // Preferences are local-only, no sync needed
    return true;
  }

  private async syncToolData(data: any): Promise<boolean> {
    // Tool data is processed locally, no sync needed
    return true;
  }

  private async syncExport(data: any): Promise<boolean> {
    // Exports are local-only, no sync needed
    return true;
  }

  // Tool offline capability checks
  public isToolAvailableOffline(toolId: string): boolean {
    for (const category of Object.values(this.offlineCapabilities)) {
      const tool = category.find(t => t.toolId === toolId);
      if (tool) {
        return tool.offlineFeatures.length > 0;
      }
    }
    return false;
  }

  public getToolOfflineFeatures(toolId: string): string[] {
    for (const category of Object.values(this.offlineCapabilities)) {
      const tool = category.find(t => t.toolId === toolId);
      if (tool) {
        return tool.offlineFeatures;
      }
    }
    return [];
  }

  public getToolNetworkRequirements(toolId: string): string[] {
    for (const category of Object.values(this.offlineCapabilities)) {
      const tool = category.find(t => t.toolId === toolId);
      if (tool) {
        return tool.requiresNetwork;
      }
    }
    return [];
  }

  // Offline data persistence
  public persistToolData(toolId: string, data: any): void {
    try {
      const key = `braindead-tool-data-${toolId}`;
      const persistData = {
        data,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      localStorage.setItem(key, JSON.stringify(persistData));
    } catch (error) {
      console.warn(`Failed to persist data for tool ${toolId}:`, error);
    }
  }

  public getPersistedToolData(toolId: string): any | null {
    try {
      const key = `braindead-tool-data-${toolId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data;
      }
    } catch (error) {
      console.warn(`Failed to get persisted data for tool ${toolId}:`, error);
    }
    return null;
  }

  public clearPersistedToolData(toolId: string): void {
    try {
      const key = `braindead-tool-data-${toolId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to clear persisted data for tool ${toolId}:`, error);
    }
  }

  // Cache management
  public async getCacheStatus(): Promise<any> {
    if (!this.serviceWorkerRegistration) {
      return { error: 'Service Worker not available' };
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      this.serviceWorkerRegistration!.active?.postMessage(
        { type: 'GET_CACHE_STATUS' },
        [messageChannel.port2]
      );
    });
  }

  public async clearCache(cacheName: string = 'all'): Promise<boolean> {
    if (!this.serviceWorkerRegistration) {
      return false;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success);
      };

      this.serviceWorkerRegistration!.active?.postMessage(
        { type: 'CLEAR_CACHE', cacheName },
        [messageChannel.port2]
      );
    });
  }

  // Utility methods
  public isOnlineStatus(): boolean {
    return this.isOnline;
  }

  public getOfflineQueueSize(): number {
    return this.offlineQueue.length;
  }

  public getOfflineQueueItems(): OfflineQueueItem[] {
    return [...this.offlineQueue];
  }

  public clearOfflineQueue(): void {
    this.offlineQueue = [];
    this.saveOfflineQueue();
  }

  // Service worker update management
  public async updateServiceWorker(): Promise<void> {
    if (this.serviceWorkerRegistration) {
      const newWorker = this.serviceWorkerRegistration.installing || this.serviceWorkerRegistration.waiting;
      if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }
}

// Create singleton instance
export const offlineManager = new OfflineManager();

// Convenience functions
export const isToolAvailableOffline = (toolId: string) => offlineManager.isToolAvailableOffline(toolId);
export const getToolOfflineFeatures = (toolId: string) => offlineManager.getToolOfflineFeatures(toolId);
export const getToolNetworkRequirements = (toolId: string) => offlineManager.getToolNetworkRequirements(toolId);
export const persistToolData = (toolId: string, data: any) => offlineManager.persistToolData(toolId, data);
export const getPersistedToolData = (toolId: string) => offlineManager.getPersistedToolData(toolId);
export const isOnline = () => offlineManager.isOnlineStatus();
export const addToOfflineQueue = (type: OfflineQueueItem['type'], data: any) => offlineManager.addToOfflineQueue(type, data);