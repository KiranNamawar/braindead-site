import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Users, Clock, ArrowRight, X, RefreshCw } from 'lucide-react';
import { ToolRecommendation, getToolRecommendations, getSimilarTools, compareTools } from '../../utils/recommendationEngine';
import { toolRegistry } from '../../utils/toolRegistry';
import { useToast } from '../ToastContainer';

interface ToolRecommendationsProps {
  currentToolId?: string;
  context?: any;
  limit?: number;
  showComparison?: boolean;
  className?: string;
}

const ToolRecommendations: React.FC<ToolRecommendationsProps> = ({
  currentToolId,
  context,
  limit = 4,
  showComparison = true,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState<ToolRecommendation[]>([]);
  const [similarTools, setSimilarTools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadRecommendations();
  }, [currentToolId, context]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    
    try {
      // Get personalized recommendations
      const recs = getToolRecommendations({
        currentTool: currentToolId,
        ...context
      }, limit);
      
      setRecommendations(recs);
      
      // Get similar tools if current tool is provided
      if (currentToolId) {
        const similar = getSimilarTools(currentToolId, 3);
        setSimilarTools(similar);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      showToast({
        type: 'error',
        title: 'Recommendations Failed',
        message: 'Failed to load tool recommendations'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolClick = (toolId: string) => {
    const tool = toolRegistry.getTool(toolId);
    if (tool) {
      window.location.href = tool.path;
    }
  };

  const handleCompareClick = (toolId: string) => {
    if (!currentToolId) return;
    
    const comparison = compareTools(currentToolId, toolId);
    if (comparison) {
      setComparisonResult(comparison);
      setSelectedForComparison(toolId);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'similar':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'complementary':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'alternative':
        return <RefreshCw className="w-4 h-4 text-green-500" />;
      case 'upgrade':
        return <Users className="w-4 h-4 text-orange-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'similar':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'complementary':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'alternative':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'upgrade':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
          <h3 className="text-sm font-semibold text-gray-900">Loading Recommendations...</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0 && similarTools.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">No Recommendations</h3>
        </div>
        <p className="text-sm text-gray-600">
          Use more tools to get personalized recommendations!
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">Recommended Tools</h3>
        </div>
        <button
          onClick={loadRecommendations}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.tool.id}
            className="group border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer"
            onClick={() => handleToolClick(rec.tool.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {rec.tool.name}
                  </h4>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getCategoryColor(rec.category)}`}>
                    {getCategoryIcon(rec.category)}
                    <span className="capitalize">{rec.category}</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {rec.tool.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>~{rec.tool.estimatedTimeSaved}min saved</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{Math.round(rec.score * 100)}% match</span>
                  </div>
                </div>
                
                {rec.reasons.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-purple-600 font-medium">
                      Why recommended:
                    </div>
                    <ul className="text-xs text-gray-600 mt-1">
                      {rec.reasons.slice(0, 2).map((reason, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="w-1 h-1 bg-purple-400 rounded-full mt-1.5 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-1 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToolClick(rec.tool.id);
                  }}
                  className="p-1 text-purple-600 hover:text-purple-800 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                {showComparison && currentToolId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompareClick(rec.tool.id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    title="Compare tools"
                  >
                    vs
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Similar Tools Section */}
      {similarTools.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Similar Tools</h4>
          <div className="flex flex-wrap gap-2">
            {similarTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs transition-colors"
              >
                {tool.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {comparisonResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Tool Comparison</h3>
              <button
                onClick={() => setComparisonResult(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900">{comparisonResult.tool1.name}</h4>
                  <p className="text-sm text-gray-600">{comparisonResult.tool1.description}</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900">{comparisonResult.tool2.name}</h4>
                  <p className="text-sm text-gray-600">{comparisonResult.tool2.description}</p>
                </div>
              </div>

              {comparisonResult.similarities.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium text-green-800 mb-2">Similarities</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {comparisonResult.similarities.map((similarity: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        {similarity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {comparisonResult.differences.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium text-blue-800 mb-2">Differences</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {comparisonResult.differences.map((difference: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        {difference}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h5 className="font-medium text-purple-800 mb-2">Recommendation</h5>
                <p className="text-sm text-purple-700 mb-2">
                  <strong>{comparisonResult.recommendation.preferred.name}</strong> is recommended
                </p>
                <p className="text-sm text-purple-600">
                  {comparisonResult.recommendation.reason}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolRecommendations;