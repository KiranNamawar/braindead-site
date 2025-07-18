/**
 * Intelligent cache invalidation system with versioning and dependency tracking
 */

interface CacheInvalidationRule {
  pattern: RegExp;
  dependencies: string[];
  strategy: 'immediate' | 'lazy' | 'scheduled';
  ttl?: number;
}

interface CacheVersion {
  version: string;
  timestamp: number;
  assets: string[];
  dependencies: Map<string, string[]>;
}

interface InvalidationEvent {
  type: 'manual' | 'automatic' | 'dependency' | 'version';
  target: string;
  reason: string;
  timestamp: number;
}

class CacheInvalidationManager {
  private rules: Map<string, CacheInvalidationRule> = new Map();
  private versions: Map<string, CacheVersion> = new Map();
  private invalidationHistory: InvalidationEvent[] = [];
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initializeRules();
    this.initializeServiceWorker();
  }

  private initializeRules(): void {
    // Define cache invalidation rules
    const rules: Array<[string, CacheInvalidationRule]> = [
      // Tool pages - invalidate when tool logic changes
      ['tool-pages', {
        pattern: /^\/[a-z-]+$/,
        dependencies: ['app-version', 'tool-logic'],
        strategy: 'immediate'
      }],
      
      // Static assets - invalidate when version changes
      ['static-assets', {
        pattern: /\.(js|css|png|jpg|svg|ico)$/,
        dependencies: ['app-version'],
        strategy: 'immediate'
      }],
      
      // API responses - short TTL with dependency invalidation
      ['api-responses', {
        pattern: /^\/api\//,
        dependencies: ['data-version'],
        strategy: 'lazy',
        ttl: 5 * 60 * 1000 // 5 minutes
      }],
      
      // User preferences - invalidate on user action
      ['user-preferences', {
        pattern: /preferences|favorites|recent/,
        dependencies: ['user-action'],
        strategy: 'immediate'
      }],
      
      // Tool data - invalidate when tool updates
      ['tool-data', {
        pattern: /tool-data|tool-config/,
        dependencies: ['tool-version'],
        strategy: 'scheduled'
      }]
    ];

    rules.forEach(([name, rule]) => {
      this.rules.set(name, rule);
    });
  }

  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.ready;
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event);
        });
      } catch (error) {
        console.warn('Service worker not available for cache invalidation:', error);
      }
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data;
    
    switch (type) {
      case 'CACHE_INVALIDATED':
        this.recordInvalidation({
          type: 'automatic',
          target: data.target,
          reason: data.reason,
          timestamp: Date.now()
        });
        break;
        
      case 'CACHE_VERSION_UPDATED':
        this.updateVersion(data.name, data.version);
        break;
    }
  }

  // Invalidate cache based on pattern or specific key
  async invalidate(target: string, reason: string = 'Manual invalidation'): Promise<void> {
    try {
      // Check if target matches any rules
      const matchingRules = this.findMatchingRules(target);
      
      for (const [ruleName, rule] of matchingRules) {
        await this.executeInvalidation(target, rule, reason);
      }

      // Record invalidation event
      this.recordInvalidation({
        type: 'manual',
        target,
        reason,
        timestamp: Date.now()
      });

      // Notify service worker
      await this.notifyServiceWorker('INVALIDATE_CACHE', { target, reason });
      
    } catch (error) {
      console.error('Cache invalidation failed:', error);
    }
  }

  // Invalidate based on dependency changes
  async invalidateByDependency(dependency: string, reason: string = 'Dependency changed'): Promise<void> {
    try {
      const affectedRules = Array.from(this.rules.entries()).filter(([_, rule]) => 
        rule.dependencies.includes(dependency)
      );

      for (const [ruleName, rule] of affectedRules) {
        // Find all cached items matching this rule's pattern
        const cachedItems = await this.findCachedItemsByPattern(rule.pattern);
        
        for (const item of cachedItems) {
          await this.executeInvalidation(item, rule, reason);
        }
      }

      // Record dependency invalidation
      this.recordInvalidation({
        type: 'dependency',
        target: dependency,
        reason,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Dependency-based invalidation failed:', error);
    }
  }

  // Version-based invalidation
  async invalidateByVersion(versionName: string, newVersion: string): Promise<void> {
    try {
      const currentVersion = this.versions.get(versionName);
      
      if (!currentVersion || currentVersion.version !== newVersion) {
        // Version changed - invalidate all related assets
        if (currentVersion) {
          for (const asset of currentVersion.assets) {
            await this.invalidate(asset, `Version updated: ${currentVersion.version} → ${newVersion}`);
          }
        }

        // Update version
        this.updateVersion(versionName, newVersion);
        
        // Record version invalidation
        this.recordInvalidation({
          type: 'version',
          target: versionName,
          reason: `Version updated to ${newVersion}`,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Version-based invalidation failed:', error);
    }
  }

  private findMatchingRules(target: string): Array<[string, CacheInvalidationRule]> {
    return Array.from(this.rules.entries()).filter(([_, rule]) => 
      rule.pattern.test(target)
    );
  }

  private async executeInvalidation(target: string, rule: CacheInvalidationRule, reason: string): Promise<void> {
    switch (rule.strategy) {
      case 'immediate':
        await this.immediateInvalidation(target);
        break;
        
      case 'lazy':
        await this.lazyInvalidation(target, rule.ttl);
        break;
        
      case 'scheduled':
        await this.scheduledInvalidation(target);
        break;
    }
  }

  private async immediateInvalidation(target: string): Promise<void> {
    // Remove from all caches immediately
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        await cache.delete(target);
      }
    }

    // Remove from localStorage
    this.removeFromLocalStorage(target);
  }

  private async lazyInvalidation(target: string, ttl?: number): Promise<void> {
    // Mark for lazy invalidation - will be removed on next access
    const invalidationKey = `lazy_invalidation_${target}`;
    const invalidationData = {
      target,
      timestamp: Date.now(),
      ttl: ttl || 0
    };
    
    localStorage.setItem(invalidationKey, JSON.stringify(invalidationData));
  }

  private async scheduledInvalidation(target: string): Promise<void> {
    // Schedule invalidation for next maintenance window
    const scheduledKey = `scheduled_invalidation_${Date.now()}`;
    const scheduledData = {
      target,
      scheduledFor: Date.now() + (60 * 60 * 1000), // 1 hour from now
      reason: 'Scheduled maintenance'
    };
    
    localStorage.setItem(scheduledKey, JSON.stringify(scheduledData));
  }

  private removeFromLocalStorage(pattern: string): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes(pattern) || new RegExp(pattern).test(key))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  private async findCachedItemsByPattern(pattern: RegExp): Promise<string[]> {
    const cachedItems: string[] = [];
    
    // Check caches API
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          if (pattern.test(request.url)) {
            cachedItems.push(request.url);
          }
        }
      }
    }
    
    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && pattern.test(key)) {
        cachedItems.push(key);
      }
    }
    
    return [...new Set(cachedItems)]; // Remove duplicates
  }

  private updateVersion(name: string, version: string): void {
    this.versions.set(name, {
      version,
      timestamp: Date.now(),
      assets: [],
      dependencies: new Map()
    });
  }

  private recordInvalidation(event: InvalidationEvent): void {
    this.invalidationHistory.push(event);
    
    // Keep only last 100 events
    if (this.invalidationHistory.length > 100) {
      this.invalidationHistory = this.invalidationHistory.slice(-100);
    }
  }

  private async notifyServiceWorker(type: string, data: any): Promise<void> {
    if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.active) {
      this.serviceWorkerRegistration.active.postMessage({ type, data });
    }
  }

  // Process scheduled invalidations
  async processScheduledInvalidations(): Promise<void> {
    try {
      const now = Date.now();
      const keysToProcess: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('scheduled_invalidation_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.scheduledFor <= now) {
              keysToProcess.push(key);
              await this.invalidate(data.target, data.reason);
            }
          } catch {
            // Remove corrupted scheduled invalidation
            keysToProcess.push(key);
          }
        }
      }
      
      // Clean up processed scheduled invalidations
      keysToProcess.forEach(key => localStorage.removeItem(key));
      
    } catch (error) {
      console.error('Failed to process scheduled invalidations:', error);
    }
  }

  // Check if item should be lazily invalidated
  shouldInvalidateLazily(target: string): boolean {
    const invalidationKey = `lazy_invalidation_${target}`;
    const invalidationData = localStorage.getItem(invalidationKey);
    
    if (!invalidationData) return false;
    
    try {
      const data = JSON.parse(invalidationData);
      const isExpired = data.ttl > 0 && (Date.now() - data.timestamp) > data.ttl;
      
      if (isExpired) {
        localStorage.removeItem(invalidationKey);
        return true;
      }
      
      return false;
    } catch {
      localStorage.removeItem(invalidationKey);
      return true;
    }
  }

  // Get invalidation statistics
  getInvalidationStats(): {
    totalInvalidations: number;
    byType: { [key: string]: number };
    recentInvalidations: InvalidationEvent[];
    activeRules: number;
    scheduledInvalidations: number;
  } {
    const byType: { [key: string]: number } = {};
    
    this.invalidationHistory.forEach(event => {
      byType[event.type] = (byType[event.type] || 0) + 1;
    });
    
    // Count scheduled invalidations
    let scheduledCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('scheduled_invalidation_')) {
        scheduledCount++;
      }
    }
    
    return {
      totalInvalidations: this.invalidationHistory.length,
      byType,
      recentInvalidations: this.invalidationHistory.slice(-10),
      activeRules: this.rules.size,
      scheduledInvalidations: scheduledCount
    };
  }

  // Clear all caches (nuclear option)
  async clearAllCaches(): Promise<void> {
    try {
      // Clear caches API
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Clear localStorage cache entries
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('cache_') || key.includes('invalidation'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Record nuclear invalidation
      this.recordInvalidation({
        type: 'manual',
        target: 'ALL_CACHES',
        reason: 'Nuclear cache clear',
        timestamp: Date.now()
      });
      
      // Notify service worker
      await this.notifyServiceWorker('CLEAR_ALL_CACHES', {});
      
    } catch (error) {
      console.error('Failed to clear all caches:', error);
    }
  }
}

