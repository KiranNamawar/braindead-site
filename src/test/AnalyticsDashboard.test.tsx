import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import * as useAnalyticsHook from '../hooks/useAnalytics';

// Mock the useAnalytics hook
const mockUseAnalytics = vi.spyOn(useAnalyticsHook, 'useAnalytics');

const mockAnalyticsData = {
  analytics: {
    totalToolsUsed: 25,
    totalTimeSaved: 120,
    mostUsedTool: 'calculator',
    productivityScore: 75,
    sessionsCount: 10,
    averageSessionDuration: 12,
    toolCategoryUsage: {
      'everyday-life': 5,
      'text-writing': 8,
      'creative-design': 3,
      'time-productivity': 4,
      'developer': 3,
      'number-conversion': 2,
      'calculator': 0,
      'utility': 0
    }
  },
  insights: {
    productivityTrend: 'up' as const,
    mostProductiveCategory: 'text-writing',
    averageSessionTime: 12,
    toolDiversityScore: 65,
    efficiencyRating: 'good' as const,
    recommendations: [
      'Try exploring more tool categories to boost your productivity diversity score!',
      'Consider using tools more frequently to improve your efficiency rating.'
    ]
  },
  usagePatterns: [
    {
      category: 'text-writing' as any,
      usage: 8,
      percentage: 32,
      trend: 'up' as const,
      averageTimeSpent: 15
    },
    {
      category: 'everyday-life' as any,
      usage: 5,
      percentage: 20,
      trend: 'stable' as const,
      averageTimeSpent: 10
    }
  ],
  isLoading: false,
  error: null,
  getProductivityBreakdown: () => ({
    breakdown: {
      usage: 30,
      diversity: 20,
      consistency: 15,
      efficiency: 10
    },
    total: 75,
    maxPossible: 100
  }),
  getTimeBasedAnalytics: () => ({
    today: { toolsUsed: 3, totalUsage: 5, timeSaved: 15 },
    week: { toolsUsed: 8, totalUsage: 15, timeSaved: 60 },
    month: { toolsUsed: 12, totalUsage: 25, timeSaved: 120 }
  }),
  getAdvancedInsights: () => ({
    dailyProductivity: {},
    weeklyTrends: [],
    toolEfficiency: {},
    peakUsageHours: {},
    categoryDistribution: {}
  }),
  getUsagePatterns: () => ({
    mostActiveDay: 'Monday',
    mostActiveHour: 14,
    averageSessionLength: 12,
    toolSwitchingFrequency: 0.3,
    productivityStreaks: [],
    focusScore: 75
  }),
  getProductivityReport: () => ({
    summary: {
      totalTimeSaved: 120,
      totalSessions: 25,
      averageProductivity: 4.8,
      topTool: 'calculator',
      improvementAreas: ['Focus & Concentration']
    },
    recommendations: ['Try using fewer tools per session to improve focus'],
    achievements: [
      {
        title: 'Time Saver',
        description: 'Saved over 60 minutes using tools',
        unlocked: true
      }
    ]
  }),
  getSessionAnalytics: () => [],
  loadAnalytics: vi.fn(),
  resetAnalytics: vi.fn(),
  exportAnalytics: vi.fn(),
  clearAllAnalytics: vi.fn()
};

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAnalytics.mockReturnValue(mockAnalyticsData);
  });

  it('should render analytics dashboard with basic metrics', () => {
    render(<AnalyticsDashboard />);
    
    // Check for key metrics
    expect(screen.getByText('25')).toBeInTheDocument(); // Total uses
    expect(screen.getByText('120m')).toBeInTheDocument(); // Time saved
    expect(screen.getByText('65%')).toBeInTheDocument(); // Diversity
    expect(screen.getByText('G')).toBeInTheDocument(); // Rating (Good)
  });

  it('should display productivity score breakdown', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Productivity Score Breakdown')).toBeInTheDocument();
    expect(screen.getAllByText('75/100')).toHaveLength(2); // One in header, one in breakdown
  });

  it('should show usage patterns by category', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Usage Patterns by Category')).toBeInTheDocument();
    expect(screen.getAllByText('Text Writing')).toHaveLength(2); // One in patterns, one in insights
    expect(screen.getByText('Everyday Life')).toBeInTheDocument();
  });

  it('should display insights and recommendations', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Insights & Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Productivity Trend')).toBeInTheDocument();
    expect(screen.getByText('Top Category')).toBeInTheDocument();
  });

  it('should toggle recommendations visibility', () => {
    render(<AnalyticsDashboard />);
    
    const toggleButton = screen.getByText('Show Details');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Personalized Recommendations:')).toBeInTheDocument();
    expect(screen.getByText('Try exploring more tool categories to boost your productivity diversity score!')).toBeInTheDocument();
  });

  it('should show advanced analytics when toggled', () => {
    render(<AnalyticsDashboard />);
    
    const advancedToggle = screen.getByText('Show Advanced');
    fireEvent.click(advancedToggle);
    
    expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
  });

  it('should handle export functionality', () => {
    render(<AnalyticsDashboard />);
    
    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);
    
    expect(mockAnalyticsData.exportAnalytics).toHaveBeenCalled();
  });

  it('should handle reset functionality with confirmation', () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<AnalyticsDashboard />);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to reset all analytics data? This action cannot be undone.');
    expect(mockAnalyticsData.resetAnalytics).toHaveBeenCalled();
    
    confirmSpy.mockRestore();
  });

  it('should display loading state', () => {
    mockUseAnalytics.mockReturnValue({
      ...mockAnalyticsData,
      isLoading: true,
      analytics: null
    });
    
    render(<AnalyticsDashboard />);
    
    // Should show loading animation
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should display error state', () => {
    mockUseAnalytics.mockReturnValue({
      ...mockAnalyticsData,
      isLoading: false,
      error: 'Failed to load analytics',
      analytics: null
    });
    
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Analytics Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Failed to load analytics')).toBeInTheDocument();
  });

  it('should display empty state when no analytics data', () => {
    mockUseAnalytics.mockReturnValue({
      ...mockAnalyticsData,
      isLoading: false,
      error: null,
      analytics: null
    });
    
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Analytics Unavailable')).toBeInTheDocument();
    expect(screen.getByText('No analytics data available yet. Start using tools to see your productivity insights!')).toBeInTheDocument();
  });

  it('should render in compact mode', () => {
    render(<AnalyticsDashboard compact={true} />);
    
    // Should not show advanced analytics in compact mode
    expect(screen.queryByText('Advanced Analytics')).not.toBeInTheDocument();
    // Should not show productivity breakdown in compact mode
    expect(screen.queryByText('Productivity Score Breakdown')).not.toBeInTheDocument();
  });

  it('should hide title when showTitle is false', () => {
    render(<AnalyticsDashboard showTitle={false} />);
    
    expect(screen.queryByText('Analytics Dashboard')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<AnalyticsDashboard className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});