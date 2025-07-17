import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Clock, 
  Zap, 
  Award,
  Lightbulb,
  Calendar,
  PieChart,
  Activity,
  ChevronRight,
  Download,
  RotateCcw
} from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import AdvancedAnalyticsContent from './AdvancedAnalyticsContent';

interface AnalyticsDashboardProps {
  className?: string;
  showTitle?: boolean;
  compact?: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
  showTitle = true,
  compact = false
}) => {
  const { 
    analytics, 
    insights, 
    usagePatterns, 
    isLoading, 
    error,
    getProductivityBreakdown,
    getTimeBasedAnalytics,
    getAdvancedInsights,
    getUsagePatterns,
    getProductivityReport,
    getSessionAnalytics,
    exportAnalytics,
    resetAnalytics,
    clearAllAnalytics
  } = useAnalytics();

  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={`${className}`}>
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 text-center">
          <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Analytics Unavailable</h3>
          <p className="text-gray-400">
            {error || 'No analytics data available yet. Start using tools to see your productivity insights!'}
          </p>
        </div>
      </div>
    );
  }

  const productivityBreakdown = getProductivityBreakdown();
  const timeBasedAnalytics = getTimeBasedAnalytics();

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'stable': return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getEfficiencyColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'average': return 'text-yellow-400';
      case 'needs-improvement': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatCategoryName = (category: string) => {
    return category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleExport = () => {
    const data = exportAnalytics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `braindead-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all analytics data? This action cannot be undone.')) {
      resetAnalytics();
    }
  };

  return (
    <div className={`${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
            <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
              {analytics.productivityScore}/100
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleReset}
              className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{analytics.totalToolsUsed}</div>
          <div className="text-xs text-gray-400 flex items-center justify-center space-x-1">
            <Activity className="w-3 h-3" />
            <span>Total Uses</span>
          </div>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{analytics.totalTimeSaved}m</div>
          <div className="text-xs text-gray-400 flex items-center justify-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Time Saved</span>
          </div>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{Math.round(insights?.toolDiversityScore || 0)}%</div>
          <div className="text-xs text-gray-400 flex items-center justify-center space-x-1">
            <PieChart className="w-3 h-3" />
            <span>Diversity</span>
          </div>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center">
          <div className={`text-2xl font-bold ${getEfficiencyColor(insights?.efficiencyRating || 'average')}`}>
            {insights?.efficiencyRating?.charAt(0).toUpperCase()}
          </div>
          <div className="text-xs text-gray-400 flex items-center justify-center space-x-1">
            <Award className="w-3 h-3" />
            <span>Rating</span>
          </div>
        </div>
      </div>

      {/* Productivity Score Breakdown */}
      {productivityBreakdown && !compact && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Productivity Score Breakdown</span>
            </h3>
            <div className="text-2xl font-bold text-purple-400">
              {productivityBreakdown.total}/100
            </div>
          </div>
          
          <div className="space-y-3">
            {Object.entries(productivityBreakdown.breakdown).map(([category, score]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-gray-300 capitalize">{category}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(score / (category === 'usage' ? 40 : category === 'diversity' ? 30 : category === 'consistency' ? 20 : 10)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-400 w-8">{Math.round(score)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Patterns */}
      {usagePatterns.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <PieChart className="w-5 h-5" />
            <span>Usage Patterns by Category</span>
          </h3>
          
          <div className="space-y-3">
            {usagePatterns.map((pattern) => (
              <div key={pattern.category} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(pattern.trend)}
                    <span className="text-white font-medium">
                      {formatCategoryName(pattern.category)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>{pattern.usage} uses</span>
                  <span>{pattern.percentage}%</span>
                  <span>{Math.round(pattern.averageTimeSpent)}m avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time-based Analytics */}
      {timeBasedAnalytics && !compact && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Time-based Analytics</span>
            </h3>
            
            <div className="flex items-center space-x-2">
              {(['today', 'week', 'month'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {timeBasedAnalytics[selectedPeriod].toolsUsed}
              </div>
              <div className="text-xs text-gray-400">Tools Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {timeBasedAnalytics[selectedPeriod].totalUsage}
              </div>
              <div className="text-xs text-gray-400">Total Usage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {timeBasedAnalytics[selectedPeriod].timeSaved}m
              </div>
              <div className="text-xs text-gray-400">Time Saved</div>
            </div>
          </div>
        </div>
      )}

      {/* Insights and Recommendations */}
      {insights && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Lightbulb className="w-5 h-5" />
              <span>Insights & Recommendations</span>
            </h3>
            
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
            >
              <span>{showRecommendations ? 'Hide' : 'Show'} Details</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showRecommendations ? 'rotate-90' : ''}`} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-3">
              {getTrendIcon(insights.productivityTrend)}
              <div>
                <div className="text-white font-medium">Productivity Trend</div>
                <div className="text-sm text-gray-400 capitalize">{insights.productivityTrend}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Zap className="w-4 h-4 text-yellow-400" />
              <div>
                <div className="text-white font-medium">Top Category</div>
                <div className="text-sm text-gray-400">
                  {formatCategoryName(insights.mostProductiveCategory)}
                </div>
              </div>
            </div>
          </div>
          
          {showRecommendations && insights.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Personalized Recommendations:</h4>
              {insights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-300">{recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Advanced Analytics Section */}
      {!compact && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Advanced Analytics</span>
            </h3>
            
            <button
              onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
            >
              <span>{showAdvancedAnalytics ? 'Hide' : 'Show'} Advanced</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showAdvancedAnalytics ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {showAdvancedAnalytics && (
            <AdvancedAnalyticsContent 
              getAdvancedInsights={getAdvancedInsights}
              getUsagePatterns={getUsagePatterns}
              getProductivityReport={getProductivityReport}
              clearAllAnalytics={clearAllAnalytics}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;