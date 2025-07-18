import React, { useState, useRef, useEffect } from 'react';
import { createOptimizedImageUrl, checkWebPSupport } from '../../utils/imageOptimizer';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  width,
  height,
  quality = 80,
  onLoad,
  onError,
  loading = 'lazy'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const [imageSrc, setImageSrc] = useState<string>('');
  const [webpSupported, setWebpSupported] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Check WebP support on mount
  useEffect(() => {
    checkWebPSupport().then(setWebpSupported);
  }, []);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (loading === 'eager' || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px' // Start loading 50px before the image comes into view
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [loading, isInView]);

  // Generate optimized image URL when in view
  useEffect(() => {
    if (!isInView) return;

    const optimizedSrc = createOptimizedImageUrl(src, {
      width,
      height,
      quality
    });

    // Add WebP extension if supported and not already WebP
    let finalSrc = optimizedSrc;
    if (webpSupported && !src.includes('.webp')) {
      // This would work with a CDN that supports format conversion
      finalSrc = optimizedSrc.includes('?') 
        ? `${optimizedSrc}&format=webp`
        : `${optimizedSrc}?format=webp`;
    }

    setImageSrc(finalSrc);
  }, [isInView, src, width, height, quality, webpSupported]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    // Fallback to original image if optimized version fails
    if (imageSrc !== src) {
      setImageSrc(src);
    } else {
      onError?.();
    }
  };

  // Placeholder component
  const PlaceholderComponent = () => (
    <div 
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      {placeholder ? (
        <span className="text-gray-400 text-sm">{placeholder}</span>
      ) : (
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
            clipRule="evenodd" 
          />
        </svg>
      )}
    </div>
  );

  return (
    <div className="relative overflow-hidden">
      {/* Placeholder */}
      {!isLoaded && <PlaceholderComponent />}
      
      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
          decoding="async"
          style={{
            position: isLoaded ? 'static' : 'absolute',
            top: isLoaded ? 'auto' : 0,
            left: isLoaded ? 'auto' : 0
          }}
        />
      )}
    </div>
  );
};

export default LazyImage;