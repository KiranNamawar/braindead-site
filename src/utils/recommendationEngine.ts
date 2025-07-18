// Tool comparison and recommendation engine
import { Tool, ToolCategory, ToolUsage } from '../types';
import { toolRegistry } from './toolRegistry';
import { storageManager } from './storage';

export interface ToolComparison {
  tool1: Tool;
  tool2: Tool;
  similarities: string[];
  differences: string[];
  recommendation: {
    preferred: Tool;
    reason: string;
    useCase: string;
  };
}

export interface ToolRecommendation {
  tool: Tool;
  score: number;
  reasons: string[];
  category: 'similar' | 'complementary' | 'alternative' | 'upgrade';
  confidence: number;
}

export interface RecommendationContext {
  currentTool?: string;
  userPreferences?: {
    favoriteCategories: ToolCategory[];
    usagePatterns: Record<string, number>;
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
  };
  taskContext?: {
    inputType: string;
    outputType: string;
    complexity: 'simple' | 'medium' | 'complex';
  };
}

class RecommendationEngine {
  private toolSimilarityCache: Map<string, Map<string, number>> = new Map();

  constructor() {
    this.precomputeSimilarities();
  }

  private precomputeSimilarities(): void {
    const allTools = toolRegistry.getAllTools();
    
    allTools.forEach(tool1 => {
      const similarities = new Map<string, number>();
      
      allTools.forEach(tool2 => {
        if (tool1.id !== tool2.id) {
          const similarity = this.calculateToolSimilarity(tool1, tool2);
          similarities.set(tool2.id, similarity);
        }
      });
      
      this.toolSimilarityCache.set(tool1.id, similarities);
    });
  }

  private calculateToolSimilarity(tool1: Tool, tool2: Tool): number {
    let similarity = 0;
    
    // Category similarity (40% weight)
    if (tool1.category === tool2.category) {
      similarity += 0.4;
    } else if (this.areRelatedCategories(tool1.category, tool2.category)) {
      similarity += 0.2;
    }
    
    // Feature overlap (30% weight)
    const featureOverlap = this.calculateFeatureOverlap(tool1.features, tool2.features);
    similarity += featureOverlap * 0.3;
    
    // Keyword overlap (20% weight)
    const keywordOverlap = this.calculateKeywordOverlap(tool1.keywords, tool2.keywords);
    similarity += keywordOverlap * 0.2;
    
    // Time saved similarity (10% weight)
    const timeDiff = Math.abs(tool1.estimatedTimeSaved - tool2.estimatedTimeSaved);
    const maxTime = Math.max(tool1.estimatedTimeSaved, tool2.estimatedTimeSaved);
    const timeSimilarity = maxTime > 0 ? 1 - (timeDiff / maxTime) : 1;
    similarity += timeSimilarity * 0.1;
    
    return Math.min(1, similarity);
  }

  private areRelatedCategories(cat1: ToolCategory, cat2: ToolCategory): boolean {
    const relatedGroups = [
      [ToolCategory.TEXT_WRITING, ToolCategory.DEVELOPER],
      [ToolCategory.CREATIVE_DESIGN, ToolCategory.DEVELOPER],
      [ToolCategory.CALCULATOR, ToolCategory.NUMBER_CONVERSION],
      [ToolCategory.EVERYDAY_LIFE, ToolCategory.CALCULATOR],
      [ToolCategory.TIME_PRODUCTIVITY, ToolCategory.EVERYDAY_LIFE]
    ];
    
    return relatedGroups.some(group => 
      group.includes(cat1) && group.includes(cat2)
    );
  }

