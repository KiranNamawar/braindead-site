/**
 * Resource preloader for critical tools and assets
 * Implements intelligent preloading based on user behavior and tool popularity
 */

interface PreloadConfig {
  priority: 'high' | 'medium' | 'low';
  condition?: () => boolean;
  delay?: number;
}

interface ToolPreloadMap {
  [key: string]: PreloadConfig;
}

// Critical tools that should be preloaded based on usage patterns
const CRITICAL_TOOLS: ToolPreloadMap = {
  '/calculator': { priority: 'high' },
  '/color-picker': { priority: 'high' },
  '/qr-generator': { priority: 'high' },
  '/password-generator': { priority: 'high' },
  '/json-formatter': { priority: 'high' },
  '/text-tools': { priority: 'medium' },
  '/hash-generator': { priority: 'medium' },
  '/timestamp-converter': { priority: 'medium' },
  '/unit-converter': { priority: 'medium' },
  '/tip-calculator': { priority: 'medium', condition: () => isWeekend() },
  '/word-counter': { priority: 'medium' },
  '/base64-encoder': { priority: 'low', delay: 2000 },
  '/uuid-generator': { priority: 'low', delay: 3000 },
};

// Check if it's weekend (higher probability of tip calculator usage)
function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

// Get user's recent tools from localStorage
function getRecentTools(): string[] {
  try {
    const recent = localStorage.getItem('recentTools');
    return recent ? JSON.parse(recent).map((item: any) => item.path) : [];
  } catch {
    return [];
  }
}

// Get user's favorite tools from localStorage
function getFavoriteTools(): string[] {
  try {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
  } catch {
    return [];
  }
}

// Preload a specific route/component
async function preloadRoute(path: string): Promise<void> {
  try {
    // Dynamic import based on path
    const routeMap: { [key: string]: () => Promise<any> } = {
      '/calculator': () => import('../pages/CalculatorPage'),
      '/color-picker': () => import('../pages/ColorPickerPage'),
      '/qr-generator': () => import('../pages/QRGeneratorPage'),
      '/text-tools': () => import('../pages/TextToolsPage'),
      '/password-generator': () => import('../pages/PasswordGeneratorPage'),
      '/hash-generator': () => import('../pages/HashGeneratorPage'),
      '/image-optimizer': () => import('../pages/ImageOptimizerPage'),
      '/timestamp-converter': () => import('../pages/TimestampConverterPage'),
      '/json-formatter': () => import('../pages/JSONFormatterPage'),
      '/random-generator': () => import('../pages/RandomGeneratorPage'),
      '/unit-converter': () => import('../pages/UnitConverterPage'),
      '/tip-calculator': () => import('../pages/TipCalculatorPage'),
      '/age-calculator': () => import('../pages/AgeCalculatorPage'),
      '/bmi-calculator': () => import('../pages/BMICalculatorPage'),
      '/loan-calculator': () => import('../pages/LoanCalculatorPage'),
      '/percentage-calculator': () => import('../pages/PercentageCalculatorPage'),
      '/grade-calculator': () => import('../pages/GradeCalculatorPage'),
      '/word-counter': () => import('../pages/WordCounterPage'),
      '/text-case-converter': () => import('../pages/TextCaseConverterPage'),
      '/lorem-ipsum': () => import('../pages/LoremIpsumPage'),
      '/diff-checker': () => import('../pages/DiffCheckerPage'),
      '/text-summarizer': () => import('../pages/TextSummarizerPage'),
      '/gradient-generator': () => import('../pages/GradientGeneratorPage'),
      '/ascii-art-generator': () => import('../pages/ASCIIArtGeneratorPage'),
      '/favicon-generator': () => import('../pages/FaviconGeneratorPage'),
      '/pomodoro-timer': () => import('../pages/PomodoroTimerPage'),
      '/world-clock': () => import('../pages/WorldClockPage'),
      '/stopwatch-timer': () => import('../pages/StopwatchTimerPage'),
      '/countdown-timer': () => import('../pages/CountdownTimerPage'),
      '/base64-encoder': () => import('../pages/Base64EncoderPage'),
      '/url-encoder': () => import('../pages/URLEncoderPage'),
      '/markdown-editor': () => import('../pages/MarkdownEditorPage'),
      '/uuid-generator': () => import('../pages/UUIDGeneratorPage'),
      '/jwt-decoder': () => import('../pages/JWTDecoderPage'),
      '/number-converter': () => import('../pages/NumberConverterPage'),
      '/roman-numeral': () => import('../pages/RomanNumeralPage'),
    };

    const loader = routeMap[path];
    if (loader) {
      await loader();
      console.log(`Preloaded: ${path}`);
    }
  } catch (error) {
    console.warn(`Failed to preload ${path}:`, error);
  }
}

