// Error reporting and monitoring utilities
interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  buildVersion: string;
}

class ErrorReporter {
  private sessionId: string;
  private buildVersion: string;
  private isProduction: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.buildVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
    this.isProduction = import.meta.env.PROD;
    
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        buildVersion: this.buildVersion
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        buildVersion: this.buildVersion
      });
    });
  }

  public reportError(error: Partial<ErrorReport>): void {
    const errorReport: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
      ...error
    };

    // Log to console in development
    if (!this.isProduction) {
      console.error('Error Report:', errorReport);
    }

    // Store locally for debugging
    this.storeErrorLocally(errorReport);

    // In production, you would send this to your error reporting service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    if (this.isProduction) {
      this.sendToErrorService(errorReport);
    }
  }

  private storeErrorLocally(error: ErrorReport): void {
    try {
      const errors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      errors.push(error);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('error_reports', JSON.stringify(errors));
    } catch (e) {
      console.warn('Failed to store error locally:', e);
    }
  }

  private async sendToErrorService(error: ErrorReport): Promise<void> {
    try {
      // Example implementation - replace with your error reporting service
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error),
      });
    } catch (e) {
      console.warn('Failed to send error to service:', e);
    }
  }

  public getStoredErrors(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('error_reports') || '[]');
    } catch {
      return [];
    }
  }

  public clearStoredErrors(): void {
    localStorage.removeItem('error_reports');
  }
}

// Create singleton instance
export const errorReporter = new ErrorReporter();

// Utility function for manual error reporting
export const reportError = (error: Error | string, context?: Record<string, any>) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;
  
  errorReporter.reportError({
    message: errorMessage,
    stack: errorStack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    sessionId: errorReporter['sessionId'],
    buildVersion: errorReporter['buildVersion'],
    ...context
  });
};