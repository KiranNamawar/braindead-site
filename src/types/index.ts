// Shared types and interfaces for tool communication
export interface Tool {
  id: string;
  name: string;
  description: string;
  sarcasticQuote: string;
  path: string;
  icon: string;
  gradient: string;
  category: ToolCategory;
  features: string[];
  keywords: string[];
  shortcuts: string[];
  isNew?: boolean;
  isPremium: false; // Always false - everything is free
  estimatedTimeSaved: number; // in minutes
}

export enum ToolCategory {
  EVERYDAY_LIFE = 'everyday-life',
  TEXT_WRITING = 'text-writing',
  CREATIVE_DESIGN = 'creative-design',
  TIME_PRODUCTIVITY = 'time-productivity',
  DEVELOPER = 'developer',
  NUMBER_CONVERSION = 'number-conversion',
  CALCULATOR = 'calculator',
  UTILITY = 'utility'
}

export interface ToolUsage {
  toolId: string;
  lastUsed: Date;
  usageCount: number;
  timeSpent: number;
  category: ToolCategory;
}

export interface UserPreferences {
  favorites: string[];
  recentTools: ToolUsage[];
  searchHistory: string[];
  keyboardShortcutsEnabled: boolean;
  animationsEnabled: boolean;
  compactMode: boolean;
  theme: 'light' | 'dark' | 'auto';
  lastVisit: Date;
  onboardingCompleted: boolean;
}

export interface UsageAnalytics {
  totalToolsUsed: number;
  totalTimeSaved: number;
  mostUsedTool: string;
  productivityScore: number;
  sessionsCount: number;
  averageSessionDuration: number;
  toolCategoryUsage: Record<ToolCategory, number>;
}

export interface AppState {
  user: {
    favorites: string[];
    recentTools: ToolUsage[];
    preferences: UserPreferences;
    analytics: UsageAnalytics;
  };
  ui: {
    searchModal: boolean;
    theme: 'dark' | 'light';
    animations: boolean;
    sidebarOpen: boolean;
  };
  tools: {
    available: Tool[];
    categories: ToolCategory[];
    featured: string[];
  };
}

export interface SearchResult {
  tool: Tool;
  matchScore: number;
  matchedFields: string[];
}

export interface ToolIntegration {
  sourceToolId: string;
  targetToolId: string;
  dataTransform: (input: any) => any;
  compatibilityCheck: (data: any) => boolean;
  description: string;
}

export interface SharedClipboard {
  data: any;
  sourceToolId: string;
  timestamp: Date;
  dataType: 'text' | 'number' | 'json' | 'binary' | 'image';
  format?: string;
}

export interface ToolExportData {
  toolId: string;
  data: any;
  format: 'json' | 'csv' | 'txt' | 'xml' | 'pdf';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: string;
  description: string;
  toolId?: string;
}

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}