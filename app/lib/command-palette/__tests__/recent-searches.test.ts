import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RecentSearchesService, StorageProvider } from '../recent-searches';

// Mock storage provider
class MockStorageProvider implements StorageProvider {
  private store: Record<string, string> = {};
  
  getItem = vi.fn((key: string) => this.store[key] || null);
  setItem = vi.fn((key: string, value: string) => {
    this.store[key] = value;
  });
  removeItem = vi.fn((key: string) => {
    delete this.store[key];
  });
  
  clear() {
    this.store = {};
  }
}

describe('RecentSearchesService', () => {
  const storageKey = 'testRecentSearches';
  let mockStorage: MockStorageProvider;
  let service: RecentSearchesService;
  
  beforeEach(() => {
    // Create a new mock storage
    mockStorage = new MockStorageProvider();
    
    // Create a new service instance with mock storage
    service = new RecentSearchesService(storageKey, 5, mockStorage);
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    mockStorage.clear();
  });
  
  it('should return empty array when no recent searches exist', () => {
    const searches = service.getRecentSearches();
    expect(searches).toEqual([]);
    expect(mockStorage.getItem).toHaveBeenCalledWith(storageKey);
  });
  
  it('should add a search query to recent searches', () => {
    const query = 'test query';
    const searches = service.addRecentSearch(query);
    
    expect(searches).toEqual([query]);
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      storageKey,
      JSON.stringify([query])
    );
  });
  
  it('should not add empty queries', () => {
    service.addRecentSearch('test query');
    const searches = service.addRecentSearch('');
    
    expect(searches).toEqual(['test query']);
    expect(mockStorage.setItem).toHaveBeenCalledTimes(1);
  });
  
  it('should limit recent searches to maxItems', () => {
    // Add more than maxItems searches
    service.addRecentSearch('query1');
    service.addRecentSearch('query2');
    service.addRecentSearch('query3');
    service.addRecentSearch('query4');
    service.addRecentSearch('query5');
    const searches = service.addRecentSearch('query6');
    
    expect(searches.length).toBe(5);
    expect(searches).toEqual(['query6', 'query5', 'query4', 'query3', 'query2']);
    expect(searches).not.toContain('query1');
  });
  
  it('should move existing query to the top when added again', () => {
    service.addRecentSearch('query1');
    service.addRecentSearch('query2');
    service.addRecentSearch('query3');
    const searches = service.addRecentSearch('query1');
    
    expect(searches).toEqual(['query1', 'query3', 'query2']);
  });
  
  it('should be case insensitive when checking for duplicates', () => {
    service.addRecentSearch('Test Query');
    const searches = service.addRecentSearch('test query');
    
    expect(searches).toEqual(['test query']);
    expect(searches.length).toBe(1);
  });
  
  it('should clear all recent searches', () => {
    service.addRecentSearch('query1');
    service.addRecentSearch('query2');
    
    service.clearRecentSearches();
    
    const searches = service.getRecentSearches();
    expect(searches).toEqual([]);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(storageKey);
  });
  
  it('should remove a specific search query', () => {
    service.addRecentSearch('query1');
    service.addRecentSearch('query2');
    service.addRecentSearch('query3');
    
    const searches = service.removeRecentSearch('query2');
    
    expect(searches).toEqual(['query3', 'query1']);
    expect(searches).not.toContain('query2');
  });
  
  it('should handle storage errors gracefully', () => {
    // Mock getItem to throw an error
    mockStorage.getItem.mockImplementationOnce(() => {
      throw new Error('Storage error');
    });
    
    // Should return empty array on error
    const searches = service.getRecentSearches();
    expect(searches).toEqual([]);
    
    // Mock setItem to throw an error
    mockStorage.setItem.mockImplementationOnce(() => {
      throw new Error('Storage error');
    });
    
    // Should return current searches on error
    const updatedSearches = service.addRecentSearch('test');
    expect(updatedSearches).toEqual([]);
  });
});