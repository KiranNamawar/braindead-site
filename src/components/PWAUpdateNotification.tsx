// PWA update notification component
import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, X, Zap } from 'lucide-react';
import { offlineManager } from '../utils/offlineManager';

const PWAUpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateVersion, setUpdateVersion] = useState('');

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setShowUpdate(true);
    };

    const handleUpdated = (version: string) => {
      setUpdateVersion(version);
      setShowUpdate(true);
    };

    // Listen for service worker updates
    offlineManager.on('sw-update-available', handleUpdateAvailable);
    offlineManager.on('sw-updated', handleUpdated);

    return () => {
      offlineManager.off('sw-update-available', handleUpdateAvailable);
      offlineManager.off('sw-updated', handleUpdated);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      await offlineManager.updateServiceWorker();
      // The page will reload automatically
    } catch (error) {
      console.error('Failed to update service worker:', error);
      setIsUpdating(false);
      
      // Fallback: manual reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-update-dismissed', 'true');
  };

  // Don't show if dismissed this session
  if (!showUpdate || sessionStorage.getItem('pwa-update-dismissed')) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 max-w-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
          {isUpdating ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Zap className="w-5 h-5 text-white" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {isUpdating ? 'Updating App...' : 'App Update Available!'}
          </h3>
          
          {isUpdating ? (
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              Installing the latest version...
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                A new version with improvements and bug fixes is ready.
              </p>
              
              {updateVersion && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Version: {updateVersion}
                </p>
              )}
            </>
          )}
          
          {!isUpdating && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleUpdate}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Update Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-xs font-medium transition-colors"
              >
                Later
              </button>
            </div>
          )}
        </div>
        
        {!isUpdating && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Update benefits */}
      {!isUpdating && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            <Download className="w-3 h-3" />
            <span>Updates install instantly and work offline</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAUpdateNotification;