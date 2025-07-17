import { useState, useEffect, useCallback } from 'react';
import { getFavorites, addFavorite, removeFavorite, isFavorite, storageManager } from '../utils/storage';
import { getAllTools } from '../utils/toolRegistry';
import { Tool } from '../types';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteTools, setFavoriteTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from storage
  const loadFavorites = useCallback(() => {
    try {
      const favoriteIds = getFavorites();
      setFavorites(favoriteIds);
      
      const allTools = getAllTools();
      const tools = favoriteIds
        .map(id => allTools.find(tool => tool.id === id))
        .filter((tool): tool is Tool => tool !== undefined);
      
      setFavoriteTools(tools);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize favorites on mount
  useEffect(() => {
    loadFavorites();
    
    // Listen for storage changes from other tabs/components
    const handleStorageChange = (event: CustomEvent) => {
      const { key } = event.detail;
      if (key && key.includes('favorites')) {
        loadFavorites();
      }
    };

    window.addEventListener('braindead-storage-change', handleStorageChange as EventListener);
    return () => window.removeEventListener('braindead-storage-change', handleStorageChange as EventListener);
  }, [loadFavorites]);

  // Add tool to favorites
  const addToFavorites = useCallback((toolId: string) => {
    try {
      addFavorite(toolId);
      loadFavorites();
      return true;
    } catch (error) {
      console.error('Failed to add favorite:', error);
      return false;
    }
  }, [loadFavorites]);

  // Remove tool from favorites
  const removeFromFavorites = useCallback((toolId: string) => {
    try {
      removeFavorite(toolId);
      loadFavorites();
      return true;
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      return false;
    }
  }, [loadFavorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback((toolId: string) => {
    if (isFavorite(toolId)) {
      return removeFromFavorites(toolId);
    } else {
      return addToFavorites(toolId);
    }
  }, [addToFavorites, removeFromFavorites]);

  // Check if tool is favorited
  const checkIsFavorite = useCallback((toolId: string) => {
    return favorites.includes(toolId);
  }, [favorites]);

  // Reorder favorites
  const reorderFavorites = useCallback((newOrder: string[]) => {
    try {
      storageManager.reorderFavorites(newOrder);
      loadFavorites();
      return true;
    } catch (error) {
      console.error('Failed to reorder favorites:', error);
      return false;
    }
  }, [loadFavorites]);

  // Get favorite tools with additional metadata
  const getFavoriteToolsWithMetadata = useCallback(() => {
    return favoriteTools.map((tool, index) => ({
      ...tool,
      favoriteIndex: index,
      isFavorite: true,
      dateAdded: new Date() // This could be enhanced to track actual add date
    }));
  }, [favoriteTools]);

  // Get tools that are not favorited
  const getNonFavoriteTools = useCallback(() => {
    const allTools = getAllTools();
    return allTools.filter(tool => !favorites.includes(tool.id));
  }, [favorites]);

  // Get favorite tools by category
  const getFavoritesByCategory = useCallback(() => {
    const categorized: Record<string, Tool[]> = {};
    
    favoriteTools.forEach(tool => {
      const category = tool.category;
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(tool);
    });
    
    return categorized;
  }, [favoriteTools]);

  // Get favorites statistics
  const getFavoritesStats = useCallback(() => {
    const totalFavorites = favorites.length;
    const categorizedFavorites = getFavoritesByCategory();
    const categoriesWithFavorites = Object.keys(categorizedFavorites).length;
    
    const mostFavoritedCategory = Object.entries(categorizedFavorites)
      .sort(([, a], [, b]) => b.length - a.length)[0];
    
    return {
      totalFavorites,
      categoriesWithFavorites,
      mostFavoritedCategory: mostFavoritedCategory ? {
        category: mostFavoritedCategory[0],
        count: mostFavoritedCategory[1].length
      } : null,
      averageFavoritesPerCategory: categoriesWithFavorites > 0 
        ? Math.round(totalFavorites / categoriesWithFavorites * 10) / 10 
        : 0
    };
  }, [favorites.length, getFavoritesByCategory]);

  // Clear all favorites
  const clearAllFavorites = useCallback(() => {
    try {
      favorites.forEach(toolId => removeFavorite(toolId));
      loadFavorites();
      return true;
    } catch (error) {
      console.error('Failed to clear favorites:', error);
      return false;
    }
  }, [favorites, loadFavorites]);

  // Import favorites from array
  const importFavorites = useCallback((favoriteIds: string[]) => {
    try {
      // Clear existing favorites
      clearAllFavorites();
      
      // Add new favorites
      const allTools = getAllTools();
      const validIds = favoriteIds.filter(id => 
        allTools.some(tool => tool.id === id)
      );
      
      validIds.forEach(id => addFavorite(id));
      loadFavorites();
      
      return {
        success: true,
        imported: validIds.length,
        invalid: favoriteIds.length - validIds.length
      };
    } catch (error) {
      console.error('Failed to import favorites:', error);
      return {
        success: false,
        imported: 0,
        invalid: favoriteIds.length
      };
    }
  }, [clearAllFavorites, loadFavorites]);

  // Export favorites as array
  const exportFavorites = useCallback(() => {
    return {
      favorites: favorites,
      favoriteTools: favoriteTools.map(tool => ({
        id: tool.id,
        name: tool.name,
        category: tool.category
      })),
      exportDate: new Date().toISOString(),
      totalCount: favorites.length
    };
  }, [favorites, favoriteTools]);

  return {
    // State
    favorites,
    favoriteTools,
    isLoading,
    
    // Actions
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    reorderFavorites,
    clearAllFavorites,
    
    // Queries
    checkIsFavorite,
    getFavoriteToolsWithMetadata,
    getNonFavoriteTools,
    getFavoritesByCategory,
    getFavoritesStats,
    
    // Import/Export
    importFavorites,
    exportFavorites,
    
    // Utilities
    loadFavorites
  };
}