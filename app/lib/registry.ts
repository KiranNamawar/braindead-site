import type { UtilityDefinition, UtilityRegistry } from './types';
import { categories } from './categories';

/**
 * Initial utility definitions for the platform
 * These represent the core utilities available on braindead.site
 */
export const utilities: UtilityDefinition[] = [
  // Text Tools
  {
    id: 'base64-encoder',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings with real-time conversion',
    category: 'text',
    keywords: ['base64', 'encode', 'decode', 'conversion', 'text'],
    route: '/tools/base64',
    icon: 'FileText',
    featured: true
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder/Decoder',
    description: 'Encode and decode URLs for safe web transmission',
    category: 'text',
    keywords: ['url', 'encode', 'decode', 'percent', 'web'],
    route: '/tools/url-encoder',
    icon: 'Link'
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text between different cases: uppercase, lowercase, title case',
    category: 'text',
    keywords: ['case', 'uppercase', 'lowercase', 'title', 'camel', 'snake'],
    route: '/tools/case-converter',
    icon: 'Type'
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, paragraphs, and reading time',
    category: 'text',
    keywords: ['word', 'count', 'character', 'paragraph', 'reading', 'time'],
    route: '/tools/word-counter',
    icon: 'Hash'
  },

  // Developer Tools
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and minify JSON with syntax highlighting',
    category: 'developer',
    keywords: ['json', 'format', 'validate', 'minify', 'pretty', 'syntax'],
    route: '/tools/json-formatter',
    icon: 'Braces',
    featured: true
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode and verify JSON Web Tokens (JWT)',
    category: 'developer',
    keywords: ['jwt', 'json', 'web', 'token', 'decode', 'verify'],
    route: '/tools/jwt-decoder',
    icon: 'Key'
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, and other hash values',
    category: 'developer',
    keywords: ['hash', 'md5', 'sha1', 'sha256', 'checksum', 'crypto'],
    route: '/tools/hash-generator',
    icon: 'Shield'
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Pick colors and convert between HEX, RGB, HSL formats',
    category: 'developer',
    keywords: ['color', 'picker', 'hex', 'rgb', 'hsl', 'palette'],
    route: '/tools/color-picker',
    icon: 'Palette'
  },

  // Image Tools
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize images while maintaining aspect ratio',
    category: 'image',
    keywords: ['image', 'resize', 'scale', 'dimensions', 'aspect', 'ratio'],
    route: '/tools/image-resizer',
    icon: 'Crop'
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes for text, URLs, and other data',
    category: 'image',
    keywords: ['qr', 'code', 'generator', 'barcode', 'scan'],
    route: '/tools/qr-generator',
    icon: 'QrCode',
    featured: true
  },
  {
    id: 'placeholder-image',
    name: 'Placeholder Image Generator',
    description: 'Generate placeholder images with custom dimensions and colors',
    category: 'image',
    keywords: ['placeholder', 'image', 'generator', 'dimensions', 'mockup'],
    route: '/tools/placeholder-image',
    icon: 'ImageIcon'
  },

  // Productivity Tools
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure passwords with customizable options',
    category: 'productivity',
    keywords: ['password', 'generator', 'secure', 'random', 'strong'],
    route: '/tools/password-generator',
    icon: 'Lock',
    featured: true
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate unique identifiers (UUID/GUID) in various formats',
    category: 'productivity',
    keywords: ['uuid', 'guid', 'unique', 'identifier', 'random'],
    route: '/tools/uuid-generator',
    icon: 'Fingerprint'
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    description: 'Convert between different units of measurement',
    category: 'productivity',
    keywords: ['unit', 'convert', 'measurement', 'metric', 'imperial'],
    route: '/tools/unit-converter',
    icon: 'Calculator'
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert between Unix timestamps and human-readable dates',
    category: 'productivity',
    keywords: ['timestamp', 'unix', 'date', 'time', 'convert', 'epoch'],
    route: '/tools/timestamp-converter',
    icon: 'Clock'
  },

  // Fun Tools
  {
    id: 'lorem-generator',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text for design and development',
    category: 'fun',
    keywords: ['lorem', 'ipsum', 'placeholder', 'text', 'dummy', 'filler'],
    route: '/tools/lorem-generator',
    icon: 'FileText'
  },
  {
    id: 'random-quote',
    name: 'Random Quote Generator',
    description: 'Get inspired with random quotes from famous people',
    category: 'fun',
    keywords: ['quote', 'random', 'inspiration', 'famous', 'wisdom'],
    route: '/tools/random-quote',
    icon: 'Quote'
  },
  {
    id: 'dice-roller',
    name: 'Dice Roller',
    description: 'Roll virtual dice for games and decision making',
    category: 'fun',
    keywords: ['dice', 'roll', 'random', 'game', 'decision'],
    route: '/tools/dice-roller',
    icon: 'Dice1'
  },
  {
    id: 'coin-flip',
    name: 'Coin Flip',
    description: 'Flip a virtual coin for quick decisions',
    category: 'fun',
    keywords: ['coin', 'flip', 'heads', 'tails', 'decision', 'random'],
    route: '/tools/coin-flip',
    icon: 'Circle'
  }
];

/**
 * Featured utility IDs for homepage highlighting
 */
export const featuredUtilities: string[] = [
  'base64-encoder',
  'json-formatter',
  'qr-generator',
  'password-generator'
];

/**
 * Complete utility registry combining categories, utilities, and featured items
 */
export const utilityRegistry: UtilityRegistry = {
  categories,
  utilities,
  featured: featuredUtilities
};

/**
 * Helper function to get utilities by category
 */
export function getUtilitiesByCategory(category: string): UtilityDefinition[] {
  return utilities.filter(utility => utility.category === category);
}

/**
 * Helper function to get a utility by ID
 */
export function getUtilityById(id: string): UtilityDefinition | undefined {
  return utilities.find(utility => utility.id === id);
}

/**
 * Helper function to get featured utilities
 */
export function getFeaturedUtilities(): UtilityDefinition[] {
  return utilities.filter(utility => featuredUtilities.includes(utility.id));
}

/**
 * Helper function to get all utility keywords for search indexing
 */
export function getAllKeywords(): string[] {
  const keywords = new Set<string>();
  utilities.forEach(utility => {
    utility.keywords.forEach(keyword => keywords.add(keyword));
  });
  return Array.from(keywords);
}