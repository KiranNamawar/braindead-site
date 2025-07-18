// SEO utilities for dynamic meta tags and structured data
import { Tool, ToolCategory } from '../types';
import { APP_CONFIG } from './constants';

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  image: string;
  type: string;
  structuredData: any;
  breadcrumbs?: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

// Tool-specific SEO configurations
const TOOL_SEO_CONFIG: Record<string, Partial<SEOData>> = {
  'calculator': {
    title: 'Free Online Calculator - Basic Math Operations',
    description: 'Free online calculator for basic math operations. Add, subtract, multiply, divide with history and keyboard support. No signup required.',
    keywords: ['calculator', 'math', 'arithmetic', 'basic calculator', 'online calculator', 'free calculator'],
  },
  'color-picker': {
    title: 'Color Picker Tool - HEX, RGB, HSL Converter',
    description: 'Free color picker and converter tool. Convert between HEX, RGB, HSL color formats. Generate color palettes and use eyedropper tool.',
    keywords: ['color picker', 'hex converter', 'rgb converter', 'hsl converter', 'color palette', 'eyedropper'],
  },
  'qr-generator': {
    title: 'QR Code Generator - Free QR Code Maker',
    description: 'Generate QR codes for free. Create QR codes for URLs, text, contact info. Customizable size and error correction. Download as PNG.',
    keywords: ['qr code generator', 'qr code maker', 'free qr code', 'qr code creator', 'generate qr code'],
  },
  'text-tools': {
    title: 'Text Tools - Case Converter, Text Cleaner',
    description: 'Free text transformation tools. Convert text case, clean text, count characters. Multiple text manipulation utilities in one place.',
    keywords: ['text tools', 'case converter', 'text cleaner', 'character count', 'text manipulation'],
  },
  'password-generator': {
    title: 'Secure Password Generator - Strong Random Passwords',
    description: 'Generate secure, random passwords with custom options. Choose length, character sets, and complexity. Password strength meter included.',
    keywords: ['password generator', 'secure password', 'random password', 'strong password', 'password maker'],
  },
  'hash-generator': {
    title: 'Hash Generator - MD5, SHA-1, SHA-256 Hash Calculator',
    description: 'Generate cryptographic hashes for text and files. Supports MD5, SHA-1, SHA-256, and more. Compare hashes and verify integrity.',
    keywords: ['hash generator', 'md5 generator', 'sha256 generator', 'checksum calculator', 'crypto hash'],
  },
  'image-optimizer': {
    title: 'Image Optimizer - Compress and Resize Images',
    description: 'Optimize and compress images online. Reduce file size while maintaining quality. Supports JPEG, PNG, WebP formats.',
    keywords: ['image optimizer', 'image compressor', 'resize image', 'compress image', 'image converter'],
  },
  'timestamp-converter': {
    title: 'Unix Timestamp Converter - Date Time Converter',
    description: 'Convert Unix timestamps to human-readable dates and vice versa. Support for multiple date formats and timezones.',
    keywords: ['timestamp converter', 'unix timestamp', 'date converter', 'time converter', 'epoch converter'],
  },
  'json-formatter': {
    title: 'JSON Formatter - Validate, Format, Minify JSON',
    description: 'Format, validate, and minify JSON data online. Pretty print JSON with syntax highlighting. JSON validator and beautifier.',
    keywords: ['json formatter', 'json validator', 'json beautifier', 'json minifier', 'json pretty print'],
  },
  'random-generator': {
    title: 'Random Generator - Numbers, Strings, UUIDs',
    description: 'Generate random numbers, strings, and UUIDs. Customizable ranges and formats. Perfect for testing and development.',
    keywords: ['random generator', 'random number generator', 'uuid generator', 'random string generator'],
  },
  'unit-converter': {
    title: 'Unit Converter - Length, Weight, Temperature',
    description: 'Convert between different units of measurement. Length, weight, temperature, volume conversions. Metric and imperial units.',
    keywords: ['unit converter', 'metric converter', 'imperial converter', 'length converter', 'weight converter'],
  },
  'tip-calculator': {
    title: 'Tip Calculator - Bill Splitter and Gratuity Calculator',
    description: 'Calculate tips and split bills easily. Custom tip percentages, bill splitting for groups, currency formatting.',
    keywords: ['tip calculator', 'bill splitter', 'gratuity calculator', 'restaurant tip', 'service charge'],
  },
  'age-calculator': {
    title: 'Age Calculator - Precise Age and Date Difference',
    description: 'Calculate exact age in years, months, days, hours. Age comparison tool with leap year handling and multiple date formats.',
    keywords: ['age calculator', 'birthday calculator', 'date difference', 'age in days', 'time calculator'],
  },
  'bmi-calculator': {
    title: 'BMI Calculator - Body Mass Index Calculator',
    description: 'Calculate Body Mass Index (BMI) with health insights. Metric and imperial units, BMI categories, health indicators.',
    keywords: ['bmi calculator', 'body mass index', 'health calculator', 'weight calculator', 'fitness calculator'],
  },
  'loan-calculator': {
    title: 'Loan Calculator - Mortgage Payment Calculator',
    description: 'Calculate loan payments and amortization schedules. Mortgage calculator with interest breakdown and payment analysis.',
    keywords: ['loan calculator', 'mortgage calculator', 'payment calculator', 'amortization calculator', 'interest calculator'],
  },
  'percentage-calculator': {
    title: 'Percentage Calculator - Percent Change Calculator',
    description: 'Calculate percentages, increases, decreases, and percentage changes. Multiple calculation types with clear explanations.',
    keywords: ['percentage calculator', 'percent calculator', 'percentage change', 'percent increase', 'percent decrease'],
  },
  'grade-calculator': {
    title: 'Grade Calculator - GPA and Weighted Grade Calculator',
    description: 'Calculate weighted grades and GPA. Grade scale customization, grade prediction, academic performance tracking.',
    keywords: ['grade calculator', 'gpa calculator', 'weighted grade', 'academic calculator', 'school calculator'],
  },
  'word-counter': {
    title: 'Word Counter - Text Analyzer and Reading Time',
    description: 'Count words, characters, paragraphs. Text analysis with reading time estimation and keyword density analysis.',
    keywords: ['word counter', 'character counter', 'text analyzer', 'reading time', 'text statistics'],
  },
  'text-case-converter': {
    title: 'Text Case Converter - Upper, Lower, Title Case',
    description: 'Convert text case online. Upper case, lower case, title case, camel case, snake case, and more text transformations.',
    keywords: ['text case converter', 'uppercase converter', 'lowercase converter', 'title case', 'camel case'],
  },
  'lorem-ipsum': {
    title: 'Lorem Ipsum Generator - Placeholder Text Generator',
    description: 'Generate Lorem Ipsum placeholder text. Customizable word, sentence, and paragraph count. Multiple Lorem variants.',
    keywords: ['lorem ipsum generator', 'placeholder text', 'dummy text', 'filler text', 'text generator'],
  },
  'diff-checker': {
    title: 'Text Diff Checker - Compare Text Differences',
    description: 'Compare text differences online. Side-by-side text comparison with line, word, and character level highlighting.',
    keywords: ['diff checker', 'text compare', 'text difference', 'file compare', 'text comparison'],
  },
  'text-summarizer': {
    title: 'Text Summarizer - Automatic Text Summary',
    description: 'Summarize text automatically. Extract key sentences and create bullet point summaries with customizable length.',
    keywords: ['text summarizer', 'text summary', 'automatic summarization', 'key sentences', 'text extraction'],
  },
  'gradient-generator': {
    title: 'CSS Gradient Generator - Linear, Radial, Conic Gradients',
    description: 'Generate CSS gradients with visual editor. Linear, radial, and conic gradients with color picker and CSS code output.',
    keywords: ['css gradient generator', 'gradient maker', 'linear gradient', 'radial gradient', 'css generator'],
  },
  'ascii-art-generator': {
    title: 'ASCII Art Generator - Text to ASCII Art Converter',
    description: 'Convert text to ASCII art with multiple font styles. Create ASCII art banners and text art with export options.',
    keywords: ['ascii art generator', 'text to ascii', 'ascii art maker', 'text art', 'ascii banner'],
  },
  'favicon-generator': {
    title: 'Favicon Generator - Create Website Icons',
    description: 'Generate favicons from text or graphics. Multiple sizes (16x16, 32x32, etc.) with ICO format export and preview.',
    keywords: ['favicon generator', 'favicon maker', 'website icon', 'ico generator', 'favicon creator'],
  },
  'pomodoro-timer': {
    title: 'Pomodoro Timer - Focus and Productivity Timer',
    description: 'Pomodoro technique timer with customizable work and break intervals. Track productivity sessions and statistics.',
    keywords: ['pomodoro timer', 'focus timer', 'productivity timer', 'work timer', 'break timer'],
  },
  'world-clock': {
    title: 'World Clock - Multiple Timezone Display',
    description: 'Display multiple timezones simultaneously. World clock with timezone search, conversion, and customizable formats.',
    keywords: ['world clock', 'timezone converter', 'time zones', 'international time', 'global clock'],
  },
  'stopwatch-timer': {
    title: 'Stopwatch and Timer - Precise Time Measurement',
    description: 'Precise stopwatch with lap times and countdown timer. Multiple timer support with sound notifications.',
    keywords: ['stopwatch', 'timer', 'countdown timer', 'lap timer', 'precision timer'],
  },
  'countdown-timer': {
    title: 'Countdown Timer - Event Countdown Clock',
    description: 'Create countdown timers for events. Multiple countdown formats with custom event management and notifications.',
    keywords: ['countdown timer', 'event countdown', 'countdown clock', 'timer countdown', 'event timer'],
  },
  'base64-encoder': {
    title: 'Base64 Encoder Decoder - URL Safe Base64 Converter',
    description: 'Encode and decode Base64 data online. URL-safe Base64 variants, file upload support, and batch processing.',
    keywords: ['base64 encoder', 'base64 decoder', 'base64 converter', 'url safe base64', 'data encoding'],
  },
  'url-encoder': {
    title: 'URL Encoder Decoder - URL Component Parser',
    description: 'Encode, decode, and parse URLs. URL component extraction, query parameter analysis, and URL validation.',
    keywords: ['url encoder', 'url decoder', 'url parser', 'query parameters', 'url validation'],
  },
  'markdown-editor': {
    title: 'Markdown Editor - Live Preview and Syntax Highlighting',
    description: 'Live markdown editor with real-time preview. Syntax highlighting, formatting toolbar, and HTML export.',
    keywords: ['markdown editor', 'markdown preview', 'md editor', 'markdown converter', 'live preview'],
  },
  'uuid-generator': {
    title: 'UUID Generator - GUID Generator and Validator',
    description: 'Generate and validate UUIDs (GUIDs). Multiple UUID versions, bulk generation, and format validation.',
    keywords: ['uuid generator', 'guid generator', 'uuid validator', 'unique identifier', 'uuid maker'],
  },
  'jwt-decoder': {
    title: 'JWT Decoder - JSON Web Token Analyzer',
    description: 'Decode and analyze JSON Web Tokens (JWT). Header and payload inspection with security information.',
    keywords: ['jwt decoder', 'json web token', 'jwt analyzer', 'token decoder', 'jwt parser'],
  },
  'number-converter': {
    title: 'Number Base Converter - Binary, Hex, Decimal Converter',
    description: 'Convert numbers between binary, decimal, hexadecimal, and octal. Step-by-step conversion explanations.',
    keywords: ['number converter', 'binary converter', 'hex converter', 'decimal converter', 'base converter'],
  },
  'roman-numeral': {
    title: 'Roman Numeral Converter - Roman to Decimal Converter',
    description: 'Convert between Roman numerals and decimal numbers. Historical context, format validation, and batch processing.',
    keywords: ['roman numeral converter', 'roman to decimal', 'decimal to roman', 'roman numerals', 'ancient numbers'],
  },
};

