import React from 'react';
import { SearchBar } from './SearchBar';
import { useSearch } from '~/hooks/useSearch';
import { Card } from '~/components/ui/card';

/**
 * Demo component to showcase search functionality
 */
export function SearchDemo() {
  const {
    query,
    results,
    suggestions,
    isLoading,
    recentlyUsed,
    favorites,
    performSearch,
    handleSuggestionSelect,
    toggleFavorite
  } = useSearch();
  
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Search Utilities</h2>
        <p className="text-muted-foreground">
          Search for utilities by name, description, or keywords
        </p>
      </div>
      
      <SearchBar
        onSearch={performSearch}
        onSuggestionSelect={handleSuggestionSelect}
        suggestions={suggestions}
        isLoading={isLoading}
        placeholder="Search for utilities..."
        className="w-full"
      />
      
      {/* Search results */}
      {query && results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Search Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.map(result => (
              <Card key={result.utility.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{result.utility.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {result.utility.description}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5">
                        {result.utility.category}
                      </span>
                      <span className="ml-2">
                        Match: {result.matchedFields.join(', ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(result.utility.id)}
                    className="text-yellow-500 hover:text-yellow-600"
                    aria-label={favorites.some(f => f.id === result.utility.id) 
                      ? "Remove from favorites" 
                      : "Add to favorites"
                    }
                  >
                    {favorites.some(f => f.id === result.utility.id) 
                      ? "★" 
                      : "☆"
                    }
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* No results message */}
      {query && results.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-lg font-medium">No results found</p>
          <p className="text-muted-foreground">
            Try a different search term or browse categories
          </p>
        </div>
      )}
      
      {/* Recently used */}
      {!query && recentlyUsed.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Recently Used</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentlyUsed.map(utility => (
              <Card key={utility.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{utility.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {utility.description}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(utility.id)}
                    className="text-yellow-500 hover:text-yellow-600"
                    aria-label={favorites.some(f => f.id === utility.id) 
                      ? "Remove from favorites" 
                      : "Add to favorites"
                    }
                  >
                    {favorites.some(f => f.id === utility.id) 
                      ? "★" 
                      : "☆"
                    }
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Favorites */}
      {!query && favorites.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Favorites</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map(utility => (
              <Card key={utility.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{utility.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {utility.description}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(utility.id)}
                    className="text-yellow-500 hover:text-yellow-600"
                    aria-label="Remove from favorites"
                  >
                    ★
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}