/**
 * Advanced caching utilities with intelligent cache invalidation and CDN optimization
 */

interface CacheConfig {
  name: string;
  version: string;
  maxAge: number;
  maxEntries: number;
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
}

interface CacheEntry {
  data: any;
  timestamp: number;
  version: string;
  etag?: string;
  lastModified?: string;
}

interface CDNConfig {
  baseUrl: string;
  regions: string[];
  optimizations: {
    images: boolean;
    css: boolean;
    js: boolean;
    compression: boolean;
  };
}

class AdvancedCacheManager {
  private caches: Map<string, CacheConfig> = new Map();
  private cdnConfig: CDNConfig | null = null;

  constructor() {
    this.initializeCacheConfigs();
    this.setupCDNConfig();
  }

  private initializeCacheConfigs(): void {
    const configs: CacheConfig[] = [
      {
        name: 'static-assets',
        version: '1.0.0',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        maxEntries: 100,
        strategy: 'cache-first'
      },
      {
        name: 'tool-data',
        version: '1.0.0',
        maxAge: 60 * 60 * 1000, // 1 hour
        maxEntries: 50,
        strategy: 'stale-while-revalidate'
      },
      {
        name: 'user-preferences',
        version: '1.0.0',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxEntries: 10,
        strategy: 'cache-first'
      },
      {
        name: 'api-responses',
        version: '1.0.0',
        maxAge: 5 * 60 * 1000, // 5 minutes
        maxEntries: 25,
        strategy: 'network-first'
      }
    ];

    configs.forEach(config => {
      this.caches.set(config.name, config);
    });
  }

  private setupCDNConfig(): void {
    // In a real implementation, this would be configured based on deployment
    this.cdnConfig = {
      baseUrl: window.location.origin,
      regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
      optimizations: {
        images: true,
        css: true,
        js: true,
        compression: true
      }
    };
  }

