// Comprehensive tool management utility
import { Tool, ToolCategory, ToolUsage, UserPreferences } from '../types';
import { toolRegistry } from './toolRegistry';
import { storageManager } from './storage';
import { toolIntegrationManager } from './toolIntegration';
import { trackToolUsage } from './analytics';

class ToolManager {
  private sessionStartTime: Date = new Date();
  private currentToolStartTime: Date | null = null;
  private currentToolId: string | null = null;

  constructor() {
    this.initializeSession();
  }

  private initializeSession(): void {
    // Update session analytics
    const analytics = storageManager.getAnalytics();
    analytics.sessionsCount += 1;
    storageManager.setAnalytics(analytics);
  }

  public startToolSession(toolId: string): void {
    // End previous session if exists
    if (this.currentToolId && this.currentToolStartTime) {
      this.endToolSession();
    }

    this.currentToolId = toolId;
    this.currentToolStartTime = new Date();

    // Track tool usage
    trackToolUsage(toolId, 'started');
  }

  public endToolSession(): void {
    if (!this.currentToolId || !this.currentToolStartTime) return;

    const timeSpent = Math.round((new Date().getTime() - this.currentToolStartTime.getTime()) / 1000 / 60); // minutes
    const tool = toolRegistry.getTool(this.currentToolId);
    
    if (tool) {
      // Add to recent tools
      storageManager.addRecentTool(this.currentToolId, tool.category, timeSpent);
      
      // Track analytics
      trackToolUsage(this.currentToolId, 'completed', { timeSpent });
    }

    this.currentToolId = null;
    this.currentToolStartTime = null;
  }

  public getToolUsageStats(toolId: string): {
    usageCount: number;
    totalTimeSpent: number;
    lastUsed: Date | null;
    averageSessionTime: number;
  } {
    const recentTools = storageManager.getRecentTools();
    const toolUsage = recentTools.find(t => t.toolId === toolId);

    if (!toolUsage) {
      return {
        usageCount: 0,
        totalTimeSpent: 0,
        lastUsed: null,
        averageSessionTime: 0
      };
    }

    return {
      usageCount: toolUsage.usageCount,
      totalTimeSpent: toolUsage.timeSpent,
      lastUsed: toolUsage.lastUsed,
      averageSessionTime: toolUsage.timeSpent / toolUsage.usageCount
    };
  }

  public getPersonalizedRecommendations(): Tool[] {
    const recentTools = storageManager.getRecentTools();
    const favorites = storageManager.getFavorites();
    const analytics = storageManager.getAnalytics();

    // Get tools from most used categories
    const categoryUsage = analytics.toolCategoryUsage;
    const topCategories = Object.entries(categoryUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category as ToolCategory);

    const recommendations: Tool[] = [];

    // Add tools from top categories that user hasn't used much
    topCategories.forEach(category => {
      const categoryTools = toolRegistry.getToolsByCategory(category);
      const lessUsedTools = categoryTools.filter(tool => {
        const usage = recentTools.find(r => r.toolId === tool.id);
        return !usage || usage.usageCount < 3;
      });
      
      recommendations.push(...lessUsedTools.slice(0, 2));
    });

    // Add similar tools to favorites
    favorites.forEach(favoriteId => {
      const similarTools = toolRegistry.suggestSimilarTools(favoriteId);
      recommendations.push(...similarTools.slice(0, 1));
    });

    // Remove duplicates and limit results
    const unique = Array.from(new Map(recommendations.map(t => [t.id, t])).values());
    return unique.slice(0, 6);
  }

  public getQuickAccessTools(): {
    favorites: Tool[];
    recent: Tool[];
    recommended: Tool[];
  } {
    const favorites = storageManager.getFavorites()
      .map(id => toolRegistry.getTool(id))
      .filter((tool): tool is Tool => tool !== undefined)
      .slice(0, 8);

    const recent = storageManager.getRecentTools()
      .slice(0, 6)
      .map(usage => toolRegistry.getTool(usage.toolId))
      .filter((tool): tool is Tool => tool !== undefined);

    const recommended = this.getPersonalizedRecommendations().slice(0, 4);

    return { favorites, recent, recommended };
  }

  public searchToolsWithPersonalization(query: string): Tool[] {
    const baseResults = toolRegistry.searchTools(query);
    const recentTools = storageManager.getRecentTools();
    const favorites = storageManager.getFavorites();

    // Boost score for recently used and favorite tools
    const scoredResults = baseResults.map(tool => {
      let boost = 0;
      
      if (favorites.includes(tool.id)) {
        boost += 5; // Favorite boost
      }
      
      const recentUsage = recentTools.find(r => r.toolId === tool.id);
      if (recentUsage) {
        boost += Math.min(3, recentUsage.usageCount); // Recent usage boost
      }

      return { tool, boost };
    });

    // Sort by boost and return tools
    return scoredResults
      .sort((a, b) => b.boost - a.boost)
      .map(result => result.tool);
  }

  public getToolsByUsageFrequency(): Tool[] {
    const recentTools = storageManager.getRecentTools();
    
    return recentTools
      .sort((a, b) => b.usageCount - a.usageCount)
      .map(usage => toolRegistry.getTool(usage.toolId))
      .filter((tool): tool is Tool => tool !== undefined);
  }

