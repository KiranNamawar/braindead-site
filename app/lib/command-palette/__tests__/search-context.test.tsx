import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createContext, useContext } from 'react';
import { SearchProvider, useSearch } from '../search-context';
import { Utility } from '../../types';

// Mock React hooks
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useState: vi.fn().mockImplementation((initialValue) => [initialValue, vi.fn()]),
    useEffect: vi.fn().mockImplementation((fn) => fn()),
    useContext: vi.fn(),
    createContext: vi.fn().mockReturnValue({
      Provider: ({ children }) => children,
    }),
  };
});

// Mock utilities for testing
const mockUtilities: Utility[] = [
  {
    id: "test-tool-1",
    name: "Test Tool One",
    description: "This is the first test tool",
    category: "Test Category",
    tags: ["test", "one", "first"],
    path: "/test/one",
  },
  {
    id: "test-tool-2",
    name: "Test Tool Two",
    description: "This is the second test tool",
    category: "Test Category",
    tags: ["test", "two", "second"],
    path: "/test/two",
  },
  {
    id: "another-tool",
    name: "Another Tool",
    description: "This is another test tool",
    category: "Another Category",
    tags: ["another", "test"],
    path: "/another",
  },
];

describe('SearchContext', () => {
  it('should create a context with the correct properties', () => {
    // Check that the SearchContext is created correctly
    expect(SearchProvider).toBeDefined();
    expect(useSearch).toBeDefined();
  });
  
  it('should initialize with default values', () => {
    // Mock useState to capture initial values
    const stateMock = vi.spyOn(require('react'), 'useState');
    
    // Reset mock to capture new calls
    stateMock.mockClear();
    
    // Call SearchProvider to trigger useState calls
    const provider = new SearchProvider({ children: null });
    
    // Check that useState was called with the expected initial values
    expect(stateMock).toHaveBeenCalledWith("");  // query
    expect(stateMock).toHaveBeenCalledWith([]); // results
    expect(stateMock).toHaveBeenCalledWith(false); // isOpen
  });
  
  it('should throw an error when useSearch is used outside of SearchProvider', () => {
    // Mock useContext to return undefined (simulating use outside of Provider)
    const useContextMock = vi.spyOn(require('react'),
      
      // Initial state
      expect(result.current.query).toBe('')
      
      // Update query
      act(() => {
        result.current.setQuery('test');
      });
      
      // Check that query was updated
      expect(result.current.query).toBe('test');
    });
    
    it('should update results when query changes', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: ({ children }) => (
          <SearchProvider utilities={mockUtilities}>{children}</SearchProvider>
        ),
      });
      
      // Initial state
      expect(result.current.results).toEqual([]);
      
      // Update query to match some utilities
      act(() => {
        result.current.setQuery('test');
      });
      
      // Check that results were updated
      expect(result.current.results.length).toBeGreaterThan(0);
      expect(result.current.results.some(item => item.id === 'test-tool-1')).toBe(true);
      expect(result.current.results.some(item => item.id === 'test-tool-2')).toBe(true);
    });
    
    it('should update isOpen state when setIsOpen is called', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: ({ children }) => (
          <SearchProvider utilities={mockUtilities}>{children}</SearchProvider>
        ),
      });
      
      // Initial state
      expect(result.current.isOpen).toBe(false);
      
      // Open the command palette
      act(() => {
        result.current.setIsOpen(true);
      });
      
      // Check that isOpen was updated
      expect(result.current.isOpen).toBe(true);
      
      // Close the command palette
      act(() => {
        result.current.setIsOpen(false);
      });
      
      // Check that isOpen was updated
      expect(result.current.isOpen).toBe(false);
    });
    
    it('should return empty results when query is empty', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: ({ children }) => (
          <SearchProvider utilities={mockUtilities}>{children}</SearchProvider>
        ),
      });
      
      // Set query to empty string
      act(() => {
        result.current.setQuery('');
      });
      
      // Check that results are empty
      expect(result.current.results).toEqual([]);
    });
    
    it('should filter results based on query', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: ({ children }) => (
          <SearchProvider utilities={mockUtilities}>{children}</SearchProvider>
        ),
      });
      
      // Search for "one"
      act(() => {
        result.current.setQuery('one');
      });
      
      // Check that only the first tool is returned
      expect(result.current.results.length).toBe(1);
      expect(result.current.results[0].id).toBe('test-tool-1');
      
      // Search for "another"
      act(() => {
        result.current.setQuery('another');
      });
      
      // Check that only the third tool is returned
      expect(result.current.results.length).toBe(1);
      expect(result.current.results[0].id).toBe('another-tool');
    });
  });
});