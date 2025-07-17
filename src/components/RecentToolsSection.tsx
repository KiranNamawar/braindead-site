import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Clock, TrendingUp, ArrowRight, BarChart3, Zap, Calendar } from 'lucide-react';
import { getAllTools } from '../utils/toolRegistry';
import { getRecentTools, addRecentTool } from '../utils/storage';
import { Tool, ToolUsage, ToolCategory } from '../types';

interface RecentToolsSectionProps {
  className?: string;
  showTitle?: boolean;
  maxItems?: number;
  compact?: boolean;
  showStats?: boolean;
}

interface RecentToolWithMetadata extends Tool {
  usage: ToolUsage;
  timeSinceLastUsed: string;
  usageFrequency: 'high' | 'medium' | 'low';
  trend: 'up' | 'down' | 'stable';
}

const RecentToolsSection: React.FC<RecentToolsSectionProps> = ({
  className = '',
  showTitle = true,
  maxItems = 6,
  compact = false,
  showStats = true
}) => {
  const [recentTools, setRecentTools] = useState<RecentToolWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');

  // Load recent tools on mount
  useEffect(() => {
    loadRecentTools();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadRecentTools();
    };

    window.addEventListener('braindead-storage-change', handleStorageChange);
    return () => window.removeEventListener('braindead-storage-change', handleStorageChange);
  }, []);

  const loadRecentTools = useCallback(() => {
    try {
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
            trend: calculateTrend(usage)
          };
        })
        .filter((tool): tool is RecentToolWithMetadata => tool !== null);
      
      setRecentTools(toolsWithMetadata);
    } catch (error) {
      console.error('Failed to load recent tools:', error);
    } finally {
      setIsLoading(false);
    }
  }, [maxItems]);

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

  const calculateUsageFrequency = (usage: ToolUsage): 'high' | 'medium' | 'low' => {
    const daysSinceLastUsed = (new Date().getTime() - new Date(usage.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
    const usageRate = usage.usageCount / Math.max(daysSinceLastUsed, 1);
    
    if (usageRate > 1) return 'high';
    if (usageRate > 0.3) return 'medium';
    return 'low';
  };

  const calculateTrend = (usage: ToolUsage): 'up' | 'down' | 'stable' => {
    // Simple trend calculation based on recent usage
    // In a real app, you'd track usage over time
    const daysSinceLastUsed = (new Date().getTime() - new Date(usage.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastUsed < 1 && usage.usageCount > 3) return 'up';
    if (daysSinceLastUsed > 7) return 'down';
    return 'stable';
  };

  const getFrequencyColor = (frequency: 'high' | 'medium' | 'low') => {
    switch (frequency) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-gray-400';
    }
  };

  const getFrequencyIcon = (frequency: 'high' | 'medium' | 'low') => {
    switch (frequency) {
      case 'high': return <TrendingUp className="w-3 h-3" />;
      case 'medium': return <BarChart3 className="w-3 h-3" />;
      case 'low': return <Clock className="w-3 h-3" />;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
    }
  };

  const getUsageStats = () => {
    const totalUsage = recentTools.reduce((sum, tool) => sum + tool.usage.usageCount, 0);
    const totalTimeSaved = recentTools.reduce((sum, tool) => sum + tool.usage.timeSpent, 0);
    const mostUsedTool = recentTools.reduce((prev, current) => 
      prev.usage.usageCount > current.usage.usageCount ? prev : current, recentTools[0]);
    
    return {
      totalUsage,
      totalTimeSaved,
      mostUsedTool: mostUsedTool?.name || 'None',
      averageUsage: totalUsage > 0 ? Math.round(totalUsage / recentTools.length) : 0
    };
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recentTools.length === 0) {
    return (
      <div className={`${className}`}>
        {showTitle && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Recent Tools</h2>
            </div>
          </div>
        )}
        
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 text-center">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No recent activity</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Start using tools to see your recent activity and usage patterns here.
          </p>
          <Link
            to="/calculator"
            onClick={() => addRecentTool('calculator', ToolCategory.CALCULATOR)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl font-semibold text-white hover:from-blue-400 hover:to-cyan-500 transition-all duration-300 hover:scale-105 inline-flex items-center space-x-2"
          >
            <Zap className="w-5 h-5" />
            <span>Try Calculator</span>
          </Link>
        </div>
      </div>
    );
  }

  const stats = getUsageStats();

  return (
    <div className={`${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Recent Tools</h2>
            <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
              {recentTools.length}
            </span>
          </div>
          
          {showStats && (
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <BarChart3 className="w-4 h-4" />
                <span>{stats.totalUsage} uses</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{stats.totalTimeSaved}min saved</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Usage Stats Summary */}
      {showStats && !compact && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.totalUsage}</div>
            <div className="text-xs text-gray-400">Total Uses</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.totalTimeSaved}m</div>
            <div className="text-xs text-gray-400">Time Saved</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.averageUsage}</div>
            <div className="text-xs text-gray-400">Avg Uses</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-sm font-bold text-yellow-400 truncate">{stats.mostUsedTool}</div>
            <div className="text-xs text-gray-400">Most Used</div>
          </div>
        </div>
      )}

      {/* Recent Tools Grid */}
      <div className={`grid gap-4 ${
        compact 
          ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {recentTools.map((tool, index) => (
          <Link
            key={tool.id}
            to={tool.path}
            onClick={() => addRecentTool(tool.id, tool.category)}
            className={`group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-all duration-300 hover:scale-105 ${
              compact ? 'p-3' : 'p-4'
            }`}
          >
            {/* Usage Frequency Indicator */}
            <div className="absolute top-2 right-2">
              <div className={`flex items-center space-x-1 ${getFrequencyColor(tool.usageFrequency)}`}>
                {getFrequencyIcon(tool.usageFrequency)}
                <span className="text-xs">{tool.usage.usageCount}</span>
              </div>
            </div>

            {/* Trend Indicator */}
            <div className="absolute top-2 left-2 text-xs">
              {getTrendIcon(tool.trend)}
            </div>

            <div className="flex items-center space-x-3 mb-3 mt-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.gradient.replace('linear-gradient(135deg, ', '').replace(')', '')} flex items-center justify-center`}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-white truncate ${compact ? 'text-sm' : 'text-base'}`}>
                  {tool.name}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{tool.timeSinceLastUsed}</span>
                </div>
              </div>
            </div>

            {!compact && (
              <div className="mb-3">
                <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                  {tool.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    Used {tool.usage.usageCount} time{tool.usage.usageCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-gray-500">
                    {tool.usage.timeSpent}min saved
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getFrequencyColor(tool.usageFrequency)} bg-gray-800`}>
                  {tool.usageFrequency} usage
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* View All Link */}
      {recentTools.length >= maxItems && (
        <div className="mt-6 text-center">
          <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
            View all recent tools →
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentToolsSection;