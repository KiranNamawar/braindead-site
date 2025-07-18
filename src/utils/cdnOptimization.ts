/**
 * CDN optimization utilities for static assets and performance
 */

interface CDNOptimizationConfig {
  enableImageOptimization: boolean;
  enableCSSMinification: boolean;
  enableJSMinification: boolean;
  enableGzipCompression: boolean;
  enableBrotliCompression: boolean;
  enableWebPConversion: boolean;
  enableAVIFConversion: boolean;
  cacheHeaders: {
    staticAssets: number;
    images: number;
    fonts: number;
    api: number;
  };
}

interface AssetOptimization {
  originalUrl: string;
  optimizedUrl: string;
  optimizations: string[];
  estimatedSavings: number;
}

class CDNOptimizer {
  private config: CDNOptimizationConfig;
  private supportedFormats: Set<string> = new Set();

  constructor() {
    this.config = {
      enableImageOptimization: true,
      enableCSSMinification: true,
      enableJSMinification: true,
      enableGzipCompression: true,
      enableBrotliCompression: true,
      enableWebPConversion: true,
      enableAVIFConversion: false, // Not widely supported yet
      cacheHeaders: {
        staticAssets: 31536000, // 1 year
        images: 2592000, // 30 days
        fonts: 31536000, // 1 year
        api: 300 // 5 minutes
      }
    };

    this.detectSupportedFormats();
  }

  private async detectSupportedFormats(): Promise<void> {
    // Detect WebP support
    if (await this.supportsWebP()) {
      this.supportedFormats.add('webp');
    }

    // Detect AVIF support
    if (await this.supportsAVIF()) {
      this.supportedFormats.add('avif');
    }

    // Detect Brotli support
    if (this.supportsBrotli()) {
      this.supportedFormats.add('br');
    }

    // Detect Gzip support (almost universal)
    this.supportedFormats.add('gzip');
  }

