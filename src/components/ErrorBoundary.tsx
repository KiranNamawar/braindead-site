import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { errorReporter } from '../utils/errorReporting';
import { logger } from '../utils/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Report error
    errorReporter.reportError({
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: errorReporter['sessionId'],
      buildVersion: errorReporter['buildVersion']
    });
    
    // Log error
    logger.error('React Error Boundary caught error', error, {
      componentStack: errorInfo.componentStack
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-400 mb-6">
              Don't worry, even our brain-dead tools sometimes have hiccups. 
              Try refreshing the page or go back to the homepage.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRefresh}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-white hover:from-blue-400 hover:to-purple-500 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Page</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-gray-400 cursor-pointer hover:text-white text-sm">
                  Error Details (Dev Mode)
                </summary>
                <div className="mt-2 p-4 bg-gray-800/50 rounded-lg text-xs text-red-400 overflow-auto max-h-40">
                  <div className="font-semibold mb-2">Error:</div>
                  <pre className="whitespace-pre-wrap">{this.state.error.message}</pre>
                  {this.state.error.stack && (
                    <>
                      <div className="font-semibold mt-3 mb-2">Stack Trace:</div>
                      <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </>
                  )}
                  {this.state.errorInfo && (
                    <>
                      <div className="font-semibold mt-3 mb-2">Component Stack:</div>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;