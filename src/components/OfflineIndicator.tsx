import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle, Clock, Database, Zap } from 'lucide-react';
import { offlineManager } from '../utils/offlineManager';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const [queueSize, setQueueSize] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      setSyncInProgress(true);
      
      // Hide the "back online" message after 4 seconds
      setTimeout(() => {
        setShowBackOnline(false);
        setSyncInProgress(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
      setSyncInProgress(false);
    };

    const handleQueueUpdate = () => {
      setQueueSize(offlineManager.getOfflineQueueSize());
    };

    const handleSyncSuccess = () => {
      setQueueSize(offlineManager.getOfflineQueueSize());
    };

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Offline manager events
    offlineManager.on('queue-item-processed', handleSyncSuccess);
    offlineManager.on('queue-item-failed', handleQueueUpdate);

    // Initial queue size
    setQueueSize(offlineManager.getOfflineQueueSize());

    // Update queue size periodically
    const interval = setInterval(handleQueueUpdate, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      offlineManager.off('queue-item-processed', handleSyncSuccess);
      offlineManager.off('queue-item-failed', handleQueueUpdate);
      clearInterval(interval);
    };
  }, []);

  // Show "back online" notification with sync status
  if (showBackOnline) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 min-w-0">
        {syncInProgress ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium">Back online! Syncing data...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">Back online! All synced.</span>
          </>
        )}
      </div>
    );
  }

  // Show offline indicator with enhanced information
  if (!isOnline) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div 
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer transition-all duration-200 hover:shadow-xl"
          onClick={() => setShowDetails(!showDetails)}
        >
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">You're offline - but tools still work!</span>
          {queueSize > 0 && (
            <div className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-bold">
              {queueSize}
            </div>
          )}
        </div>
        
        {showDetails && (
          <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Zap className="w-4 h-4" />
                <span className="font-medium">All tools work offline</span>
              </div>
              
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Database className="w-4 h-4" />
                <span>Your data stays in your browser</span>
              </div>
              
              {queueSize > 0 && (
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <Clock className="w-4 h-4" />
                  <span>{queueSize} items queued for sync</span>
                </div>
              )}
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  No internet? No problem. Everything works locally without sending data anywhere.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default OfflineIndicator;