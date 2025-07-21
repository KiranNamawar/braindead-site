import Fuse from "fuse.js";
import { Utility } from "../types";

/**
 * Options for configuring the fuzzy search
 */
export interface SearchOptions {
  /** Keys to search in */
  keys?: (keyof Utility)[];
  
  /** Threshold for fuzzy matching (0-1, lower is more strict) */
  threshold?: number;
  
  /** Whether to include score in results */
  includeScore?: boolean;
  
  /** Whether to sort results by score */
  shouldSort?: boolean;
  
  /** Minimum length of query before searching */
  minMatchCharLength?: number;
}

/**
 * Default search options
 */
const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  keys: ["name", "description", "tags", "category"],
  threshold: 0.3,
  includeScore: true,
  shouldSort: true,
  minMatchCharLength: 2,
};

/**
 * Search result type with score
 */
export interface SearchResult {
  /** The matched utility */
  item: Utility;
  
  /** Match score (lower is better) */
  score?: number;
  
  /** Match indices */
  matches?: readonly Fuse.FuseResultMatch[];
}

/**
 * Service for performing fuzzy searches on utilities
 */
export class SearchService {
  private fuse: Fuse<Utility>;
  private options: SearchOptions;
  
  /**
   * Create a new SearchService
   * @param utilities The utilities to search
   * @param options Search configuration options
   */
  constructor(utilities: Utility[], options: SearchOptions = DEFAULT_SEARCH_OPTIONS) {
    this.options = { ...DEFAULT_SEARCH_OPTIONS, ...options };
    this.fuse = new Fuse(utilities, this.options as Fuse.IFuseOptions<Utility>);
  }
  
  /**
   * Search for utilities matching the query
   * @param query The search query
   * @returns Array of matching utilities
   */
  search(query: string): Utility[] {
    if (!query || query.trim().length < (this.options.minMatchCharLength || 2)) {
      return [];
    }
    
    const results = this.fuse.search(query);
    return results.map(result => result.item);
  }
  
  /**
   * Search for utilities matching the query with scores
   * @param query The search query
   * @returns Array of search results with scores
   */
  searchWithScores(query: string): SearchResult[] {
    if (!query || query.trim().length < (this.options.minMatchCharLength || 2)) {
      return [];
    }
    
    return this.fuse.search(query);
  }
  
  /**
   * Update the utilities to search
   * @param utilities The new utilities to search
   */
  updateUtilities(utilities: Utility[]): void {
    // Create a new Fuse instance with the updated utilities
    this.fuse = new Fuse(utilities, this.options as Fuse.IFuseOptions<Utility>);
  }
  
  /**
   * Update the search options
   * @param options The new search options
   */
  updateOptions(options: SearchOptions): void {
    // Update options and recreate Fuse instance
    this.options = { ...this.options, ...options };
    this.fuse = new Fuse(this.fuse.getIndex().docs, this.options as Fuse.IFuseOptions<Utility>);
  }
}