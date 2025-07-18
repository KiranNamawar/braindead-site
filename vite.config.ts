import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
  },
  base: './',
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: process.env.NODE_ENV !== 'production',
    cssCodeSplit: true,
    assetsInlineLimit: 2048, // Reduced for better caching
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info'] : [],
        passes: 3, // Increased for better compression
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        hoist_funs: true,
        hoist_props: true,
        hoist_vars: true,
        if_return: true,
        join_vars: true,
        loops: true,
        negate_iife: true,
        properties: true,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        switches: true,
        top_retain: [],
        typeofs: true,
        unused: true,
      },
      mangle: {
        safari10: true,
        properties: {
          regex: /^_/,
        },
      },
      format: {
        comments: false,
        ascii_only: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('react-helmet')) {
              return 'helmet';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('crypto-js') || id.includes('qrcode')) {
              return 'crypto-utils';
            }
            if (id.includes('marked') || id.includes('highlight.js')) {
              return 'text-processing';
            }
            return 'vendor';
          }
          
          // Tool categories for better code splitting
          if (id.includes('/pages/')) {
            if (id.includes('Calculator') || id.includes('Tip') || id.includes('BMI') || 
                id.includes('Age') || id.includes('Loan') || id.includes('Percentage') || 
                id.includes('Grade')) {
              return 'calculators';
            }
            if (id.includes('Text') || id.includes('Word') || id.includes('Case') || 
                id.includes('Lorem') || id.includes('Diff') || id.includes('Summarizer')) {
              return 'text-tools';
            }
            if (id.includes('Gradient') || id.includes('ASCII') || id.includes('Favicon') || 
                id.includes('Color')) {
              return 'design-tools';
            }
            if (id.includes('Timer') || id.includes('Pomodoro') || id.includes('World') || 
                id.includes('Stopwatch') || id.includes('Countdown')) {
              return 'time-tools';
            }
            if (id.includes('Base64') || id.includes('URL') || id.includes('Markdown') || 
                id.includes('UUID') || id.includes('JWT') || id.includes('JSON')) {
              return 'dev-tools';
            }
            if (id.includes('Number') || id.includes('Roman') || id.includes('Unit')) {
              return 'conversion-tools';
            }
          }
          
          // Shared components
          if (id.includes('/components/shared/')) {
            return 'shared-components';
          }
          
          // Utils
          if (id.includes('/utils/')) {
            return 'utils';
          }
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Permitted-Cross-Domain-Policies': 'none',
    },
  },
  preview: {
    port: 3000,
    host: true,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Permitted-Cross-Domain-Policies': 'none',
    },
  },
});