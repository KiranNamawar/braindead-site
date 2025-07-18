/**
 * Comprehensive performance reporting and optimization tracking
 */

import { getWebVitals, getPerformanceReport } from './performanceMonitor';
import { getCacheStats } from './advancedCaching';
import { getOptimizationReport } from './cdnOptimization';
import { getInvalidationStats } from './cacheInvalidation';

interface PerformanceReport {
  timestamp: number;
  webVitals: {
    CLS?: number;
    FID?: number;
    FCP?: number;
    LCP?: number;
    TTFB?: number;
  };
  caching: {
    hitRate: number;
    totalSize: number;
    entries: number;
    invalidations: number;
  };
  bundleAnalysis: {
    totalSize: number;
    chunkCount: number;
    compressionRatio: number;
    lazyLoadedChunks: number;
  };
  optimization: {
    supportedFormats: string[];
    optimizedAssets: number;
    estimatedSavings: number;
  };
  recommendations: string[];
  score: number;
}

interface BundleInfo {
  name: string;
  size: number;
  gzipSize: number;
  type: 'vendor' | 'chunk' | 'asset';
  loadTime?: number;
}

class PerformanceReporter {
  private reports: PerformanceReport[] = [];
  private bundleInfo: BundleInfo[] = [];

  constructor() {
    this.initializeBundleTracking();
  }

