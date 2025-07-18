import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializePerformanceMonitoring } from './utils/performanceMonitor';
import { initializeResourcePreloader } from './utils/resourcePreloader';
import { initializeCacheManager } from './utils/advancedCaching';
import { initializeCDNOptimization } from './utils/cdnOptimization';
import { initializeCacheInvalidation } from './utils/cacheInvalidation';
import { initializePerformanceReporting } from './utils/performanceReport';

// Initialize performance monitoring
initializePerformanceMonitoring();

// Initialize advanced caching systems
initializeCacheManager();
initializeCDNOptimization();
initializeCacheInvalidation();

// Initialize performance reporting
initializePerformanceReporting();

// Register service worker for PWA functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Initialize resource preloader after service worker is ready
        setTimeout(() => {
          initializeResourcePreloader();
        }, 1000);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
        
        // Initialize resource preloader even if SW fails
        setTimeout(() => {
          initializeResourcePreloader();
        }, 1000);
      });
  });
} else {
  // Initialize resource preloader in development
  setTimeout(() => {
    initializeResourcePreloader();
  }, 1000);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
