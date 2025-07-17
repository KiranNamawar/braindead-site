import { useState, useEffect, useCallback } from 'react';
import { getAnalytics, getRecentTools, getFavorites, storageManager } from '../utils/storage';
import { getAllTools } from '../utils/toolRegistry';
import { analytics } from '../utils/analytics';
import { UsageAnalytics, ToolCategory, ToolUsage } from '../types';

interface AnalyticsInsights {
  productivityTrend: 'up' | 'down' | 'stable';
  mostProductiveCategory: string;
  averageSessionTime: number;
  toolDiversityScore: number;
  efficiencyRating: 'excellent' | 'good' | 'average' | 'needs-improvement';
  recommendations: string[];
}

interface UsagePattern {
  category: ToolCategory;
  usage: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  averageTimeSpent: number;
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [insights, setInsights] = useState<AnalyticsInsights | null>(null);
  const [usagePatterns, setUsagePatterns] = useState<UsagePattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load analytics data
  const loadAnalytics = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      const analyticsData = getAnalytics();
      const recentTools = getRecentTools();
      const favorites = getFavorites();
      
      setAnalytics(analyticsData);
      
      // Calculate insights
      const calculatedInsights = calculateInsights(analyticsData, recentTools, favorites);
      setInsights(calculatedInsights);
      
      // Calculate usage patterns
      const patterns = calculateUsagePatterns(analyticsData, recentTools);
      setUsagePatterns(patterns);
      
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize analytics on mount
  useEffect(() => {
    loadAnalytics();
    
    // Listen for storage changes
    const handleStorageChange = (event: CustomEvent) => {
      const { key } = event.detail;
      if (key && (key.includes('analytics') || key.includes('recent') || key.includes('favorites'))) {
        loadAnalytics();
      }
    };

    window.addEventListener('braindead-storage-change', handleStorageChange as EventListener);
    return () => window.removeEventListener('braindead-storage-change', handleStorageChange as EventListener);
  }, [loadAnalytics]);

  // Calculate insights from analytics data
  const calculateInsights = useCallback((
    analyticsData: UsageAnalytics,
    recentTools: ToolUsage[],
    favorites: string[]
  ): AnalyticsInsights => {
    const totalUsage = analyticsData.totalToolsUsed;
    const totalTimeSaved = analyticsData.totalTimeSaved;
    const uniqueToolsUsed = recentTools.length;
    const allTools = getAllTools();
    
    // Calculate productivity trend (simplified)
    const productivityTrend: 'up' | 'down' | 'stable' = 
      analyticsData.productivityScore > 50 ? 'up' : 
      analyticsData.productivityScore > 20 ? 'stable' : 'down';
    
    // Find most productive category
    const categoryEntries = Object.entries(analyticsData.toolCategoryUsage);
    const mostUsedCategory = categoryEntries.reduce((prev, current) => 
      current[1] > prev[1] ? current : prev, categoryEntries[0]);
    const mostProductiveCategory = mostUsedCategory ? mostUsedCategory[0] : 'none';
    
    // Calculate average session time
    const averageSessionTime = analyticsData.sessionsCount > 0 
      ? analyticsData.averageSessionDuration 
      : 0;
    
    // Calculate tool diversity score (0-100)
    const toolDiversityScore = Math.min(100, (uniqueToolsUsed / allTools.length) * 100);
    
    // Calculate efficiency rating
    const efficiencyRating: 'excellent' | 'good' | 'average' | 'needs-improvement' = 
      analyticsData.productivityScore >= 80 ? 'excellent' :
      analyticsData.productivityScore >= 60 ? 'good' :
      analyticsData.productivityScore >= 40 ? 'average' : 'needs-improvement';
    
    // Generate recommendations
    const recommendations = generateRecommendations(
      analyticsData, 
      recentTools, 
      favorites, 
      toolDiversityScore,
      efficiencyRating
    );
    
    return {
      productivityTrend,
      mostProductiveCategory,
      averageSessionTime,
      toolDiversityScore,
      efficiencyRating,
      recommendations
    };
  }, []);

