import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, Star, ArrowRight, Zap, Filter } from 'lucide-react';
import { getAllTools } from '../utils/toolRegistry';
import { searchTools, TOOL_SHORTCUTS } from '../utils/fuzzySearch';
import { addSearchHistory, getSearchHistory, getFavorites, getRecentTools, addRecentTool } from '../utils/storage';
import { Tool, ToolCategory } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  tool: Tool;
  matchScore: number;
  matchedFields: string[];
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tool[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchHistory, setSearchHistoryState] = useState<string[]>([]);
  const [favorites, setFavoritesState] = useState<string[]>([]);
  const [recentTools, setRecentToolsState] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      setSearchHistoryState(getSearchHistory());
      setFavoritesState(getFavorites());
      setRecentToolsState(getRecentTools());
      setQuery('');
      setSelectedIndex(0);
      setShowHistory(true);
      
      // Focus input after modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowHistory(true);
      setSelectedIndex(0);
      return;
    }

    setShowHistory(false);
    
    // Perform fuzzy search (includes shortcut handling)
    const allTools = getAllTools();
    let searchResults = searchTools(query, allTools);
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      searchResults = searchResults.filter(tool => tool.category === selectedCategory);
    }
    
    setResults(searchResults);
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (showHistory) {
            const maxIndex = Math.max(searchHistory.length - 1, 0);
            setSelectedIndex(prev => Math.min(prev + 1, maxIndex));
          } else {
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (showHistory && searchHistory.length > 0) {
            const selectedQuery = searchHistory[selectedIndex];
            setQuery(selectedQuery);
          } else if (results.length > 0) {
            handleToolSelect(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, showHistory, searchHistory, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex]);



  const handleToolSelect = useCallback((tool: Tool) => {
    // Add to search history
    if (query.trim()) {
      addSearchHistory(query);
    }
    
    // Add to recent tools
    addRecentTool(tool.id, tool.category);
    
    // Navigate to tool
    navigate(tool.path);
    onClose();
  }, [query, navigate, onClose]);

  const handleHistorySelect = useCallback((historyQuery: string) => {
    setQuery(historyQuery);
    setShowHistory(false);
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistoryState([]);
    // Also clear from storage
    const { clearSearchHistory } = require('../utils/storage');
    clearSearchHistory();
  }, []);

  const getDisplayItems = () => {
    if (showHistory) {
      return searchHistory.slice(0, 8);
    }
    return results.slice(0, 8);
  };

  const getQuickAccessTools = () => {
    const allTools = getAllTools();
    const favoriteTools = favorites
      .map(id => allTools.find(t => t.id === id))
      .filter((tool): tool is Tool => tool !== undefined)
      .slice(0, 4);
    
    const recentToolsData = recentTools
      .map(usage => allTools.find(t => t.id === usage.toolId))
      .filter((tool): tool is Tool => tool !== undefined)
      .slice(0, 4);
    
    return { favoriteTools, recentToolsData };
  };

  if (!isOpen) return null;

  const displayItems = getDisplayItems();
  const { favoriteTools, recentToolsData } = getQuickAccessTools();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Search Input */}
        <div className="p-6 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools... (try 'calc', 'json', 'color', 'hash', 'time')"
              className="w-full pl-12 pr-12 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Keyboard hint */}
          <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
            <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+K</kbd>
              <span>to open</span>
            </div>
          </div>

          {/* Category Filters */}
          {!showHistory && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400 font-medium">Filter by category</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                {Object.values(ToolCategory).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-96 overflow-y-auto">
          {showHistory && searchHistory.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400 font-medium">Recent Searches</span>
                </div>
                <button
                  onClick={clearSearchHistory}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
              {displayItems.map((item, index) => (
                <button
                  key={`history-${index}`}
                  onClick={() => handleHistorySelect(item)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    index === selectedIndex
                      ? 'bg-blue-600/20 border border-blue-500/30'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{item}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!showHistory && results.length > 0 && (
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400 font-medium">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
              </div>
              {displayItems.map((tool, index) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool)}
                  className={`w-full text-left px-4 py-4 rounded-lg transition-all duration-200 ${
                    index === selectedIndex
                      ? 'bg-blue-600/20 border border-blue-500/30 scale-[1.02]'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.gradient.replace('linear-gradient(135deg, ', '').replace(')', '')} flex items-center justify-center`}>
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-semibold">{tool.name}</h3>
                        {favorites.includes(tool.id) && (
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{tool.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          {tool.category.replace('-', ' ')}
                        </span>
                        {tool.shortcuts.length > 0 && (
                          <span className="text-xs text-blue-400">
                            Try: {tool.shortcuts[0]}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {!showHistory && query && results.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No tools found</h3>
              <p className="text-gray-400 text-sm mb-4">
                Try searching for "calc", "json", "color", or browse all tools
              </p>
              <button
                onClick={() => {
                  setQuery('');
                  setShowHistory(true);
                }}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Quick Access Section */}
          {showHistory && (favoriteTools.length > 0 || recentToolsData.length > 0) && (
            <div className="border-t border-gray-700 p-4">
              {favoriteTools.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-400 font-medium">Favorites</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {favoriteTools.map((tool) => (
                      <button
                        key={`fav-${tool.id}`}
                        onClick={() => handleToolSelect(tool)}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.gradient.replace('linear-gradient(135deg, ', '').replace(')', '')} flex items-center justify-center`}>
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white text-sm font-medium">{tool.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {recentToolsData.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400 font-medium">Recently Used</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {recentToolsData.map((tool) => (
                      <button
                        key={`recent-${tool.id}`}
                        onClick={() => handleToolSelect(tool)}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.gradient.replace('linear-gradient(135deg, ', '').replace(')', '')} flex items-center justify-center`}>
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white text-sm font-medium">{tool.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;