// Enhanced input validation utilities with comprehensive error handling
import { LIMITS } from './constants';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
  suggestions?: string[];
}

export interface ValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => ValidationResult;
}

// Legacy functions for backward compatibility
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateHexColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
};

export const validateNumber = (value: string, min?: number, max?: number): boolean => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '');
};

export const validateJSON = (jsonString: string): { isValid: boolean; error?: string } => {
  try {
    JSON.parse(jsonString);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON' 
    };
  }
};

export const validatePasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += 20;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Add lowercase letters');
  } else {
    score += 20;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters');
  } else {
    score += 20;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Add numbers');
  } else {
    score += 20;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push('Add special characters');
  } else {
    score += 20;
  }

  return { score, feedback };
};

// Enhanced validation functions with detailed feedback
export const validateJSONEnhanced = (input: string): ValidationResult => {
  if (!input.trim()) {
    return { isValid: false, error: 'JSON input is required' };
  }

  if (input.length > LIMITS.maxTextLength) {
    return { 
      isValid: false, 
      error: `JSON too large. Maximum size is ${LIMITS.maxTextLength / 1000}KB` 
    };
  }

  try {
    const parsed = JSON.parse(input);
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for common JSON issues
    if (typeof parsed === 'string') {
      warnings.push('JSON contains only a string value');
    }

    if (Array.isArray(parsed) && parsed.length === 0) {
      warnings.push('JSON array is empty');
    }

    if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length === 0) {
      warnings.push('JSON object is empty');
    }

    // Check for potential formatting improvements
    if (!input.includes('\n') && input.length > 100) {
      suggestions.push('Consider formatting for better readability');
    }

    return { isValid: true, warnings, suggestions };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid JSON format';
    const suggestions: string[] = [];

    // Provide helpful suggestions based on common errors
    if (errorMessage.includes('Unexpected token')) {
      suggestions.push('Check for missing commas, quotes, or brackets');
    }
    if (errorMessage.includes('Unexpected end')) {
      suggestions.push('Check for unclosed brackets or quotes');
    }

    return { 
      isValid: false, 
      error: errorMessage,
      suggestions
    };
  }
};

export const validateEmailEnhanced = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!emailRegex.test(email)) {
    const suggestions = [
      'Ensure format is: user@domain.com',
      'Check for missing @ symbol',
      'Verify domain has a dot'
    ];
    return { isValid: false, error: 'Invalid email format', suggestions };
  }

  return { isValid: true };
};

export const validateURLEnhanced = (url: string): ValidationResult => {
  if (!url.trim()) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    const urlObj = new URL(url);
    const warnings: string[] = [];

    if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
      warnings.push('URL should use HTTP or HTTPS protocol');
    }

    if (urlObj.protocol === 'http:') {
      warnings.push('Consider using HTTPS for security');
    }

    return { isValid: true, warnings };
  } catch {
    const suggestions = [
      'Include protocol (http:// or https://)',
      'Check for typos in domain name',
      'Ensure proper URL format'
    ];
    return { isValid: false, error: 'Invalid URL format', suggestions };
  }
};

export const validatePasswordEnhanced = (password: string): ValidationResult => {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { 
      isValid: false, 
      error: 'Password must be at least 8 characters long',
      suggestions: ['Use a combination of letters, numbers, and symbols']
    };
  }

  let strength = 0;

  if (!/[A-Z]/.test(password)) {
    warnings.push('Consider adding uppercase letters');
    suggestions.push('Add at least one uppercase letter (A-Z)');
  } else {
    strength++;
  }

  if (!/[a-z]/.test(password)) {
    warnings.push('Consider adding lowercase letters');
    suggestions.push('Add at least one lowercase letter (a-z)');
  } else {
    strength++;
  }

  if (!/\d/.test(password)) {
    warnings.push('Consider adding numbers');
    suggestions.push('Add at least one number (0-9)');
  } else {
    strength++;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    warnings.push('Consider adding special characters');
    suggestions.push('Add special characters (!@#$%^&*)');
  } else {
    strength++;
  }

  if (password.length >= 12) {
    strength++;
  }

  // Check for common weak patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /(.)\1{2,}/, // repeated characters
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      warnings.push('Avoid common patterns and repeated characters');
      break;
    }
  }

  return { isValid: true, warnings, suggestions };
};

export const validateNumberEnhanced = (
  input: string, 
  min?: number, 
  max?: number,
  allowDecimals = true
): ValidationResult => {
  if (!input.trim()) {
    return { isValid: false, error: 'Number is required' };
  }

  const num = allowDecimals ? parseFloat(input) : parseInt(input, 10);
  
  if (isNaN(num)) {
    const suggestions = [
      'Enter a valid number',
      allowDecimals ? 'Use decimal point (.) for decimals' : 'Enter whole numbers only'
    ];
    return { isValid: false, error: 'Invalid number format', suggestions };
  }

  if (!allowDecimals && input.includes('.')) {
    return { 
      isValid: false, 
      error: 'Decimal numbers not allowed',
      suggestions: ['Enter whole numbers only']
    };
  }

  if (min !== undefined && num < min) {
    return { 
      isValid: false, 
      error: `Number must be at least ${min}`,
      suggestions: [`Enter a value >= ${min}`]
    };
  }

  if (max !== undefined && num > max) {
    return { 
      isValid: false, 
      error: `Number must be at most ${max}`,
      suggestions: [`Enter a value <= ${max}`]
    };
  }

  return { isValid: true };
};

