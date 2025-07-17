import { describe, it, expect } from 'vitest';
import { searchTools, TOOL_SHORTCUTS } from '../utils/fuzzySearch';
import { Tool, ToolCategory } from '../types';

// Mock tools for testing
const mockTools: Tool[] = [
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Basic calculator for everyday math',
    sarcasticQuote: 'Because mental math is apparently too hard',
    path: '/calculator',
    icon: 'Calculator',
    gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    category: ToolCategory.CALCULATOR,
    features: ['Basic operations', 'History', 'Keyboard support'],
    keywords: ['math', 'calculate', 'arithmetic', 'numbers'],
    shortcuts: ['calc', 'math'],
    isPremium: false,
    estimatedTimeSaved: 2
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and minify JSON data',
    sarcasticQuote: 'Making JSON readable by humans again',
    path: '/json-formatter',
    icon: 'Braces',
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
    category: ToolCategory.DEVELOPER,
    features: ['Pretty print', 'Validation', 'Minification'],
    keywords: ['json', 'format', 'validate', 'pretty', 'minify'],
    shortcuts: ['json', 'format'],
    isPremium: false,
    estimatedTimeSaved: 5
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Pick and convert colors between formats',
    sarcasticQuote: 'For when you need that perfect shade of disappointment',
    path: '/color-picker',
    icon: 'Palette',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    category: ToolCategory.CREATIVE_DESIGN,
    features: ['HEX, RGB, HSL conversion', 'Color palette', 'Eyedropper'],
    keywords: ['color', 'hex', 'rgb', 'hsl', 'palette'],
    shortcuts: ['color', 'hex'],
    isPremium: false,
    estimatedTimeSaved: 5
  }
];

describe('Fuzzy Search', () => {
  it('should find tools by exact name match', () => {
    const results = searchTools('Calculator', mockTools);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('calculator');
  });

  it('should find tools by partial name match', () => {
    const results = searchTools('calc', mockTools);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('calculator');
  });

  it('should find tools by shortcut', () => {
    const results = searchTools('json', mockTools);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('json-formatter');
  });

  it('should find tools by keyword', () => {
    const results = searchTools('hex', mockTools);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('color-picker');
  });

  it('should find tools by description', () => {
    const results = searchTools('format', mockTools);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.id === 'json-formatter')).toBe(true);
  });

  it('should return empty array for no matches', () => {
    const results = searchTools('nonexistent', mockTools);
    expect(results).toHaveLength(0);
  });

  it('should return empty array for empty query', () => {
    const results = searchTools('', mockTools);
    expect(results).toHaveLength(0);
  });

  it('should handle case insensitive search', () => {
    const results = searchTools('CALCULATOR', mockTools);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('calculator');
  });

  it('should prioritize exact matches over partial matches', () => {
    const results = searchTools('color', mockTools);
    expect(results[0].id).toBe('color-picker');
  });
});

describe('Tool Shortcuts', () => {
  it('should have shortcuts for calculator', () => {
    expect(TOOL_SHORTCUTS['calculator']).toContain('calc');
    expect(TOOL_SHORTCUTS['calculator']).toContain('math');
  });

  it('should have shortcuts for json formatter', () => {
    expect(TOOL_SHORTCUTS['json-formatter']).toContain('json');
    expect(TOOL_SHORTCUTS['json-formatter']).toContain('format');
  });

  it('should have shortcuts for color picker', () => {
    expect(TOOL_SHORTCUTS['color-picker']).toContain('color');
    expect(TOOL_SHORTCUTS['color-picker']).toContain('hex');
  });
});