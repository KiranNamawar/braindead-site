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
    this.track('tool_usage', {
      tool: toolName,
      action,
      ...properties
    });
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