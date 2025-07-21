/**
 * Interface for storage provider
 */
export interface StorageProvider {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Default storage provider using localStorage
 */
export class LocalStorageProvider implements StorageProvider {
  getItem(key: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  }
  
  setItem(key: string, value: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, value);
  }
  
  removeItem(key: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  }
}

/**
 * Service for managing recent searches in storage
 */
export class RecentSearchesService {
  private storageKey: string;
  private maxItems: number;
  private storage: StorageProvider;
  
  /**
   * Create a new RecentSearchesService
   * @param storageKey The key to use for storage
   * @param maxItems Maximum number of recent searches to store
   * @param storage Storage provider (defaults to localStorage)
   */
  constructor(
    storageKey = 'recentSearches', 
    maxItems = 5,
    storage: StorageProvider = new LocalStorageProvider()
  ) {
    this.storageKey = storageKey;
    this.maxItems = maxItems;
    this.storage = storage;
  }
  
  /**
   * Get recent searches from storage
   * @returns Array of recent searches
   */
  getRecentSearches(): string[] {
    try {
      const stored = this.storage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving recent searches:', error);
      return [];
    }
  }
  
  /**
   * Add a search query to recent searches
   * @param query The search query to add
   * @returns Updated array of recent searches
   */
  addRecentSearch(query: string): string[] {
    if (!query || query.trim() === '') {
      return this.getRecentSearches();
    }
    
    try {
      const recentSearches = this.getRecentSearches();
      
      // Remove the query if it already exists
      const filteredSearches = recentSearches.filter(
        search => search.toLowerCase() !== query.toLowerCase()
      );
      
      // Add the new query to the beginning
      const updatedSearches = [query, ...filteredSearches].slice(0, this.maxItems);
      
      // Save to storage
      this.storage.setItem(this.storageKey, JSON.stringify(updatedSearches));
      
      return updatedSearches;
    } catch (error) {
      console.error('Error adding recent search:', error);
      return this.getRecentSearches();
    }
  }
  
  /**
   * Clear all recent searches
   */
  clearRecentSearches(): void {
    try {
      this.storage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  }
  
  /**
   * Remove a specific search query from recent searches
   * @param query The search query to remove
   * @returns Updated array of recent searches
   */
  removeRecentSearch(query: string): string[] {
    try {
      const recentSearches = this.getRecentSearches();
      const updatedSearches = recentSearches.filter(
        search => search.toLowerCase() !== query.toLowerCase()
      );
      
      // Save to storage
      this.storage.setItem(this.storageKey, JSON.stringify(updatedSearches));
      
      return updatedSearches;
    } catch (error) {
      console.error('Error removing recent search:', error);
      return this.getRecentSearches();
    }
  }
}