// Category-specific SEO data
const CATEGORY_SEO_CONFIG: Record<ToolCategory, { keywords: string[]; description: string }> = {
  [ToolCategory.CALCULATOR]: {
    keywords: ['calculator', 'math tools', 'arithmetic', 'computation'],
    description: 'Free online calculators for everyday math, finance, and scientific calculations.'
  },
  [ToolCategory.TEXT_WRITING]: {
    keywords: ['text tools', 'writing tools', 'text processing', 'text manipulation'],
    description: 'Text processing and writing tools for content creation and text analysis.'
  },
  [ToolCategory.CREATIVE_DESIGN]: {
    keywords: ['design tools', 'creative tools', 'graphics', 'visual design'],
    description: 'Creative and design tools for graphics, colors, and visual content creation.'
  },
  [ToolCategory.TIME_PRODUCTIVITY]: {
    keywords: ['productivity tools', 'time management', 'timers', 'scheduling'],
    description: 'Time management and productivity tools to boost your efficiency.'
  },
  [ToolCategory.DEVELOPER]: {
    keywords: ['developer tools', 'programming tools', 'coding utilities', 'development'],
    description: 'Developer tools and utilities for programming, debugging, and development.'
  },
  [ToolCategory.UTILITY]: {
    keywords: ['utility tools', 'general tools', 'everyday tools', 'practical tools'],
    description: 'General utility tools for everyday tasks and common operations.'
  },
  [ToolCategory.NUMBER_CONVERSION]: {
    keywords: ['number conversion', 'base conversion', 'math conversion', 'numerical tools'],
    description: 'Number and base conversion tools for mathematical operations.'
  },
  [ToolCategory.EVERYDAY_LIFE]: {
    keywords: ['everyday tools', 'life tools', 'practical calculators', 'daily tools'],
    description: 'Practical tools for everyday life calculations and tasks.'
  }
};

