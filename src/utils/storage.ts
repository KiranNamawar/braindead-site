// Enhanced local storage management system for user preferences
import { UserPreferences, ToolUsage, UsageAnalytics, ToolCategory } from '../types';

interface StorageConfig {
  version: string;
  encryption: boolean;
  compression: boolean;
  maxSize: number; // in bytes
}

class StorageManager {
  private config: StorageConfig = {
    version: '1.0.0',
    encryption: false,
    compression: false,
    maxSize: 5 * 1024 * 1024 // 5MB
  };

  private storageKeys = {
    userPreferences: 'braindead-user-preferences',
    toolUsage: 'braindead-tool-usage',
    analytics: 'braindead-analytics',
    favorites: 'braindead-favorites',
    recentTools: 'braindead-recent-tools',
    searchHistory: 'braindead-search-history',
    sharedClipboard: 'braindead-shared-clipboard',
    toolConfigs: 'braindead-tool-configs',
    exportHistory: 'braindead-export-history',
    keyboardShortcuts: 'braindead-keyboard-shortcuts'
  };

  private defaultPreferences: UserPreferences = {
    favorites: [],
    recentTools: [],
    searchHistory: [],
    keyboardShortcutsEnabled: true,
    animationsEnabled: true,
    compactMode: false,
    theme: 'auto',
    lastVisit: new Date(),
    onboardingCompleted: false
  };

  private defaultAnalytics: UsageAnalytics = {
    totalToolsUsed: 0,
    totalTimeSaved: 0,
    mostUsedTool: '',
    productivityScore: 0,
    sessionsCount: 0,
    averageSessionDuration: 0,
    toolCategoryUsage: {
      [ToolCategory.EVERYDAY_LIFE]: 0,
      [ToolCategory.TEXT_WRITING]: 0,
      [ToolCategory.CREATIVE_DESIGN]: 0,
      [ToolCategory.TIME_PRODUCTIVITY]: 0,
      [ToolCategory.DEVELOPER]: 0,
      [ToolCategory.NUMBER_CONVERSION]: 0,
      [ToolCategory.CALCULATOR]: 0,
      [ToolCategory.UTILITY]: 0
    }
  };

  constructor() {
    this.initializeStorage();
    this.setupStorageEventListeners();
    this.performMaintenance();
  }

  private initializeStorage(): void {
    // Check if this is the first visit
    const preferences = this.getItem(this.storageKeys.userPreferences);
    if (!preferences) {
      this.setUserPreferences(this.defaultPreferences);
      this.setAnalytics(this.defaultAnalytics);
    }

    // Update last visit
    this.updateLastVisit();
  }

