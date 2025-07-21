/**
 * Search engine implementation for utility discovery
 */
import type { 
  UtilityDefinition, 
  SearchResult, 
  SearchSuggestion, 
  CategoryType,
  SearchEngine,
  SearchIndex,
  FuzzyMatcher
} from './types';
import { utilityRegistry, getUtilityById } from './registry';

/**
 * Simple fuzzy matcher implementation
 */
class SimpleFuzzyMatcher implements FuzzyMatcher {
  /**
   * Match a query string against a target string with typo tolerance
   * @param query The search query
   * @param target The target string to match against
   * @returns Match score (higher is better) or null if no match
   */
  match(query: string, target: string): number | null {
    // Convert both strings to lowercase for case-insensitive matching
    const queryLower = query.toLowerCase();
    const targetLower = target.toLowerCase();
    
    // If the target contains the exact query, return a high score
    if (targetLower.includes(queryLower)) {
      return 1.0;
    }
    
    // Check for partial matches with some tolerance
    const queryChars = queryLower.split('');
    let lastIndex = -1;
    let matchCount = 0;
    
    // Count how many characters match in sequence
    for (const char of queryChars) {
      const index = targetLower.indexOf(char, lastIndex + 1);
      if (index > -1) {
        lastIndex = index;
        matchCount++;
      }
    }
    
    // Calculate match score based on percentage of matched characters
    const matchScore = matchCount / queryChars.length;
    
    // Return null if the score is too low
    return matchScore > 0.6 ? matchScore : null;
  }
}

/**
 * Build a search index from the utility registry
 * @returns A search index for efficient utility discovery
 */
function buildSearchIndex(): SearchIndex {
  const utilities = new Map<string, UtilityDefinition>();
  const keywords = new Map<string, string[]>();
  const categories = new Map<CategoryType, string[]>();
  
  // Index all utilities
  utilityRegistry.utilities.forEach(utility => {
    // Add to utilities map
    utilities.set(utility.id, utility);
    
    // Add to categories map
    const categoryUtilities = categories.get(utility.category) || [];
    categoryUtilities.push(utility.id);
    categories.set(utility.category, categoryUtilities);
    
    // Add to keywords map
    utility.keywords.forEach(keyword => {
      const keywordUtilities = keywords.get(keyword) || [];
      keywordUtilities.push(utility.id);
      keywords.set(keyword, keywordUtilities);
    });
  });
  
  return {
    utilities,
    keywords,
    categories,
    fuzzyMatcher: new SimpleFuzzyMatcher()
  };
}

/**
 * Search engine implementation
 */
export class UtilitySearchEngine implements SearchEngine {
  private index: SearchIndex;
  private recentlyUsed: string[] = [];
  private favorites: string[] = [];
  
  constructor() {
    this.index = buildSearchIndex();
    
    // Load user preferences from localStorage if available
    this.loadPreferences();
  }
  
  /**
   * Load user preferences from localStorage
   */
  private loadPreferences(): void {
    if (typeof window !== 'undefined') {
      try {
        const recentlyUsed = localStorage.getItem('recentlyUsed');
        if (recentlyUsed) {
          this.recentlyUsed = JSON.parse(recentlyUsed);
        }
        
        const favorites = localStorage.getItem('favorites');
        if (favorites) {
          this.favorites = JSON.parse(favorites);
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    }
  }
  
  /**
   * Save user preferences to localStorage
   */
  private savePreferences(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('recentlyUsed', JSON.stringify(this.recentlyUsed));
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
      } catch (error) {
        console.error('Failed to save preferences:', error);
      }
    }
  }
  
