/**
 * Additional interfaces for the utility discovery system
 */
import type { CategoryType, UtilityDefinition, SearchResult, SearchSuggestion, CategoryDefinition } from './types';

/**
 * Search engine interface for utility discovery
 */
export interface SearchEngine {
  /**
   * Search for utilities based on a query string
   * @param query The search query
   * @returns Array of search results with relevance scores
   */
  search(query: string): SearchResult[];
  
  /**
   * Get real-time search suggestions as the user types
   * @param query The partial search query
   * @returns Array of search suggestions
   */
  getSuggestions(query: string): SearchSuggestion[];
  
  /**
   * Add a utility to the recently used list
   * @param utilityId The ID of the utility to add
   */
  addToRecentlyUsed(utilityId: string): void;
  
  /**
   * Toggle a utility's favorite status
   * @param utilityId The ID of the utility to toggle
   */
  toggleFavorite(utilityId: string): void;
}

/**
 * Preferences manager for user personalization
 */
export interface PreferencesManager {
  /**
   * Get the list of recently used utility IDs
   * @returns Array of utility IDs
   */
  getRecentlyUsed(): string[];
  
  /**
   * Get the list of favorite utility IDs
   * @returns Array of utility IDs
   */
  getFavorites(): string[];
  
  /**
   * Add a utility to the recently used list
   * @param utilityId The ID of the utility to add
   */
  addRecentlyUsed(utilityId: string): void;
  
  /**
   * Toggle a utility's favorite status
   * @param utilityId The ID of the utility to toggle
   */
  toggleFavorite(utilityId: string): void;
  
  /**
   * Clear all user history and preferences
   */
  clearHistory(): void;
}

/**
 * Search index structure for efficient utility discovery
 */
export interface SearchIndex {
  /**
   * Map of utility IDs to utility definitions
   */
  utilities: Map<string, UtilityDefinition>;
  
  /**
   * Map of keywords to utility IDs
   */
  keywords: Map<string, string[]>;
  
  /**
   * Map of categories to utility IDs
   */
  categories: Map<CategoryType, string[]>;
  
  /**
   * Fuzzy matching engine for typo-tolerant search
   */
  fuzzyMatcher: FuzzyMatcher;
}

/**
 * Fuzzy matching interface for typo-tolerant search
 */
export interface FuzzyMatcher {
  /**
   * Match a query string against a target string with typo tolerance
   * @param query The search query
   * @param target The target string to match against
   * @returns Match score (higher is better) or null if no match
   */
  match(query: string, target: string): number | null;
}

/**
 * Error boundary state for handling error conditions
 */
export interface ErrorBoundaryState {
  /**
   * Whether an error has occurred
   */
  hasError: boolean;
  
  /**
   * The type of error that occurred
   */
  errorType: 'search' | 'data' | 'network' | 'unknown';
  
  /**
   * The component to render as a fallback
   */
  fallbackComponent: React.ComponentType;
}

/**
 * Error recovery strategies for different error types
 */
export const errorRecoveryStrategies = {
  /**
   * Recovery strategy for search errors
   * @returns Function to show static utilities
   */
  search: () => {
    // Implementation would show static utilities
    console.log('Showing static utilities as fallback');
    return null;
  },
  
  /**
   * Recovery strategy for data errors
   * @returns Function to load cached data
   */
  data: () => {
    // Implementation would load cached data
    console.log('Loading cached data as fallback');
    return null;
  },
  
  /**
   * Recovery strategy for network errors
   * @returns Function to enable offline mode
   */
  network: () => {
    // Implementation would enable offline mode
    console.log('Enabling offline mode as fallback');
    return null;
  },
  
  /**
   * Recovery strategy for unknown errors
   * @returns Function to show generic error
   */
  unknown: () => {
    // Implementation would show generic error
    console.log('Showing generic error message');
    return null;
  }
};

/**
 * Component props for the HomePage component
 */
export interface HomePageProps {
  /**
   * Array of utility definitions
   */
  utilities: UtilityDefinition[];
  
  /**
   * Record of category definitions
   */
  categories: Record<CategoryType, CategoryDefinition>;
}

/**
 * Component props for the SearchBar component
 */
export interface SearchBarProps {
  /**
   * Callback function for search events
   */
  onSearch: (query: string) => void;
  
  /**
   * Placeholder text for the search input
   */
  placeholder?: string;
  
  /**
   * Array of search suggestions
   */
  suggestions?: SearchSuggestion[];
}

/**
 * Component props for the UtilityCard component
 */
export interface UtilityCardProps {
  /**
   * The utility to display
   */
  utility: UtilityDefinition;
  
  /**
   * Display variant for the card
   */
  variant?: 'default' | 'compact' | 'featured';
  
  /**
   * Click handler for the card
   */
  onClick?: () => void;
}

/**
 * Component props for the CategorySection component
 */
export interface CategorySectionProps {
  /**
   * The category definition
   */
  category: CategoryDefinition;
  
  /**
   * Array of utilities in this category
   */
  utilities: UtilityDefinition[];
  
  /**
   * Maximum number of items to display
   */
  maxItems?: number;
  
  /**
   * Whether to show a "View All" button
   */
  showViewAll?: boolean;
}