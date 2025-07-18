// URL structure utilities for SEO optimization
import { getAllTools } from './toolRegistry';
import { APP_CONFIG } from './constants';

/**
 * Validate that all tool URLs follow SEO best practices
 */
export function validateToolUrls(): { valid: boolean; issues: string[]; recommendations: string[] } {
  const tools = getAllTools();
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  tools.forEach(tool => {
    const path = tool.path;
    
    // Check for SEO-friendly URL patterns
    if (path.includes('_')) {
      issues.push(`Tool ${tool.id} uses underscores in URL: ${path}. Search engines prefer hyphens.`);
      recommendations.push(`Change ${path} to ${path.replace(/_/g, '-')}`);
    }
    
    if (path.includes(' ')) {
      issues.push(`Tool ${tool.id} has spaces in URL: ${path}`);
      recommendations.push(`URL encode spaces or use hyphens in ${path}`);
    }
    
    if (path.length > 50) {
      issues.push(`Tool ${tool.id} has very long URL (${path.length} chars): ${path}`);
      recommendations.push(`Consider shortening URL for ${tool.id}`);
    }
    
    if (!/^\/[a-z0-9-]+$/.test(path)) {
      issues.push(`Tool ${tool.id} URL doesn't follow kebab-case pattern: ${path}`);
      recommendations.push(`Use lowercase letters, numbers, and hyphens only for ${path}`);
    }
    
    // Check for duplicate paths
    const duplicates = tools.filter(t => t.path === path && t.id !== tool.id);
    if (duplicates.length > 0) {
      issues.push(`Duplicate URL path found: ${path} used by ${tool.id} and ${duplicates.map(d => d.id).join(', ')}`);
    }
  });
  
  return {
    valid: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Generate canonical URLs for all tools
 */
export function generateCanonicalUrls(): Record<string, string> {
  const tools = getAllTools();
  const canonicalUrls: Record<string, string> = {};
  
  // Homepage
  canonicalUrls['homepage'] = APP_CONFIG.url;
  
  // Tool pages
  tools.forEach(tool => {
    canonicalUrls[tool.id] = `${APP_CONFIG.url}${tool.path}`;
  });
  
  return canonicalUrls;
}

/**
 * Generate URL redirects for common variations
 */
export function generateUrlRedirects(): Record<string, string> {
  const tools = getAllTools();
  const redirects: Record<string, string> = {};
  
  tools.forEach(tool => {
    const basePath = tool.path.replace('/', '');
    
    // Add common variations that should redirect to the canonical URL
    redirects[`/${basePath}/`] = tool.path; // Remove trailing slash
    redirects[`/${basePath.replace(/-/g, '_')}`] = tool.path; // Underscore to hyphen
    redirects[`/${basePath.toUpperCase()}`] = tool.path; // Uppercase to lowercase
    
    // Add tool name variations
    const toolNameSlug = tool.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (toolNameSlug !== basePath) {
      redirects[`/${toolNameSlug}`] = tool.path;
    }
  });
  
  return redirects;
}

/**
 * Generate structured URL hierarchy for breadcrumbs
 */
export function generateUrlHierarchy(): Record<string, { parent?: string; children: string[] }> {
  const tools = getAllTools();
  const hierarchy: Record<string, { parent?: string; children: string[] }> = {};
  
  // Root level
  hierarchy['/'] = {
    children: [...new Set(tools.map(tool => tool.category))]
  };
  
  // Category level
  const categories = [...new Set(tools.map(tool => tool.category))];
  categories.forEach(category => {
    const categoryTools = tools.filter(tool => tool.category === category);
    hierarchy[`/category/${category}`] = {
      parent: '/',
      children: categoryTools.map(tool => tool.path)
    };
  });
  
  // Tool level
  tools.forEach(tool => {
    hierarchy[tool.path] = {
      parent: `/category/${tool.category}`,
      children: []
    };
  });
  
  return hierarchy;
}

/**
 * Generate URL patterns for server configuration
 */
export function generateServerUrlPatterns(): {
  rewrites: Array<{ source: string; destination: string }>;
  redirects: Array<{ source: string; destination: string; permanent: boolean }>;
} {
  const tools = getAllTools();
  const rewrites: Array<{ source: string; destination: string }> = [];
  const redirects: Array<{ source: string; destination: string; permanent: boolean }> = [];
  
  // SPA fallback - all tool routes should serve index.html
  tools.forEach(tool => {
    rewrites.push({
      source: tool.path,
      destination: '/index.html'
    });
  });
  
  // Category pages
  const categories = [...new Set(tools.map(tool => tool.category))];
  categories.forEach(category => {
    rewrites.push({
      source: `/category/${category}`,
      destination: '/index.html'
    });
  });
  
  // Common redirects
  const urlRedirects = generateUrlRedirects();
  Object.entries(urlRedirects).forEach(([source, destination]) => {
    redirects.push({
      source,
      destination,
      permanent: true
    });
  });
  
  return { rewrites, redirects };
}

/**
 * Validate URL accessibility and performance
 */
export function validateUrlAccessibility(): {
  accessible: boolean;
  issues: string[];
  performance: { score: number; recommendations: string[] };
} {
  const tools = getAllTools();
  const issues: string[] = [];
  const performanceRecommendations: string[] = [];
  
  // Check URL length distribution
  const urlLengths = tools.map(tool => tool.path.length);
  const avgLength = urlLengths.reduce((sum, len) => sum + len, 0) / urlLengths.length;
  const maxLength = Math.max(...urlLengths);
  
  if (avgLength > 30) {
    performanceRecommendations.push('Consider shorter URLs for better user experience');
  }
  
  if (maxLength > 50) {
    performanceRecommendations.push('Some URLs are very long, consider abbreviations');
  }
  
  // Check for accessibility-friendly patterns
  tools.forEach(tool => {
    const path = tool.path;
    
    // URLs should be descriptive
    if (path.length < 5) {
      issues.push(`URL too short to be descriptive: ${path}`);
    }
    
    // Check for screen reader friendly patterns
    if (!/^\/[a-z]/.test(path)) {
      issues.push(`URL should start with a letter for better screen reader support: ${path}`);
    }
  });
  
  // Calculate performance score (0-100)
  let score = 100;
  score -= issues.length * 10;
  score -= performanceRecommendations.length * 5;
  score = Math.max(0, Math.min(100, score));
  
  return {
    accessible: issues.length === 0,
    issues,
    performance: {
      score,
      recommendations: performanceRecommendations
    }
  };
}

/**
 * Generate meta information for URL structure
 */
export function generateUrlMeta(): {
  totalUrls: number;
  categories: number;
  avgUrlLength: number;
  seoScore: number;
  recommendations: string[];
} {
  const tools = getAllTools();
  const categories = [...new Set(tools.map(tool => tool.category))];
  const urlLengths = tools.map(tool => tool.path.length);
  const avgUrlLength = urlLengths.reduce((sum, len) => sum + len, 0) / urlLengths.length;
  
  const validation = validateToolUrls();
  const accessibility = validateUrlAccessibility();
  
  // Calculate overall SEO score
  let seoScore = 100;
  seoScore -= validation.issues.length * 15;
  seoScore -= accessibility.issues.length * 10;
  seoScore = Math.max(0, Math.min(100, seoScore));
  
  const recommendations = [
    ...validation.recommendations,
    ...accessibility.performance.recommendations
  ];
  
  return {
    totalUrls: tools.length + categories.length + 1, // tools + categories + homepage
    categories: categories.length,
    avgUrlLength: Math.round(avgUrlLength),
    seoScore,
    recommendations: recommendations.slice(0, 5) // Top 5 recommendations
  };
}