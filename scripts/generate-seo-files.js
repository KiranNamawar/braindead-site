#!/usr/bin/env node

/**
 * Generate SEO files (sitemap.xml, robots.txt) for the build
 * This script runs during the build process to create static SEO files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Since this is a build script, we need to simulate the tool data
// In a real build, this would import from the built application
const APP_CONFIG = {
  name: 'BrainDead.site',
  url: 'https://braindead.site',
  version: '2.0.0',
  author: 'BrainDead.site Team'
};

// Tool data - this should match the tools in toolRegistry.ts
const TOOLS = [
  { id: 'calculator', path: '/calculator', category: 'calculator' },
  { id: 'color-picker', path: '/color-picker', category: 'creative-design' },
  { id: 'qr-generator', path: '/qr-generator', category: 'utility' },
  { id: 'text-tools', path: '/text-tools', category: 'text-writing' },
  { id: 'password-generator', path: '/password-generator', category: 'utility' },
  { id: 'hash-generator', path: '/hash-generator', category: 'developer' },
  { id: 'image-optimizer', path: '/image-optimizer', category: 'creative-design' },
  { id: 'timestamp-converter', path: '/timestamp-converter', category: 'time-productivity' },
  { id: 'json-formatter', path: '/json-formatter', category: 'developer' },
  { id: 'random-generator', path: '/random-generator', category: 'utility' },
  { id: 'unit-converter', path: '/unit-converter', category: 'number-conversion' },
  { id: 'tip-calculator', path: '/tip-calculator', category: 'everyday-life' },
  { id: 'age-calculator', path: '/age-calculator', category: 'everyday-life' },
  { id: 'bmi-calculator', path: '/bmi-calculator', category: 'everyday-life' },
  { id: 'loan-calculator', path: '/loan-calculator', category: 'everyday-life' },
  { id: 'percentage-calculator', path: '/percentage-calculator', category: 'everyday-life' },
  { id: 'grade-calculator', path: '/grade-calculator', category: 'everyday-life' },
  { id: 'word-counter', path: '/word-counter', category: 'text-writing' },
  { id: 'text-case-converter', path: '/text-case-converter', category: 'text-writing' },
  { id: 'lorem-ipsum', path: '/lorem-ipsum', category: 'text-writing' },
  { id: 'diff-checker', path: '/diff-checker', category: 'text-writing' },
  { id: 'text-summarizer', path: '/text-summarizer', category: 'text-writing' },
  { id: 'gradient-generator', path: '/gradient-generator', category: 'creative-design' },
  { id: 'ascii-art-generator', path: '/ascii-art-generator', category: 'creative-design' },
  { id: 'favicon-generator', path: '/favicon-generator', category: 'creative-design' },
  { id: 'pomodoro-timer', path: '/pomodoro-timer', category: 'time-productivity' },
  { id: 'world-clock', path: '/world-clock', category: 'time-productivity' },
  { id: 'stopwatch-timer', path: '/stopwatch-timer', category: 'time-productivity' },
  { id: 'countdown-timer', path: '/countdown-timer', category: 'time-productivity' },
  { id: 'base64-encoder', path: '/base64-encoder', category: 'developer' },
  { id: 'url-encoder', path: '/url-encoder', category: 'developer' },
  { id: 'markdown-editor', path: '/markdown-editor', category: 'developer' },
  { id: 'uuid-generator', path: '/uuid-generator', category: 'developer' },
  { id: 'jwt-decoder', path: '/jwt-decoder', category: 'developer' },
  { id: 'number-converter', path: '/number-converter', category: 'number-conversion' },
  { id: 'roman-numeral', path: '/roman-numeral', category: 'number-conversion' }
];

function generateSitemapUrls() {
  const currentDate = new Date().toISOString().split('T')[0];
  const urls = [];
  
  // Homepage
  urls.push({
    loc: APP_CONFIG.url,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: 1.0
  });
  
  // Tool pages
  TOOLS.forEach(tool => {
    urls.push({
      loc: `${APP_CONFIG.url}${tool.path}`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.8
    });
  });
  
  // Category pages
  const categories = [...new Set(TOOLS.map(tool => tool.category))];
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

function generateXMLSitemap() {
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

function generateRobotsTxt() {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${APP_CONFIG.url}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Allow all tools and pages
${TOOLS.map(tool => `Allow: ${tool.path}`).join('\n')}

# Cache directives for better SEO
# (These are suggestions for server configuration)
# Cache-Control: public, max-age=3600 for static assets
# Cache-Control: public, max-age=86400 for tool pages`;
}

function main() {
  const distDir = path.join(process.cwd(), 'dist');
  const publicDir = path.join(process.cwd(), 'public');
  
  // Ensure directories exist
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Generate files
  const sitemap = generateXMLSitemap();
  const robots = generateRobotsTxt();
  
  // Write to public directory (for development)
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots);
  
  // Write to dist directory (for production)
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robots);
  
  console.log('✅ Generated SEO files:');
  console.log(`   - sitemap.xml (${generateSitemapUrls().length} URLs)`);
  console.log('   - robots.txt');
  console.log(`   - Files written to both public/ and dist/ directories`);
}

// Run the main function
main();

export {
  generateXMLSitemap,
  generateRobotsTxt,
  generateSitemapUrls
};