// Enhanced PWA update notification component
import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, X, Zap, Sparkles, Shield } from 'lucide-react';
import { offlineManager } from '../utils/offlineManager';

interface UpdateInfo {
  version?: string;
  features?: string[];
  timestamp?: number;
}

const PWAUpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({});
  const [updateStep, setUpdateStep] = useState(0);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setShowUpdate(true);
    };

    const handleSWUpdated = (event: CustomEvent) => {
      const { version, features } = event.detail;
      setUpdateInfo({
        version,
        features,
        timestamp: Date.now()
      });
      setShowUpdate(true);
    };

    // Listen for service worker updates
    offlineManager.on('sw-update-available', handleUpdateAvailable);
    window.addEventListener('sw-updated', handleSWUpdated as EventListener);

    return () => {
      offlineManager.off('sw-update-available', handleUpdateAvailable);
      window.removeEventListener('sw-updated', handleSWUpdated as EventListener);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateStep(1);
    
    try {
      // Simulate update steps for better UX
      setTimeout(() => setUpdateStep(2), 500);
      setTimeout(() => setUpdateStep(3), 1000);
      
      await offlineManager.updateServiceWorker();
      // The page will reload automatically
    } catch (error) {
      console.error('Failed to update service worker:', error);
      setIsUpdating(false);
      setUpdateStep(0);
      
      // Fallback: manual reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    // Remember dismissal for this version
    sessionStorage.setItem('pwa-update-dismissed', updateInfo.version || 'unknown');
  };

  const updateSteps = [
    "Preparing update...",
    "Downloading new version...",
    "Installing update...",
    "Finalizing..."
  ];

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'advanced-caching':
        return <Zap className="w-3 h-3 text-yellow-500" />;
      case 'background-sync':
        return <RefreshCw className="w-3 h-3 text-blue-500" />;
      case 'push-notifications':
        return <Sparkles className="w-3 h-3 text-purple-500" />;
      case 'offline-first':
        return <Shield className="w-3 h-3 text-green-500" />;
      default:
        return <Sparkles className="w-3 h-3 text-gray-500" />;
    }
  };

  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'advanced-caching':
        return 'Faster Loading';
      case 'background-sync':
        return 'Background Sync';
      case 'push-notifications':
        return 'Notifications';
      case 'offline-first':
        return 'Better Offline';
      default:
        return feature.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Don't show if dismissed for this version
  if (!showUpdate || sessionStorage.getItem('pwa-update-dismissed') === updateInfo.version) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
          disabled={isUpdating}
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            {isUpdating ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-sm">
              {isUpdating ? updateSteps[updateStep] : 'Update Available'}
            </h4>
            {updateInfo.version && (
              <p className="text-blue-100 text-xs">
                Version {updateInfo.version}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isUpdating ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-3 relative">
              <div className="absolute inset-0 border-3 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-3 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
              {updateSteps[updateStep]}
            </h5>
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              This will only take a moment...
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              New features and improvements are ready to install.
            </p>

            {/* New Features */}
            {updateInfo.features && updateInfo.features.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 dark:text-white text-xs mb-2">
                  What's New:
                </h5>
                <div className="space-y-1">
                  {updateInfo.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {getFeatureIcon(feature)}
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {getFeatureName(feature)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sarcastic Note */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                "Yes, we actually improved things. No subscription required, shocking we know."
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 shadow-md"
              >
                <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>{isUpdating ? 'Updating...' : 'Update Now'}</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={isUpdating}
              >
                Later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PWAUpdateNotification;