  private calculateFeatureOverlap(features1: string[], features2: string[]): number {
    if (features1.length === 0 && features2.length === 0) return 1;
    if (features1.length === 0 || features2.length === 0) return 0;
    
    const set1 = new Set(features1.map(f => f.toLowerCase()));
    const set2 = new Set(features2.map(f => f.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  private calculateKeywordOverlap(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 && keywords2.length === 0) return 1;
    if (keywords1.length === 0 || keywords2.length === 0) return 0;
    
    const set1 = new Set(keywords1.map(k => k.toLowerCase()));
    const set2 = new Set(keywords2.map(k => k.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  public getToolRecommendations(
    context: RecommendationContext,
    limit: number = 5
  ): ToolRecommendation[] {
    const allTools = toolRegistry.getAllTools();
    const recentTools = storageManager.getRecentTools();
    const favorites = storageManager.getFavorites();
    const analytics = storageManager.getAnalytics();
    
    const recommendations: ToolRecommendation[] = [];
    
    allTools.forEach(tool => {
      if (context.currentTool && tool.id === context.currentTool) return;
      
      const recommendation = this.calculateToolRecommendation(
        tool,
        context,
        recentTools,
        favorites,
        analytics
      );
      
      if (recommendation.score > 0.1) {
        recommendations.push(recommendation);
      }
    });
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private calculateToolRecommendation(
    tool: Tool,
    context: RecommendationContext,
    recentTools: ToolUsage[],
    favorites: string[],
    analytics: any
  ): ToolRecommendation {
    let score = 0;
    const reasons: string[] = [];
    let category: 'similar' | 'complementary' | 'alternative' | 'upgrade' = 'similar';
    
    // Base similarity score if current tool is provided
    if (context.currentTool) {
      const similarity = this.toolSimilarityCache.get(context.currentTool)?.get(tool.id) || 0;
      score += similarity * 0.4;
      
      if (similarity > 0.7) {
        reasons.push('Very similar functionality');
        category = 'similar';
      } else if (similarity > 0.4) {
        reasons.push('Related functionality');
        category = 'complementary';
      }
    }
    
    // User preference scoring
    const recentUsage = recentTools.find(rt => rt.toolId === tool.id);
    if (recentUsage) {
      score += Math.min(0.3, recentUsage.usageCount / 10);
      reasons.push(`Used ${recentUsage.usageCount} times recently`);
    }
    
    if (favorites.includes(tool.id)) {
      score += 0.3;
      reasons.push('One of your favorites');
    }
    
    // Category preference
    if (context.userPreferences?.favoriteCategories.includes(tool.category)) {
      score += 0.2;
      reasons.push(`Matches your preferred category`);
    }
    
    // Time efficiency
    if (tool.estimatedTimeSaved > 5) {
      score += 0.1;
      reasons.push(`Saves ~${tool.estimatedTimeSaved} minutes`);
    }
    
    const confidence = Math.min(1, score + (reasons.length * 0.05));
    
    return {
      tool,
      score: Math.min(1, score),
      reasons: reasons.slice(0, 3),
      category,
      confidence
    };
  }

  public compareTools(toolId1: string, toolId2: string): ToolComparison | null {
    const tool1 = toolRegistry.getTool(toolId1);
    const tool2 = toolRegistry.getTool(toolId2);
    
    if (!tool1 || !tool2) return null;
    
    const similarities: string[] = [];
    const differences: string[] = [];
    
    // Category comparison
    if (tool1.category === tool2.category) {
      similarities.push(`Both are ${tool1.category} tools`);
    } else {
      differences.push(`Different categories: ${tool1.category} vs ${tool2.category}`);
    }
    
    // Time efficiency comparison
    if (tool1.estimatedTimeSaved !== tool2.estimatedTimeSaved) {
      const more = tool1.estimatedTimeSaved > tool2.estimatedTimeSaved ? tool1 : tool2;
      const less = tool1.estimatedTimeSaved > tool2.estimatedTimeSaved ? tool2 : tool1;
      differences.push(`${more.name} saves more time (${more.estimatedTimeSaved} vs ${less.estimatedTimeSaved} minutes)`);
    }
    
    // Determine recommendation
    const recentTools = storageManager.getRecentTools();
    const usage1 = recentTools.find(rt => rt.toolId === toolId1);
    const usage2 = recentTools.find(rt => rt.toolId === toolId2);
    
    let preferred = tool1;
    let reason = 'Both tools are equally suitable';
    let useCase = 'Choose based on your specific needs';
    
    if (usage1 && usage2) {
      preferred = usage1.usageCount > usage2.usageCount ? tool1 : tool2;
      reason = `You use ${preferred.name} more frequently`;
    } else if (tool1.estimatedTimeSaved !== tool2.estimatedTimeSaved) {
      preferred = tool1.estimatedTimeSaved > tool2.estimatedTimeSaved ? tool1 : tool2;
      reason = `${preferred.name} is more time-efficient`;
    }
    
    return {
      tool1,
      tool2,
      similarities,
      differences,
      recommendation: {
        preferred,
        reason,
        useCase
      }
    };
  }

  public getSimilarTools(toolId: string, limit: number = 3): Tool[] {
    const similarities = this.toolSimilarityCache.get(toolId);
    if (!similarities) return [];
    
    const sorted = Array.from(similarities.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
    
    return sorted
      .map(([id]) => toolRegistry.getTool(id))
      .filter((tool): tool is Tool => tool !== undefined);
  }
}

// Create singleton instance
export const recommendationEngine = new RecommendationEngine();

// Convenience functions
export const getToolRecommendations = (context: RecommendationContext, limit?: number) =>
  recommendationEngine.getToolRecommendations(context, limit);

export const compareTools = (toolId1: string, toolId2: string) =>
  recommendationEngine.compareTools(toolId1, toolId2);

export const getSimilarTools = (toolId: string, limit?: number) =>
  recommendationEngine.getSimilarTools(toolId, limit);