  // Calculate usage patterns by category
  const calculateUsagePatterns = useCallback((
    analyticsData: UsageAnalytics,
    recentTools: ToolUsage[]
  ): UsagePattern[] => {
    const totalUsage = analyticsData.totalToolsUsed;
    
    return Object.entries(analyticsData.toolCategoryUsage)
      .map(([category, usage]) => {
        const categoryTools = recentTools.filter(tool => tool.category === category as ToolCategory);
        const averageTimeSpent = categoryTools.length > 0 
          ? categoryTools.reduce((sum, tool) => sum + tool.timeSpent, 0) / categoryTools.length
          : 0;
        
        return {
          category: category as ToolCategory,
          usage,
          percentage: totalUsage > 0 ? Math.round((usage / totalUsage) * 100) : 0,
          trend: calculateCategoryTrend(category as ToolCategory, categoryTools),
          averageTimeSpent
        };
      })
      .filter(pattern => pattern.usage > 0)
      .sort((a, b) => b.usage - a.usage);
  }, []);

  // Calculate trend for a specific category
  const calculateCategoryTrend = (category: ToolCategory, tools: ToolUsage[]): 'up' | 'down' | 'stable' => {
    if (tools.length === 0) return 'stable';
    
    const recentUsage = tools.filter(tool => {
      const daysSinceLastUsed = (new Date().getTime() - new Date(tool.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLastUsed <= 7;
    }).length;
    
    const totalUsage = tools.length;
    const recentUsageRatio = recentUsage / totalUsage;
    
    if (recentUsageRatio > 0.6) return 'up';
    if (recentUsageRatio < 0.3) return 'down';
    return 'stable';
  };

  // Generate personalized recommendations
  const generateRecommendations = (
    analyticsData: UsageAnalytics,
    recentTools: ToolUsage[],
    favorites: string[],
    diversityScore: number,
    efficiencyRating: string
  ): string[] => {
    const recommendations: string[] = [];
    const allTools = getAllTools();
    
    // Diversity recommendations
    if (diversityScore < 30) {
      recommendations.push("Try exploring more tool categories to boost your productivity diversity score!");
    }
    
    // Efficiency recommendations
    if (efficiencyRating === 'needs-improvement') {
      recommendations.push("Consider using tools more frequently to improve your efficiency rating.");
    }
    
    // Favorites recommendations
    if (favorites.length === 0) {
      recommendations.push("Add your most-used tools to favorites for quicker access.");
    } else if (favorites.length < 3) {
      recommendations.push("Consider adding more tools to your favorites for better workflow.");
    }
    
    // Category-specific recommendations
    const categoryUsage = Object.entries(analyticsData.toolCategoryUsage);
    const unusedCategories = categoryUsage.filter(([, usage]) => usage === 0);
    
    if (unusedCategories.length > 0) {
      const randomCategory = unusedCategories[Math.floor(Math.random() * unusedCategories.length)][0];
      const categoryName = randomCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      recommendations.push(`Explore ${categoryName} tools to discover new productivity opportunities.`);
    }
    
    // Time-based recommendations
    if (analyticsData.totalTimeSaved < 30) {
      recommendations.push("Use tools more regularly to maximize your time savings potential.");
    }
    
    // Tool-specific recommendations
    const leastUsedTools = allTools.filter(tool => 
      !recentTools.some(recent => recent.toolId === tool.id) && 
      !favorites.includes(tool.id)
    );
    
    if (leastUsedTools.length > 0) {
      const randomTool = leastUsedTools[Math.floor(Math.random() * leastUsedTools.length)];
      recommendations.push(`Try the ${randomTool.name} - ${randomTool.sarcasticQuote}`);
    }
    
    return recommendations.slice(0, 5); // Limit to 5 recommendations
  };

  // Get productivity score breakdown
  const getProductivityBreakdown = useCallback(() => {
    if (!analytics) return null;
    
    const breakdown = {
      usage: Math.min(40, (analytics.totalToolsUsed / 10) * 40), // Max 40 points for usage
      diversity: Math.min(30, (usagePatterns.length / 8) * 30), // Max 30 points for diversity
      consistency: Math.min(20, (analytics.sessionsCount / 5) * 20), // Max 20 points for consistency
      efficiency: Math.min(10, (analytics.totalTimeSaved / 60) * 10) // Max 10 points for time saved
    };
    
    const total = Object.values(breakdown).reduce((sum, score) => sum + score, 0);
    
    return {
      breakdown,
      total: Math.round(total),
      maxPossible: 100
    };
  }, [analytics, usagePatterns]);

  // Get time-based analytics
  const getTimeBasedAnalytics = useCallback(() => {
    if (!analytics) return null;
    
    const recentTools = getRecentTools();
    const now = new Date();
    
    // Tools used today
    const todayTools = recentTools.filter(tool => {
      const toolDate = new Date(tool.lastUsed);
      return toolDate.toDateString() === now.toDateString();
    });
    
    // Tools used this week
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const weekTools = recentTools.filter(tool => 
      new Date(tool.lastUsed) >= weekStart
    );
    
    // Tools used this month
    const monthStart = new Date(now);
    monthStart.setMonth(now.getMonth() - 1);
    const monthTools = recentTools.filter(tool => 
      new Date(tool.lastUsed) >= monthStart
    );
    
    return {
      today: {
        toolsUsed: todayTools.length,
        totalUsage: todayTools.reduce((sum, tool) => sum + tool.usageCount, 0),
        timeSaved: todayTools.reduce((sum, tool) => sum + tool.timeSpent, 0)
      },
      week: {
        toolsUsed: weekTools.length,
        totalUsage: weekTools.reduce((sum, tool) => sum + tool.usageCount, 0),
        timeSaved: weekTools.reduce((sum, tool) => sum + tool.timeSpent, 0)
      },
      month: {
        toolsUsed: monthTools.length,
        totalUsage: monthTools.reduce((sum, tool) => sum + tool.usageCount, 0),
        timeSaved: monthTools.reduce((sum, tool) => sum + tool.timeSpent, 0)
      }
    };
  }, [analytics]);

  // Export analytics data
  const exportAnalytics = useCallback(() => {
    return {
      analytics,
      insights,
      usagePatterns,
      productivityBreakdown: getProductivityBreakdown(),
      timeBasedAnalytics: getTimeBasedAnalytics(),
      exportDate: new Date().toISOString()
    };
  }, [analytics, insights, usagePatterns, getProductivityBreakdown, getTimeBasedAnalytics]);

  // Reset analytics
  const resetAnalytics = useCallback(() => {
    try {
      storageManager.setAnalytics({
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
      });
      loadAnalytics();
      return true;
    } catch (error) {
      console.error('Failed to reset analytics:', error);
      return false;
    }
  }, [loadAnalytics]);

  // Get advanced productivity insights
  const getAdvancedInsights = useCallback(() => {
    return analytics.getProductivityInsights();
  }, []);

  // Get usage patterns analysis
  const getUsagePatterns = useCallback(() => {
    return analytics.getUsagePatterns();
  }, []);

  // Get productivity report
  const getProductivityReport = useCallback(() => {
    return analytics.generateProductivityReport();
  }, []);

  // Get session analytics
  const getSessionAnalytics = useCallback(() => {
    return analytics.getSessionAnalytics();
  }, []);

  // Clear all analytics data
  const clearAllAnalytics = useCallback(() => {
    analytics.clearAnalyticsData();
    resetAnalytics();
  }, [resetAnalytics]);

  return {
    // State
    analytics,
    insights,
    usagePatterns,
    isLoading,
    error,
    
    // Computed data
    getProductivityBreakdown,
    getTimeBasedAnalytics,
    
    // Advanced analytics
    getAdvancedInsights,
    getUsagePatterns,
    getProductivityReport,
    getSessionAnalytics,
    
    // Actions
    loadAnalytics,
    resetAnalytics,
    exportAnalytics,
    clearAllAnalytics
  };
}