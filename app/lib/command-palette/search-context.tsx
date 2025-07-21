import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { Utility } from "../types";
import { sampleUtilities } from "./data";
import { SearchService, SearchResult } from "./search-service";
import { RecentSearchesService } from "./recent-searches";

/**
 * Search context type definition
 */
interface SearchContextType {
  /** Current search query */
  query: string;
  
  /** Function to update the search query */
  setQuery: (query: string) => void;
  
  /** Search results based on the current query */
  results: Utility[];
  
  /** Search results with scores for highlighting */
  resultsWithScores: SearchResult[];
  
  /** Whether the command palette is open */
  isOpen: boolean;
  
  /** Function to toggle the command palette open state */
  setIsOpen: (isOpen: boolean) => void;
  
  /** Search service instance */
  searchService: SearchService;
  
  /** Recent searches */
  recentSearches: string[];
  
  /** Add a search query to recent searches */
  addRecentSearch: (query: string) => void;
  
  /** Remove a search query from recent searches */
  removeRecentSearch: (query: string) => void;
  
  /** Clear all recent searches */
  clearRecentSearches: () => void;
  
  /** Recently used utilities */
  recentUtilities: Utility[];
  
  /** Add a utility to recently used */
  addRecentUtility: (utility: Utility) => void;
}

/**
 * Context for the search functionality
 * Provides search state and methods to components
 */
export const SearchContext = createContext<SearchContextType | undefined>(undefined);

/**
 * Props for the SearchProvider component
 */
interface SearchProviderProps {
  /** Child components */
  children: ReactNode;
  
  /** Optional utilities data to use for search */
  utilities?: Utility[];
}

/**
 * Provider component for search functionality
 * Manages search state and provides context to children
 */
export function SearchProvider({ 
  children, 
  utilities = sampleUtilities 
}: SearchProviderProps) {
  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Utility[]>([]);
  const [resultsWithScores, setResultsWithScores] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Recent searches state
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentUtilities, setRecentUtilities] = useState<Utility[]>([]);
  
  // Create services
  const searchService = useMemo(() => new SearchService(utilities), [utilities]);
  const recentSearchesService = useMemo(() => new RecentSearchesService('recentSearches', 5), []);
  const recentUtilitiesService = useMemo(() => new RecentSearchesService('recentUtilities', 5), []);
  
  // Initialize recent searches from localStorage
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      setRecentSearches(recentSearchesService.getRecentSearches());
      
      // Get recent utility IDs
      const recentUtilityIds = recentUtilitiesService.getRecentSearches();
      
      // Find utilities by ID
      const recent = recentUtilityIds
        .map(id => utilities.find(util => util.id === id))
        .filter((util): util is Utility => util !== undefined);
      
      setRecentUtilities(recent);
    }
  }, [recentSearchesService, recentUtilitiesService, utilities]);
  
  // Update search results when query changes
  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchService.searchWithScores(query);
      setResultsWithScores(searchResults);
      setResults(searchResults.map(result => result.item));
    } else {
      setResultsWithScores([]);
      setResults([]);
    }
  }, [query, searchService]);
  
  // Add a search query to recent searches
  const addRecentSearch = (searchQuery: string) => {
    if (typeof window !== 'undefined' && searchQuery.trim()) {
      const updated = recentSearchesService.addRecentSearch(searchQuery);
      setRecentSearches(updated);
    }
  };
  
  // Remove a search query from recent searches
  const removeRecentSearch = (searchQuery: string) => {
    if (typeof window !== 'undefined') {
      const updated = recentSearchesService.removeRecentSearch(searchQuery);
      setRecentSearches(updated);
    }
  };
  
  // Clear all recent searches
  const clearRecentSearches = () => {
    if (typeof window !== 'undefined') {
      recentSearchesService.clearRecentSearches();
      setRecentSearches([]);
    }
  };
  
  // Add a utility to recently used
  const addRecentUtility = (utility: Utility) => {
    if (typeof window !== 'undefined') {
      const updated = recentUtilitiesService.addRecentSearch(utility.id);
      
      // Find utilities by ID
      const recent = updated
        .map(id => utilities.find(util => util.id === id))
        .filter((util): util is Utility => util !== undefined);
      
      setRecentUtilities(recent);
    }
  };
  
  // Context value
  const value = {
    query,
    setQuery,
    results,
    resultsWithScores,
    isOpen,
    setIsOpen,
    searchService,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    recentUtilities,
    addRecentUtility,
  };
  
  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

/**
 * Hook to use the search context
 * @returns The search context
 * @throws Error if used outside of a SearchProvider
 */
export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}