  /**
   * Search for utilities based on a query string
   * @param query The search query
   * @returns Array of search results with relevance scores
   */
  search(query: string): SearchResult[] {
    if (!query.trim()) {
      return [];
    }
    
    const results: SearchResult[] = [];
    const processedUtilities = new Set<string>();
    
    // Search by exact keyword match
    this.index.keywords.forEach((utilityIds, keyword) => {
      if (keyword.toLowerCase().includes(query.toLowerCase())) {
        utilityIds.forEach(id => {
          if (!processedUtilities.has(id)) {
            const utility = this.index.utilities.get(id);
            if (utility) {
              results.push({
                utility,
                relevanceScore: 1.0,
                matchedFields: ['keyword']
              });
              processedUtilities.add(id);
            }
          }
        });
      }
    });
    
    // Search by utility name and description
    this.index.utilities.forEach(utility => {
      if (!processedUtilities.has(utility.id)) {
        const nameMatch = this.index.fuzzyMatcher.match(query, utility.name);
        const descMatch = this.index.fuzzyMatcher.match(query, utility.description);
        
        if (nameMatch || descMatch) {
          const matchedFields = [];
          if (nameMatch) matchedFields.push('name');
          if (descMatch) matchedFields.push('description');
          
          results.push({
            utility,
            relevanceScore: Math.max(nameMatch || 0, descMatch || 0),
            matchedFields
          });
          processedUtilities.add(utility.id);
        }
      }
    });
    
    // Sort results by relevance score (descending)
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  
  /**
   * Get real-time search suggestions as the user types
   * @param query The partial search query
   * @returns Array of search suggestions
   */
  getSuggestions(query: string): SearchSuggestion[] {
    if (!query.trim()) {
      return [];
    }
    
    const suggestions: SearchSuggestion[] = [];
    const processedItems = new Set<string>();
    
    // Add utility suggestions
    const searchResults = this.search(query);
    searchResults.slice(0, 5).forEach(result => {
      const key = `utility-${result.utility.id}`;
      if (!processedItems.has(key)) {
        suggestions.push({
          type: 'utility',
          text: result.utility.name,
          utility: result.utility
        });
        processedItems.add(key);
      }
    });
    
    // Add keyword suggestions
    this.index.keywords.forEach((_, keyword) => {
      const key = `keyword-${keyword}`;
      if (
        !processedItems.has(key) &&
        keyword.toLowerCase().includes(query.toLowerCase())
      ) {
        suggestions.push({
          type: 'keyword',
          text: keyword
        });
        processedItems.add(key);
      }
    });
    
    // Add category suggestions if query matches category name
    utilityRegistry.categories && Object.values(utilityRegistry.categories).forEach(category => {
      const key = `category-${category.id}`;
      if (
        !processedItems.has(key) &&
        category.name.toLowerCase().includes(query.toLowerCase())
      ) {
        suggestions.push({
          type: 'category',
          text: category.name
        });
        processedItems.add(key);
      }
    });
    
    // Limit to 10 suggestions total
    return suggestions.slice(0, 10);
  }
  
  /**
   * Add a utility to the recently used list
   * @param utilityId The ID of the utility to add
   */
  addToRecentlyUsed(utilityId: string): void {
    // Remove if already exists
    this.recentlyUsed = this.recentlyUsed.filter(id => id !== utilityId);
    
    // Add to the beginning of the array
    this.recentlyUsed.unshift(utilityId);
    
    // Limit to 10 items
    if (this.recentlyUsed.length > 10) {
      this.recentlyUsed = this.recentlyUsed.slice(0, 10);
    }
    
    // Save to localStorage
    this.savePreferences();
  }
  
  /**
   * Toggle a utility's favorite status
   * @param utilityId The ID of the utility to toggle
   */
  toggleFavorite(utilityId: string): void {
    const index = this.favorites.indexOf(utilityId);
    
    if (index === -1) {
      // Add to favorites
      this.favorites.push(utilityId);
    } else {
      // Remove from favorites
      this.favorites.splice(index, 1);
    }
    
    // Save to localStorage
    this.savePreferences();
  }
  
  /**
   * Get the list of recently used utility IDs
   * @returns Array of utility IDs
   */
  getRecentlyUsed(): string[] {
    return this.recentlyUsed;
  }
  
  /**
   * Get the list of favorite utility IDs
   * @returns Array of utility IDs
   */
  getFavorites(): string[] {
    return this.favorites;
  }
  
  /**
   * Clear all user history and preferences
   */
  clearHistory(): void {
    this.recentlyUsed = [];
    this.favorites = [];
    this.savePreferences();
  }
  
  /**
   * Get recently used utilities
   * @returns Array of utility definitions
   */
  getRecentlyUsedUtilities(): UtilityDefinition[] {
    return this.recentlyUsed
      .map(id => getUtilityById(id))
      .filter((utility): utility is UtilityDefinition => utility !== undefined);
  }
  
  /**
   * Get favorite utilities
   * @returns Array of utility definitions
   */
  getFavoriteUtilities(): UtilityDefinition[] {
    return this.favorites
      .map(id => getUtilityById(id))
      .filter((utility): utility is UtilityDefinition => utility !== undefined);
  }
}

// Export a singleton instance of the search engine
export const searchEngine = new UtilitySearchEngine();