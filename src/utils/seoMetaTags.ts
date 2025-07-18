// SEO meta tags generation utilities
import { Tool, ToolCategory } from '../types';
import { getAllTools } from './toolRegistry';

export interface MetaTags {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  twitterTitle: string;
  twitterDescription: string;
  canonicalUrl: string;
  structuredData: object;
}

// Generate comprehensive meta tags for tool pages
export function generateToolMetaTags(toolId: string, baseUrl: string = 'https://braindead.site'): MetaTags {
  const toolMetaData: Record<string, Partial<MetaTags>> = {
    'calculator': {
      title: 'Free Online Calculator - Basic Math Calculator | BrainDead.site',
      description: 'Free online calculator for basic math operations. No signup required. Perform addition, subtraction, multiplication, division with keyboard support and calculation history.',
      keywords: 'calculator, math, arithmetic, basic calculator, online calculator, free calculator, addition, subtraction, multiplication, division, keyboard shortcuts',
      ogTitle: 'Free Online Calculator - No Signup Required',
      ogDescription: 'Perform basic math calculations instantly. Keyboard support, calculation history, and completely free to use.',
      twitterTitle: 'Free Online Calculator | BrainDead.site',
      twitterDescription: 'Basic math calculator with keyboard support. No signup, no ads, just calculations.'
    },
    'tip-calculator': {
      title: 'Tip Calculator - Split Bills & Calculate Tips | BrainDead.site',
      description: 'Calculate tips and split restaurant bills easily. Custom tip percentages, bill splitting for groups, currency formatting. No signup required.',
      keywords: 'tip calculator, bill splitter, restaurant tip, gratuity calculator, split bill, tip percentage, dining calculator, restaurant calculator',
      ogTitle: 'Tip Calculator & Bill Splitter - Free Tool',
      ogDescription: 'Calculate tips and split restaurant bills with custom percentages. Perfect for dining out with friends.',
      twitterTitle: 'Tip Calculator | Split Bills Easily',
      twitterDescription: 'Calculate tips and split bills for group dining. Custom percentages and instant calculations.'
    },
    'age-calculator': {
      title: 'Age Calculator - Calculate Exact Age in Years, Months, Days | BrainDead.site',
      description: 'Calculate your exact age in years, months, days, hours, and minutes. Age difference calculator, birthday countdown, leap year handling.',
      keywords: 'age calculator, birthday calculator, age difference, exact age, years months days, birthday countdown, age in days, leap year calculator',
      ogTitle: 'Age Calculator - Calculate Your Exact Age',
      ogDescription: 'Find your exact age down to the second. Age difference calculator with leap year handling.',
      twitterTitle: 'Age Calculator | Exact Age Calculator',
      twitterDescription: 'Calculate your precise age in years, months, days, and hours. Handles leap years automatically.'
    },
    'bmi-calculator': {
      title: 'BMI Calculator - Body Mass Index Calculator | BrainDead.site',
      description: 'Calculate your Body Mass Index (BMI) with metric or imperial units. BMI categories, health indicators, and visual feedback included.',
      keywords: 'bmi calculator, body mass index, health calculator, weight calculator, bmi chart, health metrics, fitness calculator, metric imperial units',
      ogTitle: 'BMI Calculator - Body Mass Index Tool',
      ogDescription: 'Calculate your BMI with metric or imperial units. Includes health categories and indicators.',
      twitterTitle: 'BMI Calculator | Health Metrics Tool',
      twitterDescription: 'Calculate Body Mass Index with health categories. Supports metric and imperial units.'
    },
    'base64-encoder': {
      title: 'Base64 Encoder Decoder - Encode & Decode Base64 Online | BrainDead.site',
      description: 'Free Base64 encoder and decoder tool. Encode text to Base64 or decode Base64 to text. URL-safe Base64, file upload support, batch processing.',
      keywords: 'base64 encoder, base64 decoder, encode base64, decode base64, url safe base64, base64 converter, binary encoder, data encoding',
      ogTitle: 'Base64 Encoder & Decoder - Free Online Tool',
      ogDescription: 'Encode and decode Base64 data instantly. URL-safe variants, file upload support, and batch processing.',
      twitterTitle: 'Base64 Encoder/Decoder | Developer Tool',
      twitterDescription: 'Encode and decode Base64 data with URL-safe variants. Perfect for developers and API work.'
    },
    'json-formatter': {
      title: 'JSON Formatter - Format, Validate & Minify JSON Online | BrainDead.site',
      description: 'Format, validate, and minify JSON data online. Pretty print JSON, syntax highlighting, error detection. Free JSON formatter tool.',
      keywords: 'json formatter, json validator, json minifier, pretty print json, json syntax, json parser, format json, validate json',
      ogTitle: 'JSON Formatter & Validator - Free Tool',
      ogDescription: 'Format, validate, and minify JSON with syntax highlighting and error detection.',
      twitterTitle: 'JSON Formatter | Validate & Format JSON',
      twitterDescription: 'Format and validate JSON data with syntax highlighting. Essential developer tool.'
    },
    'password-generator': {
      title: 'Password Generator - Create Strong Secure Passwords | BrainDead.site',
      description: 'Generate strong, secure passwords with custom length and character sets. Password strength meter, no storage, completely secure.',
      keywords: 'password generator, secure password, strong password, random password, password creator, password strength, secure generator, cryptographic password',
      ogTitle: 'Secure Password Generator - Strong Passwords',
      ogDescription: 'Generate cryptographically secure passwords with custom options. No passwords stored.',
      twitterTitle: 'Password Generator | Secure Passwords',
      twitterDescription: 'Generate strong, secure passwords with custom length and character sets. Completely secure.'
    },
    'color-picker': {
      title: 'Color Picker - HEX RGB HSL Color Converter | BrainDead.site',
      description: 'Pick and convert colors between HEX, RGB, HSL formats. Color palette generator, eyedropper tool, color harmony calculator.',
      keywords: 'color picker, hex color, rgb color, hsl color, color converter, color palette, eyedropper, color harmony, design tool',
      ogTitle: 'Color Picker & Converter - Design Tool',
      ogDescription: 'Pick colors and convert between HEX, RGB, HSL formats. Generate color palettes and explore harmony.',
      twitterTitle: 'Color Picker | HEX RGB HSL Converter',
      twitterDescription: 'Pick and convert colors between formats. Generate palettes and explore color harmony.'
    },
    'qr-generator': {
      title: 'QR Code Generator - Create QR Codes Online Free | BrainDead.site',
      description: 'Generate QR codes for text, URLs, and more. Custom size, error correction, download PNG. Free QR code generator tool.',
      keywords: 'qr code generator, qr generator, create qr code, qr code maker, free qr generator, url qr code, text qr code',
      ogTitle: 'QR Code Generator - Free Online Tool',
      ogDescription: 'Generate QR codes for text, URLs, and data. Custom sizing and downloadable PNG format.',
      twitterTitle: 'QR Code Generator | Create QR Codes Free',
      twitterDescription: 'Generate QR codes for text and URLs. Custom sizes and instant download.'
    },
    'hash-generator': {
      title: 'Hash Generator - MD5 SHA1 SHA256 Hash Calculator | BrainDead.site',
      description: 'Generate MD5, SHA-1, SHA-256 hashes online. File hashing, hash comparison, checksum calculator. Free hash generator tool.',
      keywords: 'hash generator, md5 generator, sha1 generator, sha256 generator, checksum calculator, file hash, crypto hash, hash calculator',
      ogTitle: 'Hash Generator - MD5 SHA1 SHA256 Calculator',
      ogDescription: 'Generate cryptographic hashes with multiple algorithms. File hashing and comparison support.',
      twitterTitle: 'Hash Generator | MD5 SHA1 SHA256',
      twitterDescription: 'Generate cryptographic hashes with MD5, SHA-1, SHA-256 algorithms. File support included.'
    }
  };

  const defaultMeta = toolMetaData[toolId] || {
    title: `${toolId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} | BrainDead.site`,
    description: `Free online ${toolId.replace('-', ' ')} tool. No signup required, works offline, completely free.`,
    keywords: `${toolId.replace('-', ' ')}, online tool, free tool, no signup`,
    ogTitle: `${toolId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} - Free Online Tool`,
    ogDescription: `Free ${toolId.replace('-', ' ')} tool with no signup required.`,
    twitterTitle: `${toolId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} | BrainDead.site`,
    twitterDescription: `Free online ${toolId.replace('-', ' ')} tool. No signup, no ads.`
  };

  const canonicalUrl = `${baseUrl}/${toolId}`;

  // Generate structured data for the tool
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": defaultMeta.title?.split(' | ')[0] || toolId,
    "description": defaultMeta.description,
    "url": canonicalUrl,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "permissions": "browser",
    "isAccessibleForFree": true,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "BrainDead.site"
    },
    "provider": {
      "@type": "Organization",
      "name": "BrainDead.site",
      "url": baseUrl
    }
  };

  return {
    title: defaultMeta.title || '',
    description: defaultMeta.description || '',
    keywords: defaultMeta.keywords || '',
    ogTitle: defaultMeta.ogTitle || defaultMeta.title || '',
    ogDescription: defaultMeta.ogDescription || defaultMeta.description || '',
    ogImage: `${baseUrl}/og-images/${toolId}.png`,
    twitterTitle: defaultMeta.twitterTitle || defaultMeta.title || '',
    twitterDescription: defaultMeta.twitterDescription || defaultMeta.description || '',
    canonicalUrl,
    structuredData
  };
}

