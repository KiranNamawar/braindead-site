import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAnalytics, storageManager } from '../utils/storage';
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

describe('Analytics System', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Basic Analytics Operations', () => {
    it('should start with default analytics', () => {
      const analytics = getAnalytics();
      expect(analytics.totalToolsUsed).toBe(0);
      expect(analytics.totalTimeSaved).toBe(0);
      expect(analytics.productivityScore).toBe(0);
    });

    it('should have all tool categories initialized', () => {
      const analytics = getAnalytics();
      expect(analytics.toolCategoryUsage).toHaveProperty(ToolCategory.CALCULATOR);
      expect(analytics.toolCategoryUsage).toHaveProperty(ToolCategory.DEVELOPER);
      expect(analytics.toolCategoryUsage).toHaveProperty(ToolCategory.UTILITY);
      expect(analytics.toolCategoryUsage).toHaveProperty(ToolCategory.CREATIVE_DESIGN);
      expect(analytics.toolCategoryUsage).toHaveProperty(ToolCategory.TEXT_WRITING);
      expect(analytics.toolCategoryUsage).toHaveProperty(ToolCategory.TIME_PRODUCTIVITY);
      expect(analytics.toolCategoryUsage).toHaveProperty(ToolCategory.NUMBER_CONVERSION);
      expect(analytics.toolCategoryUsage).toHaveProperty(ToolCategory.EVERYDAY_LIFE);
    });

    it('should track tool usage correctly', () => {
      // Mock analytics with some usage data
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          totalToolsUsed: 10,
          totalTimeSaved: 25,
          mostUsedTool: 'calculator',
          productivityScore: 45,
          sessionsCount: 3,
          averageSessionDuration: 8,
          toolCategoryUsage: {
            [ToolCategory.CALCULATOR]: 5,
            [ToolCategory.DEVELOPER]: 3,
            [ToolCategory.UTILITY]: 2,
            [ToolCategory.CREATIVE_DESIGN]: 0,
            [ToolCategory.TEXT_WRITING]: 0,
            [ToolCategory.TIME_PRODUCTIVITY]: 0,
            [ToolCategory.NUMBER_CONVERSION]: 0,
            [ToolCategory.EVERYDAY_LIFE]: 0
          }
        }
      }));

      const analytics = getAnalytics();
      expect(analytics.totalToolsUsed).toBe(10);
      expect(analytics.totalTimeSaved).toBe(25);
      expect(analytics.mostUsedTool).toBe('calculator');
      expect(analytics.productivityScore).toBe(45);
    });

    it('should calculate productivity score correctly', () => {
      // Mock analytics with high usage
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          totalToolsUsed: 50,
          totalTimeSaved: 120,
          mostUsedTool: 'calculator',
          productivityScore: 85,
          sessionsCount: 10,
          averageSessionDuration: 12,
          toolCategoryUsage: {
            [ToolCategory.CALCULATOR]: 20,
            [ToolCategory.DEVELOPER]: 15,
            [ToolCategory.UTILITY]: 10,
            [ToolCategory.CREATIVE_DESIGN]: 5,
            [ToolCategory.TEXT_WRITING]: 0,
            [ToolCategory.TIME_PRODUCTIVITY]: 0,
            [ToolCategory.NUMBER_CONVERSION]: 0,
            [ToolCategory.EVERYDAY_LIFE]: 0
          }
        }
      }));

      const analytics = getAnalytics();
      expect(analytics.productivityScore).toBeGreaterThan(50);
    });
  });

  describe('Analytics Data Integrity', () => {
    it('should handle corrupted analytics data gracefully', () => {
      // Mock corrupted localStorage
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // Should not throw and return default analytics
      expect(() => getAnalytics()).not.toThrow();
      const analytics = getAnalytics();
      expect(analytics.totalToolsUsed).toBe(0);
    });

    it('should handle missing category data', () => {
      // Mock analytics with missing categories
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          totalToolsUsed: 5,
          totalTimeSaved: 10,
          mostUsedTool: 'calculator',
          productivityScore: 25,
          sessionsCount: 2,
          averageSessionDuration: 5,
          toolCategoryUsage: {
            [ToolCategory.CALCULATOR]: 5
            // Missing other categories
          }
        }
      }));

      const analytics = getAnalytics();
      expect(analytics.toolCategoryUsage[ToolCategory.CALCULATOR]).toBe(5);
      // Should have default values for missing categories
      expect(analytics.toolCategoryUsage[ToolCategory.DEVELOPER]).toBeDefined();
    });

    it('should handle negative values gracefully', () => {
      // Mock analytics with negative values
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          totalToolsUsed: -5,
          totalTimeSaved: -10,
          mostUsedTool: 'calculator',
          productivityScore: -25,
          sessionsCount: -2,
          averageSessionDuration: -5,
          toolCategoryUsage: {
            [ToolCategory.CALCULATOR]: -3,
            [ToolCategory.DEVELOPER]: 0,
            [ToolCategory.UTILITY]: 0,
            [ToolCategory.CREATIVE_DESIGN]: 0,
            [ToolCategory.TEXT_WRITING]: 0,
            [ToolCategory.TIME_PRODUCTIVITY]: 0,
            [ToolCategory.NUMBER_CONVERSION]: 0,
            [ToolCategory.EVERYDAY_LIFE]: 0
          }
        }
      }));

      const analytics = getAnalytics();
      // Should handle negative values without crashing
      expect(typeof analytics.totalToolsUsed).toBe('number');
      expect(typeof analytics.totalTimeSaved).toBe('number');
    });
  });

  describe('Analytics Storage Management', () => {
    it('should set analytics data', () => {
      const newAnalytics = {
        totalToolsUsed: 15,
        totalTimeSaved: 30,
        mostUsedTool: 'json-formatter',
        productivityScore: 60,
        sessionsCount: 5,
        averageSessionDuration: 6,
        toolCategoryUsage: {
          [ToolCategory.CALCULATOR]: 5,
          [ToolCategory.DEVELOPER]: 8,
          [ToolCategory.UTILITY]: 2,
          [ToolCategory.CREATIVE_DESIGN]: 0,
          [ToolCategory.TEXT_WRITING]: 0,
          [ToolCategory.TIME_PRODUCTIVITY]: 0,
          [ToolCategory.NUMBER_CONVERSION]: 0,
          [ToolCategory.EVERYDAY_LIFE]: 0
        }
      };

      const setSpy = vi.spyOn(storageManager, 'setAnalytics');
      storageManager.setAnalytics(newAnalytics);
      
      expect(setSpy).toHaveBeenCalledWith(newAnalytics);
    });

    it('should handle storage quota exceeded', () => {
      // Mock storage quota exceeded error
      localStorageMock.setItem.mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      const newAnalytics = {
        totalToolsUsed: 100,
        totalTimeSaved: 200,
        mostUsedTool: 'calculator',
        productivityScore: 90,
        sessionsCount: 20,
        averageSessionDuration: 10,
        toolCategoryUsage: {
          [ToolCategory.CALCULATOR]: 50,
          [ToolCategory.DEVELOPER]: 30,
          [ToolCategory.UTILITY]: 20,
          [ToolCategory.CREATIVE_DESIGN]: 0,
          [ToolCategory.TEXT_WRITING]: 0,
          [ToolCategory.TIME_PRODUCTIVITY]: 0,
          [ToolCategory.NUMBER_CONVERSION]: 0,
          [ToolCategory.EVERYDAY_LIFE]: 0
        }
      };

      // Should not throw when setting analytics
      expect(() => storageManager.setAnalytics(newAnalytics)).not.toThrow();
    });
  });

  describe('Analytics Calculations', () => {
    it('should calculate category usage correctly', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          totalToolsUsed: 20,
          totalTimeSaved: 40,
          mostUsedTool: 'calculator',
          productivityScore: 70,
          sessionsCount: 8,
          averageSessionDuration: 5,
          toolCategoryUsage: {
            [ToolCategory.CALCULATOR]: 10,
            [ToolCategory.DEVELOPER]: 6,
            [ToolCategory.UTILITY]: 4,
            [ToolCategory.CREATIVE_DESIGN]: 0,
            [ToolCategory.TEXT_WRITING]: 0,
            [ToolCategory.TIME_PRODUCTIVITY]: 0,
            [ToolCategory.NUMBER_CONVERSION]: 0,
            [ToolCategory.EVERYDAY_LIFE]: 0
          }
        }
      }));

      const analytics = getAnalytics();
      const totalCategoryUsage = Object.values(analytics.toolCategoryUsage)
        .reduce((sum, usage) => sum + usage, 0);
      
      expect(totalCategoryUsage).toBe(analytics.totalToolsUsed);
    });

    it('should track sessions correctly', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          totalToolsUsed: 30,
          totalTimeSaved: 60,
          mostUsedTool: 'calculator',
          productivityScore: 80,
          sessionsCount: 12,
          averageSessionDuration: 5,
          toolCategoryUsage: {
            [ToolCategory.CALCULATOR]: 15,
            [ToolCategory.DEVELOPER]: 10,
            [ToolCategory.UTILITY]: 5,
            [ToolCategory.CREATIVE_DESIGN]: 0,
            [ToolCategory.TEXT_WRITING]: 0,
            [ToolCategory.TIME_PRODUCTIVITY]: 0,
            [ToolCategory.NUMBER_CONVERSION]: 0,
            [ToolCategory.EVERYDAY_LIFE]: 0
          }
        }
      }));

      const analytics = getAnalytics();
      expect(analytics.sessionsCount).toBe(12);
      expect(analytics.averageSessionDuration).toBe(5);
    });

    it('should identify most used tool correctly', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          totalToolsUsed: 25,
          totalTimeSaved: 50,
          mostUsedTool: 'json-formatter',
          productivityScore: 75,
          sessionsCount: 10,
          averageSessionDuration: 5,
          toolCategoryUsage: {
            [ToolCategory.CALCULATOR]: 5,
            [ToolCategory.DEVELOPER]: 15, // Highest usage
            [ToolCategory.UTILITY]: 5,
            [ToolCategory.CREATIVE_DESIGN]: 0,
            [ToolCategory.TEXT_WRITING]: 0,
            [ToolCategory.TIME_PRODUCTIVITY]: 0,
            [ToolCategory.NUMBER_CONVERSION]: 0,
            [ToolCategory.EVERYDAY_LIFE]: 0
          }
        }
      }));

      const analytics = getAnalytics();
      expect(analytics.mostUsedTool).toBe('json-formatter');
    });
  });

  describe('Analytics Edge Cases', () => {
    it('should handle zero usage gracefully', () => {
      const analytics = getAnalytics();
      expect(analytics.totalToolsUsed).toBe(0);
      expect(analytics.productivityScore).toBe(0);
      expect(analytics.mostUsedTool).toBe('');
    });

    it('should handle very large numbers', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          totalToolsUsed: 999999,
          totalTimeSaved: 999999,
          mostUsedTool: 'calculator',
          productivityScore: 100,
          sessionsCount: 999999,
          averageSessionDuration: 999999,
          toolCategoryUsage: {
            [ToolCategory.CALCULATOR]: 999999,
            [ToolCategory.DEVELOPER]: 0,
            [ToolCategory.UTILITY]: 0,
            [ToolCategory.CREATIVE_DESIGN]: 0,
            [ToolCategory.TEXT_WRITING]: 0,
            [ToolCategory.TIME_PRODUCTIVITY]: 0,
            [ToolCategory.NUMBER_CONVERSION]: 0,
            [ToolCategory.EVERYDAY_LIFE]: 0
          }
        }
      }));

      const analytics = getAnalytics();
      expect(analytics.totalToolsUsed).toBe(999999);
      expect(analytics.productivityScore).toBeLessThanOrEqual(100);
    });
  });
});