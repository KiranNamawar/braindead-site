import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, TrendingUp, ArrowRight, Sparkles, Target, Brain } from 'lucide-react';
import { getAllTools } from '../utils/toolRegistry';
import { getFavorites, getRecentTools, addRecentTool } from '../utils/storage';
import { Tool, ToolCategory } from '../types';

interface PersonalizedRecommendationsProps {
  className?: string;
  maxItems?: number;
}

interface RecommendationReason {
  type: 'similar_category' | 'complementary' | 'trending' | 'underused' | 'workflow';
  description: string;
  confidence: number;
}

interface RecommendedTool extends Tool {
  reason: RecommendationReason;
  score: number;
}

const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  className = '',
  maxItems = 4
}) => {
  const [recommendations, setRecommendations] = useState<RecommendedTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, []);

  const generateRecommendations = () => {
    try {
      const allTools = getAllTools();
      const favorites = getFavorites();
      const recentTools = getRecentTools();
      const recentToolIds = recentTools.map(r => r.toolId);
      
      // Get tools user hasn't used recently or favorited
      const unusedTools = allTools.filter(tool => 
        !favorites.includes(tool.id) && !recentToolIds.includes(tool.id)
      );

      const recommendedTools: RecommendedTool[] = [];

      // 1. Similar category recommendations
      if (favorites.length > 0 || recentTools.length > 0) {
        const userCategories = new Set([
          ...favorites.map(id => allTools.find(t => t.id === id)?.category).filter(Boolean),
          ...recentTools.map(r => allTools.find(t => t.id === r.toolId)?.category).filter(Boolean)
        ]);

        unusedTools.forEach(tool => {
          if (userCategories.has(tool.category)) {
            recommendedTools.push({
              ...tool,
              reason: {
                type: 'similar_category',
                description: `You seem to like ${tool.category.replace('-', ' ')} tools`,
                confidence: 0.8
              },
              score: 0.8
            });
          }
        });
      }

      // 2. Complementary tool recommendations
      const complementaryPairs: Record<string, string[]> = {
        'calculator': ['tip-calculator', 'percentage-calculator', 'grade-calculator'],
        'tip-calculator': ['calculator', 'percentage-calculator'],
        'text-tools': ['word-counter', 'text-case-converter', 'lorem-ipsum'],
        'json-formatter': ['base64-encoder', 'url-encoder', 'markdown-editor'],
        'color-picker': ['css-gradient-generator', 'favicon-generator'],
        'password-generator': ['hash-generator', 'uuid-generator'],
        'timestamp-converter': ['world-clock', 'countdown-timer'],
        'pomodoro-timer': ['stopwatch-timer', 'world-clock']
      };

      [...favorites, ...recentToolIds].forEach(usedToolId => {
        const complementary = complementaryPairs[usedToolId] || [];
        complementary.forEach(toolId => {
          const tool = allTools.find(t => t.id === toolId);
          if (tool && !favorites.includes(toolId) && !recentToolIds.includes(toolId)) {
            const existing = recommendedTools.find(r => r.id === toolId);
            if (!existing) {
              recommendedTools.push({
                ...tool,
                reason: {
                  type: 'complementary',
                  description: `Works great with tools you already use`,
                  confidence: 0.9
                },
                score: 0.9
              });
            }
          }
        });
      });

      // 3. Trending/Popular tools (simulated)
      const trendingTools = ['json-formatter', 'password-generator', 'qr-generator', 'color-picker'];
      trendingTools.forEach(toolId => {
        const tool = allTools.find(t => t.id === toolId);
        if (tool && !favorites.includes(toolId) && !recentToolIds.includes(toolId)) {
          const existing = recommendedTools.find(r => r.id === toolId);
          if (!existing) {
            recommendedTools.push({
              ...tool,
              reason: {
                type: 'trending',
                description: 'Popular among other users',
                confidence: 0.6
              },
              score: 0.6
            });
          }
        }
      });

      // 4. Underused category recommendations
      const categoryUsage = new Map<string, number>();
      recentTools.forEach(r => {
        const tool = allTools.find(t => t.id === r.toolId);
        if (tool) {
          categoryUsage.set(tool.category, (categoryUsage.get(tool.category) || 0) + r.usageCount);
        }
      });

      const underusedCategories = ['creative-design', 'time-productivity', 'number-conversion'];
      underusedCategories.forEach(category => {
        if ((categoryUsage.get(category) || 0) < 3) {
          const categoryTools = unusedTools.filter(t => t.category === category);
          categoryTools.slice(0, 1).forEach(tool => {
            const existing = recommendedTools.find(r => r.id === tool.id);
            if (!existing) {
              recommendedTools.push({
                ...tool,
                reason: {
                  type: 'underused',
                  description: `Explore ${category.replace('-', ' ')} tools`,
                  confidence: 0.5
                },
                score: 0.5
              });
            }
          });
        }
      });

      // 5. Workflow-based recommendations
      const workflowRecommendations: Record<string, { tools: string[], description: string }> = {
        'developer-workflow': {
          tools: ['json-formatter', 'base64-encoder', 'uuid-generator', 'jwt-decoder'],
          description: 'Complete your developer toolkit'
        },
        'content-creator-workflow': {
          tools: ['word-counter', 'lorem-ipsum', 'emoji-picker', 'ascii-art-generator'],
          description: 'Perfect for content creation'
        },
        'designer-workflow': {
          tools: ['color-picker', 'css-gradient-generator', 'favicon-generator'],
          description: 'Essential design tools'
        }
      };

      Object.entries(workflowRecommendations).forEach(([workflow, data]) => {
        const userHasWorkflowTools = data.tools.some(toolId => 
          favorites.includes(toolId) || recentToolIds.includes(toolId)
        );
        
        if (userHasWorkflowTools) {
          data.tools.forEach(toolId => {
            const tool = allTools.find(t => t.id === toolId);
            if (tool && !favorites.includes(toolId) && !recentToolIds.includes(toolId)) {
              const existing = recommendedTools.find(r => r.id === toolId);
              if (!existing) {
                recommendedTools.push({
                  ...tool,
                  reason: {
                    type: 'workflow',
                    description: data.description,
                    confidence: 0.7
                  },
                  score: 0.7
                });
              }
            }
          });
        }
      });

      // Sort by score and take top recommendations
      const sortedRecommendations = recommendedTools
        .sort((a, b) => b.score - a.score)
        .slice(0, maxItems);

      setRecommendations(sortedRecommendations);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReasonIcon = (type: RecommendationReason['type']) => {
    switch (type) {
      case 'similar_category': return <Target className="w-4 h-4" />;
      case 'complementary': return <Sparkles className="w-4 h-4" />;
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      case 'underused': return <Brain className="w-4 h-4" />;
      case 'workflow': return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getReasonColor = (type: RecommendationReason['type']) => {
    switch (type) {
      case 'similar_category': return 'text-blue-400';
      case 'complementary': return 'text-purple-400';
      case 'trending': return 'text-green-400';
      case 'underused': return 'text-orange-400';
      case 'workflow': return 'text-yellow-400';
    }
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 text-center">
          <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No recommendations yet</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Use a few tools to get personalized recommendations based on your preferences and workflow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
          <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
            {recommendations.length}
          </span>
        </div>
        
        <button
          onClick={generateRecommendations}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-1"
        >
          <Sparkles className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((tool, index) => (
          <Link
            key={tool.id}
            to={tool.path}
            onClick={() => addRecentTool(tool.id, tool.category)}
            className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-all duration-300 hover:scale-105"
          >
            {/* Confidence Score */}
            <div className="absolute top-2 right-2">
              <div className="bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                {Math.round(tool.reason.confidence * 100)}% match
              </div>
            </div>

            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.gradient.replace('linear-gradient(135deg, ', '').replace(')', '')} flex items-center justify-center`}>
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{tool.name}</h3>
                <div className={`flex items-center space-x-1 text-xs ${getReasonColor(tool.reason.type)}`}>
                  {getReasonIcon(tool.reason.type)}
                  <span>{tool.reason.description}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {tool.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-purple-400 bg-purple-600/20 px-2 py-1 rounded-full">
                  Recommended
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          💡 Recommendations update based on your usage patterns
        </p>
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;