  // Intelligent cache with ETags and conditional requests
  async get(key: string, cacheName: string = 'default'): Promise<any> {
    try {
      const cacheConfig = this.caches.get(cacheName);
      if (!cacheConfig) {
        console.warn(`Cache config not found: ${cacheName}`);
        return null;
      }

      const cacheKey = this.generateCacheKey(key, cacheConfig.version);
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const entry: CacheEntry = JSON.parse(cached);
        
        // Check if cache is still valid
        if (this.isCacheValid(entry, cacheConfig.maxAge)) {
          // For stale-while-revalidate, update in background
          if (cacheConfig.strategy === 'stale-while-revalidate') {
            this.backgroundRefresh(key, cacheName);
          }
          return entry.data;
        }
      }

      // Cache miss or expired - fetch fresh data
      return this.fetchAndCache(key, cacheName);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, data: any, cacheName: string = 'default', metadata?: { etag?: string; lastModified?: string }): Promise<void> {
    try {
      const cacheConfig = this.caches.get(cacheName);
      if (!cacheConfig) {
        console.warn(`Cache config not found: ${cacheName}`);
        return;
      }

      const cacheKey = this.generateCacheKey(key, cacheConfig.version);
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        version: cacheConfig.version,
        etag: metadata?.etag,
        lastModified: metadata?.lastModified
      };

      localStorage.setItem(cacheKey, JSON.stringify(entry));
      
      // Enforce cache size limits
      await this.enforceMaxEntries(cacheName);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidate(key: string, cacheName: string = 'default'): Promise<void> {
    try {
      const cacheConfig = this.caches.get(cacheName);
      if (!cacheConfig) return;

      const cacheKey = this.generateCacheKey(key, cacheConfig.version);
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  async invalidateAll(cacheName: string): Promise<void> {
    try {
      const cacheConfig = this.caches.get(cacheName);
      if (!cacheConfig) return;

      const prefix = `cache_${cacheName}_${cacheConfig.version}_`;
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Cache invalidate all error:', error);
    }
  }

  private generateCacheKey(key: string, version: string): string {
    return `cache_${key}_${version}_${this.hashString(key)}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private isCacheValid(entry: CacheEntry, maxAge: number): boolean {
    return (Date.now() - entry.timestamp) < maxAge;
  }

  private async backgroundRefresh(key: string, cacheName: string): Promise<void> {
    // Use requestIdleCallback for background updates
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.fetchAndCache(key, cacheName);
      });
    } else {
      setTimeout(() => {
        this.fetchAndCache(key, cacheName);
      }, 100);
    }
  }

  private async fetchAndCache(key: string, cacheName: string): Promise<any> {
    try {
      const cacheConfig = this.caches.get(cacheName);
      if (!cacheConfig) return null;

      // This would be replaced with actual API calls
      const response = await this.fetchWithCDN(key);
      
      if (response) {
        await this.set(key, response.data, cacheName, {
          etag: response.etag,
          lastModified: response.lastModified
        });
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Fetch and cache error:', error);
      return null;
    }
  }

  private async fetchWithCDN(key: string): Promise<{ data: any; etag?: string; lastModified?: string } | null> {
    // Simulate CDN fetch with optimization
    try {
      const optimizedUrl = this.optimizeUrl(key);
      const response = await fetch(optimizedUrl, {
        headers: this.getOptimizedHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        return {
          data,
          etag: response.headers.get('etag') || undefined,
          lastModified: response.headers.get('last-modified') || undefined
        };
      }

      return null;
    } catch (error) {
      console.error('CDN fetch error:', error);
      return null;
    }
  }

  private optimizeUrl(url: string): string {
    if (!this.cdnConfig) return url;

    // Add CDN optimizations
    const params = new URLSearchParams();
    
    if (this.cdnConfig.optimizations.compression) {
      params.set('compress', 'true');
    }

    // Add WebP support for images
    if (url.match(/\.(jpg|jpeg|png)$/i) && this.supportsWebP()) {
      params.set('format', 'webp');
    }

    // Add quality optimization for images
    if (url.match(/\.(jpg|jpeg|png|webp)$/i)) {
      params.set('quality', '85');
    }

    const optimizedUrl = params.toString() ? `${url}?${params.toString()}` : url;
    return optimizedUrl;
  }

  private getOptimizedHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    // Add compression headers
    if (this.cdnConfig?.optimizations.compression) {
      headers['Accept-Encoding'] = 'gzip, deflate, br';
    }

    // Add WebP support
    if (this.supportsWebP()) {
      headers['Accept'] = 'image/webp,image/avif,image/*,*/*;q=0.8';
    }

    return headers;
  }

  private supportsWebP(): boolean {
    // Check WebP support
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  private async enforceMaxEntries(cacheName: string): Promise<void> {
    try {
      const cacheConfig = this.caches.get(cacheName);
      if (!cacheConfig) return;

      const prefix = `cache_${cacheName}_${cacheConfig.version}_`;
      const entries: { key: string; timestamp: number }[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          try {
            const entry: CacheEntry = JSON.parse(localStorage.getItem(key) || '{}');
            entries.push({ key, timestamp: entry.timestamp || 0 });
          } catch {
            // Remove corrupted entries
            localStorage.removeItem(key);
          }
        }
      }

      // Remove oldest entries if over limit
      if (entries.length > cacheConfig.maxEntries) {
        entries.sort((a, b) => a.timestamp - b.timestamp);
        const toRemove = entries.slice(0, entries.length - cacheConfig.maxEntries);
        toRemove.forEach(entry => localStorage.removeItem(entry.key));
      }
    } catch (error) {
      console.error('Enforce max entries error:', error);
    }
  }

  // Cache statistics
  getCacheStats(cacheName: string): { size: number; entries: number; oldestEntry: number; newestEntry: number } {
    try {
      const cacheConfig = this.caches.get(cacheName);
      if (!cacheConfig) {
        return { size: 0, entries: 0, oldestEntry: 0, newestEntry: 0 };
      }

      const prefix = `cache_${cacheName}_${cacheConfig.version}_`;
      let size = 0;
      let entries = 0;
      let oldestEntry = Date.now();
      let newestEntry = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            size += value.length;
            entries++;
            
            try {
              const entry: CacheEntry = JSON.parse(value);
              oldestEntry = Math.min(oldestEntry, entry.timestamp);
              newestEntry = Math.max(newestEntry, entry.timestamp);
            } catch {
              // Skip corrupted entries
            }
          }
        }
      }

      return { size, entries, oldestEntry, newestEntry };
    } catch (error) {
      console.error('Get cache stats error:', error);
      return { size: 0, entries: 0, oldestEntry: 0, newestEntry: 0 };
    }
  }

  // Clear expired entries
  async clearExpired(): Promise<void> {
    try {
      for (const [cacheName, config] of this.caches.entries()) {
        const prefix = `cache_${cacheName}_${config.version}_`;
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            try {
              const value = localStorage.getItem(key);
              if (value) {
                const entry: CacheEntry = JSON.parse(value);
                if (!this.isCacheValid(entry, config.maxAge)) {
                  keysToRemove.push(key);
                }
              }
            } catch {
              // Remove corrupted entries
              keysToRemove.push(key);
            }
          }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Clear expired error:', error);
    }
  }
}

// Create singleton instance
const cacheManager = new AdvancedCacheManager();

// Export functions for use throughout the app
export const getFromCache = (key: string, cacheName?: string) => 
  cacheManager.get(key, cacheName);

export const setInCache = (key: string, data: any, cacheName?: string, metadata?: { etag?: string; lastModified?: string }) => 
  cacheManager.set(key, data, cacheName, metadata);

export const invalidateCache = (key: string, cacheName?: string) => 
  cacheManager.invalidate(key, cacheName);

export const invalidateAllCache = (cacheName: string) => 
  cacheManager.invalidateAll(cacheName);

export const getCacheStats = (cacheName: string) => 
  cacheManager.getCacheStats(cacheName);

export const clearExpiredCache = () => 
  cacheManager.clearExpired();

// Initialize cache cleanup on app start
export function initializeCacheManager(): void {
  // Clear expired entries on startup
  cacheManager.clearExpired();

  // Set up periodic cleanup
  setInterval(() => {
    cacheManager.clearExpired();
  }, 60 * 60 * 1000); // Every hour
}

export default cacheManager;