export const validateBase64 = (input: string): ValidationResult => {
  if (!input.trim()) {
    return { isValid: false, error: 'Base64 input is required' };
  }

  // Remove whitespace and newlines
  const cleaned = input.replace(/\s/g, '');
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  
  if (!base64Regex.test(cleaned)) {
    const suggestions = [
      'Base64 should only contain A-Z, a-z, 0-9, +, /, and = for padding',
      'Remove any spaces or special characters',
      'Check for typos in the encoded string'
    ];
    return { isValid: false, error: 'Invalid Base64 format', suggestions };
  }

  try {
    atob(cleaned);
    const warnings: string[] = [];
    
    if (input !== cleaned) {
      warnings.push('Whitespace was automatically removed');
    }
    
    return { isValid: true, warnings };
  } catch {
    return { 
      isValid: false, 
      error: 'Invalid Base64 encoding',
      suggestions: ['Verify the Base64 string is complete and not corrupted']
    };
  }
};

export const validateHexColorEnhanced = (input: string): ValidationResult => {
  if (!input.trim()) {
    return { isValid: false, error: 'Color value is required' };
  }

  const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  
  if (!hexRegex.test(input)) {
    const suggestions = [
      'Use format: #RRGGBB or #RGB',
      'Example: #FF0000 for red',
      'Only use hexadecimal characters (0-9, A-F)'
    ];
    return { isValid: false, error: 'Invalid hex color format', suggestions };
  }

  return { isValid: true };
};

export const validateMarkdown = (input: string): ValidationResult => {
  if (!input.trim()) {
    return { isValid: false, error: 'Markdown content is required' };
  }

  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for common markdown issues
  const lines = input.split('\n');
  
  // Check for unmatched brackets
  const openBrackets = (input.match(/\[/g) || []).length;
  const closeBrackets = (input.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    warnings.push('Unmatched square brackets detected');
    suggestions.push('Check link syntax: [text](url)');
  }

  // Check for unmatched parentheses in links
  const openParens = (input.match(/\(/g) || []).length;
  const closeParens = (input.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    warnings.push('Unmatched parentheses detected');
    suggestions.push('Check link URLs are properly closed');
  }

  return { isValid: true, warnings, suggestions };
};

export const validateRegex = (pattern: string): ValidationResult => {
  if (!pattern.trim()) {
    return { isValid: false, error: 'Regular expression is required' };
  }

  try {
    new RegExp(pattern);
    return { isValid: true };
  } catch (error) {
    const suggestions = [
      'Check for unescaped special characters',
      'Verify bracket matching',
      'Use \\ to escape special characters'
    ];
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid regular expression',
      suggestions
    };
  }
};

export const validateCSS = (input: string): ValidationResult => {
  if (!input.trim()) {
    return { isValid: false, error: 'CSS input is required' };
  }

  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Basic CSS validation checks
  const openBraces = (input.match(/\{/g) || []).length;
  const closeBraces = (input.match(/\}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    return { 
      isValid: false, 
      error: 'Unmatched braces in CSS',
      suggestions: ['Check that all { have matching }']
    };
  }

  // Check for common issues
  if (input.includes(';;')) {
    warnings.push('Double semicolons found');
    suggestions.push('Remove extra semicolons');
  }

  if (!input.includes(';') && input.includes(':')) {
    warnings.push('Missing semicolons after properties');
    suggestions.push('Add semicolons after CSS property values');
  }

  return { isValid: true, warnings, suggestions };
};

// Enhanced sanitization
export const sanitizeHTML = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

export const sanitizeInputEnhanced = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/vbscript:/gi, '')
    .trim();
};

// Generic validator with options
export const validateWithOptions = (
  value: any,
  options: ValidationOptions
): ValidationResult => {
  const { required, minLength, maxLength, pattern, customValidator } = options;

  if (required && (!value || (typeof value === 'string' && !value.trim()))) {
    return { isValid: false, error: 'This field is required' };
  }

  if (typeof value === 'string') {
    if (minLength && value.length < minLength) {
      return { 
        isValid: false, 
        error: `Minimum length is ${minLength} characters`,
        suggestions: [`Current length: ${value.length}`]
      };
    }

    if (maxLength && value.length > maxLength) {
      return { 
        isValid: false, 
        error: `Maximum length is ${maxLength} characters`,
        suggestions: [`Current length: ${value.length}`]
      };
    }

    if (pattern && !pattern.test(value)) {
      return { 
        isValid: false, 
        error: 'Value does not match required pattern',
        suggestions: ['Check the format requirements']
      };
    }
  }

  if (customValidator) {
    return customValidator(value);
  }

  return { isValid: true };
};