import { useState, useEffect, useCallback } from 'react';
import { getRecentTools, addRecentTool, storageManager } from '../utils/storage';
import { getAllTools } from '../utils/toolRegistry';
import { Tool, ToolUsage, ToolCategory } from '../types';

interface RecentToolWithMetadata extends Tool {
  usage: ToolUsage;
  timeSinceLastUsed: string;
  usageFrequency: 'high' | 'medium' | 'low';
  trend: 'up' | 'down' | 'stable';
  lastUsedFormatted: string;
}

export function useRecentTools(maxItems: number = 10) {
  const [recentTools, setRecentTools] = useState<RecentToolWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load recent tools from storage
  const loadRecentTools = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      const recentUsage = getRecentTools();
      const allTools = getAllTools();
      
      const toolsWithMetadata: RecentToolWithMetadata[] = recentUsage
        .slice(0, maxItems)
        .map(usage => {
          const tool = allTools.find(t => t.id === usage.toolId);
          if (!tool) return null;
          
          return {
            ...tool,
            usage,
            timeSinceLastUsed: formatTimeSince(usage.lastUsed),
            usageFrequency: calculateUsageFrequency(usage),
            trend: calculateTrend(usage),
            lastUsedFormatted: formatLastUsed(usage.lastUsed)
          };
        })
        .filter((tool): tool is RecentToolWithMetadata => tool !== null);
      
      setRecentTools(toolsWithMetadata);
    } catch (err) {
      console.error('Failed to load recent tools:', err);
      setError('Failed to load recent tools');
    } finally {
      setIsLoading(false);
    }
  }, [maxItems]);

  // Initialize recent tools on mount
  useEffect(() => {
    loadRecentTools();
    
    // Listen for storage changes from other tabs/components
    const handleStorageChange = (event: CustomEvent) => {
      const { key } = event.detail;
      if (key && key.includes('recent')) {
        loadRecentTools();
      }
    };

    window.addEventListener('braindead-storage-change', handleStorageChange as EventListener);
    return () => window.removeEventListener('braindead-storage-change', handleStorageChange as EventListener);
  }, [loadRecentTools]);

  // Format time since last used
  const formatTimeSince = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  // Format last used date
  const formatLastUsed = (date: Date): string => {
    const now = new Date();
    const lastUsed = new Date(date);
    const diffDays = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return lastUsed.toLocaleDateString('en-US', { weekday: 'long' });
    return lastUsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate usage frequency
  const calculateUsageFrequency = (usage: ToolUsage): 'high' | 'medium' | 'low' => {
    const daysSinceLastUsed = (new Date().getTime() - new Date(usage.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
    const usageRate = usage.usageCount / Math.max(daysSinceLastUsed, 1);
    
    if (usageRate > 1) return 'high';
    if (usageRate > 0.3) return 'medium';
    return 'low';
  };

  // Calculate trend
  const calculateTrend = (usage: ToolUsage): 'up' | 'down' | 'stable' => {
    const daysSinceLastUsed = (new Date().getTime() - new Date(usage.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastUsed < 1 && usage.usageCount > 3) return 'up';
    if (daysSinceLastUsed > 7) return 'down';
    return 'stable';
  };

  // Add tool to recent tools
  const addToRecentTools = useCallback((toolId: string, category: ToolCategory, timeSpent: number = 0) => {
    try {
      addRecentTool(toolId, category, timeSpent);
      loadRecentTools();
      return true;
    } catch (error) {
      console.error('Failed to add recent tool:', error);
      return false;
    }
  }, [loadRecentTools]);

  // Get usage statistics
  const getUsageStats = useCallback(() => {
    const totalUsage = recentTools.reduce((sum, tool) => sum + tool.usage.usageCount, 0);
    const totalTimeSaved = recentTools.reduce((sum, tool) => sum + tool.usage.timeSpent, 0);
    const mostUsedTool = recentTools.reduce((prev, current) => 
      prev.usage.usageCount > current.usage.usageCount ? prev : current, recentTools[0]);
    
    const categoryUsage: Record<string, number> = {};
    recentTools.forEach(tool => {
      categoryUsage[tool.category] = (categoryUsage[tool.category] || 0) + tool.usage.usageCount;
    });
    
    const mostUsedCategory = Object.entries(categoryUsage)
      .sort(([, a], [, b]) => b - a)[0];
    
    return {
      totalUsage,
      totalTimeSaved,
      mostUsedTool: mostUsedTool?.name || 'None',
      averageUsage: totalUsage > 0 ? Math.round(totalUsage / recentTools.length) : 0,
      uniqueTools: recentTools.length,
      mostUsedCategory: mostUsedCategory ? {
        category: mostUsedCategory[0],
        count: mostUsedCategory[1]
      } : null,
      categoryBreakdown: categoryUsage
    };
  }, [recentTools]);

  // Get recent tools by category
  const getRecentToolsByCategory = useCallback(() => {
    const categorized: Record<string, RecentToolWithMetadata[]> = {};
    
    recentTools.forEach(tool => {
      const category = tool.category;
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(tool);
    });
    
    return categorized;
  }, [recentTools]);

  // Get recent tools by time period
  const getRecentToolsByPeriod = useCallback((period: 'today' | 'week' | 'month') => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (period) {
      case 'today':
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    return recentTools.filter(tool => 
      new Date(tool.usage.lastUsed) >= cutoffDate
    );
  }, [recentTools]);

  // Get tools by usage frequency
  const getToolsByFrequency = useCallback((frequency: 'high' | 'medium' | 'low') => {
    return recentTools.filter(tool => tool.usageFrequency === frequency);
  }, [recentTools]);

  // Get trending tools
  const getTrendingTools = useCallback(() => {
    return recentTools.filter(tool => tool.trend === 'up');
  }, [recentTools]);

  // Clear recent tools
  const clearRecentTools = useCallback(() => {
    try {
      storageManager.setRecentTools([]);
      loadRecentTools();
      return true;
    } catch (error) {
      console.error('Failed to clear recent tools:', error);
      return false;
    }
  }, [loadRecentTools]);

  // Export recent tools data
  const exportRecentTools = useCallback(() => {
    return {
      recentTools: recentTools.map(tool => ({
        id: tool.id,
        name: tool.name,
        category: tool.category,
        usage: tool.usage,
        timeSinceLastUsed: tool.timeSinceLastUsed,
        usageFrequency: tool.usageFrequency,
        trend: tool.trend
      })),
      stats: getUsageStats(),
      exportDate: new Date().toISOString(),
      totalCount: recentTools.length
    };
  }, [recentTools, getUsageStats]);

  return {
    // State
    recentTools,
    isLoading,
    error,
    
    // Actions
    addToRecentTools,
    clearRecentTools,
    loadRecentTools,
    
    // Queries
    getUsageStats,
    getRecentToolsByCategory,
    getRecentToolsByPeriod,
    getToolsByFrequency,
    getTrendingTools,
    
    // Export
    exportRecentTools,
    
    // Utilities
    formatTimeSince,
    formatLastUsed,
    calculateUsageFrequency,
    calculateTrend
  };
}