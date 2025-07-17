// Production monitoring utilities
interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  timestamp: string;
  responseTime?: number;
}

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
}

class ProductionMonitor {
  private healthChecks: Map<string, HealthCheck> = new Map();
  private performanceMetrics: PerformanceMetrics | null = null;

  constructor() {
    this.initializePerformanceMonitoring();
    this.runHealthChecks();

    // Run health checks every 5 minutes
    setInterval(() => {
      this.runHealthChecks();
    }, 5 * 60 * 1000);
  }

  private initializePerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.collectPerformanceMetrics();
        }, 0);
      });
    }
  }

  private collectPerformanceMetrics(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    this.performanceMetrics = {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    };

    // Collect Web Vitals if available
    if ('PerformanceObserver' in window) {
      try {
        // First Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcp && this.performanceMetrics) {
            this.performanceMetrics.firstContentfulPaint = fcp.startTime;
          }
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries[entries.length - 1];
          if (lcp && this.performanceMetrics) {
            this.performanceMetrics.largestContentfulPaint = lcp.startTime;
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          if (this.performanceMetrics) {
            this.performanceMetrics.cumulativeLayoutShift = clsValue;
          }
        }).observe({ entryTypes: ['layout-shift'] });

        // First Input Delay
        new PerformanceObserver((list) => {
          const firstInput = list.getEntries()[0];
          if (firstInput && this.performanceMetrics) {
            this.performanceMetrics.firstInputDelay = (firstInput as any).processingStart - firstInput.startTime;
          }
        }).observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('Performance monitoring setup failed:', error);
      }
    }
  }

  private async runHealthChecks(): Promise<void> {
    const checks = [
      this.checkLocalStorage(),
      this.checkSessionStorage(),
      this.checkClipboardAPI(),
      this.checkCanvasAPI(),
      this.checkCryptoAPI(),
    ];

    await Promise.allSettled(checks);
  }

  private async checkLocalStorage(): Promise<void> {
    const startTime = performance.now();
    try {
      const testKey = '__health_check__';
      localStorage.setItem(testKey, 'test');
      localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      this.healthChecks.set('localStorage', {
        name: 'Local Storage',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - startTime,
      });
    } catch (error) {
      this.healthChecks.set('localStorage', {
        name: 'Local Storage',
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - startTime,
      });
    }
  }

  private async checkSessionStorage(): Promise<void> {
    const startTime = performance.now();
    try {
      const testKey = '__health_check__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.getItem(testKey);
      sessionStorage.removeItem(testKey);

      this.healthChecks.set('sessionStorage', {
        name: 'Session Storage',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - startTime,
      });
    } catch (error) {
      this.healthChecks.set('sessionStorage', {
        name: 'Session Storage',
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - startTime,
      });
    }
  }

  private async checkClipboardAPI(): Promise<void> {
    const startTime = performance.now();
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available');
      }

      this.healthChecks.set('clipboard', {
        name: 'Clipboard API',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - startTime,
      });
    } catch (error) {
      this.healthChecks.set('clipboard', {
        name: 'Clipboard API',
        status: 'degraded',
        message: 'Fallback available',
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - startTime,
      });
    }
  }

  private async checkCanvasAPI(): Promise<void> {
    const startTime = performance.now();
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      this.healthChecks.set('canvas', {
        name: 'Canvas API',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - startTime,
      });
    } catch (error) {
      this.healthChecks.set('canvas', {
        name: 'Canvas API',
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - startTime,
      });
    }
  }

  private async checkCryptoAPI(): Promise<void> {
    const startTime = performance.now();
    try {
      if (!window.crypto || !window.crypto.getRandomValues) {
        throw new Error('Crypto API not available');
      }

      // Test random generation
      const array = new Uint8Array(1);
      window.crypto.getRandomValues(array);

      this.healthChecks.set('crypto', {
        name: 'Crypto API',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - startTime,
      });
    } catch (error) {
      this.healthChecks.set('crypto', {
        name: 'Crypto API',
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - startTime,
      });
    }
  }

  public getHealthStatus(): HealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  public getPerformanceMetrics(): PerformanceMetrics | null {
    return this.performanceMetrics;
  }

  public getOverallHealth(): 'healthy' | 'degraded' | 'unhealthy' {
    const checks = Array.from(this.healthChecks.values());

    if (checks.some(check => check.status === 'unhealthy')) {
      return 'unhealthy';
    }

    if (checks.some(check => check.status === 'degraded')) {
      return 'degraded';
    }

    return 'healthy';
  }
}

// Create singleton instance
export const productionMonitor = new ProductionMonitor();

// Utility functions
export const getHealthStatus = () => productionMonitor.getHealthStatus();
export const getPerformanceMetrics = () => productionMonitor.getPerformanceMetrics();
export const getOverallHealth = () => productionMonitor.getOverallHealth();