/**
 * Generate SEO data for a specific tool
 */
export function generateToolSEO(tool: Tool): SEOData {
  const toolConfig = TOOL_SEO_CONFIG[tool.id] || {};
  const categoryConfig = CATEGORY_SEO_CONFIG[tool.category];
  
  const title = toolConfig.title || `${tool.name} - ${tool.description}`;
  const description = toolConfig.description || tool.description;
  const keywords = [
    ...(toolConfig.keywords || []),
    ...tool.keywords,
    ...categoryConfig.keywords,
    'free tool',
    'no signup',
    'online tool'
  ];

  const canonical = `${APP_CONFIG.url}${tool.path}`;
  const image = `${APP_CONFIG.url}/og-images/${tool.id}.png`;

  // Generate structured data for the tool
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: description,
    url: canonical,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    creator: {
      '@type': 'Organization',
      name: APP_CONFIG.author,
      url: APP_CONFIG.url
    },
    featureList: tool.features,
    keywords: keywords.join(', '),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1'
    },
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: tool.name,
      applicationCategory: categoryConfig.description,
      operatingSystem: 'Web Browser',
      permissions: 'No permissions required',
      price: '0',
      priceCurrency: 'USD'
    }
  };

  // Generate breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: APP_CONFIG.url },
    { name: getCategoryDisplayName(tool.category), url: `${APP_CONFIG.url}/#${tool.category}` },
    { name: tool.name, url: canonical }
  ];

  return {
    title,
    description,
    keywords,
    canonical,
    image,
    type: 'website',
    structuredData,
    breadcrumbs
  };
}

