import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  toolId: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'badge';
  className?: string;
  showTooltip?: boolean;
  animated?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  toolId,
  size = 'md',
  variant = 'default',
  className = '',
  showTooltip = true,
  animated = true
}) => {
  const { checkIsFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);
  
  const isFavorited = checkIsFavorite(toolId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (animated) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
    
    toggleFavorite(toolId);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'relative transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50';
    
    switch (variant) {
      case 'minimal':
        return `${baseClasses} p-1 rounded-full hover:bg-gray-800/50`;
      case 'badge':
        return `${baseClasses} px-2 py-1 rounded-full bg-gray-800/50 hover:bg-gray-700/50 flex items-center space-x-1`;
      default:
        return `${baseClasses} p-2 rounded-full hover:bg-gray-800/50 hover:scale-110`;
    }
  };

  const getStarClasses = () => {
    const sizeClasses = getSizeClasses();
    const colorClasses = isFavorited 
      ? 'text-yellow-400 fill-current' 
      : 'text-gray-400 hover:text-yellow-400';
    const animationClasses = animated && isAnimating 
      ? 'animate-pulse scale-125' 
      : '';
    
    return `${sizeClasses} ${colorClasses} ${animationClasses} transition-all duration-200`;
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
        className={`${getButtonClasses()} ${className}`}
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        {variant === 'badge' ? (
          <>
            <Star className={getStarClasses()} />
            <span className="text-xs text-gray-300">
              {isFavorited ? 'Favorited' : 'Favorite'}
            </span>
          </>
        ) : (
          <Star className={getStarClasses()} />
        )}
        
        {/* Animated sparkle effect */}
        {animated && isAnimating && isFavorited && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute top-0 right-0 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-75"></div>
            <div className="absolute bottom-0 left-0 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-150"></div>
            <div className="absolute bottom-0 right-0 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-200"></div>
          </div>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && showTooltipState && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10 border border-gray-700">
          {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default FavoriteButton;