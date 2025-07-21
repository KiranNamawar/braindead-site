/**
 * Enhanced search engine implementation with improved suggestion system
 */
import { UtilitySearchEngine } from './search';
import { generateSuggestions, filterSuggestions } from './searchSuggestions';
import type { SearchSuggestion } from './types';

/**
 * Enhanced search engine with improved suggestion system
 * Extends the base UtilitySearchEngine with better suggestion generation
 */
export class EnhancedSearchEngine extends UtilitySearchEngine {
  /**
   * Get real-time search suggestions as the user types
   * @param query The partial search query
   * @returns Array of search suggestions
   */
  override getSuggestions(query: string): SearchSuggestion[] {
    if (!query.trim()) {
      return [];
    }
    
    // Generate suggestions using the new system
    const suggestions = generateSuggestions(
      query,
      (q, t) => this.index.fuzzyMatcher.match(q, t),
      {
        maxSuggestions: 10,
        maxUtilities: 5,
        maxKeywords: 3,
        maxCategories: 2,
        includeRecentlyUsed: true,
        recentlyUsed: this.recentlyUsed,
        favorites: this.favorites
      }
    );
    
    // Filter suggestions to remove duplicates and similar items
    return filterSuggestions(suggestions);
  }
}

// Create and export a singleton instance of the enhanced search engine
export const enhancedSearchEngine = new EnhancedSearchEngine();