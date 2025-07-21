import type { CategoryDefinition, CategoryType } from './types';

/**
 * Category definitions with color schemes and icons
 * Colors are based on Tailwind CSS classes for consistency
 */
export const categories: Record<CategoryType, CategoryDefinition> = {
  text: {
    id: 'text',
    name: 'Text Tools',
    description: 'Text manipulation, formatting, and conversion utilities',
    color: 'blue', // Blue variants for text tools
    icon: 'Type'
  },
  developer: {
    id: 'developer',
    name: 'Developer Tools',
    description: 'Code formatting, encoding, and development utilities',
    color: 'green', // Green variants for developer tools
    icon: 'Code2'
  },
  image: {
    id: 'image',
    name: 'Image Tools',
    description: 'Image processing, conversion, and optimization tools',
    color: 'purple', // Purple variants for image tools
    icon: 'Image'
  },
  productivity: {
    id: 'productivity',
    name: 'Productivity Tools',
    description: 'Calculators, converters, and productivity utilities',
    color: 'orange', // Orange variants for productivity
    icon: 'Calculator'
  },
  fun: {
    id: 'fun',
    name: 'Fun Tools',
    description: 'Entertainment, games, and novelty utilities',
    color: 'pink', // Pink variants for fun tools
    icon: 'Smile'
  }
};

/**
 * Get category-specific Tailwind CSS classes for styling
 */
export function getCategoryColorClasses(category: CategoryType) {
  const colorMap = {
    text: {
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      accent: 'text-blue-600 dark:text-blue-400',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-900'
    },
    developer: {
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      accent: 'text-green-600 dark:text-green-400',
      hover: 'hover:bg-green-100 dark:hover:bg-green-900'
    },
    image: {
      bg: 'bg-purple-50 dark:bg-purple-950',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-700 dark:text-purple-300',
      accent: 'text-purple-600 dark:text-purple-400',
      hover: 'hover:bg-purple-100 dark:hover:bg-purple-900'
    },
    productivity: {
      bg: 'bg-orange-50 dark:bg-orange-950',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-700 dark:text-orange-300',
      accent: 'text-orange-600 dark:text-orange-400',
      hover: 'hover:bg-orange-100 dark:hover:bg-orange-900'
    },
    fun: {
      bg: 'bg-pink-50 dark:bg-pink-950',
      border: 'border-pink-200 dark:border-pink-800',
      text: 'text-pink-700 dark:text-pink-300',
      accent: 'text-pink-600 dark:text-pink-400',
      hover: 'hover:bg-pink-100 dark:hover:bg-pink-900'
    }
  };

  return colorMap[category];
}