  private async supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  private async supportsAVIF(): Promise<boolean> {
    return new Promise((resolve) => {
      const avif = new Image();
      avif.onload = avif.onerror = () => {
        resolve(avif.height === 2);
      };
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  }

  private supportsBrotli(): boolean {
    // Check if browser supports Brotli compression
    return 'CompressionStream' in window && 'DecompressionStream' in window;
  }

  // Optimize image URLs with format conversion and compression
  optimizeImageUrl(url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  } = {}): AssetOptimization {
    const optimizations: string[] = [];
    let optimizedUrl = url;
    let estimatedSavings = 0;

    // Skip external URLs
    if (!url.startsWith('/') && !url.startsWith('./') && !url.includes(window.location.origin)) {
      return {
        originalUrl: url,
        optimizedUrl: url,
        optimizations: [],
        estimatedSavings: 0
      };
    }

    const params = new URLSearchParams();

    // Format optimization
    if (options.format === 'auto' || !options.format) {
      if (this.supportedFormats.has('avif') && this.config.enableAVIFConversion) {
        params.set('format', 'avif');
        optimizations.push('AVIF conversion');
        estimatedSavings += 50; // ~50% size reduction
      } else if (this.supportedFormats.has('webp') && this.config.enableWebPConversion) {
        params.set('format', 'webp');
        optimizations.push('WebP conversion');
        estimatedSavings += 30; // ~30% size reduction
      }
    } else if (options.format && this.supportedFormats.has(options.format)) {
      params.set('format', options.format);
      optimizations.push(`${options.format.toUpperCase()} conversion`);
    }

    // Dimension optimization
    if (options.width) {
      params.set('w', options.width.toString());
      optimizations.push(`Width: ${options.width}px`);
      estimatedSavings += 20; // Estimated savings from resizing
    }

    if (options.height) {
      params.set('h', options.height.toString());
      optimizations.push(`Height: ${options.height}px`);
      estimatedSavings += 20;
    }

    // Quality optimization
    const quality = options.quality || 85;
    if (quality < 100) {
      params.set('q', quality.toString());
      optimizations.push(`Quality: ${quality}%`);
      estimatedSavings += Math.max(0, 100 - quality) * 0.5; // Rough estimate
    }

    // Compression
    if (this.config.enableImageOptimization) {
      params.set('optimize', 'true');
      optimizations.push('Lossless optimization');
      estimatedSavings += 15;
    }

    // Build optimized URL
    if (params.toString()) {
      optimizedUrl = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`;
    }

    return {
      originalUrl: url,
      optimizedUrl,
      optimizations,
      estimatedSavings: Math.min(estimatedSavings, 80) // Cap at 80% savings
    };
  }

  // Optimize CSS URLs with minification and compression
  optimizeCSSUrl(url: string): AssetOptimization {
    const optimizations: string[] = [];
    let optimizedUrl = url;
    let estimatedSavings = 0;

    if (!this.config.enableCSSMinification) {
      return { originalUrl: url, optimizedUrl: url, optimizations: [], estimatedSavings: 0 };
    }

    const params = new URLSearchParams();

    // Minification
    params.set('minify', 'true');
    optimizations.push('CSS minification');
    estimatedSavings += 25;

    // Compression
    if (this.supportedFormats.has('br')) {
      params.set('compress', 'br');
      optimizations.push('Brotli compression');
      estimatedSavings += 20;
    } else if (this.supportedFormats.has('gzip')) {
      params.set('compress', 'gzip');
      optimizations.push('Gzip compression');
      estimatedSavings += 15;
    }

    // Build optimized URL
    if (params.toString()) {
      optimizedUrl = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`;
    }

    return {
      originalUrl: url,
      optimizedUrl,
      optimizations,
      estimatedSavings
    };
  }

  // Optimize JavaScript URLs with minification and compression
  optimizeJSUrl(url: string): AssetOptimization {
    const optimizations: string[] = [];
    let optimizedUrl = url;
    let estimatedSavings = 0;

    if (!this.config.enableJSMinification) {
      return { originalUrl: url, optimizedUrl: url, optimizations: [], estimatedSavings: 0 };
    }

    const params = new URLSearchParams();

    // Minification
    params.set('minify', 'true');
    optimizations.push('JS minification');
    estimatedSavings += 30;

    // Compression
    if (this.supportedFormats.has('br')) {
      params.set('compress', 'br');
      optimizations.push('Brotli compression');
      estimatedSavings += 25;
    } else if (this.supportedFormats.has('gzip')) {
      params.set('compress', 'gzip');
      optimizations.push('Gzip compression');
      estimatedSavings += 20;
    }

    // Build optimized URL
    if (params.toString()) {
      optimizedUrl = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`;
    }

    return {
      originalUrl: url,
      optimizedUrl,
      optimizations,
      estimatedSavings
    };
  }

  // Generate optimal cache headers for different asset types
  getCacheHeaders(assetType: 'static' | 'image' | 'font' | 'api'): HeadersInit {
    const maxAge = this.config.cacheHeaders[assetType === 'static' ? 'staticAssets' : assetType === 'image' ? 'images' : assetType === 'font' ? 'fonts' : 'api'];
    
    const headers: HeadersInit = {
      'Cache-Control': `public, max-age=${maxAge}, immutable`,
    };

    // Add compression headers
    if (this.supportedFormats.has('br')) {
      headers['Accept-Encoding'] = 'br, gzip, deflate';
    } else if (this.supportedFormats.has('gzip')) {
      headers['Accept-Encoding'] = 'gzip, deflate';
    }

    // Add format-specific headers
    if (assetType === 'image') {
      const acceptedFormats = [];
      if (this.supportedFormats.has('avif')) acceptedFormats.push('image/avif');
      if (this.supportedFormats.has('webp')) acceptedFormats.push('image/webp');
      acceptedFormats.push('image/*');
      
      headers['Accept'] = acceptedFormats.join(', ');
    }

    return headers;
  }

  // Preload critical resources with optimization
  preloadCriticalResources(resources: { url: string; type: 'image' | 'css' | 'js' | 'font' }[]): void {
    resources.forEach(resource => {
      let optimizedUrl = resource.url;
      
      // Apply optimizations based on resource type
      switch (resource.type) {
        case 'image':
          optimizedUrl = this.optimizeImageUrl(resource.url, { quality: 90 }).optimizedUrl;
          break;
        case 'css':
          optimizedUrl = this.optimizeCSSUrl(resource.url).optimizedUrl;
          break;
        case 'js':
          optimizedUrl = this.optimizeJSUrl(resource.url).optimizedUrl;
          break;
      }

      // Create preload link
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = optimizedUrl;
      
      switch (resource.type) {
        case 'image':
          link.as = 'image';
          break;
        case 'css':
          link.as = 'style';
          break;
        case 'js':
          link.as = 'script';
          break;
        case 'font':
          link.as = 'font';
          link.crossOrigin = 'anonymous';
          break;
      }

      document.head.appendChild(link);
    });
  }

  // Generate resource hints for performance
  generateResourceHints(): void {
    // DNS prefetch for external domains
    const externalDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });

    // Preconnect to critical origins
    const criticalOrigins = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    criticalOrigins.forEach(origin => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // Optimize all assets on a page
  optimizePageAssets(): { optimized: number; totalSavings: number } {
    let optimized = 0;
    let totalSavings = 0;

    // Optimize images
    const images = document.querySelectorAll('img[src]');
    images.forEach(img => {
      const imgElement = img as HTMLImageElement;
      const optimization = this.optimizeImageUrl(imgElement.src, {
        width: imgElement.width || undefined,
        height: imgElement.height || undefined,
        quality: 85
      });

      if (optimization.optimizedUrl !== optimization.originalUrl) {
        imgElement.src = optimization.optimizedUrl;
        optimized++;
        totalSavings += optimization.estimatedSavings;
      }
    });

    // Optimize CSS links
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"][href]');
    cssLinks.forEach(link => {
      const linkElement = link as HTMLLinkElement;
      const optimization = this.optimizeCSSUrl(linkElement.href);

      if (optimization.optimizedUrl !== optimization.originalUrl) {
        linkElement.href = optimization.optimizedUrl;
        optimized++;
        totalSavings += optimization.estimatedSavings;
      }
    });

    return { optimized, totalSavings };
  }

  // Get optimization report
  getOptimizationReport(): {
    supportedFormats: string[];
    config: CDNOptimizationConfig;
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    if (!this.supportedFormats.has('webp')) {
      recommendations.push('Browser does not support WebP - consider fallback images');
    }

    if (!this.supportedFormats.has('br')) {
      recommendations.push('Browser does not support Brotli compression - using Gzip fallback');
    }

    if (!this.config.enableImageOptimization) {
      recommendations.push('Image optimization is disabled - enable for better performance');
    }

    return {
      supportedFormats: Array.from(this.supportedFormats),
      config: this.config,
      recommendations
    };
  }
}

// Create singleton instance
const cdnOptimizer = new CDNOptimizer();

// Export functions for use throughout the app
export const optimizeImageUrl = (url: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
}) => cdnOptimizer.optimizeImageUrl(url, options);

export const optimizeCSSUrl = (url: string) => cdnOptimizer.optimizeCSSUrl(url);

export const optimizeJSUrl = (url: string) => cdnOptimizer.optimizeJSUrl(url);

export const getCacheHeaders = (assetType: 'static' | 'image' | 'font' | 'api') => 
  cdnOptimizer.getCacheHeaders(assetType);

export const preloadCriticalResources = (resources: { url: string; type: 'image' | 'css' | 'js' | 'font' }[]) => 
  cdnOptimizer.preloadCriticalResources(resources);

export const generateResourceHints = () => cdnOptimizer.generateResourceHints();

export const optimizePageAssets = () => cdnOptimizer.optimizePageAssets();

export const getOptimizationReport = () => cdnOptimizer.getOptimizationReport();

// Initialize CDN optimization
export function initializeCDNOptimization(): void {
  // Generate resource hints
  cdnOptimizer.generateResourceHints();

  // Optimize existing page assets
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        cdnOptimizer.optimizePageAssets();
      }, 100);
    });
  } else {
    setTimeout(() => {
      cdnOptimizer.optimizePageAssets();
    }, 100);
  }
}

export default cdnOptimizer;