// Generate meta tags for category pages
export function generateCategoryMetaTags(category: ToolCategory, baseUrl: string = 'https://braindead.site'): MetaTags {
  const categoryMetaData: Record<ToolCategory, Partial<MetaTags>> = {
    [ToolCategory.EVERYDAY_LIFE]: {
      title: 'Everyday Life Calculators - Free Online Tools | BrainDead.site',
      description: 'Free everyday life calculators including tip calculator, BMI calculator, age calculator, loan calculator, and more. No signup required.',
      keywords: 'everyday calculators, life tools, tip calculator, bmi calculator, age calculator, loan calculator, percentage calculator, daily tools',
      ogTitle: 'Everyday Life Calculators - Free Tools',
      ogDescription: 'Essential calculators for daily life. Tip, BMI, age, loan, and percentage calculators.',
      twitterTitle: 'Everyday Life Calculators | Free Tools',
      twitterDescription: 'Free calculators for daily tasks. No signup required, works offline.'
    },
    [ToolCategory.TEXT_WRITING]: {
      title: 'Text & Writing Tools - Word Counter, Case Converter | BrainDead.site',
      description: 'Free text and writing tools including word counter, text case converter, lorem ipsum generator, diff checker, and text summarizer.',
      keywords: 'text tools, writing tools, word counter, case converter, lorem ipsum, diff checker, text analyzer, text formatter',
      ogTitle: 'Text & Writing Tools - Free Online',
      ogDescription: 'Transform and analyze text with our comprehensive writing tools.',
      twitterTitle: 'Text & Writing Tools | Free Online',
      twitterDescription: 'Word counter, case converter, lorem ipsum, and more text tools.'
    },
    [ToolCategory.DEVELOPER]: {
      title: 'Developer Tools - JSON Formatter, Base64, UUID Generator | BrainDead.site',
      description: 'Essential developer tools including JSON formatter, Base64 encoder/decoder, UUID generator, JWT decoder, and more. Free and secure.',
      keywords: 'developer tools, json formatter, base64 encoder, uuid generator, jwt decoder, url encoder, markdown editor, coding tools',
      ogTitle: 'Developer Tools - Essential Coding Utilities',
      ogDescription: 'JSON formatter, Base64 encoder, UUID generator, and more developer tools.',
      twitterTitle: 'Developer Tools | Coding Utilities',
      twitterDescription: 'Essential tools for developers. JSON, Base64, UUID, JWT, and more.'
    },
    [ToolCategory.CREATIVE_DESIGN]: {
      title: 'Creative Design Tools - Color Picker, Gradient Generator | BrainDead.site',
      description: 'Creative design tools including color picker, CSS gradient generator, favicon generator, ASCII art generator, and emoji picker.',
      keywords: 'design tools, color picker, gradient generator, favicon generator, ascii art, emoji picker, creative tools, css tools',
      ogTitle: 'Creative Design Tools - Free Online',
      ogDescription: 'Color picker, gradient generator, favicon creator, and more design tools.',
      twitterTitle: 'Creative Design Tools | Free Online',
      twitterDescription: 'Design tools for creativity. Colors, gradients, favicons, and more.'
    },
    [ToolCategory.TIME_PRODUCTIVITY]: {
      title: 'Time & Productivity Tools - Pomodoro Timer, World Clock | BrainDead.site',
      description: 'Boost productivity with time management tools including Pomodoro timer, world clock, stopwatch, and countdown timer.',
      keywords: 'productivity tools, pomodoro timer, world clock, stopwatch, countdown timer, time management, focus timer, productivity',
      ogTitle: 'Time & Productivity Tools - Focus Better',
      ogDescription: 'Pomodoro timer, world clock, stopwatch, and countdown tools for productivity.',
      twitterTitle: 'Productivity Tools | Time Management',
      twitterDescription: 'Pomodoro timer, world clock, and other productivity tools.'
    },
    [ToolCategory.NUMBER_CONVERSION]: {
      title: 'Number Conversion Tools - Binary, Hex, Roman Numerals | BrainDead.site',
      description: 'Convert numbers between different bases and formats. Binary, decimal, hexadecimal, octal, and Roman numeral converters.',
      keywords: 'number converter, binary converter, hex converter, roman numerals, base converter, decimal converter, octal converter, number base',
      ogTitle: 'Number Conversion Tools - Convert Bases',
      ogDescription: 'Convert between binary, decimal, hex, octal, and Roman numerals.',
      twitterTitle: 'Number Converters | Binary Hex Decimal',
      twitterDescription: 'Convert numbers between different bases and formats.'
    },
    [ToolCategory.CALCULATOR]: {
      title: 'Calculators - Free Online Calculator Tools | BrainDead.site',
      description: 'Free online calculators for math, finance, health, and everyday calculations. No signup required, works offline.',
      keywords: 'calculator, online calculator, math calculator, free calculator, basic calculator, scientific calculator, financial calculator',
      ogTitle: 'Free Online Calculators - Math & More',
      ogDescription: 'Comprehensive collection of calculators for all your mathematical needs.',
      twitterTitle: 'Free Calculators | Math Tools Online',
      twitterDescription: 'Free online calculators for math, finance, and everyday use.'
    },
    [ToolCategory.UTILITY]: {
      title: 'Utility Tools - QR Generator, Random Generator | BrainDead.site',
      description: 'Useful utility tools including QR code generator, random generator, password generator, and more practical tools.',
      keywords: 'utility tools, qr generator, random generator, password generator, practical tools, online utilities, useful tools',
      ogTitle: 'Utility Tools - Practical Online Tools',
      ogDescription: 'QR generator, random generator, password creator, and other utilities.',
      twitterTitle: 'Utility Tools | Practical Online Tools',
      twitterDescription: 'QR codes, random generation, passwords, and more utility tools.'
    }
  };

  const categoryName = category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const defaultMeta = categoryMetaData[category] || {
    title: `${categoryName} Tools | BrainDead.site`,
    description: `Free ${categoryName.toLowerCase()} tools. No signup required, works offline.`,
    keywords: `${categoryName.toLowerCase()}, online tools, free tools`,
    ogTitle: `${categoryName} Tools - Free Online`,
    ogDescription: `Free ${categoryName.toLowerCase()} tools with no signup required.`,
    twitterTitle: `${categoryName} Tools | BrainDead.site`,
    twitterDescription: `Free ${categoryName.toLowerCase()} tools online.`
  };

  const canonicalUrl = `${baseUrl}/category/${category.toLowerCase()}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": defaultMeta.title?.split(' | ')[0] || categoryName,
    "description": defaultMeta.description,
    "url": canonicalUrl,
    "mainEntity": {
      "@type": "ItemList",
      "name": `${categoryName} Tools`,
      "description": defaultMeta.description
    },
    "provider": {
      "@type": "Organization",
      "name": "BrainDead.site",
      "url": baseUrl
    }
  };

  return {
    title: defaultMeta.title || '',
    description: defaultMeta.description || '',
    keywords: defaultMeta.keywords || '',
    ogTitle: defaultMeta.ogTitle || defaultMeta.title || '',
    ogDescription: defaultMeta.ogDescription || defaultMeta.description || '',
    ogImage: `${baseUrl}/og-images/category-${category.toLowerCase()}.png`,
    twitterTitle: defaultMeta.twitterTitle || defaultMeta.title || '',
    twitterDescription: defaultMeta.twitterDescription || defaultMeta.description || '',
    canonicalUrl,
    structuredData
  };
}

// Generate homepage meta tags
export function generateHomepageMetaTags(baseUrl: string = 'https://braindead.site'): MetaTags {
  const allTools = getAllTools();
  const totalTools = allTools.length;

  return {
    title: 'BrainDead.site - Free Online Tools & Calculators | No Signup Required',
    description: `Access ${totalTools}+ free online tools and calculators. No signup, no ads, no BS. Calculators, converters, generators, and utilities that actually work.`,
    keywords: 'free online tools, calculators, converters, generators, utilities, no signup, web tools, productivity tools, developer tools, text tools, math calculators, design tools',
    ogTitle: 'BrainDead.site - Free Online Tools That Actually Work',
    ogDescription: `${totalTools}+ free tools including calculators, converters, and utilities. No signup required, works offline.`,
    ogImage: `${baseUrl}/og-images/homepage.png`,
    twitterTitle: 'BrainDead.site | Free Online Tools & Calculators',
    twitterDescription: `${totalTools}+ free tools with no signup required. Calculators, converters, and more.`,
    canonicalUrl: baseUrl,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "BrainDead.site",
      "description": `Free online tools and calculators. ${totalTools}+ tools with no signup required.`,
      "url": baseUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      "provider": {
        "@type": "Organization",
        "name": "BrainDead.site",
        "url": baseUrl
      }
    }
  };
}

// Functions are already exported inline above