  private initializeBundleTracking(): void {
    // Track bundle loading performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('assets/js/')) {
            this.trackBundleLoad(entry as PerformanceResourceTiming);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Bundle tracking not supported:', error);
      }
    }
  }

  private trackBundleLoad(entry: PerformanceResourceTiming): void {
    const url = new URL(entry.name);
    const filename = url.pathname.split('/').pop() || '';
    
    // Extract bundle info from filename
    const bundleInfo: BundleInfo = {
      name: filename,
      size: entry.transferSize || 0,
      gzipSize: entry.encodedBodySize || 0,
      type: this.getBundleType(filename),
      loadTime: entry.responseEnd - entry.startTime
    };

    this.bundleInfo.push(bundleInfo);
  }

  private getBundleType(filename: string): 'vendor' | 'chunk' | 'asset' {
    if (filename.includes('vendor')) return 'vendor';
    if (filename.includes('index')) return 'chunk';
    return 'asset';
  }

  // Generate comprehensive performance report
  async generateReport(): Promise<PerformanceReport> {
    const webVitals = getWebVitals();
    const performanceData = getPerformanceReport();
    const optimizationData = getOptimizationReport();
    const invalidationData = getInvalidationStats();

    // Calculate caching metrics
    const cacheStats = this.calculateCacheStats();
    
    // Calculate bundle analysis
    const bundleAnalysis = this.calculateBundleAnalysis();
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(webVitals, cacheStats, bundleAnalysis);
    
    // Calculate overall performance score
    const score = this.calculatePerformanceScore(webVitals, cacheStats, bundleAnalysis);

    const report: PerformanceReport = {
      timestamp: Date.now(),
      webVitals,
      caching: {
        hitRate: cacheStats.hitRate,
        totalSize: cacheStats.totalSize,
        entries: cacheStats.entries,
        invalidations: invalidationData.totalInvalidations
      },
      bundleAnalysis,
      optimization: {
        supportedFormats: optimizationData.supportedFormats,
        optimizedAssets: 0, // Would be tracked in real implementation
        estimatedSavings: 0
      },
      recommendations,
      score
    };

    this.reports.push(report);
    
    // Keep only last 10 reports
    if (this.reports.length > 10) {
      this.reports = this.reports.slice(-10);
    }

    return report;
  }

  private calculateCacheStats(): {
    hitRate: number;
    totalSize: number;
    entries: number;
  } {
    let totalSize = 0;
    let entries = 0;
    let hits = 0;
    let requests = 0;

    // Calculate from different cache types
    const cacheTypes = ['static-assets', 'tool-data', 'user-preferences', 'api-responses'];
    
    cacheTypes.forEach(cacheType => {
      const stats = getCacheStats(cacheType);
      totalSize += stats.size;
      entries += stats.entries;
    });

    // Estimate hit rate from performance entries
    if ('performance' in window) {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      resourceEntries.forEach(entry => {
        requests++;
        // If transfer size is 0 or very small, likely served from cache
        if (entry.transferSize === 0 || entry.transferSize < 100) {
          hits++;
        }
      });
    }

    const hitRate = requests > 0 ? (hits / requests) * 100 : 0;

    return { hitRate, totalSize, entries };
  }

  private calculateBundleAnalysis(): {
    totalSize: number;
    chunkCount: number;
    compressionRatio: number;
    lazyLoadedChunks: number;
  } {
    let totalSize = 0;
    let totalGzipSize = 0;
    let lazyLoadedChunks = 0;

    this.bundleInfo.forEach(bundle => {
      totalSize += bundle.size;
      totalGzipSize += bundle.gzipSize;
      
      // Count lazy-loaded chunks (non-vendor, non-index chunks)
      if (bundle.type === 'asset' && !bundle.name.includes('index')) {
        lazyLoadedChunks++;
      }
    });

    const compressionRatio = totalSize > 0 ? (totalGzipSize / totalSize) * 100 : 0;

    return {
      totalSize,
      chunkCount: this.bundleInfo.length,
      compressionRatio,
      lazyLoadedChunks
    };
  }

  private generateRecommendations(
    webVitals: any,
    cacheStats: any,
    bundleAnalysis: any
  ): string[] {
    const recommendations: string[] = [];

    // Web Vitals recommendations
    if (webVitals.LCP && webVitals.LCP > 4000) {
      recommendations.push('Largest Contentful Paint is slow - consider optimizing critical resources');
    }

    if (webVitals.FID && webVitals.FID > 300) {
      recommendations.push('First Input Delay is high - consider reducing JavaScript execution time');
    }

    if (webVitals.CLS && webVitals.CLS > 0.25) {
      recommendations.push('Cumulative Layout Shift is high - ensure proper image dimensions and avoid dynamic content insertion');
    }

    // Caching recommendations
    if (cacheStats.hitRate < 70) {
      recommendations.push('Cache hit rate is low - consider increasing cache TTL for static assets');
    }

    if (cacheStats.totalSize > 50 * 1024 * 1024) { // 50MB
      recommendations.push('Cache size is large - consider implementing cache cleanup strategies');
    }

    // Bundle recommendations
    if (bundleAnalysis.totalSize > 2 * 1024 * 1024) { // 2MB
      recommendations.push('Bundle size is large - consider further code splitting or tree shaking');
    }

    if (bundleAnalysis.compressionRatio > 40) {
      recommendations.push('Compression ratio could be improved - ensure Brotli/Gzip is enabled');
    }

    if (bundleAnalysis.lazyLoadedChunks < 5) {
      recommendations.push('Consider implementing more lazy loading for non-critical components');
    }

    return recommendations;
  }

  private calculatePerformanceScore(
    webVitals: any,
    cacheStats: any,
    bundleAnalysis: any
  ): number {
    let score = 100;

    // Web Vitals scoring (40% of total score)
    if (webVitals.LCP) {
      if (webVitals.LCP > 4000) score -= 15;
      else if (webVitals.LCP > 2500) score -= 8;
    }

    if (webVitals.FID) {
      if (webVitals.FID > 300) score -= 15;
      else if (webVitals.FID > 100) score -= 8;
    }

    if (webVitals.CLS) {
      if (webVitals.CLS > 0.25) score -= 10;
      else if (webVitals.CLS > 0.1) score -= 5;
    }

    // Caching scoring (30% of total score)
    if (cacheStats.hitRate < 50) score -= 15;
    else if (cacheStats.hitRate < 70) score -= 8;

    // Bundle scoring (30% of total score)
    if (bundleAnalysis.totalSize > 3 * 1024 * 1024) score -= 15; // 3MB
    else if (bundleAnalysis.totalSize > 2 * 1024 * 1024) score -= 8; // 2MB

    if (bundleAnalysis.compressionRatio > 50) score -= 10;
    else if (bundleAnalysis.compressionRatio > 40) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  // Get performance trends
  getPerformanceTrends(): {
    scoreHistory: number[];
    webVitalsHistory: { timestamp: number; LCP?: number; FID?: number; CLS?: number }[];
    recommendations: { [key: string]: number };
  } {
    const scoreHistory = this.reports.map(report => report.score);
    const webVitalsHistory = this.reports.map(report => ({
      timestamp: report.timestamp,
      LCP: report.webVitals.LCP,
      FID: report.webVitals.FID,
      CLS: report.webVitals.CLS
    }));

    // Count recommendation frequency
    const recommendations: { [key: string]: number } = {};
    this.reports.forEach(report => {
      report.recommendations.forEach(rec => {
        recommendations[rec] = (recommendations[rec] || 0) + 1;
      });
    });

    return { scoreHistory, webVitalsHistory, recommendations };
  }

  // Export performance data
  exportPerformanceData(): string {
    const exportData = {
      reports: this.reports,
      bundleInfo: this.bundleInfo,
      trends: this.getPerformanceTrends(),
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Get current performance summary
  getCurrentSummary(): {
    score: number;
    status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    keyMetrics: { [key: string]: any };
    topRecommendations: string[];
  } {
    const latestReport = this.reports[this.reports.length - 1];
    
    if (!latestReport) {
      return {
        score: 0,
        status: 'poor',
        keyMetrics: {},
        topRecommendations: ['Generate performance report first']
      };
    }

    let status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    if (latestReport.score >= 90) status = 'excellent';
    else if (latestReport.score >= 75) status = 'good';
    else if (latestReport.score >= 50) status = 'needs-improvement';
    else status = 'poor';

    const keyMetrics = {
      'Performance Score': `${latestReport.score}/100`,
      'Cache Hit Rate': `${latestReport.caching.hitRate.toFixed(1)}%`,
      'Bundle Size': `${(latestReport.bundleAnalysis.totalSize / 1024 / 1024).toFixed(2)} MB`,
      'Lazy Chunks': latestReport.bundleAnalysis.lazyLoadedChunks,
      'LCP': latestReport.webVitals.LCP ? `${latestReport.webVitals.LCP.toFixed(0)}ms` : 'N/A',
      'FID': latestReport.webVitals.FID ? `${latestReport.webVitals.FID.toFixed(0)}ms` : 'N/A',
      'CLS': latestReport.webVitals.CLS ? latestReport.webVitals.CLS.toFixed(3) : 'N/A'
    };

    return {
      score: latestReport.score,
      status,
      keyMetrics,
      topRecommendations: latestReport.recommendations.slice(0, 3)
    };
  }
}

// Create singleton instance
const performanceReporter = new PerformanceReporter();

// Export functions for use throughout the app
export const generatePerformanceReport = () => performanceReporter.generateReport();
export const getPerformanceTrends = () => performanceReporter.getPerformanceTrends();
export const exportPerformanceData = () => performanceReporter.exportPerformanceData();
export const getCurrentPerformanceSummary = () => performanceReporter.getCurrentSummary();

// Initialize performance reporting
export function initializePerformanceReporting(): void {
  // Generate initial report after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        performanceReporter.generateReport();
      }, 2000); // Wait 2 seconds for metrics to stabilize
    });
  } else {
    setTimeout(() => {
      performanceReporter.generateReport();
    }, 2000);
  }

  // Generate periodic reports
  setInterval(() => {
    performanceReporter.generateReport();
  }, 5 * 60 * 1000); // Every 5 minutes
}

export default performanceReporter;