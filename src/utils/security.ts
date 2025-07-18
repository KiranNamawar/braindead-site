/**
 * Security utilities for input sanitization and XSS prevention
 */

// HTML entities for escaping
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

// Dangerous HTML tags that should be stripped
const DANGEROUS_TAGS = [
  'script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select',
  'button', 'link', 'meta', 'style', 'base', 'applet', 'bgsound', 'blink',
  'body', 'frame', 'frameset', 'head', 'html', 'ilayer', 'layer', 'title',
  'xml', 'svg', 'math', 'marquee', 'noscript'
];

// Dangerous attributes that should be stripped
const DANGEROUS_ATTRIBUTES = [
  'onabort', 'onactivate', 'onafterprint', 'onafterupdate', 'onbeforeactivate',
  'onbeforecopy', 'onbeforecut', 'onbeforedeactivate', 'onbeforeeditfocus',
  'onbeforepaste', 'onbeforeprint', 'onbeforeunload', 'onbeforeupdate', 'onblur',
  'onbounce', 'oncellchange', 'onchange', 'onclick', 'oncontextmenu', 'oncontrolselect',
  'oncopy', 'oncut', 'ondataavailable', 'ondatasetchanged', 'ondatasetcomplete',
  'ondblclick', 'ondeactivate', 'ondrag', 'ondragend', 'ondragenter', 'ondragleave',
  'ondragover', 'ondragstart', 'ondrop', 'onerror', 'onerrorupdate', 'onfilterchange',
  'onfinish', 'onfocus', 'onfocusin', 'onfocusout', 'onhelp', 'onkeydown', 'onkeypress',
  'onkeyup', 'onlayoutcomplete', 'onload', 'onlosecapture', 'onmousedown', 'onmouseenter',
  'onmouseleave', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel',
  'onmove', 'onmoveend', 'onmovestart', 'onpaste', 'onpropertychange', 'onreadystatechange',
  'onreset', 'onresize', 'onresizeend', 'onresizestart', 'onrowenter', 'onrowexit',
  'onrowsdelete', 'onrowsinserted', 'onscroll', 'onselect', 'onselectionchange',
  'onselectstart', 'onstart', 'onstop', 'onsubmit', 'onunload', 'javascript:', 'vbscript:',
  'data:', 'mocha:', 'livescript:', 'expression', 'url', 'href', 'src', 'action'
];

// URL protocols that are considered safe
const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:', 'ftp:'];

/**
 * Escapes HTML entities to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }
  
  return text.replace(/[&<>"'`=\/]/g, (match) => HTML_ENTITIES[match] || match);
}

/**
 * Sanitizes text input by removing potentially dangerous content
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove null bytes and control characters (except newlines and tabs)
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Remove potential script injections
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove javascript: and data: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');
  
  // Remove on* event handlers
  sanitized = sanitized.replace(/\bon\w+\s*=/gi, '');
  
  return sanitized.trim();
}

/**
 * Sanitizes HTML content by removing dangerous tags and attributes
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }

  let sanitized = html;

  // Remove dangerous tags
  DANGEROUS_TAGS.forEach(tag => {
    const regex = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  // Remove dangerous attributes
  DANGEROUS_ATTRIBUTES.forEach(attr => {
    const regex = new RegExp(`\\s${attr}\\s*=\\s*[^\\s>]*`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  // Remove javascript: and data: URLs from remaining attributes
  sanitized = sanitized.replace(/\s(href|src|action)\s*=\s*["']?(javascript:|data:|vbscript:)[^"'>\s]*/gi, '');

  return sanitized;
}

/**
 * Validates and sanitizes URLs
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }

  try {
    const urlObj = new URL(url);
    
    // Check if protocol is safe
    if (!SAFE_PROTOCOLS.includes(urlObj.protocol)) {
      return '';
    }
    
    // Remove dangerous characters
    return url.replace(/[<>"'`]/g, '');
  } catch {
    // If URL is invalid, return empty string
    return '';
  }
}

/**
 * Sanitizes JSON input to prevent injection attacks
 */
