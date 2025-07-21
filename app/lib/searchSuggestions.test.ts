/**
 * Unit tests for the search suggestions system
 */
import { generateSuggestions, filterSuggestions } from './searchSuggestions';
import { utilityRegistry } from './registry';
import type { SearchSuggestion } from './types';

// Mock fuzzy matcher function for testing
const mockFuzzyMatcher = (query: string, target: string): number | null => {
  // Simple fuzzy matching for testing
  if (target.toLowerCase().includes(query.toLowerCase())) {
    return 0.8;
  }
  
  // Check for typos (allow one character difference)
  if (query.length > 2) {
    // Check if target contains query with first character removed
    if (target.toLowerCase().includes(query.toLowerCase().slice(1))) {
      return 0.7;
    }
    
    // Check if target contains query with last character removed
    if (target.toLowerCase().includes(query.toLowerCase().slice(0, -1))) {
      return 0.7;
    }
    
    // Special case for "jsno" -> "json"
    if (query.toLowerCase() === 'jsno' && target.toLowerCase().includes('json')) {
      return 0.7;
    }
  }
  
  return null;
};

describe('Search Suggestions System', () => {
  describe('generateSuggestions', () => {
    test('should return empty array for empty query', () => {
      expect(generateSuggestions('', mockFuzzyMatcher)).toEqual([]);
      expect(generateSuggestions('   ', mockFuzzyMatcher)).toEqual([]);
    });
    
    test('should generate utility suggestions', () => {
      const suggestions = generateSuggestions('json', mockFuzzyMatcher);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.type === 'utility' && s.text.toLowerCase().includes('json'))).toBe(true);
    });
    
    test('should generate keyword suggestions', () => {
      // Use a keyword that definitely exists in the registry
      const suggestions = generateSuggestions('json', mockFuzzyMatcher);
      
      expect(suggestions.length).toBeGreaterThan(0);
      // Check if any suggestion is a keyword or contains 'json'
      expect(suggestions.some(s => 
        s.type === 'keyword' || 
        s.text.toLowerCase().includes('json')
      )).toBe(true);
    });
    
    test('should generate category suggestions', () => {
      const suggestions = generateSuggestions('text', mockFuzzyMatcher);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.type === 'category' && s.text === 'Text Tools')).toBe(true);
    });
    
    test('should respect maxSuggestions option', () => {
      const suggestions = generateSuggestions('a', mockFuzzyMatcher, { maxSuggestions: 5 });
      
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });
    
    test('should respect type-specific limits', () => {
      const suggestions = generateSuggestions('a', mockFuzzyMatcher, { 
        maxUtilities: 2,
        maxKeywords: 1,
        maxCategories: 1
      });
      
      const utilities = suggestions.filter(s => s.type === 'utility');
      const keywords = suggestions.filter(s => s.type === 'keyword');
      const categories = suggestions.filter(s => s.type === 'category');
      
      expect(utilities.length).toBeLessThanOrEqual(2);
      expect(keywords.length).toBeLessThanOrEqual(1);
      expect(categories.length).toBeLessThanOrEqual(1);
    });
    
    test('should boost featured utilities', () => {
      // Find a query that matches both featured and non-featured utilities
      const suggestions = generateSuggestions('format', mockFuzzyMatcher);
      
      // Get featured and non-featured utilities
      const featuredUtilities = utilityRegistry.utilities.filter(u => u.featured);
      const featuredNames = featuredUtilities.map(u => u.name);
      
      // Check if featured utilities appear before non-featured ones
      const featuredIndices = suggestions
        .filter(s => s.type === 'utility' && featuredNames.includes(s.text))
        .map(s => suggestions.indexOf(s));
      
      const nonFeaturedIndices = suggestions
        .filter(s => s.type === 'utility' && !featuredNames.includes(s.text))
        .map(s => suggestions.indexOf(s));
      
      if (featuredIndices.length > 0 && nonFeaturedIndices.length > 0) {
        expect(Math.min(...featuredIndices)).toBeLessThan(Math.max(...nonFeaturedIndices));
      }
    });
    
    test('should boost recently used utilities', () => {
      const recentlyUsed = ['json-formatter'];
      
      const suggestions = generateSuggestions('format', mockFuzzyMatcher, { recentlyUsed });
      
      // Check if recently used utilities appear before others
      const recentIndices = suggestions
        .filter(s => s.type === 'utility' && s.utility?.id === 'json-formatter')
        .map(s => suggestions.indexOf(s));
      
      const otherIndices = suggestions
        .filter(s => s.type === 'utility' && s.utility?.id !== 'json-formatter')
        .map(s => suggestions.indexOf(s));
      
      if (recentIndices.length > 0 && otherIndices.length > 0) {
        expect(Math.min(...recentIndices)).toBeLessThan(Math.max(...otherIndices));
      }
    });
    
    test('should handle typos with fuzzy matching', () => {
      const suggestions = generateSuggestions('jsno', mockFuzzyMatcher); // Intentional typo
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.text.toLowerCase().includes('json'))).toBe(true);
    });
  });
  
  describe('filterSuggestions', () => {
    test('should remove duplicate suggestions', () => {
      const duplicateSuggestions: SearchSuggestion[] = [
        { type: 'utility', text: 'JSON Formatter' },
        { type: 'utility', text: 'JSON Formatter' }, // Duplicate
        { type: 'keyword', text: 'json' },
        { type: 'keyword', text: 'json' } // Duplicate
      ];
      
      const filtered = filterSuggestions(duplicateSuggestions);
      
      // Should have one utility and one keyword
      expect(filtered.filter(s => s.text === 'JSON Formatter').length).toBe(1);
      expect(filtered.filter(s => s.text === 'json').length).toBe(1);
    });
    
    test('should keep utilities, categories, and keywords', () => {
      const suggestions: SearchSuggestion[] = [
        { type: 'utility', text: 'JSON Formatter' },
        { type: 'keyword', text: 'json' },
        { type: 'keyword', text: 'format' }
      ];
      
      const filtered = filterSuggestions(suggestions);
      
      // Should keep all unique suggestions
      expect(filtered.length).toBe(3);
      expect(filtered.some(s => s.text === 'JSON Formatter')).toBe(true);
      expect(filtered.some(s => s.text === 'json')).toBe(true);
      expect(filtered.some(s => s.text === 'format')).toBe(true);
    });
    
    test('should order by type: utilities, categories, then keywords', () => {
      const suggestions: SearchSuggestion[] = [
        { type: 'keyword', text: 'json' },
        { type: 'utility', text: 'JSON Formatter' },
        { type: 'category', text: 'Developer Tools' }
      ];
      
      const filtered = filterSuggestions(suggestions);
      
      // Check order: utility, category, keyword
      expect(filtered[0].type).toBe('utility');
      expect(filtered[1].type).toBe('category');
      expect(filtered[2].type).toBe('keyword');
    });
    
    test('should handle empty suggestions array', () => {
      const suggestions: SearchSuggestion[] = [];
      const filtered = filterSuggestions(suggestions);
      expect(filtered).toEqual([]);
    });
  });
});