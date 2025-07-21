import { useState, useEffect, useCallback, useRef } from 'react';
import { enhancedSearchEngine } from '~/lib/searchEngine';
import type { SearchResult, SearchSuggestion, UtilityDefinition } from '~/lib/types';

/**
 * Custom hook for managing search state and suggestions
 */
export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState<UtilityDefinition[]>([]);
  const [favorites, setFavorites] = useState<UtilityDefinition[]>([]);
  
  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Perform search with debouncing
   */
  const performSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (!searchQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // Debounce search to avoid excessive processing
    debounceTimerRef.current = setTimeout(() => {
      try {
        // Get search results
        const searchResults = enhancedSearchEngine.search(searchQuery);
        setResults(searchResults);
        
        // Get search suggestions
        const searchSuggestions = enhancedSearchEngine.getSuggestions(searchQuery);
        setSuggestions(searchSuggestions);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 150); // 150ms debounce delay
  }, []);
  
  /**
   * Handle suggestion selection
   */
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'utility':
        if (suggestion.utility) {
          // Add to recently used
          enhancedSearchEngine.addToRecentlyUsed(suggestion.utility.id);
          // Update recently used state
          setRecentlyUsed(enhancedSearchEngine.getRecentlyUsedUtilities());
        }
        setQuery(suggestion.text);
        performSearch(suggestion.text);
        break;
        
      case 'category':
      case 'keyword':
        setQuery(suggestion.text);
        performSearch(suggestion.text);
        break;
        
      default:
        break;
    }
  }, [performSearch]);
  
  /**
   * Toggle favorite status for a utility
   */
  const toggleFavorite = useCallback((utilityId: string) => {
    enhancedSearchEngine.toggleFavorite(utilityId);
    setFavorites(enhancedSearchEngine.getFavoriteUtilities());
  }, []);
  
  /**
   * Clear search history
   */
  const clearHistory = useCallback(() => {
    enhancedSearchEngine.clearHistory();
    setRecentlyUsed([]);
    setFavorites([]);
  }, []);
  
  /**
   * Load user preferences on mount
   */
  useEffect(() => {
    setRecentlyUsed(enhancedSearchEngine.getRecentlyUsedUtilities());
    setFavorites(enhancedSearchEngine.getFavoriteUtilities());
  }, []);
  
  return {
    query,
    results,
    suggestions,
    isLoading,
    recentlyUsed,
    favorites,
    performSearch,
    handleSuggestionSelect,
    toggleFavorite,
    clearHistory
  };
}