  public getProductivityInsights(): {
    totalTimeSaved: number;
    mostProductiveCategory: ToolCategory;
    streakDays: number;
    toolsDiscovered: number;
    efficiencyScore: number;
  } {
    const analytics = storageManager.getAnalytics();
    const recentTools = storageManager.getRecentTools();
    const allTools = toolRegistry.getAllTools();

    // Find most productive category
    const categoryUsage = analytics.toolCategoryUsage;
    const mostProductiveCategory = Object.entries(categoryUsage)
      .reduce(([maxCat, maxCount], [cat, count]) => 
        count > maxCount ? [cat, count] : [maxCat, maxCount]
      )[0] as ToolCategory;

    // Calculate streak (simplified - days with tool usage)
    const streakDays = this.calculateUsageStreak(recentTools);

    // Tools discovered (tools used at least once)
    const toolsDiscovered = recentTools.length;

    // Efficiency score (0-100 based on various factors)
    const efficiencyScore = Math.min(100, 
      (toolsDiscovered / allTools.length * 30) + // Discovery factor
      (Math.min(analytics.totalTimeSaved, 1000) / 1000 * 40) + // Time saved factor
      (streakDays * 2) + // Consistency factor
      (analytics.sessionsCount > 10 ? 20 : analytics.sessionsCount * 2) // Usage factor
    );

    return {
      totalTimeSaved: analytics.totalTimeSaved,
      mostProductiveCategory,
      streakDays,
      toolsDiscovered,
      efficiencyScore: Math.round(efficiencyScore)
    };
  }

  private calculateUsageStreak(recentTools: ToolUsage[]): number {
    if (recentTools.length === 0) return 0;

    // Get unique days with tool usage
    const usageDays = recentTools
      .map(tool => new Date(tool.lastUsed).toDateString())
      .filter((date, index, array) => array.indexOf(date) === index)
      .sort()
      .reverse();

    let streak = 0;
    const today = new Date().toDateString();
    let currentDate = new Date();

    for (let i = 0; i < usageDays.length; i++) {
      const usageDate = currentDate.toDateString();
      
      if (usageDays.includes(usageDate)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  public exportToolData(toolId: string, data: any, format: string): void {
    const exportData = toolIntegrationManager.exportData(toolId, data, format);
    
    // Track export
    storageManager.addExportHistory(toolId, format, JSON.stringify(data).length);
    trackToolUsage(toolId, 'exported', { format, size: JSON.stringify(data).length });
  }

  public getToolIntegrationSuggestions(toolId: string, outputData: any): Array<{
    targetTool: Tool;
    integration: any;
    description: string;
  }> {
    const suggestions = toolIntegrationManager.suggestIntegrations(toolId, outputData);
    
    return suggestions.map(integration => ({
      targetTool: toolRegistry.getTool(integration.targetToolId)!,
      integration,
      description: integration.description
    })).filter(s => s.targetTool);
  }

  public shareDataBetweenTools(sourceToolId: string, targetToolId: string, data: any): any {
    try {
      const transformedData = toolIntegrationManager.integrateData(sourceToolId, targetToolId, data);
      trackToolUsage(sourceToolId, 'shared_data', { targetTool: targetToolId });
      return transformedData;
    } catch (error) {
      console.error('Failed to share data between tools:', error);
      throw error;
    }
  }

  public getSessionStats(): {
    sessionDuration: number;
    toolsUsedInSession: number;
    currentTool: string | null;
    currentToolDuration: number;
  } {
    const sessionDuration = Math.round((new Date().getTime() - this.sessionStartTime.getTime()) / 1000 / 60);
    const currentToolDuration = this.currentToolStartTime 
      ? Math.round((new Date().getTime() - this.currentToolStartTime.getTime()) / 1000 / 60)
      : 0;

    return {
      sessionDuration,
      toolsUsedInSession: 1, // Simplified for now
      currentTool: this.currentToolId,
      currentToolDuration
    };
  }

  public cleanup(): void {
    // End current session
    this.endToolSession();
    
    // Update session analytics
    const analytics = storageManager.getAnalytics();
    const sessionDuration = Math.round((new Date().getTime() - this.sessionStartTime.getTime()) / 1000 / 60);
    
    // Update average session duration
    const totalSessions = analytics.sessionsCount;
    const currentAverage = analytics.averageSessionDuration;
    analytics.averageSessionDuration = ((currentAverage * (totalSessions - 1)) + sessionDuration) / totalSessions;
    
    storageManager.setAnalytics(analytics);
  }
}

// Create singleton instance
export const toolManager = new ToolManager();

// Setup cleanup on page unload
window.addEventListener('beforeunload', () => {
  toolManager.cleanup();
});

// Convenience functions
export const startToolSession = (toolId: string) => toolManager.startToolSession(toolId);
export const endToolSession = () => toolManager.endToolSession();
export const getQuickAccessTools = () => toolManager.getQuickAccessTools();
export const searchToolsPersonalized = (query: string) => toolManager.searchToolsWithPersonalization(query);
export const getProductivityInsights = () => toolManager.getProductivityInsights();
export const getToolIntegrationSuggestions = (toolId: string, data: any) => 
  toolManager.getToolIntegrationSuggestions(toolId, data);
export const shareToolData = (sourceId: string, targetId: string, data: any) => 
  toolManager.shareDataBetweenTools(sourceId, targetId, data);