// Preload resources with priority and conditions
async function preloadWithPriority(path: string, config: PreloadConfig): Promise<void> {
  // Check condition if provided
  if (config.condition && !config.condition()) {
    return;
  }

  // Apply delay if specified
  if (config.delay) {
    await new Promise(resolve => setTimeout(resolve, config.delay));
  }

  // Use requestIdleCallback for low priority preloading
  if (config.priority === 'low' && 'requestIdleCallback' in window) {
    return new Promise(resolve => {
      requestIdleCallback(async () => {
        await preloadRoute(path);
        resolve();
      });
    });
  }

  // Immediate preload for high priority
  if (config.priority === 'high') {
    return preloadRoute(path);
  }

  // Delayed preload for medium priority
  setTimeout(() => preloadRoute(path), 100);
}

// Main preloader function
export async function initializeResourcePreloader(): Promise<void> {
  // Don't preload on slow connections
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection && (connection.saveData || connection.effectiveType === 'slow-2g')) {
      console.log('Skipping preload on slow connection');
      return;
    }
  }

  // Get user's personalized tools
  const recentTools = getRecentTools();
  const favoriteTools = getFavoriteTools();

  // Create personalized preload list
  const personalizedTools = [...new Set([...favoriteTools, ...recentTools.slice(0, 3)])];

  // Preload personalized tools first (highest priority)
  for (const tool of personalizedTools) {
    if (tool && tool !== window.location.pathname) {
      await preloadWithPriority(tool, { priority: 'high' });
    }
  }

  // Preload critical tools
  for (const [path, config] of Object.entries(CRITICAL_TOOLS)) {
    if (path !== window.location.pathname && !personalizedTools.includes(path)) {
      preloadWithPriority(path, config);
    }
  }
}

// Preload on hover (for tool cards)
export function preloadOnHover(path: string): void {
  // Debounce to avoid excessive preloading
  const key = `preload_${path}`;
  if ((window as any)[key]) return;
  (window as any)[key] = true;

  setTimeout(() => {
    preloadRoute(path);
  }, 100);
}

// Preload based on user interaction patterns
export function preloadBasedOnInteraction(currentPath: string): void {
  // Preload related tools based on current tool
  const relatedTools: { [key: string]: string[] } = {
    '/calculator': ['/percentage-calculator', '/tip-calculator', '/unit-converter'],
    '/color-picker': ['/gradient-generator', '/favicon-generator'],
    '/text-tools': ['/word-counter', '/text-case-converter', '/lorem-ipsum'],
    '/json-formatter': ['/base64-encoder', '/url-encoder', '/jwt-decoder'],
    '/password-generator': ['/hash-generator', '/uuid-generator'],
    '/tip-calculator': ['/percentage-calculator', '/calculator'],
    '/word-counter': ['/text-case-converter', '/text-summarizer'],
    '/gradient-generator': ['/color-picker', '/favicon-generator'],
    '/pomodoro-timer': ['/stopwatch-timer', '/countdown-timer'],
  };

  const related = relatedTools[currentPath];
  if (related) {
    related.forEach(path => {
      setTimeout(() => preloadRoute(path), Math.random() * 2000 + 500);
    });
  }
}

// Export for use in components
export { preloadRoute };