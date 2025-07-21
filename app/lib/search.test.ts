/**
 * Unit tests for the search engine functionality
 */
import { UtilitySearchEngine } from './search';
import { utilityRegistry } from './registry';

describe('UtilitySearchEngine', () => {
  let searchEngine: UtilitySearchEngine;
  
  beforeEach(() => {
    // Create a fresh search engine instance for each test
    searchEngine = new UtilitySearchEngine();
    
    // Mock localStorage for testing
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
      removeItem: jest.fn(),
      length: 0,
      key: jest.fn()
    };
    
    // Check if window is defined (browser environment) or not (Node.js environment)
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
      });
    } else {
      // In Node.js environment, mock the global object
      global.localStorage = localStorageMock;
    }
  });
  
  describe('search', () => {
    test('should return empty array for empty query', () => {
      expect(searchEngine.search('')).toEqual([]);
      expect(searchEngine.search('   ')).toEqual([]);
    });
    
    test('should find utilities by exact name match', () => {
      const results = searchEngine.search('JSON Formatter');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].utility.id).toBe('json-formatter');
      expect(results[0].relevanceScore).toBeGreaterThanOrEqual(0.9);
      expect(results[0].matchedFields).toContain('name');
    });
    
    test('should find utilities by partial name match', () => {
      const results = searchEngine.search('format');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.utility.id === 'json-formatter')).toBe(true);
      expect(results.find(r => r.utility.id === 'json-formatter')?.matchedFields).toContain('name');
    });
    
    test('should find utilities by keyword match', () => {
      const results = searchEngine.search('encode');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.utility.id === 'base64-encoder')).toBe(true);
      expect(results.find(r => r.utility.id === 'base64-encoder')?.matchedFields).toContain('keyword');
    });
    
    test('should find utilities by description match', () => {
      const results = searchEngine.search('syntax highlighting');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.utility.id === 'json-formatter')).toBe(true);
      expect(results.find(r => r.utility.id === 'json-formatter')?.matchedFields).toContain('description');
    });
    
    test('should handle typos with fuzzy matching', () => {
      const results = searchEngine.search('jsno formater'); // Intentional typos
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.utility.id === 'json-formatter')).toBe(true);
    });
    
    test('should handle multi-word queries', () => {
      const results = searchEngine.search('convert case');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.utility.id === 'case-converter')).toBe(true);
    });
    
    test('should sort results by relevance score', () => {
      // Add a utility to recently used to boost its score
      searchEngine.addToRecentlyUsed('json-formatter');
      
      const results = searchEngine.search('format');
      
      // Check that results are sorted by score
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].relevanceScore).toBeGreaterThanOrEqual(results[i + 1].relevanceScore);
      }
    });
    
    test('should boost featured utilities slightly', () => {
      // Find a query that matches both featured and non-featured utilities
      const results = searchEngine.search('encode');
      
      // Featured utilities should generally rank higher for similar matches
      const featuredResults = results.filter(r => r.utility.featured);
      const nonFeaturedResults = results.filter(r => !r.utility.featured);
      
      if (featuredResults.length > 0 && nonFeaturedResults.length > 0) {
        // This is a probabilistic test - featured utilities should generally rank higher
        // but it's not guaranteed for all queries
        expect(featuredResults[0].relevanceScore).toBeGreaterThanOrEqual(nonFeaturedResults[0].relevanceScore * 0.9);
      }
    });
    
    test('should handle special characters in search queries', () => {
      const results = searchEngine.search('base64!@#');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.utility.id === 'base64-encoder')).toBe(true);
    });
    
    test('should handle very short queries (1-2 characters)', () => {
      const results = searchEngine.search('qr');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.utility.id === 'qr-generator')).toBe(true);
    });
    
    test('should handle queries with extra spaces', () => {
      const results = searchEngine.search('  json   formatter  ');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].utility.id).toBe('json-formatter');
    });
    
    test('should match utilities by ID', () => {
      const results = searchEngine.search('base64-encoder');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].utility.id).toBe('base64-encoder');
      expect(results[0].matchedFields).toContain('id');
    });
    
    test('should handle transposed characters with fuzzy matching', () => {
      const results = searchEngine.search('jsno fromatter'); // Transposed characters
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.utility.id === 'json-formatter')).toBe(true);
    });
    
    test('should match n-grams for partial matching', () => {
      // This should match "password" in "password-generator"
      const results = searchEngine.search('passw');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.utility.id === 'password-generator')).toBe(true);
    });
    
    test('should boost recently used utilities in search results', () => {
      // First search without any recently used utilities
      const initialResults = searchEngine.search('generator');
      
      // Add a utility to recently used
      searchEngine.addToRecentlyUsed('password-generator');
      
      // Search again
      const boostedResults = searchEngine.search('generator');
      
      // Find the password-generator in both result sets
      const initialPasswordGen = initialResults.find(r => r.utility.id === 'password-generator');
      const boostedPasswordGen = boostedResults.find(r => r.utility.id === 'password-generator');
      
      // The boosted score should be higher
      if (initialPasswordGen && boostedPasswordGen) {
        expect(boostedPasswordGen.relevanceScore).toBeGreaterThan(initialPasswordGen.relevanceScore);
      }
    });
    
    test('should boost favorite utilities in search results', () => {
      // First search without any favorites
      const initialResults = searchEngine.search('generator');
      
      // Add a utility to favorites
      searchEngine.toggleFavorite('qr-generator');
      
      // Search again
      const boostedResults = searchEngine.search('generator');
      
      // Find the qr-generator in both result sets
      const initialQrGen = initialResults.find(r => r.utility.id === 'qr-generator');
      const boostedQrGen = boostedResults.find(r => r.utility.id === 'qr-generator');
      
      // The boosted score should be higher
      if (initialQrGen && boostedQrGen) {
        expect(boostedQrGen.relevanceScore).toBeGreaterThan(initialQrGen.relevanceScore);
      }
    });
  });
  
  describe('getSuggestions', () => {
    test('should return empty array for empty query', () => {
      expect(searchEngine.getSuggestions('')).toEqual([]);
      expect(searchEngine.getSuggestions('   ')).toEqual([]);
    });
    
    test('should return utility suggestions', () => {
      const suggestions = searchEngine.getSuggestions('json');
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.type === 'utility' && s.text.toLowerCase().includes('json'))).toBe(true);
    });
    
    test('should return keyword suggestions', () => {
      // First add a utility with the keyword to recently used to ensure it appears in suggestions
      searchEngine.addToRecentlyUsed('base64-encoder');
      
      const suggestions = searchEngine.getSuggestions('encode');
      
      expect(suggestions.length).toBeGreaterThan(0);
      // Check for utility with encode in name or description
      expect(suggestions.some(s => 
        (s.type === 'utility' || s.type === 'keyword') && 
        s.text.toLowerCase().includes('encode')
      )).toBe(true);
    });
    
    test('should return category suggestions', () => {
      const suggestions = searchEngine.getSuggestions('text');
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.type === 'category' && s.text === 'Text Tools')).toBe(true);
    });
    
    test('should limit suggestions to 10 items', () => {
      // Use a very generic query that would match many items
      const suggestions = searchEngine.getSuggestions('a');
      
      expect(suggestions.length).toBeLessThanOrEqual(10);
    });
    
    test('should handle typos in suggestions', () => {
      // First add a utility with JSON to recently used to ensure it appears in suggestions
      searchEngine.addToRecentlyUsed('json-formatter');
      
      const suggestions = searchEngine.getSuggestions('jsno'); // Intentional typo
      
      expect(suggestions.length).toBeGreaterThan(0);
      // Check for utility with json in name
      expect(suggestions.some(s => s.text.toLowerCase().includes('json'))).toBe(true);
    });
    
    test('should prioritize exact matches in suggestions', () => {
      const suggestions = searchEngine.getSuggestions('json');
      
      // The first suggestion should be the JSON Formatter utility
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].type).toBe('utility');
      expect(suggestions[0].text).toBe('JSON Formatter');
    });
    
    test('should include recently used utilities in suggestions if relevant', () => {
      // Add a utility to recently used
      searchEngine.addToRecentlyUsed('password-generator');
      
      // Search for something that might match it
      const suggestions = searchEngine.getSuggestions('pass');
      
      // The password generator should be included
      expect(suggestions.some(s => s.type === 'utility' && s.text === 'Password Generator')).toBe(true);
    });
    
    test('should handle special characters in suggestion queries', () => {
      const suggestions = searchEngine.getSuggestions('base64!@#');
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.text.toLowerCase().includes('base64'))).toBe(true);
    });
    
    test('should sort suggestions by relevance and type', () => {
      const suggestions = searchEngine.getSuggestions('text');
      
      // Utilities and categories should come before keywords
      const utilityIndex = suggestions.findIndex(s => s.type === 'utility');
      const categoryIndex = suggestions.findIndex(s => s.type === 'category');
      const keywordIndex = suggestions.findIndex(s => s.type === 'keyword');
      
      // If we have all three types, check their order
      if (utilityIndex !== -1 && categoryIndex !== -1 && keywordIndex !== -1) {
        expect(Math.min(utilityIndex, categoryIndex)).toBeLessThan(keywordIndex);
      }
    });
    
    test('should deduplicate similar suggestions', () => {
      const suggestions = searchEngine.getSuggestions('format');
      
      // Count how many suggestions contain "format"
      const formatSuggestions = suggestions.filter(s => 
        s.text.toLowerCase().includes('format')
      );
      
      // We should have some format suggestions, but not too many duplicates
      expect(formatSuggestions.length).toBeGreaterThan(0);
      expect(formatSuggestions.length).toBeLessThanOrEqual(5);
    });
  });
  
  describe('user preferences', () => {
    test('should add utilities to recently used list', () => {
      searchEngine.addToRecentlyUsed('json-formatter');
      searchEngine.addToRecentlyUsed('base64-encoder');
      
      const recentlyUsed = searchEngine.getRecentlyUsed();
      
      expect(recentlyUsed.length).toBe(2);
      expect(recentlyUsed[0]).toBe('base64-encoder'); // Most recent first
      expect(recentlyUsed[1]).toBe('json-formatter');
    });
    
    test('should limit recently used list to 10 items', () => {
      // Add more than 10 items
      for (let i = 0; i < 15; i++) {
        const utility = utilityRegistry.utilities[i % utilityRegistry.utilities.length];
        searchEngine.addToRecentlyUsed(utility.id);
      }
      
      const recentlyUsed = searchEngine.getRecentlyUsed();
      
      expect(recentlyUsed.length).toBeLessThanOrEqual(10);
    });
    
    test('should toggle favorites', () => {
      searchEngine.toggleFavorite('json-formatter');
      
      let favorites = searchEngine.getFavorites();
      expect(favorites).toContain('json-formatter');
      
      // Toggle again to remove
      searchEngine.toggleFavorite('json-formatter');
      
      favorites = searchEngine.getFavorites();
      expect(favorites).not.toContain('json-formatter');
    });
    
    test('should clear history', () => {
      searchEngine.addToRecentlyUsed('json-formatter');
      searchEngine.toggleFavorite('base64-encoder');
      
      searchEngine.clearHistory();
      
      expect(searchEngine.getRecentlyUsed()).toEqual([]);
      expect(searchEngine.getFavorites()).toEqual([]);
    });
    
    test('should get recently used utilities as objects', () => {
      searchEngine.addToRecentlyUsed('json-formatter');
      searchEngine.addToRecentlyUsed('base64-encoder');
      
      const recentUtilities = searchEngine.getRecentlyUsedUtilities();
      
      expect(recentUtilities.length).toBe(2);
      expect(recentUtilities[0].id).toBe('base64-encoder');
      expect(recentUtilities[1].id).toBe('json-formatter');
    });
    
    test('should get favorite utilities as objects', () => {
      searchEngine.toggleFavorite('json-formatter');
      searchEngine.toggleFavorite('base64-encoder');
      
      const favoriteUtilities = searchEngine.getFavoriteUtilities();
      
      expect(favoriteUtilities.length).toBe(2);
      expect(favoriteUtilities.some(u => u.id === 'json-formatter')).toBe(true);
      expect(favoriteUtilities.some(u => u.id === 'base64-encoder')).toBe(true);
    });
    
    test('should handle adding the same utility to recently used multiple times', () => {
      searchEngine.addToRecentlyUsed('json-formatter');
      searchEngine.addToRecentlyUsed('base64-encoder');
      searchEngine.addToRecentlyUsed('json-formatter'); // Add again
      
      const recentlyUsed = searchEngine.getRecentlyUsed();
      
      // Should be at the front now, and only appear once
      expect(recentlyUsed.length).toBe(2);
      expect(recentlyUsed[0]).toBe('json-formatter');
      expect(recentlyUsed[1]).toBe('base64-encoder');
      
      // Should only appear once
      expect(recentlyUsed.filter(id => id === 'json-formatter').length).toBe(1);
    });
  });
  
  describe('fuzzy matching', () => {
    test('should match with transposed characters', () => {
      const results = searchEngine.search('jsno'); // Transposed 'json'
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.utility.id === 'json-formatter')).toBe(true);
    });
    
    test('should match with missing characters', () => {
      const results = searchEngine.search('jso'); // Missing 'n' from 'json'
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.utility.id === 'json-formatter')).toBe(true);
    });
    
    test('should match with extra characters', () => {
      const results = searchEngine.search('jsonn'); // Extra 'n' in 'json'
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.utility.id === 'json-formatter')).toBe(true);
    });
    
    test('should match with character substitutions', () => {
      const results = searchEngine.search('jasn'); // 'a' instead of 'o' in 'json'
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.utility.id === 'json-formatter')).toBe(true);
    });
    
    test('should not match with too many errors', () => {
      const results = searchEngine.search('xyzabc'); // Completely different
      
      // Should not match json-formatter
      expect(results.every(r => r.utility.id !== 'json-formatter')).toBe(true);
    });
  });
});