import { renderHook, act } from '@testing-library/react';
import { useSearch } from './useSearch';
import { searchEngine } from '~/lib/search';

// Mock the search engine
jest.mock('~/lib/search', () => ({
  searchEngine: {
    search: jest.fn(),
    getSuggestions: jest.fn(),
    addToRecentlyUsed: jest.fn(),
    toggleFavorite: jest.fn(),
    getRecentlyUsedUtilities: jest.fn(),
    getFavoriteUtilities: jest.fn(),
    clearHistory: jest.fn()
  }
}));

describe('useSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    
    // Mock search results
    (searchEngine.search as jest.Mock).mockReturnValue([
      {
        utility: {
          id: 'json-formatter',
          name: 'JSON Formatter',
          description: 'Format JSON',
          category: 'developer',
          keywords: ['json'],
          route: '/tools/json-formatter'
        },
        relevanceScore: 1.0,
        matchedFields: ['name']
      }
    ]);
    
    // Mock suggestions
    (searchEngine.getSuggestions as jest.Mock).mockReturnValue([
      {
        type: 'utility',
        text: 'JSON Formatter',
        utility: {
          id: 'json-formatter',
          name: 'JSON Formatter',
          description: 'Format JSON',
          category: 'developer',
          keywords: ['json'],
          route: '/tools/json-formatter'
        }
      }
    ]);
    
    // Mock recently used and favorites
    (searchEngine.getRecentlyUsedUtilities as jest.Mock).mockReturnValue([]);
    (searchEngine.getFavoriteUtilities as jest.Mock).mockReturnValue([]);
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('initializes with empty state', () => {
    const { result } = renderHook(() => useSearch());
    
    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
  
  test('performs search with debouncing', async () => {
    const { result } = renderHook(() => useSearch());
    
    act(() => {
      result.current.performSearch('json');
    });
    
    // Should be loading
    expect(result.current.isLoading).toBe(true);
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(150);
    });
    
    // Should have results and suggestions
    expect(searchEngine.search).toHaveBeenCalledWith('json');
    expect(searchEngine.getSuggestions).toHaveBeenCalledWith('json');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.results).toHaveLength(1);
    expect(result.current.suggestions).toHaveLength(1);
  });
  
  test('handles suggestion selection for utility', () => {
    const { result } = renderHook(() => useSearch());
    
    const suggestion = {
      type: 'utility' as const,
      text: 'JSON Formatter',
      utility: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        description: 'Format JSON',
        category: 'developer' as const,
        keywords: ['json'],
        route: '/tools/json-formatter'
      }
    };
    
    act(() => {
      result.current.handleSuggestionSelect(suggestion);
    });
    
    // Should add to recently used
    expect(searchEngine.addToRecentlyUsed).toHaveBeenCalledWith('json-formatter');
    
    // Should update query and perform search
    expect(result.current.query).toBe('JSON Formatter');
  });
  
  test('handles suggestion selection for keyword', () => {
    const { result } = renderHook(() => useSearch());
    
    const suggestion = {
      type: 'keyword' as const,
      text: 'json'
    };
    
    act(() => {
      result.current.handleSuggestionSelect(suggestion);
    });
    
    // Should not add to recently used
    expect(searchEngine.addToRecentlyUsed).not.toHaveBeenCalled();
    
    // Should update query and perform search
    expect(result.current.query).toBe('json');
  });
  
  test('toggles favorite status', () => {
    const { result } = renderHook(() => useSearch());
    
    act(() => {
      result.current.toggleFavorite('json-formatter');
    });
    
    expect(searchEngine.toggleFavorite).toHaveBeenCalledWith('json-formatter');
    expect(searchEngine.getFavoriteUtilities).toHaveBeenCalled();
  });
  
  test('clears history', () => {
    const { result } = renderHook(() => useSearch());
    
    act(() => {
      result.current.clearHistory();
    });
    
    expect(searchEngine.clearHistory).toHaveBeenCalled();
    expect(result.current.recentlyUsed).toEqual([]);
    expect(result.current.favorites).toEqual([]);
  });
});