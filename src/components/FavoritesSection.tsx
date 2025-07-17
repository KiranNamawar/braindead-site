import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ArrowRight, Grip, X, Plus } from 'lucide-react';
import { getAllTools } from '../utils/toolRegistry';
import { getFavorites, addFavorite, removeFavorite, storageManager } from '../utils/storage';
import { Tool } from '../types';

interface FavoritesSectionProps {
  className?: string;
  showTitle?: boolean;
  maxItems?: number;
  compact?: boolean;
}

const FavoritesSection: React.FC<FavoritesSectionProps> = ({
  className = '',
  showTitle = true,
  maxItems = 6,
  compact = false
}) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteTools, setFavoriteTools] = useState<Tool[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadFavorites();
    };

    window.addEventListener('braindead-storage-change', handleStorageChange);
    return () => window.removeEventListener('braindead-storage-change', handleStorageChange);
  }, []);

  const loadFavorites = useCallback(() => {
    const favoriteIds = getFavorites();
    setFavorites(favoriteIds);
    
    const allTools = getAllTools();
    const tools = favoriteIds
      .map(id => allTools.find(tool => tool.id === id))
      .filter((tool): tool is Tool => tool !== undefined)
      .slice(0, maxItems);
    
    setFavoriteTools(tools);
  }, [maxItems]);

  const handleToggleFavorite = useCallback((toolId: string) => {
    if (favorites.includes(toolId)) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
    loadFavorites();
  }, [favorites, loadFavorites]);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setIsDragging(true);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newFavorites = [...favorites];
    const draggedItem = newFavorites[draggedIndex];
    
    // Remove dragged item
    newFavorites.splice(draggedIndex, 1);
    
    // Insert at new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newFavorites.splice(insertIndex, 0, draggedItem);
    
    // Update storage
    storageManager.reorderFavorites(newFavorites);
    loadFavorites();
  }, [draggedIndex, favorites, loadFavorites]);

  const getAvailableTools = () => {
    const allTools = getAllTools();
    return allTools.filter(tool => !favorites.includes(tool.id));
  };

  if (favoriteTools.length === 0 && !showAddModal) {
    return (
      <div className={`${className}`}>
        {showTitle && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Your Favorites</h2>
            </div>
          </div>
        )}
        
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 text-center">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No favorites yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Start building your collection of go-to tools. Click the star on any tool to add it to your favorites.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl font-semibold text-white hover:from-yellow-400 hover:to-orange-500 transition-all duration-300 hover:scale-105 flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Favorite</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-current" />
            </div>
            <h2 className="text-2xl font-bold text-white">Your Favorites</h2>
            <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
              {favoriteTools.length}
            </span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add More</span>
          </button>
        </div>
      )}

      {/* Favorites Grid */}
      <div className={`grid gap-4 ${
        compact 
          ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {favoriteTools.map((tool, index) => (
          <div
            key={tool.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, index)}
            className={`group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-all duration-300 cursor-move ${
              isDragging && draggedIndex === index ? 'opacity-50 scale-95' : 'hover:scale-105'
            } ${compact ? 'p-3' : 'p-4'}`}
          >
            {/* Drag Handle */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Grip className="w-4 h-4 text-gray-500" />
            </div>

            {/* Remove Favorite Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                handleToggleFavorite(tool.id);
              }}
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 w-6 h-6 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>

            <Link to={tool.path} className="block">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.gradient.replace('linear-gradient(135deg, ', '').replace(')', '')} flex items-center justify-center`}>
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-white truncate ${compact ? 'text-sm' : 'text-base'}`}>
                    {tool.name}
                  </h3>
                  {!compact && (
                    <p className="text-gray-400 text-xs truncate">
                      {tool.category.replace('-', ' ')}
                    </p>
                  )}
                </div>
              </div>

              {!compact && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {tool.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-500">Favorite</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Add Favorites Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add to Favorites</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-400 mt-2">
                Choose tools to add to your favorites for quick access
              </p>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAvailableTools().map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      handleToggleFavorite(tool.id);
                    }}
                    className="flex items-center space-x-4 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.gradient.replace('linear-gradient(135deg, ', '').replace(')', '')} flex items-center justify-center`}>
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{tool.name}</h4>
                      <p className="text-gray-400 text-sm">{tool.description}</p>
                    </div>
                    <Plus className="w-5 h-5 text-blue-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drag and Drop Instructions */}
      {favoriteTools.length > 1 && !compact && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            💡 Drag and drop to reorder your favorites
          </p>
        </div>
      )}
    </div>
  );
};

export default FavoritesSection;