// Create singleton instance
const cacheInvalidationManager = new CacheInvalidationManager();

// Export functions for use throughout the app
export const invalidateCache = (target: string, reason?: string) => 
  cacheInvalidationManager.invalidate(target, reason);

export const invalidateByDependency = (dependency: string, reason?: string) => 
  cacheInvalidationManager.invalidateByDependency(dependency, reason);

export const invalidateByVersion = (versionName: string, newVersion: string) => 
  cacheInvalidationManager.invalidateByVersion(versionName, newVersion);

export const shouldInvalidateLazily = (target: string) => 
  cacheInvalidationManager.shouldInvalidateLazily(target);

export const getInvalidationStats = () => 
  cacheInvalidationManager.getInvalidationStats();

export const clearAllCaches = () => 
  cacheInvalidationManager.clearAllCaches();

// Initialize cache invalidation system
export function initializeCacheInvalidation(): void {
  // Process scheduled invalidations on startup
  cacheInvalidationManager.processScheduledInvalidations();
  
  // Set up periodic processing of scheduled invalidations
  setInterval(() => {
    cacheInvalidationManager.processScheduledInvalidations();
  }, 60 * 60 * 1000); // Every hour
  
  // Listen for app version changes
  const currentVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
  const storedVersion = localStorage.getItem('app_version');
  
  if (storedVersion && storedVersion !== currentVersion) {
    cacheInvalidationManager.invalidateByVersion('app-version', currentVersion);
  }
  
  localStorage.setItem('app_version', currentVersion);
}

export default cacheInvalidationManager;