  private setupStorageEventListeners(): void {
    // Listen for storage changes from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.startsWith('braindead-')) {
        this.handleStorageChange(event);
      }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      this.performMaintenance();
    });
  }

  private handleStorageChange(event: StorageEvent): void {
    // Handle cross-tab synchronization
    console.log('Storage changed in another tab:', event.key);
    
    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('braindead-storage-change', {
      detail: {
        key: event.key,
        oldValue: event.oldValue,
        newValue: event.newValue
      }
    }));
  }

  private performMaintenance(): void {
    try {
      // Clean up old search history (keep only last 50)
      const searchHistory = this.getSearchHistory();
      if (searchHistory.length > 50) {
        this.setSearchHistory(searchHistory.slice(-50));
      }

      // Clean up old recent tools (keep only last 20)
      const recentTools = this.getRecentTools();
      if (recentTools.length > 20) {
        this.setRecentTools(recentTools.slice(-20));
      }

      // Remove tools not used in the last 30 days from recent
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const filteredRecentTools = recentTools.filter(tool => 
        new Date(tool.lastUsed) > thirtyDaysAgo
      );
      
      if (filteredRecentTools.length !== recentTools.length) {
        this.setRecentTools(filteredRecentTools);
      }

      // Check storage usage
      this.checkStorageUsage();
    } catch (error) {
      console.warn('Storage maintenance failed:', error);
    }
  }

  private checkStorageUsage(): void {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (key.startsWith('braindead-')) {
          totalSize += localStorage[key].length;
        }
      }

      if (totalSize > this.config.maxSize) {
        console.warn('Storage usage exceeds limit, performing cleanup');
        this.performEmergencyCleanup();
      }
    } catch (error) {
      console.warn('Failed to check storage usage:', error);
    }
  }

  private performEmergencyCleanup(): void {
    // Remove oldest search history entries
    this.setSearchHistory([]);
    
    // Keep only 10 most recent tools
    const recentTools = this.getRecentTools();
    this.setRecentTools(recentTools.slice(-10));
    
    // Clear export history
    this.clearExportHistory();
  }

  private setItem<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify({
        data: value,
        timestamp: new Date().toISOString(),
        version: this.config.version
      });

      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Failed to set storage item ${key}:`, error);
      
      // Try emergency cleanup and retry once
      if (error instanceof DOMException && error.code === 22) {
        this.performEmergencyCleanup();
        try {
          localStorage.setItem(key, JSON.stringify({ data: value }));
        } catch (retryError) {
          console.error(`Failed to set storage item ${key} after cleanup:`, retryError);
        }
      }
    }
  }

  private getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue || null;

      const parsed = JSON.parse(item);
      
      // Handle legacy format (direct data without wrapper)
      if (parsed.data !== undefined) {
        return parsed.data;
      } else {
        return parsed;
      }
    } catch (error) {
      console.warn(`Failed to get storage item ${key}:`, error);
      return defaultValue || null;
    }
  }

  // User Preferences Management
  public getUserPreferences(): UserPreferences {
    return this.getItem(this.storageKeys.userPreferences, this.defaultPreferences)!;
  }

  public setUserPreferences(preferences: UserPreferences): void {
    this.setItem(this.storageKeys.userPreferences, preferences);
  }

  public updateUserPreferences(updates: Partial<UserPreferences>): void {
    const current = this.getUserPreferences();
    this.setUserPreferences({ ...current, ...updates });
  }

  // Favorites Management
  public getFavorites(): string[] {
    const preferences = this.getUserPreferences();
    return preferences.favorites;
  }

  public addFavorite(toolId: string): void {
    const preferences = this.getUserPreferences();
    if (!preferences.favorites.includes(toolId)) {
      preferences.favorites.push(toolId);
      this.setUserPreferences(preferences);
    }
  }

  public removeFavorite(toolId: string): void {
    const preferences = this.getUserPreferences();
    preferences.favorites = preferences.favorites.filter(id => id !== toolId);
    this.setUserPreferences(preferences);
  }

  public isFavorite(toolId: string): boolean {
    return this.getFavorites().includes(toolId);
  }

  public reorderFavorites(newOrder: string[]): void {
    const preferences = this.getUserPreferences();
    preferences.favorites = newOrder;
    this.setUserPreferences(preferences);
  }

  // Recent Tools Management
  public getRecentTools(): ToolUsage[] {
    const preferences = this.getUserPreferences();
    return preferences.recentTools.sort((a, b) => 
      new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
    );
  }

  public addRecentTool(toolId: string, category: ToolCategory, timeSpent: number = 0): void {
    const preferences = this.getUserPreferences();
    const existingIndex = preferences.recentTools.findIndex(tool => tool.toolId === toolId);
    
    if (existingIndex >= 0) {
      // Update existing entry
      preferences.recentTools[existingIndex] = {
        ...preferences.recentTools[existingIndex],
        lastUsed: new Date(),
        usageCount: preferences.recentTools[existingIndex].usageCount + 1,
        timeSpent: preferences.recentTools[existingIndex].timeSpent + timeSpent
      };
    } else {
      // Add new entry
      preferences.recentTools.push({
        toolId,
        lastUsed: new Date(),
        usageCount: 1,
        timeSpent,
        category
      });
    }

    this.setUserPreferences(preferences);
    this.updateAnalytics(toolId, category, timeSpent);
  }

  public setRecentTools(recentTools: ToolUsage[]): void {
    const preferences = this.getUserPreferences();
    preferences.recentTools = recentTools;
    this.setUserPreferences(preferences);
  }

  // Search History Management
  public getSearchHistory(): string[] {
    const preferences = this.getUserPreferences();
    return preferences.searchHistory;
  }

  public addSearchHistory(query: string): void {
    if (!query.trim()) return;
    
    const preferences = this.getUserPreferences();
    const filtered = preferences.searchHistory.filter(item => item !== query);
    preferences.searchHistory = [query, ...filtered].slice(0, 50);
    this.setUserPreferences(preferences);
  }

  public setSearchHistory(history: string[]): void {
    const preferences = this.getUserPreferences();
    preferences.searchHistory = history;
    this.setUserPreferences(preferences);
  }

  public clearSearchHistory(): void {
    this.setSearchHistory([]);
  }

  // Analytics Management
  public getAnalytics(): UsageAnalytics {
    return this.getItem(this.storageKeys.analytics, this.defaultAnalytics)!;
  }

  public setAnalytics(analytics: UsageAnalytics): void {
    this.setItem(this.storageKeys.analytics, analytics);
  }

  private updateAnalytics(toolId: string, category: ToolCategory, timeSpent: number): void {
    const analytics = this.getAnalytics();
    
    analytics.totalToolsUsed += 1;
    analytics.totalTimeSaved += Math.max(timeSpent, 1); // Assume at least 1 minute saved
    analytics.toolCategoryUsage[category] += 1;
    
    // Update most used tool
    const recentTools = this.getRecentTools();
    const mostUsed = recentTools.reduce((prev, current) => 
      prev.usageCount > current.usageCount ? prev : current
    );
    analytics.mostUsedTool = mostUsed.toolId;
    
    // Calculate productivity score (simple algorithm)
    analytics.productivityScore = Math.min(100, 
      (analytics.totalToolsUsed * 2) + (analytics.totalTimeSaved / 10)
    );
    
    this.setAnalytics(analytics);
  }

  public updateLastVisit(): void {
    const preferences = this.getUserPreferences();
    preferences.lastVisit = new Date();
    this.setUserPreferences(preferences);
  }

  // Export/Import functionality
  public exportAllData(): string {
    const data = {
      preferences: this.getUserPreferences(),
      analytics: this.getAnalytics(),
      exportDate: new Date().toISOString(),
      version: this.config.version
    };
    
    return JSON.stringify(data, null, 2);
  }

  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.preferences) {
        this.setUserPreferences(data.preferences);
      }
      
      if (data.analytics) {
        this.setAnalytics(data.analytics);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Clear all data
  public clearAllData(): void {
    Object.values(this.storageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Reinitialize with defaults
    this.initializeStorage();
  }

  // Export history management
  public addExportHistory(toolId: string, format: string, size: number): void {
    const history = this.getItem('braindead-export-history', []) as Array<{
      toolId: string;
      format: string;
      size: number;
      timestamp: string;
    }>;
    
    history.push({
      toolId,
      format,
      size,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 exports
    this.setItem('braindead-export-history', history.slice(-100));
  }

  public getExportHistory(): Array<{
    toolId: string;
    format: string;
    size: number;
    timestamp: string;
  }> {
    return this.getItem('braindead-export-history', []) as any;
  }

  public clearExportHistory(): void {
    localStorage.removeItem('braindead-export-history');
  }

  // Storage info
  public getStorageInfo(): {
    used: number;
    available: number;
    percentage: number;
  } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (key.startsWith('braindead-')) {
          used += localStorage[key].length;
        }
      }
      
      const available = this.config.maxSize - used;
      const percentage = (used / this.config.maxSize) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      return { used: 0, available: this.config.maxSize, percentage: 0 };
    }
  }
}

// Create singleton instance
export const storageManager = new StorageManager();

// Convenience functions
export const getUserPreferences = () => storageManager.getUserPreferences();
export const setUserPreferences = (preferences: UserPreferences) => storageManager.setUserPreferences(preferences);
export const updateUserPreferences = (updates: Partial<UserPreferences>) => storageManager.updateUserPreferences(updates);

export const getFavorites = () => storageManager.getFavorites();
export const addFavorite = (toolId: string) => storageManager.addFavorite(toolId);
export const removeFavorite = (toolId: string) => storageManager.removeFavorite(toolId);
export const isFavorite = (toolId: string) => storageManager.isFavorite(toolId);

export const getRecentTools = () => storageManager.getRecentTools();
export const addRecentTool = (toolId: string, category: ToolCategory, timeSpent?: number) => 
  storageManager.addRecentTool(toolId, category, timeSpent);

export const getSearchHistory = () => storageManager.getSearchHistory();
export const addSearchHistory = (query: string) => storageManager.addSearchHistory(query);

export const getAnalytics = () => storageManager.getAnalytics();
export const exportAllData = () => storageManager.exportAllData();
export const importData = (data: string) => storageManager.importData(data);
export const clearAllData = () => storageManager.clearAllData();