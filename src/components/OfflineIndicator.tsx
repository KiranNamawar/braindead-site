import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, AlertCircle, CheckCircle } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => setShowNotification(false), 3000);
      
      // Track offline duration
      if (lastOfflineTime) {
        const offlineDuration = Date.now() - lastOfflineTime.getTime();
        trackOfflineSession(offlineDuration);
        setLastOfflineTime(null);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
      setLastOfflineTime(new Date());
      
      // Keep offline notification visible
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [lastOfflineTime]);

  const trackOfflineSession = (duration: number) => {
    try {
      const analytics = JSON.parse(localStorage.getItem('braindead-analytics') || '{}');
      analytics.offlineSessions = (analytics.offlineSessions || 0) + 1;
      analytics.totalOfflineTime = (analytics.totalOfflineTime || 0) + duration;
      analytics.lastOfflineSession = {
        duration,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('braindead-analytics', JSON.stringify(analytics));
    } catch (error) {
      console.warn('Failed to track offline session:', error);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!showNotification && isOnline) {
    return null;
  }

  return (
    <>
      {/* Persistent offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 z-50">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">You're offline</span>
            <span className="text-xs opacity-75">• Most tools still work</span>
          </div>
        </div>
      )}

      {/* Notification toast */}
      {showNotification && (
        <div className={`fixed top-4 right-4 max-w-sm rounded-lg shadow-lg z-50 p-4 transition-all duration-300 ${
          isOnline 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {isOnline ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium">
                {isOnline ? 'Back online!' : 'You\'re offline'}
              </h4>
              <p className="text-sm opacity-90 mt-1">
                {isOnline 
                  ? 'All features are now available'
                  : 'Don\'t worry, most tools still work offline'
                }
              </p>
              {!isOnline && (
                <div className="mt-2">
                  <div className="text-xs opacity-75">
                    ✓ Calculator, converters, generators work offline<br/>
                    ✓ Your data is saved locally<br/>
                    ✗ Search suggestions may be limited
                  </div>
                </div>
              )}
            </div>
            {isOnline && (
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
                aria-label="Dismiss notification"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Connection status indicator (small persistent indicator) */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
          isOnline 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {isOnline ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </>
  );
};

export default OfflineIndicator;