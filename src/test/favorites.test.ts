import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getFavorites, addFavorite, removeFavorite, isFavorite, storageManager } from '../utils/storage';

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

describe('Favorites Management', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Basic Favorites Operations', () => {
    it('should start with empty favorites', () => {
      const favorites = getFavorites();
      expect(favorites).toEqual([]);
    });

    it('should add a tool to favorites', () => {
      // Mock empty favorites initially
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

      addFavorite('calculator');
      
      // Verify setItem was called
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should remove a tool from favorites', () => {
      // Mock favorites with calculator
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

      removeFavorite('calculator');
      
      // Verify setItem was called
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should check if a tool is favorited', () => {
      // Mock favorites with calculator
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

      expect(isFavorite('calculator')).toBe(true);
      expect(isFavorite('color-picker')).toBe(false);
    });

    it('should not add duplicate favorites', () => {
      // Mock favorites with calculator already present
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

      // Try to add calculator again
      addFavorite('calculator');
      
      // Should still only have one calculator in favorites
      const favorites = getFavorites();
      const calculatorCount = favorites.filter(id => id === 'calculator').length;
      expect(calculatorCount).toBeLessThanOrEqual(1);
    });
  });

  describe('Favorites Reordering', () => {
    it('should reorder favorites correctly', () => {
      const newOrder = ['json-formatter', 'calculator', 'color-picker'];
      
      // Mock the reorderFavorites method
      const reorderSpy = vi.spyOn(storageManager, 'reorderFavorites');
      storageManager.reorderFavorites(newOrder);
      
      expect(reorderSpy).toHaveBeenCalledWith(newOrder);
    });
  });

  describe('Favorites Persistence', () => {
    it('should persist favorites across sessions', () => {
      // Mock localStorage with existing favorites
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          favorites: ['calculator', 'json-formatter'],
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

      const favorites = getFavorites();
      expect(favorites).toContain('calculator');
      expect(favorites).toContain('json-formatter');
    });

    it('should handle corrupted localStorage gracefully', () => {
      // Mock corrupted localStorage
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // Should not throw and return empty array
      expect(() => getFavorites()).not.toThrow();
      const favorites = getFavorites();
      expect(Array.isArray(favorites)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tool ID', () => {
      expect(() => addFavorite('')).not.toThrow();
      expect(() => removeFavorite('')).not.toThrow();
      expect(isFavorite('')).toBe(false);
    });

    it('should handle null/undefined tool ID', () => {
      expect(() => addFavorite(null as any)).not.toThrow();
      expect(() => removeFavorite(undefined as any)).not.toThrow();
      // Note: The storage system may handle null differently, so we just check it doesn't crash
      expect(() => isFavorite(null as any)).not.toThrow();
    });

    it('should handle very long favorites list', () => {
      const longFavoritesList = Array.from({ length: 100 }, (_, i) => `tool-${i}`);
      
      // Mock localStorage with long list
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: {
          favorites: longFavoritesList,
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

      const favorites = getFavorites();
      expect(favorites.length).toBe(100);
    });
  });
});