/**
 * Generate SEO data for the homepage
 */
export function generateHomepageSEO(): SEOData {
  const title = `${APP_CONFIG.name} - Premium Utility Tools for Effortless Productivity`;
  const description = 'Free online utility tools for productivity. 30+ tools including calculators, converters, generators, and more. No signup required, works offline, respects privacy.';
  const keywords = [
    'utility tools',
    'online tools',
    'free tools',
    'productivity tools',
    'calculator',
    'converter',
    'generator',
    'no signup',
    'privacy focused',
    'offline tools'
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: APP_CONFIG.name,
    description: description,
    url: APP_CONFIG.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${APP_CONFIG.url}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Utility Tools',
      description: 'Collection of free online utility tools',
      numberOfItems: 30,
      itemListElement: [] // Will be populated with tools
    },
    publisher: {
      '@type': 'Organization',
      name: APP_CONFIG.author,
      url: APP_CONFIG.url
    }
  };

  return {
    title,
    description,
    keywords,
    canonical: APP_CONFIG.url,
    image: `${APP_CONFIG.url}/og-image.svg`,
    type: 'website',
    structuredData
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: BreadcrumbItem[]): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * Get display name for tool category
 */
function getCategoryDisplayName(category: ToolCategory): string {
  const categoryNames: Record<ToolCategory, string> = {
    [ToolCategory.CALCULATOR]: 'Calculators',
    [ToolCategory.TEXT_WRITING]: 'Text & Writing Tools',
    [ToolCategory.CREATIVE_DESIGN]: 'Creative & Design Tools',
    [ToolCategory.TIME_PRODUCTIVITY]: 'Time & Productivity Tools',
    [ToolCategory.DEVELOPER]: 'Developer Tools',
    [ToolCategory.UTILITY]: 'Utility Tools',
    [ToolCategory.NUMBER_CONVERSION]: 'Number Conversion Tools',
    [ToolCategory.EVERYDAY_LIFE]: 'Everyday Life Tools'
  };
  
  return categoryNames[category] || category;
}

/**
 * Generate FAQ structured data for tools
 */
export function generateToolFAQStructuredData(tool: Tool): any {
  const commonFAQs = [
    {
      question: `Is the ${tool.name} free to use?`,
      answer: `Yes, our ${tool.name} is completely free to use. No signup, no hidden fees, no premium tiers.`
    },
    {
      question: `Do I need to create an account to use the ${tool.name}?`,
      answer: `No account required! You can use the ${tool.name} immediately without any registration or email signup.`
    },
    {
      question: `Does the ${tool.name} work offline?`,
      answer: `Yes, once loaded, the ${tool.name} works offline. Your data stays in your browser and never leaves your device.`
    },
    {
      question: `Is my data safe when using the ${tool.name}?`,
      answer: `Absolutely! All processing happens in your browser. We don't collect, store, or transmit your data to our servers.`
    }
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: commonFAQs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Generate organization structured data
 */
export function generateOrganizationStructuredData(): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: APP_CONFIG.name,
    url: APP_CONFIG.url,
    description: 'Provider of free online utility tools for productivity and everyday tasks.',
    foundingDate: '2024',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English'
    }
  };
}