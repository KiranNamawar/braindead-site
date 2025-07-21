/**
 * Core type definitions for the utility registry system
 */

export type CategoryType = 'text' | 'developer' | 'image' | 'productivity' | 'fun';

export interface UtilityDefinition {
  id: string;
  name: string;
  description: string;
  category: CategoryType;
  keywords: string[];
  route: string;
  icon?: string;
  featured?: boolean;
}

export interface CategoryDefinition {
  id: CategoryType;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface UtilityRegistry {
  categories: Record<CategoryType, CategoryDefinition>;
  utilities: UtilityDefinition[];
  featured: string[];
}

export interface SearchResult {
  utility: UtilityDefinition;
  relevanceScore: number;
  matchedFields: string[];
}

export interface SearchSuggestion {
  type: 'utility' | 'category' | 'keyword';
  text: string;
  utility?: UtilityDefinition;
}

export interface UserPreferences {
  recentlyUsed: {
    utilityId: string;
    timestamp: number;
  }[];
  favorites: string[];
  theme: 'light' | 'dark' | 'system';
  searchHistory: string[];
}

// Export additional interfaces from interfaces.ts
export * from './interfaces';