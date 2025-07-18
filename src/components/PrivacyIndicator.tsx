import React, { useState, useEffect } from 'react';
import { Shield, Eye, Database, Settings } from 'lucide-react';
import { privacyManager, secureStorage, dataUsageTracker } from '../utils/privacy';

interface PrivacyIndicatorProps {
  onOpenDashboard: () => void;
}

const PrivacyIndicator: React.FC<PrivacyIndicatorProps> = ({ onOpenDashboard }) => {
  const [storageInfo, setStorageInfo] = useState(secureStorage.getStorageInfo());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Update storage info periodically
    const interval = setInterval(() => {
      setStorageInfo(secureStorage.getStorageInfo());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Show indicator if localStorage is enabled
    const isEnabled = privacyManager.isEnabled('localStorage');
    setIsVisible(isEnabled && storageInfo.totalKeys > 0);
  }, [storageInfo]);

  if (!isVisible) return null;

  const storageUsedKB = Math.round(storageInfo.estimatedSize / 1024);
  const storageUsedPercent = Math.round((storageInfo.estimatedSize / storageInfo.maxSize) * 100);

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <button
        onClick={onOpenDashboard}
        className="group bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 shadow-lg hover:bg-gray-800/90 transition-all duration-300 hover:scale-105"
        title="Privacy Dashboard - Click to view data usage"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Shield className="w-5 h-5 text-green-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm font-medium">Privacy Active</span>
              <div className="flex items-center space-x-1">
                <Database className="w-3 h-3 text-blue-400" />
                <span className="text-blue-400 text-xs">{storageUsedKB}KB</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-300"
                  style={{ width: `${Math.min(storageUsedPercent, 100)}%` }}
                ></div>
              </div>
              <span className="text-gray-400 text-xs">{storageInfo.totalKeys} items</span>
            </div>
          </div>
          
          <Settings className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
        </div>
      </button>
    </div>
  );
};

export default PrivacyIndicator;