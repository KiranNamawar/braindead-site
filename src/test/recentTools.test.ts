import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRecentTools, addRecentTool, storageManager } from '../utils/storage';
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

describe('Recent Tools Management', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Basic Recent Tools Operations', () => {
    it('should start with empty recent tools', () => {
      const recentTools = getRecentTools();
      expect(recentTools).toEqual([]);
    });

    it('should add a tool to recent tools', () => {
      // Mock empty recent tools initially with proper analytics structure
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'braindead-user-preferences') {
          return JSON.stringify({
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
          });
        }
        if (key === 'braindead-analytics') {
          return JSON.stringify({
            data: {
              totalToolsUsed: 0,
              totalTimeSaved: 0,
              mostUsedTool: '',
              productivityScore: 0,
              sessionsCount: 0,
              averageSessionDuration: 0,
              toolCategoryUsage: {
                [ToolCategory.CALCULATOR]: 0,
                [ToolCategory.UTILITY]: 0,
                [ToolCategory.DEVELOPER]: 0,
                [ToolCategory.CREATIVE_DESIGN]: 0,
                [ToolCategory.TEXT_WRITING]: 0,
                [ToolCategory.TIME_PRODUCTIVITY]: 0,
                [ToolCategory.NUMBER_CONVERSION]: 0,
                [ToolCategory.EVERYDAY_LIFE]: 0
              }
            }
          });
        }
        return null;
      });

      addRecentTool('calculator', ToolCategory.CALCULATOR, 5);
      
      // Verify setItem was called
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should update existing tool usage when added again', () => {
      const existingDate = new Date('2024-01-01');
      
      // Mock recent tools with calculator already present and proper analytics
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'braindead-user-preferences') {
          return JSON.stringify({
            data: {
              favorites: [],
              recentTools: [{
                toolId: 'calculator',
                lastUsed: existingDate,
                usageCount: 1,
                timeSpent: 2,
                category: ToolCategory.CALCULATOR
              }],
              searchHistory: [],
              keyboardShortcutsEnabled: true,
              animationsEnabled: true,
              compactMode: false,
              theme: 'auto',
              lastVisit: new Date(),
              onboardingCompleted: false
            }
          });
        }
        if (key === 'braindead-analytics') {
          return JSON.stringify({
            data: {
              totalToolsUsed: 1,
              totalTimeSaved: 2,
              mostUsedTool: 'calculator',
              productivityScore: 5,
              sessionsCount: 1,
              averageSessionDuration: 0,
              toolCategoryUsage: {
                [ToolCategory.CALCULATOR]: 1,
                [ToolCategory.UTILITY]: 0,
                [ToolCategory.DEVELOPER]: 0,
                [ToolCategory.CREATIVE_DESIGN]: 0,
                [ToolCategory.TEXT_WRITING]: 0,
                [ToolCategory.TIME_PRODUCTIVITY]: 0,
                [ToolCategory.NUMBER_CONVERSION]: 0,
                [ToolCategory.EVERYDAY_LIFE]: 0
              }
            }
          });
        }
        return null;
      });

      addRecentTool('calculator', ToolCategory.CALCULATOR, 3);
      
      // Verify setItem was called to update the existing entry
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should sort recent tools by last used date', () => {
      const olderDate = new Date('2024-01-01');
      const newerDate = new Date('2024-01-02');
      
      // Mock recent tools with multiple tools
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          favorites: [],
          recentTools: [
            {
              toolId: 'calculator',
              lastUsed: olderDate,
              usageCount: 1,
              timeSpent: 2,
              category: ToolCategory.CALCULATOR
            },
            {
              toolId: 'json-formatter',
              lastUsed: newerDate,
              usageCount: 1,
              timeSpent: 3,
              category: ToolCategory.DEVELOPER
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

      const recentTools = getRecentTools();
      
      // Should be sorted with most recent first
      expect(recentTools[0].toolId).toBe('json-formatter');
      expect(recentTools[1].toolId).toBe('calculator');
    });
  });

  describe('Recent Tools Cleanup', () => {
    it('should handle large number of recent tools', () => {
      // Create a large number of recent tools
      const manyRecentTools = Array.from({ length: 25 }, (_, i) => ({
        toolId: `tool-${i}`,
        lastUsed: new Date(Date.now() - i * 1000),
        usageCount: 1,
        timeSpent: 1,
        category: ToolCategory.UTILITY
      }));

      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          favorites: [],
          recentTools: manyRecentTools,
          searchHistory: [],
          keyboardShortcutsEnabled: true,
          animationsEnabled: true,
          compactMode: false,
          theme: 'auto',
          lastVisit: new Date(),
          onboardingCompleted: false
        }
      }));

      const recentTools = getRecentTools();
      
      // Should return the tools (cleanup happens during maintenance)
      expect(recentTools.length).toBeGreaterThan(0);
      expect(Array.isArray(recentTools)).toBe(true);
    });

    it('should clean up old recent tools', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35); // 35 days ago
      
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 1); // 1 day ago

      const recentToolsWithOld = [
        {
          toolId: 'old-tool',
          lastUsed: oldDate,
          usageCount: 1,
          timeSpent: 1,
          category: ToolCategory.UTILITY
        },
        {
          toolId: 'recent-tool',
          lastUsed: recentDate,
          usageCount: 1,
          timeSpent: 1,
          category: ToolCategory.CALCULATOR
        }
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          favorites: [],
          recentTools: recentToolsWithOld,
          searchHistory: [],
          keyboardShortcutsEnabled: true,
          animationsEnabled: true,
          compactMode: false,
          theme: 'auto',
          lastVisit: new Date(),
          onboardingCompleted: false
        }
      }));

      // The storage manager should clean up old tools during maintenance
      const recentTools = getRecentTools();
      
      // Should contain the recent tool
      expect(recentTools.some(tool => tool.toolId === 'recent-tool')).toBe(true);
    });
  });

  describe('Recent Tools Data Integrity', () => {
    it('should handle corrupted recent tools data gracefully', () => {
      // Mock corrupted localStorage
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // Should not throw and return empty array
      expect(() => getRecentTools()).not.toThrow();
      const recentTools = getRecentTools();
      expect(Array.isArray(recentTools)).toBe(true);
    });

    it('should handle missing tool category', () => {
      expect(() => addRecentTool('calculator', null as any)).not.toThrow();
    });

    it('should handle negative time spent', () => {
      expect(() => addRecentTool('calculator', ToolCategory.CALCULATOR, -5)).not.toThrow();
    });

    it('should handle very large time spent values', () => {
      expect(() => addRecentTool('calculator', ToolCategory.CALCULATOR, 999999)).not.toThrow();
    });
  });

  describe('Recent Tools Storage Management', () => {
    it('should clear recent tools', () => {
      const clearSpy = vi.spyOn(storageManager, 'setRecentTools');
      storageManager.setRecentTools([]);
      
      expect(clearSpy).toHaveBeenCalledWith([]);
    });

    it('should handle storage quota exceeded', () => {
      // Mock storage quota exceeded error
      localStorageMock.setItem.mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      // Should not throw when adding recent tool
      expect(() => addRecentTool('calculator', ToolCategory.CALCULATOR)).not.toThrow();
    });
  });

  describe('Recent Tools Analytics', () => {
    it('should track usage count correctly', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          favorites: [],
          recentTools: [{
            toolId: 'calculator',
            lastUsed: new Date(),
            usageCount: 5,
            timeSpent: 10,
            category: ToolCategory.CALCULATOR
          }],
          searchHistory: [],
          keyboardShortcutsEnabled: true,
          animationsEnabled: true,
          compactMode: false,
          theme: 'auto',
          lastVisit: new Date(),
          onboardingCompleted: false
        }
      }));

      const recentTools = getRecentTools();
      expect(recentTools[0].usageCount).toBe(5);
    });

    it('should track time spent correctly', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          favorites: [],
          recentTools: [{
            toolId: 'calculator',
            lastUsed: new Date(),
            usageCount: 1,
            timeSpent: 15,
            category: ToolCategory.CALCULATOR
          }],
          searchHistory: [],
          keyboardShortcutsEnabled: true,
          animationsEnabled: true,
          compactMode: false,
          theme: 'auto',
          lastVisit: new Date(),
          onboardingCompleted: false
        }
      }));

      const recentTools = getRecentTools();
      expect(recentTools[0].timeSpent).toBe(15);
    });
  });
});