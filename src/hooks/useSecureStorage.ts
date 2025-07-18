import { useState, useEffect, useCallback } from 'react';
import { secureStorage, privacyManager, dataUsageTracker } from '../utils/privacy';

/**
 * Secure localStorage hook with encryption and privacy controls
 */
export function useSecureStorage<T>(key: string, initialValue: T) {
  // Get from secure storage
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    // Check if localStorage is enabled in privacy settings
    if (!privacyManager.isEnabled('localStorage')) {
      return initialValue;
    }

    try {
      const item = secureStorage.getItem<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.warn(`Error reading secure storage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to secure storage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Check if localStorage is enabled in privacy settings
      if (!privacyManager.isEnabled('localStorage')) {
        // Only update state, don't persist
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        return;
      }

      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        secureStorage.setItem(key, valueToStore);
        
        // Track data usage for transparency
        dataUsageTracker.track(
          'Store Data',
          'User Preferences',
          'Improve User Experience',
          'Until manually deleted'
        );
      }
    } catch (error) {
      console.warn(`Error setting secure storage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Clear value from storage
  const clearValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        secureStorage.removeItem(key);
        
        // Track data deletion
        dataUsageTracker.track(
          'Delete Data',
          'User Preferences',
          'User Request',
          'Immediate'
        );
      }
    } catch (error) {
      console.warn(`Error clearing secure storage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for privacy setting changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePrivacyChange = () => {
      if (!privacyManager.isEnabled('localStorage')) {
        // If localStorage is disabled, clear the stored value but keep state
        try {
          secureStorage.removeItem(key);
        } catch (error) {
          console.warn(`Error clearing storage on privacy change for key "${key}":`, error);
        }
      }
    };

    // Check for privacy setting changes periodically
    const interval = setInterval(handlePrivacyChange, 1000);
    return () => clearInterval(interval);
  }, [key]);

  return [storedValue, setValue, clearValue] as const;
}

/**
 * Hook for managing user preferences with privacy controls
 */
export function useUserPreferences<T extends Record<string, any>>(
  defaultPreferences: T
) {
  const [preferences, setPreferences, clearPreferences] = useSecureStorage('user_preferences', defaultPreferences);

  const updatePreference = useCallback(<K extends keyof T>(
    key: K,
    value: T[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setPreferences]);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, [setPreferences, defaultPreferences]);

  return {
    preferences,
    updatePreference,
    resetPreferences,
    clearPreferences
  };
}

/**
 * Hook for managing tool usage history with privacy controls
 */
export interface ToolUsage {
  toolId: string;
  lastUsed: Date;
  usageCount: number;
  timeSpent: number;
}

export function useToolHistory() {
  const [history, setHistory, clearHistory] = useSecureStorage<ToolUsage[]>('tool_history', []);

  const recordUsage = useCallback((toolId: string, timeSpent: number = 0) => {
    if (!privacyManager.isEnabled('localStorage')) {
      return; // Don't record if localStorage is disabled
    }

    setHistory(prev => {
      const existing = prev.find(item => item.toolId === toolId);
      if (existing) {
        return prev.map(item =>
          item.toolId === toolId
            ? {
                ...item,
                lastUsed: new Date(),
                usageCount: item.usageCount + 1,
                timeSpent: item.timeSpent + timeSpent
              }
            : item
        );
      } else {
        return [...prev, {
          toolId,
          lastUsed: new Date(),
          usageCount: 1,
          timeSpent
        }];
      }
    });

    // Track data usage
    dataUsageTracker.track(
      'Record Tool Usage',
      'Usage Statistics',
      'Improve User Experience',
      'Until manually deleted'
    );
  }, [setHistory]);

  const getRecentTools = useCallback((limit: number = 5) => {
    return history
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .slice(0, limit);
  }, [history]);

  const getMostUsedTools = useCallback((limit: number = 5) => {
    return history
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }, [history]);

  return {
    history,
    recordUsage,
    getRecentTools,
    getMostUsedTools,
    clearHistory
  };
}

/**
 * Hook for managing favorites with privacy controls
 */
export function useFavorites() {
  const [favorites, setFavorites, clearFavorites] = useSecureStorage<string[]>('favorites', []);

  const addFavorite = useCallback((toolId: string) => {
    if (!privacyManager.isEnabled('localStorage')) {
      return; // Don't persist if localStorage is disabled
    }

    setFavorites(prev => {
      if (prev.includes(toolId)) {
        return prev;
      }
      return [...prev, toolId];
    });

    dataUsageTracker.track(
      'Add Favorite',
      'User Preferences',
      'Improve User Experience',
      'Until manually deleted'
    );
  }, [setFavorites]);

  const removeFavorite = useCallback((toolId: string) => {
    setFavorites(prev => prev.filter(id => id !== toolId));

    dataUsageTracker.track(
      'Remove Favorite',
      'User Preferences',
      'User Request',
      'Immediate'
    );
  }, [setFavorites]);

  const toggleFavorite = useCallback((toolId: string) => {
    if (favorites.includes(toolId)) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  }, [favorites, addFavorite, removeFavorite]);

  const isFavorite = useCallback((toolId: string) => {
    return favorites.includes(toolId);
  }, [favorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites
  };
}