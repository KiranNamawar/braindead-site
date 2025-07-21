/**
 * Preferences manager for user personalization
 */
import type { PreferencesManager, UserPreferences } from './types';

/**
 * Implementation of the PreferencesManager interface
 */
export class UserPreferencesManager implements PreferencesManager {
  private preferences: UserPreferences;
  
  constructor() {
    // Initialize with default preferences
    this.preferences = {
      recentlyUsed: [],
      favorites: [],
      theme: 'system',
      searchHistory: []
    };
    
    // Load preferences from localStorage if available
    this.loadPreferences();
  }
  
  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    if (typeof window !== 'undefined') {
      try {
        const storedPreferences = localStorage.getItem('userPreferences');
        if (storedPreferences) {
          this.preferences = {
            ...this.preferences,
            ...JSON.parse(storedPreferences)
          };
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    }
  }
  
  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('userPreferences', JSON.stringify(this.preferences));
      } catch (error) {
        console.error('Failed to save preferences:', error);
      }
    }
  }
  
  /**
   * Get the list of recently used utility IDs
   * @returns Array of utility IDs
   */
  getRecentlyUsed(): string[] {
    return this.preferences.recentlyUsed.map(item => item.utilityId);
  }
  
  /**
   * Get the list of favorite utility IDs
   * @returns Array of utility IDs
   */
  getFavorites(): string[] {
    return this.preferences.favorites;
  }
  
  /**
   * Add a utility to the recently used list
   * @param utilityId The ID of the utility to add
   */
  addRecentlyUsed(utilityId: string): void {
    // Remove if already exists
    this.preferences.recentlyUsed = this.preferences.recentlyUsed.filter(
      item => item.utilityId !== utilityId
    );
    
    // Add to the beginning of the array with current timestamp
    this.preferences.recentlyUsed.unshift({
      utilityId,
      timestamp: Date.now()
    });
    
    // Limit to 10 items
    if (this.preferences.recentlyUsed.length > 10) {
      this.preferences.recentlyUsed = this.preferences.recentlyUsed.slice(0, 10);
    }
    
    // Save to localStorage
    this.savePreferences();
  }
  
  /**
   * Toggle a utility's favorite status
   * @param utilityId The ID of the utility to toggle
   */
  toggleFavorite(utilityId: string): void {
    const index = this.preferences.favorites.indexOf(utilityId);
    
    if (index === -1) {
      // Add to favorites
      this.preferences.favorites.push(utilityId);
    } else {
      // Remove from favorites
      this.preferences.favorites.splice(index, 1);
    }
    
    // Save to localStorage
    this.savePreferences();
  }
  
  /**
   * Clear all user history and preferences
   */
  clearHistory(): void {
    this.preferences.recentlyUsed = [];
    this.preferences.favorites = [];
    this.preferences.searchHistory = [];
    this.savePreferences();
  }
  
  /**
   * Add a search query to search history
   * @param query The search query to add
   */
  addSearchHistory(query: string): void {
    // Don't add empty queries
    if (!query.trim()) return;
    
    // Remove if already exists
    this.preferences.searchHistory = this.preferences.searchHistory.filter(
      item => item !== query
    );
    
    // Add to the beginning of the array
    this.preferences.searchHistory.unshift(query);
    
    // Limit to 20 items
    if (this.preferences.searchHistory.length > 20) {
      this.preferences.searchHistory = this.preferences.searchHistory.slice(0, 20);
    }
    
    // Save to localStorage
    this.savePreferences();
  }
  
  /**
   * Get search history
   * @returns Array of search queries
   */
  getSearchHistory(): string[] {
    return this.preferences.searchHistory;
  }
  
  /**
   * Get the current theme preference
   * @returns The theme preference
   */
  getTheme(): 'light' | 'dark' | 'system' {
    return this.preferences.theme;
  }
  
  /**
   * Set the theme preference
   * @param theme The theme preference to set
   */
  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.preferences.theme = theme;
    this.savePreferences();
  }
}

// Export a singleton instance of the preferences manager
export const preferencesManager = new UserPreferencesManager();