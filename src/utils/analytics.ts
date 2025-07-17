// Analytics and usage tracking utilities
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: string;
  sessionId: string;
  userId?: string;
  properties?: Record<string, any>;
}

class Analytics {
  private sessionId: string;
  private userId?: string;
  private isProduction: boolean;
  private events: AnalyticsEvent[] = [];
  private analyticsId: string;
  private analyticsEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isProduction = import.meta.env.PROD;
    this.userId = this.getUserId();
    this.analyticsId = import.meta.env.VITE_ANALYTICS_ID || '';
    this.analyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
    
    // Initialize Google Analytics if enabled
    this.initializeGA();
    
    // Track page views
    this.trackPageView();
    
    // Set up periodic event flushing
    this.setupEventFlushing();
  }

  private initializeGA(): void {
    if (!this.analyticsEnabled || !this.analyticsId || this.analyticsId === 'G-XXXXXXXXXX') {
      return;
    }

    // Dynamically load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.analyticsId}`;
    document.head.appendChild(script);

    // Initialize gtag after script loads
    script.onload = () => {
      // Make gtag available globally
      (window as any).gtag = (window as any).gtag || function() {
        ((window as any).dataLayer = (window as any).dataLayer || []).push(arguments);
      };

      (window as any).gtag('config', this.analyticsId, {
        page_title: document.title,
        page_location: window.location.href,
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
    };
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private getUserId(): string | undefined {
    // Generate or retrieve anonymous user ID
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }

  private setupEventFlushing(): void {
    // Flush events every 30 seconds
    setInterval(() => {
      this.flushEvents();
    }, 30000);

    // Flush events before page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });
  }

  public track(event: string, properties?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      category: 'user_action',
      action: event,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      properties
    };

    this.events.push(analyticsEvent);
    
    // Send to Google Analytics if enabled
    if (this.analyticsEnabled && this.analyticsId && this.analyticsId !== 'G-XXXXXXXXXX' && window.gtag) {
      window.gtag('event', event, {
        event_category: 'user_action',
        event_label: properties?.label,
        value: properties?.value,
        custom_parameters: properties
      });
    }
    
    // Log in development
    if (!this.isProduction) {
      console.log('Analytics Event:', analyticsEvent);
    }
  }

  public trackPageView(path?: string): void {
    const currentPath = path || window.location.pathname;
    
    // Send to Google Analytics if enabled
    if (this.analyticsEnabled && this.analyticsId && this.analyticsId !== 'G-XXXXXXXXXX' && window.gtag) {
      window.gtag('config', this.analyticsId, {
        page_path: currentPath,
        page_title: document.title,
        page_location: window.location.href
      });
    }
    
    this.track('page_view', {
      path: currentPath,
      referrer: document.referrer,
      title: document.title
    });
  }

  public trackToolUsage(toolName: string, action: string, properties?: Record<string, any>): void {
    const startTime = Date.now();
    
    this.track('tool_usage', {
      tool: toolName,
      action,
      startTime,
      ...properties
    });

    // Enhanced tracking for productivity metrics
    this.trackProductivityMetrics(toolName, action, properties);
  }

  private trackProductivityMetrics(toolName: string, action: string, properties?: Record<string, any>): void {
    try {
      // Calculate estimated time saved based on tool type and action
      const timeSaved = this.calculateTimeSaved(toolName, action);
      
      // Track session data for better analytics
      const sessionData = {
        toolName,
        action,
        timeSaved,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        ...properties
      };

      // Store session data for advanced analytics
      this.storeSessionData(sessionData);
      
    } catch (error) {
      console.warn('Failed to track productivity metrics:', error);
    }
  }

  private calculateTimeSaved(toolName: string, action: string): number {
    // Enhanced time-saved calculations based on tool type and action
    const toolTimeMap: Record<string, number> = {
      'calculator': 2,
      'color-picker': 3,
      'qr-generator': 5,
      'text-tools': 4,
      'password-generator': 3,
      'hash-generator': 2,
      'image-optimizer': 10,
      'timestamp-converter': 3,
      'json-formatter': 4,
      'random-generator': 2,
      'unit-converter': 3,
      'base64-encoder': 2,
      'url-encoder': 2,
      'markdown-editor': 8,
      'regex-tester': 6,
      'css-formatter': 5,
      'lorem-ipsum': 3,
      'ascii-art': 4,
      'emoji-picker': 2,
      'gradient-generator': 6,
      'pomodoro-timer': 25,
      'world-clock': 2,
      'stopwatch': 1,
      'binary-converter': 3,
      'roman-numeral': 2
    };

    const actionMultiplier: Record<string, number> = {
      'generate': 1.0,
      'convert': 1.2,
      'format': 1.1,
      'calculate': 1.0,
      'optimize': 1.5,
      'analyze': 1.3,
      'create': 1.2,
      'export': 0.5,
      'copy': 0.2
    };

    const baseTime = toolTimeMap[toolName.toLowerCase()] || 3;
    const multiplier = actionMultiplier[action.toLowerCase()] || 1.0;
    
    return Math.round(baseTime * multiplier);
  }

  private storeSessionData(sessionData: any): void {
    try {
      const existingSessions = JSON.parse(localStorage.getItem('braindead-session-analytics') || '[]');
      existingSessions.push(sessionData);
      
      // Keep only last 1000 sessions
      if (existingSessions.length > 1000) {
        existingSessions.splice(0, existingSessions.length - 1000);
      }
      
      localStorage.setItem('braindead-session-analytics', JSON.stringify(existingSessions));
    } catch (error) {
      console.warn('Failed to store session data:', error);
    }
  }

  public trackError(error: string, context?: Record<string, any>): void {
    this.track('error', {
      error,
      ...context
    });
  }

  public trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.track('performance', {
      metric,
      value,
      unit
    });
  }

  private async flushEvents(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      if (this.isProduction) {
        // Send to analytics service (replace with your service)
        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ events: eventsToSend }),
        });
      } else {
        // Store locally in development
        const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        storedEvents.push(...eventsToSend);
        
        // Keep only last 1000 events
        if (storedEvents.length > 1000) {
          storedEvents.splice(0, storedEvents.length - 1000);
        }
        
        localStorage.setItem('analytics_events', JSON.stringify(storedEvents));
      }
    } catch (error) {
      console.warn('Failed to send analytics events:', error);
      // Re-add events to queue for retry
      this.events.unshift(...eventsToSend);
    }
  }

  public getStoredEvents(): AnalyticsEvent[] {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch {
      return [];
    }
  }

  public clearStoredEvents(): void {
    localStorage.removeItem('analytics_events');
  }

  // Advanced Analytics Methods
  public getSessionAnalytics(): any[] {
    try {
      return JSON.parse(localStorage.getItem('braindead-session-analytics') || '[]');
    } catch {
      return [];
    }
  }

  public getProductivityInsights(): {
    dailyProductivity: Record<string, number>;
    weeklyTrends: Array<{ week: string; productivity: number }>;
    toolEfficiency: Record<string, { usage: number; timeSaved: number; efficiency: number }>;
    peakUsageHours: Record<number, number>;
    categoryDistribution: Record<string, number>;
  } {
    const sessions = this.getSessionAnalytics();
    const now = new Date();
    
    // Daily productivity (last 30 days)
    const dailyProductivity: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyProductivity[dateKey] = 0;
    }

    // Weekly trends (last 12 weeks)
    const weeklyTrends: Array<{ week: string; productivity: number }> = [];
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekKey = `Week ${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      weeklyTrends.push({ week: weekKey, productivity: 0 });
    }

    // Tool efficiency tracking
    const toolEfficiency: Record<string, { usage: number; timeSaved: number; efficiency: number }> = {};
    
    // Peak usage hours (0-23)
    const peakUsageHours: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      peakUsageHours[i] = 0;
    }

    // Category distribution
    const categoryDistribution: Record<string, number> = {};

    // Process sessions
    sessions.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      const dateKey = sessionDate.toISOString().split('T')[0];
      const hour = sessionDate.getHours();
      
      // Update daily productivity
      if (dailyProductivity[dateKey] !== undefined) {
        dailyProductivity[dateKey] += session.timeSaved || 0;
      }

      // Update weekly trends
      const weekIndex = Math.floor((now.getTime() - sessionDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (weekIndex < 12 && weekIndex >= 0) {
        weeklyTrends[weekIndex].productivity += session.timeSaved || 0;
      }

      // Update tool efficiency
      const toolName = session.toolName;
      if (!toolEfficiency[toolName]) {
        toolEfficiency[toolName] = { usage: 0, timeSaved: 0, efficiency: 0 };
      }
      toolEfficiency[toolName].usage += 1;
      toolEfficiency[toolName].timeSaved += session.timeSaved || 0;
      toolEfficiency[toolName].efficiency = toolEfficiency[toolName].timeSaved / toolEfficiency[toolName].usage;

      // Update peak usage hours
      peakUsageHours[hour] += 1;

      // Update category distribution (simplified)
      const category = this.getToolCategory(toolName);
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
    });

    return {
      dailyProductivity,
      weeklyTrends: weeklyTrends.reverse(),
      toolEfficiency,
      peakUsageHours,
      categoryDistribution
    };
  }

  private getToolCategory(toolName: string): string {
    const categoryMap: Record<string, string> = {
      'calculator': 'Calculator',
      'color-picker': 'Creative Design',
      'qr-generator': 'Utility',
      'text-tools': 'Text Writing',
      'password-generator': 'Developer',
      'hash-generator': 'Developer',
      'image-optimizer': 'Creative Design',
      'timestamp-converter': 'Developer',
      'json-formatter': 'Developer',
      'random-generator': 'Utility',
      'unit-converter': 'Number Conversion',
      'base64-encoder': 'Developer',
      'url-encoder': 'Developer',
      'markdown-editor': 'Text Writing',
      'regex-tester': 'Developer',
      'css-formatter': 'Developer',
      'lorem-ipsum': 'Text Writing',
      'ascii-art': 'Creative Design',
      'emoji-picker': 'Creative Design',
      'gradient-generator': 'Creative Design',
      'pomodoro-timer': 'Time Productivity',
      'world-clock': 'Time Productivity',
      'stopwatch': 'Time Productivity',
      'binary-converter': 'Number Conversion',
      'roman-numeral': 'Number Conversion'
    };

    return categoryMap[toolName.toLowerCase()] || 'Utility';
  }

  public getUsagePatterns(): {
    mostActiveDay: string;
    mostActiveHour: number;
    averageSessionLength: number;
    toolSwitchingFrequency: number;
    productivityStreaks: Array<{ start: string; end: string; length: number }>;
    focusScore: number;
  } {
    const sessions = this.getSessionAnalytics();
    
    if (sessions.length === 0) {
      return {
        mostActiveDay: 'No data',
        mostActiveHour: 0,
        averageSessionLength: 0,
        toolSwitchingFrequency: 0,
        productivityStreaks: [],
        focusScore: 0
      };
    }

    // Analyze day patterns
    const dayCount: Record<string, number> = {};
    const hourCount: Record<number, number> = {};
    let totalSessionTime = 0;
    const toolSwitches: string[] = [];

    sessions.forEach((session, index) => {
      const date = new Date(session.timestamp);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();

      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
      hourCount[hour] = (hourCount[hour] || 0) + 1;
      totalSessionTime += session.timeSaved || 0;

      if (index > 0 && sessions[index - 1].toolName !== session.toolName) {
        toolSwitches.push(session.toolName);
      }
    });

    const mostActiveDay = Object.entries(dayCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    const mostActiveHour = Object.entries(hourCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    const averageSessionLength = totalSessionTime / sessions.length;
    const toolSwitchingFrequency = toolSwitches.length / sessions.length;

    // Calculate productivity streaks (simplified)
    const productivityStreaks: Array<{ start: string; end: string; length: number }> = [];
    let currentStreak = 0;
    let streakStart = '';

    sessions.forEach((session, index) => {
      if (session.timeSaved && session.timeSaved > 2) {
        if (currentStreak === 0) {
          streakStart = session.timestamp;
        }
        currentStreak++;
      } else {
        if (currentStreak >= 3) {
          productivityStreaks.push({
            start: streakStart,
            end: sessions[index - 1]?.timestamp || session.timestamp,
            length: currentStreak
          });
        }
        currentStreak = 0;
      }
    });

    // Calculate focus score (0-100)
    const uniqueTools = new Set(sessions.map(s => s.toolName)).size;
    const totalSessions = sessions.length;
    const focusScore = Math.max(0, 100 - (toolSwitchingFrequency * 50) - (uniqueTools / totalSessions * 30));

    return {
      mostActiveDay,
      mostActiveHour: parseInt(mostActiveHour),
      averageSessionLength: Math.round(averageSessionLength * 100) / 100,
      toolSwitchingFrequency: Math.round(toolSwitchingFrequency * 100) / 100,
      productivityStreaks,
      focusScore: Math.round(focusScore)
    };
  }

  public generateProductivityReport(): {
    summary: {
      totalTimeSaved: number;
      totalSessions: number;
      averageProductivity: number;
      topTool: string;
      improvementAreas: string[];
    };
    recommendations: string[];
    achievements: Array<{ title: string; description: string; unlocked: boolean }>;
  } {
    const sessions = this.getSessionAnalytics();
    const insights = this.getProductivityInsights();
    const patterns = this.getUsagePatterns();

    const totalTimeSaved = sessions.reduce((sum, session) => sum + (session.timeSaved || 0), 0);
    const totalSessions = sessions.length;
    const averageProductivity = totalSessions > 0 ? totalTimeSaved / totalSessions : 0;
    
    const topTool = Object.entries(insights.toolEfficiency)
      .sort(([,a], [,b]) => b.timeSaved - a.timeSaved)[0]?.[0] || 'None';

    // Identify improvement areas
    const improvementAreas: string[] = [];
    if (patterns.focusScore < 60) improvementAreas.push('Focus & Concentration');
    if (patterns.toolSwitchingFrequency > 0.5) improvementAreas.push('Tool Consistency');
    if (averageProductivity < 3) improvementAreas.push('Tool Utilization');
    if (Object.keys(insights.categoryDistribution).length < 3) improvementAreas.push('Tool Diversity');

    // Generate recommendations
    const recommendations: string[] = [];
    if (patterns.focusScore < 70) {
      recommendations.push('Try using fewer tools per session to improve focus');
    }
    if (totalTimeSaved < 60) {
      recommendations.push('Explore more tools to maximize your time savings');
    }
    if (patterns.productivityStreaks.length === 0) {
      recommendations.push('Build consistent usage habits for better productivity streaks');
    }
    if (Object.keys(insights.categoryDistribution).length < 4) {
      recommendations.push('Try tools from different categories to diversify your workflow');
    }

    // Define achievements
    const achievements = [
      {
        title: 'Time Saver',
        description: 'Saved over 60 minutes using tools',
        unlocked: totalTimeSaved >= 60
      },
      {
        title: 'Power User',
        description: 'Used tools over 50 times',
        unlocked: totalSessions >= 50
      },
      {
        title: 'Tool Explorer',
        description: 'Used tools from 5+ different categories',
        unlocked: Object.keys(insights.categoryDistribution).length >= 5
      },
      {
        title: 'Focused Worker',
        description: 'Achieved focus score above 80',
        unlocked: patterns.focusScore >= 80
      },
      {
        title: 'Streak Master',
        description: 'Maintained a productivity streak of 10+ sessions',
        unlocked: patterns.productivityStreaks.some(streak => streak.length >= 10)
      },
      {
        title: 'Early Bird',
        description: 'Most active during morning hours (6-10 AM)',
        unlocked: patterns.mostActiveHour >= 6 && patterns.mostActiveHour <= 10
      },
      {
        title: 'Night Owl',
        description: 'Most active during evening hours (8-11 PM)',
        unlocked: patterns.mostActiveHour >= 20 && patterns.mostActiveHour <= 23
      }
    ];

    return {
      summary: {
        totalTimeSaved,
        totalSessions,
        averageProductivity: Math.round(averageProductivity * 100) / 100,
        topTool,
        improvementAreas
      },
      recommendations,
      achievements
    };
  }

  public clearAnalyticsData(): void {
    localStorage.removeItem('braindead-session-analytics');
    localStorage.removeItem('analytics_events');
    localStorage.removeItem('analytics_user_id');
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Convenience functions
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  analytics.track(event, properties);
};

export const trackPageView = (path?: string) => {
  analytics.trackPageView(path);
};

export const trackToolUsage = (toolName: string, action: string, properties?: Record<string, any>) => {
  analytics.trackToolUsage(toolName, action, properties);
};

export const trackError = (error: string, context?: Record<string, any>) => {
  analytics.trackError(error, context);
};

export const trackPerformance = (metric: string, value: number, unit?: string) => {
  analytics.trackPerformance(metric, value, unit);
};