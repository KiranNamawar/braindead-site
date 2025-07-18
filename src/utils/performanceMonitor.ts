/**
 * Performance monitoring utility for Core Web Vitals and custom metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
}

interface WebVitalsMetrics {
  CLS?: number; // Cumulative Layout Shift
  FID?: number; // First Input Delay
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  TTFB?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVitalsMetrics = {};
  private observer: PerformanceObserver | null = null;

  constructor() {
    this.initializeObserver();
    this.trackWebVitals();
  }

  private initializeObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      // Observe different types of performance entries
      this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry): void {
    const metric: PerformanceMetric = {
      name: entry.name,
      value: entry.startTime,
      timestamp: Date.now(),
      url: window.location.pathname
    };

    // Process specific entry types
    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.webVitals.FCP = entry.startTime;
          this.recordMetric('FCP', entry.startTime);
        }
        break;

      case 'largest-contentful-paint':
        this.webVitals.LCP = entry.startTime;
        this.recordMetric('LCP', entry.startTime);
        break;

      case 'first-input':
        const fidEntry = entry as PerformanceEventTiming;
        this.webVitals.FID = fidEntry.processingStart - fidEntry.startTime;
        this.recordMetric('FID', this.webVitals.FID);
        break;

      case 'layout-shift':
        const clsEntry = entry as any;
        if (!clsEntry.hadRecentInput) {
          this.webVitals.CLS = (this.webVitals.CLS || 0) + clsEntry.value;
          this.recordMetric('CLS', this.webVitals.CLS);
        }
        break;

      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        this.webVitals.TTFB = navEntry.responseStart - navEntry.requestStart;
        this.recordMetric('TTFB', this.webVitals.TTFB);
        break;
    }
  }

  private recordMetric(name: string, value: number): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.pathname
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics to prevent memory issues
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log significant performance issues
    this.checkPerformanceThresholds(name, value);
  }

  private checkPerformanceThresholds(name: string, value: number): void {
    const thresholds = {
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (!threshold) return;

    let status = 'good';
    if (value > threshold.poor) {
      status = 'poor';
    } else if (value > threshold.good) {
      status = 'needs-improvement';
    }

    if (status !== 'good') {
      console.warn(`Performance issue detected: ${name} = ${value}ms (${status})`);
    }
  }

  // Track custom performance metrics
  public trackCustomMetric(name: string, value: number): void {
    this.recordMetric(`custom_${name}`, value);
  }

  // Track tool loading time
  public trackToolLoadTime(toolName: string, startTime: number): void {
    const loadTime = performance.now() - startTime;
    this.recordMetric(`tool_load_${toolName}`, loadTime);
  }

  // Track user interaction timing
  public trackInteractionTime(action: string, startTime: number): void {
    const interactionTime = performance.now() - startTime;
    this.recordMetric(`interaction_${action}`, interactionTime);
  }

  // Get current Web Vitals
  public getWebVitals(): WebVitalsMetrics {
    return { ...this.webVitals };
  }

  // Get all metrics
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Get metrics for specific URL
  public getMetricsForUrl(url: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.url === url);
  }

  // Get average metric value
  public getAverageMetric(name: string): number {
    const relevantMetrics = this.metrics.filter(metric => metric.name === name);
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / relevantMetrics.length;
  }

  // Track resource loading performance
  public trackResourcePerformance(): void {
    if (!('performance' in window)) return;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    resources.forEach(resource => {
      const loadTime = resource.responseEnd - resource.startTime;
      
      // Track slow resources
      if (loadTime > 1000) {
        console.warn(`Slow resource detected: ${resource.name} took ${loadTime}ms`);
      }

      // Track different resource types
      if (resource.name.includes('.js')) {
        this.recordMetric('js_load_time', loadTime);
      } else if (resource.name.includes('.css')) {
        this.recordMetric('css_load_time', loadTime);
      } else if (/\.(png|jpg|jpeg|gif|svg|webp)/.test(resource.name)) {
        this.recordMetric('image_load_time', loadTime);
      }
    });
  }

  // Generate performance report
  public generateReport(): {
    webVitals: WebVitalsMetrics;
    averages: { [key: string]: number };
    issues: string[];
  } {
    const issues: string[] = [];
    const averages: { [key: string]: number } = {};

    // Calculate averages for key metrics
    ['FCP', 'LCP', 'FID', 'CLS', 'TTFB'].forEach(metric => {
      averages[metric] = this.getAverageMetric(metric);
    });

    // Identify issues
    if (averages.LCP > 4000) {
      issues.push('Largest Contentful Paint is too slow');
    }
    if (averages.FID > 300) {
      issues.push('First Input Delay is too high');
    }
    if (averages.CLS > 0.25) {
      issues.push('Cumulative Layout Shift is too high');
    }
    if (averages.TTFB > 1800) {
      issues.push('Time to First Byte is too slow');
    }

    return {
      webVitals: this.webVitals,
      averages,
      issues
    };
  }

  // Track bundle size and loading performance
  public trackBundlePerformance(): void {
    // Track main bundle loading
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const domContentLoaded = navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart;
      const loadComplete = navigationEntry.loadEventEnd - navigationEntry.loadEventStart;
      
      this.recordMetric('dom_content_loaded', domContentLoaded);
      this.recordMetric('load_complete', loadComplete);
    }

    // Track chunk loading for lazy-loaded components
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsChunks = resourceEntries.filter(entry => 
      entry.name.includes('.js') && entry.name.includes('assets/js/')
    );

    jsChunks.forEach(chunk => {
      const chunkLoadTime = chunk.responseEnd - chunk.startTime;
      this.recordMetric('chunk_load_time', chunkLoadTime);
    });
  }

  // Cleanup
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.metrics = [];
    this.webVitals = {};
  }

  private trackWebVitals(): void {
    // Track Core Web Vitals using the web-vitals library approach
    if ('PerformanceObserver' in window) {
      // Track CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const clsEntry = entry as any;
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
            this.webVitals.CLS = clsValue;
          }
        }
      });

      try {
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        // Fallback for older browsers
      }
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export functions for use throughout the app
export const trackCustomMetric = (name: string, value: number) => 
  performanceMonitor.trackCustomMetric(name, value);

export const trackToolLoadTime = (toolName: string, startTime: number) => 
  performanceMonitor.trackToolLoadTime(toolName, startTime);

export const trackInteractionTime = (action: string, startTime: number) => 
  performanceMonitor.trackInteractionTime(action, startTime);

export const getWebVitals = () => performanceMonitor.getWebVitals();

export const getPerformanceReport = () => performanceMonitor.generateReport();

export const trackResourcePerformance = () => performanceMonitor.trackResourcePerformance();

export const trackBundlePerformance = () => performanceMonitor.trackBundlePerformance();

// Initialize performance tracking
export function initializePerformanceMonitoring(): void {
  // Track initial page load performance
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        performanceMonitor.trackResourcePerformance();
        performanceMonitor.trackBundlePerformance();
      }, 1000);
    });
  } else {
    setTimeout(() => {
      performanceMonitor.trackResourcePerformance();
      performanceMonitor.trackBundlePerformance();
    }, 1000);
  }

  // Track performance on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      const report = performanceMonitor.generateReport();
      console.log('Performance Report:', report);
    }
  });
}

export default performanceMonitor;