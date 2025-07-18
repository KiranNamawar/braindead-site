#!/usr/bin/env node

/**
 * Validate SEO implementation and URL structure
 * This script checks the SEO setup and provides recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tool data for validation
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

function validateToolUrls() {
  const issues = [];
  const recommendations = [];
  
  TOOLS.forEach(tool => {
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
    const duplicates = TOOLS.filter(t => t.path === path && t.id !== tool.id);
    if (duplicates.length > 0) {
      issues.push(`Duplicate URL path found: ${path} used by ${tool.id} and ${duplicates.map(d => d.id).join(', ')}`);
    }
  });
  
  return { valid: issues.length === 0, issues, recommendations };
}

function validateSEOFiles() {
  const issues = [];
  const publicDir = path.join(process.cwd(), 'public');
  
  // Check if sitemap.xml exists
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    issues.push('sitemap.xml not found in public directory');
  } else {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    if (!sitemapContent.includes('<?xml')) {
      issues.push('sitemap.xml appears to be invalid (no XML declaration)');
    }
    if (!sitemapContent.includes('https://braindead.site')) {
      issues.push('sitemap.xml does not contain the correct domain');
    }
  }
  
  // Check if robots.txt exists
  const robotsPath = path.join(publicDir, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    issues.push('robots.txt not found in public directory');
  } else {
    const robotsContent = fs.readFileSync(robotsPath, 'utf8');
    if (!robotsContent.includes('Sitemap:')) {
      issues.push('robots.txt does not reference sitemap.xml');
    }
    if (!robotsContent.includes('User-agent: *')) {
      issues.push('robots.txt does not have proper user-agent directive');
    }
  }
  
  return { valid: issues.length === 0, issues };
}

function generateSEOReport() {
  console.log('🔍 SEO Validation Report');
  console.log('========================\n');
  
  // URL Structure Validation
  const urlValidation = validateToolUrls();
  console.log('📋 URL Structure Analysis:');
  console.log(`   Total URLs: ${TOOLS.length}`);
  console.log(`   Valid URLs: ${urlValidation.valid ? '✅ All URLs are SEO-friendly' : '❌ Issues found'}`);
  
  if (urlValidation.issues.length > 0) {
    console.log('\n   Issues:');
    urlValidation.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  if (urlValidation.recommendations.length > 0) {
    console.log('\n   Recommendations:');
    urlValidation.recommendations.forEach(rec => console.log(`   - ${rec}`));
  }
  
  // SEO Files Validation
  const seoFilesValidation = validateSEOFiles();
  console.log('\n📄 SEO Files Analysis:');
  console.log(`   SEO Files: ${seoFilesValidation.valid ? '✅ All files present and valid' : '❌ Issues found'}`);
  
  if (seoFilesValidation.issues.length > 0) {
    console.log('\n   Issues:');
    seoFilesValidation.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  // URL Statistics
  const urlLengths = TOOLS.map(tool => tool.path.length);
  const avgLength = Math.round(urlLengths.reduce((sum, len) => sum + len, 0) / urlLengths.length);
  const maxLength = Math.max(...urlLengths);
  const minLength = Math.min(...urlLengths);
  
  console.log('\n📊 URL Statistics:');
  console.log(`   Average URL length: ${avgLength} characters`);
  console.log(`   Longest URL: ${maxLength} characters`);
  console.log(`   Shortest URL: ${minLength} characters`);
  
  // Categories
  const categories = [...new Set(TOOLS.map(tool => tool.category))];
  console.log(`   Categories: ${categories.length}`);
  categories.forEach(category => {
    const count = TOOLS.filter(tool => tool.category === category).length;
    console.log(`     - ${category}: ${count} tools`);
  });
  
  // Overall Score
  let score = 100;
  score -= urlValidation.issues.length * 10;
  score -= seoFilesValidation.issues.length * 15;
  score = Math.max(0, score);
  
  console.log(`\n🎯 Overall SEO Score: ${score}/100`);
  
  if (score >= 90) {
    console.log('   ✅ Excellent SEO implementation!');
  } else if (score >= 70) {
    console.log('   ⚠️  Good SEO implementation with room for improvement');
  } else {
    console.log('   ❌ SEO implementation needs attention');
  }
  
  console.log('\n========================');
  console.log('SEO validation complete!');
}

// Run the validation
generateSEOReport();