/**
 * Image optimization utilities with WebP support and lazy loading
 */

interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
  enableLazyLoading?: boolean;
}

// Check WebP support
let webpSupported: boolean | null = null;

export async function checkWebPSupport(): Promise<boolean> {
  if (webpSupported !== null) return webpSupported;

  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      webpSupported = webP.height === 2;
      resolve(webpSupported);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

// Convert image to WebP format
export async function convertToWebP(
  file: File, 
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const { quality = 0.8, maxWidth = 1920, maxHeight = 1080 } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and convert
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Optimize image with multiple format support
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<{ optimized: Blob; originalSize: number; optimizedSize: number; format: string }> {
  const originalSize = file.size;
  const supportsWebP = await checkWebPSupport();
  
  let optimized: Blob;
  let format: string;

  if (supportsWebP && options.format !== 'png') {
    optimized = await convertToWebP(file, options);
    format = 'webp';
  } else {
    // Fallback to original format with compression
    optimized = await compressImage(file, options);
    format = file.type.split('/')[1];
  }

  return {
    optimized,
    originalSize,
    optimizedSize: optimized.size,
    format
  };
}

// Compress image without format change
async function compressImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const { quality = 0.8, maxWidth = 1920, maxHeight = 1080 } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Lazy loading image component props
export interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Create optimized image URL with WebP fallback
export function createOptimizedImageUrl(
  originalUrl: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  // For external images or when WebP is not supported, return original
  if (!originalUrl.startsWith('/') && !originalUrl.startsWith('./')) {
    return originalUrl;
  }

  // Add optimization parameters (this would work with a CDN or image service)
  const params = new URLSearchParams();
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());

  const hasParams = params.toString();
  return hasParams ? `${originalUrl}?${params.toString()}` : originalUrl;
}

// Preload critical images
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Preload multiple images
export async function preloadImages(urls: string[]): Promise<void> {
  const promises = urls.map(url => preloadImage(url));
  await Promise.allSettled(promises);
}

// Get image dimensions without loading
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Calculate optimal image size for different screen densities
export function calculateOptimalSize(
  originalWidth: number,
  originalHeight: number,
  containerWidth: number,
  containerHeight: number,
  devicePixelRatio: number = window.devicePixelRatio || 1
): { width: number; height: number } {
  const ratio = Math.min(
    (containerWidth * devicePixelRatio) / originalWidth,
    (containerHeight * devicePixelRatio) / originalHeight
  );

  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio)
  };
}

// Image format detection
export function getImageFormat(file: File): string {
  return file.type.split('/')[1] || 'unknown';
}

// Check if image needs optimization
export function shouldOptimizeImage(
  file: File,
  maxSize: number = 500 * 1024 // 500KB
): boolean {
  return file.size > maxSize || !['webp', 'avif'].includes(getImageFormat(file));
}