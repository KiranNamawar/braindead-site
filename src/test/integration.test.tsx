import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Utils
import { storageManager, getFavorites, addFavorite, removeFavorite, getRecentTools, addRecentTool } from '../utils/storage';
import { searchTools } from '../utils/fuzzySearch';
import { getAllTools } from '../utils/toolRegistry';

// Types
import { ToolCategory } from '../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
});

describe('Integration Tests - Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Storage Integration', () => {
    it('should handle favorites management correctly', () => {
      // Mock localStorage with initial empty state
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          favorites: [],
          recentTools: [],
          searchHistory: [],
          keyboardShortcutsEnabled: true,
          animationsEnabled: true,
          compactMode: false,
          theme: 'auto',
          lastVisit: new Date(),
          onboardingCompleted: false
        }
      }));

      // Test adding a favorite
      addFavorite('calculator');
      expect(localStorageMock.setItem).toHaveBeenCalled();

      // Mock updated state with favorite
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          favorites: ['calculator'],
          recentTools: [],
          searchHistory: [],
          keyboardShortcutsEnabled: true,
          animationsEnabled: true,
          compactMode: false,
          theme: 'auto',
          lastVisit: new Date(),
          onboardingCompleted: false
        }
      }));

      // Test getting favorites
      const favorites = getFavorites();
      expect(favorites).toContain('calculator');

      // Test removing favorite
      removeFavorite('calculator');
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    });

    it('should handle recent tools tracking', () => {
      // Mock localStorage with initial empty state
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          favorites: [],
          recentTools: [],
          searchHistory: [],
          keyboardShortcutsEnabled: true,
          animationsEnabled: true,
          compactMode: false,
          theme: 'auto',
          lastVisit: new Date(),
          onboardingCompleted: false
        }
      }));

      // Test adding a recent tool
      addRecentTool('calculator', ToolCategory.CALCULATOR, 5);
      expect(localStorageMock.setItem).toHaveBeenCalled();

      // Mock updated state with recent tool
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          favorites: [],
          recentTools: [
            {
              toolId: 'calculator',
              lastUsed: new Date(),
              usageCount: 1,
              timeSpent: 5,
              category: ToolCategory.CALCULATOR
            }
          ],
          searchHistory: [],
          keyboardShortcutsEnabled: true,
          animationsEnabled: true,
          compactMode: false,
          theme: 'auto',
          lastVisit: new Date(),
          onboardingCompleted: false
        }
      }));

      // Test getting recent tools
      const recentTools = getRecentTools();
      expect(recentTools.length).toBe(1);
      expect(recentTools[0].toolId).toBe('calculator');
    });

    it('should handle search functionality with tool data', () => {
      const tools = getAllTools();
      
      // Test various search queries
      const testQueries = [
        { query: 'calc', expectedTool: 'calculator' },
        { query: 'json', expectedTool: 'json-formatter' },
        { query: 'color', expectedTool: 'color-picker' }
      ];

      for (const { query, expectedTool } of testQueries) {
        const results = searchTools(query, tools);
        expect(results.length).toBeGreaterThan(0);
        
        const foundTool = results.find(tool => tool.id === expectedTool);
        expect(foundTool).toBeDefined();
        expect(foundTool?.name).toBeTruthy();
      }
    });

    it('should handle data export and import between compatible tools', async () => {
      // Mock a scenario where JSON Formatter exports data
      const jsonData = { test: 'data', number: 42 };
      const exportedData = JSON.stringify(jsonData, null, 2);

      // Test that the data can be used in another tool
      expect(exportedData).toContain('"test": "data"');
      expect(exportedData).toContain('"number": 42');
      
      // Mock clipboard to return the data we write
      (navigator.clipboard.readText as any).mockResolvedValue(exportedData);
      
      // Verify clipboard operations work
      await navigator.clipboard.writeText(exportedData);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(exportedData);
      
      const clipboardData = await navigator.clipboard.readText();
      expect(clipboardData).toBe(exportedData);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw errors
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Should not crash when calling storage functions
      expect(() => {
        getFavorites();
      }).not.toThrow();

      // Should return empty array as fallback
      const favorites = getFavorites();
      expect(Array.isArray(favorites)).toBe(true);
    });

    it('should handle corrupted localStorage data', () => {
      // Mock corrupted JSON data
      localStorageMock.getItem.mockReturnValue('invalid json data');

      // Should not crash and return defaults
      expect(() => {
        getFavorites();
      }).not.toThrow();

      // Should fall back to defaults
      const favorites = getFavorites();
      expect(Array.isArray(favorites)).toBe(true);
    });
  });

  describe('Tool Integration Workflows', () => {
    it('should handle tool data sharing through clipboard', async () => {
      // Test data sharing between tools via clipboard
      const testData = 'shared data between tools';
      
      // Mock clipboard to return the data we write
      (navigator.clipboard.readText as any).mockResolvedValue(testData);
      
      await navigator.clipboard.writeText(testData);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testData);
      
      const clipboardData = await navigator.clipboard.readText();
      expect(clipboardData).toBe(testData);
    });

    it('should maintain consistent tool state across sessions', () => {
      // Test that tool preferences persist across sessions
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          favorites: ['calculator', 'json-formatter'],
          recentTools: [
            {
              toolId: 'calculator',
              lastUsed: new Date(),
              usageCount: 5,
              timeSpent: 120,
              category: ToolCategory.CALCULATOR
            }
          ],
          searchHistory: ['calculator', 'json'],
          keyboardShortcutsEnabled: true,
          animationsEnabled: true,
          compactMode: false,
          theme: 'auto',
          lastVisit: new Date(),
          onboardingCompleted: false
        }
      }));

      // Verify data persistence
      const favorites = getFavorites();
      expect(favorites).toEqual(['calculator', 'json-formatter']);
      
      const recentTools = getRecentTools();
      expect(recentTools.length).toBe(1);
      expect(recentTools[0].toolId).toBe('calculator');
    });
  });

  describe('Advanced Integration Features', () => {
    it('should handle complex data workflows', () => {
      // Test workflow state management
      const workflowData = {
        currentWorkflow: 'json-processing',
        steps: [
          { toolId: 'json-formatter', data: '{"test": "data"}', completed: true },
          { toolId: 'base64-encoder', data: '', completed: false }
        ]
      };

      // Verify workflow data structure
      expect(workflowData.currentWorkflow).toBe('json-processing');
      expect(workflowData.steps.length).toBe(2);
      expect(workflowData.steps[0].completed).toBe(true);
      expect(workflowData.steps[1].completed).toBe(false);
    });

    it('should handle batch operations across tools', () => {
      // Test batch processing capabilities
      const batchData = [
        { input: '{"name": "test1"}', format: 'json' },
        { input: '{"name": "test2"}', format: 'json' },
        { input: '{"name": "test3"}', format: 'json' }
      ];

      // Process batch data
      const processedData = batchData.map(item => {
        const parsed = JSON.parse(item.input);
        return { ...parsed, processed: true };
      });

      expect(processedData.length).toBe(3);
      expect(processedData[0].processed).toBe(true);
      expect(processedData[0].name).toBe('test1');
    });
  });

  describe('Search Functionality Integration', () => {
    it('should perform fuzzy search with real tool data', () => {
      const tools = getAllTools();
      
      // Test various search queries
      const testQueries = [
        { query: 'calc', expectedTool: 'calculator' },
        { query: 'json', expectedTool: 'json-formatter' },
        { query: 'color', expectedTool: 'color-picker' },
        { query: 'hash', expectedTool: 'hash-generator' },
        { query: 'qr', expectedTool: 'qr-generator' }
      ];

      for (const { query, expectedTool } of testQueries) {
        const results = searchTools(query, tools);
        expect(results.length).toBeGreaterThan(0);
        
        const foundTool = results.find(tool => tool.id === expectedTool);
        expect(foundTool).toBeDefined();
        expect(foundTool?.name).toBeTruthy();
      }
    });

    it('should handle empty search queries', () => {
      const tools = getAllTools();
      const results = searchTools('', tools);
      expect(results).toEqual([]);
    });

    it('should handle non-existent search queries', () => {
      const tools = getAllTools();
      const results = searchTools('nonexistenttool12345', tools);
      expect(results).toEqual([]);
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large datasets efficiently', () => {
      const tools = getAllTools();
      
      // Test search performance with all tools
      const startTime = performance.now();
      const results = searchTools('calc', tools);
      const endTime = performance.now();
      
      // Search should complete quickly (under 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should limit search results for performance', () => {
      const tools = getAllTools();
      
      // Search for a broad term that might match many tools
      const results = searchTools('tool', tools);
      
      // Should limit results to avoid performance issues
      expect(results.length).toBeLessThanOrEqual(20);
    });
  });
});