export function sanitizeJson(jsonString: string): string {
  if (typeof jsonString !== 'string') {
    return '';
  }

  try {
    // Parse and stringify to validate JSON structure
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    // If invalid JSON, return sanitized text
    return sanitizeText(jsonString);
  }
}

/**
 * Sanitizes markdown content to prevent XSS while preserving formatting
 */
export function sanitizeMarkdown(markdown: string): string {
  if (typeof markdown !== 'string') {
    return '';
  }

  let sanitized = markdown;

  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous HTML tags but preserve basic formatting
  const allowedTags = ['b', 'i', 'em', 'strong', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr'];
  const dangerousTagsRegex = new RegExp(`<(?!/?(?:${allowedTags.join('|')})\\b)[^>]+>`, 'gi');
  sanitized = sanitized.replace(dangerousTagsRegex, '');

  // Remove javascript: and data: URLs from links
  sanitized = sanitized.replace(/\[([^\]]*)\]\((javascript:|data:|vbscript:)[^)]*\)/gi, '[$1](#)');
  
  // Remove on* event handlers from any remaining HTML
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^>\s]*/gi, '');

  return sanitized;
}

/**
 * Validates file content based on type and size
 */
export function validateFileContent(content: string, maxSize: number = 1024 * 1024): { isValid: boolean; error?: string } {
  if (typeof content !== 'string') {
    return { isValid: false, error: 'Invalid content type' };
  }

  if (content.length > maxSize) {
    return { isValid: false, error: `Content too large. Maximum size is ${maxSize / 1024}KB` };
  }

  // Check for potential binary content
  if (/[\x00-\x08\x0E-\x1F\x7F]/.test(content)) {
    return { isValid: false, error: 'Binary content not allowed' };
  }

  return { isValid: true };
}

/**
 * Sanitizes CSS content to prevent CSS injection attacks
 */
export function sanitizeCss(css: string): string {
  if (typeof css !== 'string') {
    return '';
  }

  let sanitized = css;

  // Remove javascript: and data: URLs
  sanitized = sanitized.replace(/url\s*\(\s*["']?(javascript:|data:|vbscript:)[^"')]*["']?\s*\)/gi, '');
  
  // Remove expression() calls (IE specific)
  sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, '');
  
  // Remove @import with javascript: or data: URLs
  sanitized = sanitized.replace(/@import\s+["']?(javascript:|data:|vbscript:)[^"';]*/gi, '');
  
  // Remove behavior property (IE specific)
  sanitized = sanitized.replace(/behavior\s*:\s*[^;]*/gi, '');

  return sanitized;
}

/**
 * Rate limiting utility for preventing abuse
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Export a default rate limiter instance
export const defaultRateLimiter = new RateLimiter();

/**
 * Content Security Policy utilities
 */
export const CSP_DIRECTIVES = {
  DEFAULT_SRC: "'self'",
  SCRIPT_SRC: "'self' 'unsafe-inline' data:",
  STYLE_SRC: "'self' 'unsafe-inline' https://fonts.googleapis.com",
  FONT_SRC: "'self' https://fonts.gstatic.com",
  IMG_SRC: "'self' data: https:",
  CONNECT_SRC: "'self'",
  OBJECT_SRC: "'none'",
  MEDIA_SRC: "'self'",
  FRAME_SRC: "'none'",
  WORKER_SRC: "'self'",
  MANIFEST_SRC: "'self'",
  BASE_URI: "'self'",
  FORM_ACTION: "'self'"
};

/**
 * Generates a Content Security Policy header value
 */
export function generateCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([key, value]) => `${key.toLowerCase().replace(/_/g, '-')} ${value}`)
    .join('; ');
}

/**
 * Input validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  BASE64: /^[A-Za-z0-9+/]*={0,2}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  JWT: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
};

/**
 * Validates input against common patterns
 */
export function validateInput(input: string, pattern: keyof typeof VALIDATION_PATTERNS): boolean {
  if (typeof input !== 'string') {
    return false;
  }
  
  return VALIDATION_PATTERNS[pattern].test(input);
}