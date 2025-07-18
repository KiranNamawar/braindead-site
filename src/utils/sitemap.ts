// Sitemap generation utilities
import { getAllTools } from './toolRegistry';
import { APP_CONFIG } from './constants';

export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

/**
 * Generate sitemap URLs for all pages
 */
export function generateSitemapUrls(): SitemapUrl[] {
  const currentDate = new Date().toISOString().split('T')[0];
  const urls: SitemapUrl[] = [];
  
  // Homepage
  urls.push({
    loc: APP_CONFIG.url,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: 1.0
  });
  
  // Tool pages
  const tools = getAllTools();
  tools.forEach(tool => {
    urls.push({
      loc: `${APP_CONFIG.url}${tool.path}`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.8
    });
  });
  
  // Category pages (if they exist)
  const categories = [...new Set(tools.map(tool => tool.category))];
  categories.forEach(category => {
    urls.push({
      loc: `${APP_CONFIG.url}/category/${category}`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.6
    });
  });
  
  return urls;
}

/**
 * Generate XML sitemap content
 */
export function generateXMLSitemap(): string {
  const urls = generateSitemapUrls();
  
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';
  
  const urlElements = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');
  
  return `${xmlHeader}\n${urlsetOpen}${urlElements}\n${urlsetClose}`;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${APP_CONFIG.url}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Block access to sensitive areas (none for this app)
# Disallow: /admin/
# Disallow: /private/

# Allow all tools and pages
Allow: /calculator
Allow: /color-picker
Allow: /qr-generator
Allow: /text-tools
Allow: /password-generator
Allow: /hash-generator
Allow: /image-optimizer
Allow: /timestamp-converter
Allow: /json-formatter
Allow: /random-generator
Allow: /unit-converter
Allow: /tip-calculator
Allow: /age-calculator
Allow: /bmi-calculator
Allow: /loan-calculator
Allow: /percentage-calculator
Allow: /grade-calculator
Allow: /word-counter
Allow: /text-case-converter
Allow: /lorem-ipsum
Allow: /diff-checker
Allow: /text-summarizer
Allow: /gradient-generator
Allow: /ascii-art-generator
Allow: /favicon-generator
Allow: /pomodoro-timer
Allow: /world-clock
Allow: /stopwatch-timer
Allow: /countdown-timer
Allow: /base64-encoder
Allow: /url-encoder
Allow: /markdown-editor
Allow: /uuid-generator
Allow: /jwt-decoder
Allow: /number-converter
Allow: /roman-numeral

# Cache directives for better SEO
# (These are suggestions for server configuration)
# Cache-Control: public, max-age=3600 for static assets
# Cache-Control: public, max-age=86400 for tool pages`;
}

/**
 * Generate sitemap index for large sites (future-proofing)
 */
export function generateSitemapIndex(): string {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${APP_CONFIG.url}/sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;
}

/**
 * Generate URL structure for SEO-friendly URLs
 */
export function generateSEOFriendlyUrls(): Record<string, string> {
  const tools = getAllTools();
  const urlMap: Record<string, string> = {};
  
  tools.forEach(tool => {
    // Current URL structure is already SEO-friendly
    // e.g., /calculator, /color-picker, /qr-generator
    urlMap[tool.id] = tool.path;
  });
  
  return urlMap;
}

/**
 * Validate URL structure for SEO best practices
 */
export function validateSEOUrls(): { valid: boolean; issues: string[] } {
  const tools = getAllTools();
  const issues: string[] = [];
  
  tools.forEach(tool => {
    const path = tool.path;
    
    // Check for SEO-friendly URL patterns
    if (path.includes('_')) {
      issues.push(`Tool ${tool.id} uses underscores in URL: ${path}. Consider using hyphens.`);
    }
    
    if (path.includes(' ')) {
      issues.push(`Tool ${tool.id} has spaces in URL: ${path}`);
    }
    
    if (path.length > 50) {
      issues.push(`Tool ${tool.id} has very long URL: ${path}`);
    }
    
    if (!/^\/[a-z0-9-]+$/.test(path)) {
      issues.push(`Tool ${tool.id} URL doesn't follow kebab-case pattern: ${path}`);
    }
  });
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Generate canonical URL for a given path
 */
export function generateCanonicalUrl(path: string): string {
  // Remove trailing slash and ensure proper format
  const cleanPath = path.replace(/\/$/, '') || '/';
  return `${APP_CONFIG.url}${cleanPath}`;
}

/**
 * Generate hreflang tags for internationalization (future feature)
 */
export function generateHreflangTags(path: string): Array<{ hreflang: string; href: string }> {
  // Currently only English, but prepared for future i18n
  return [
    {
      hreflang: 'en',
      href: generateCanonicalUrl(path)
    },
    {
      hreflang: 'x-default',
      href: generateCanonicalUrl(path)
    }
  ];
}

/**
 * Export sitemap data for build process
 */
export function exportSitemapData(): {
  sitemap: string;
  robots: string;
  sitemapIndex: string;
  urls: SitemapUrl[];
} {
  return {
    sitemap: generateXMLSitemap(),
    robots: generateRobotsTxt(),
    sitemapIndex: generateSitemapIndex(),
    urls: generateSitemapUrls()
  };
}