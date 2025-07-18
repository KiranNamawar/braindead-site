import React, { useState, useEffect } from 'react';
import { Shield, X, Settings, Eye, Lock } from 'lucide-react';
import { consentManager, privacyManager } from '../utils/privacy';

interface PrivacyNoticeProps {
  onOpenDashboard: () => void;
}

const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ onOpenDashboard }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Check if user has already interacted with privacy settings
    const hasConsent = consentManager.getCurrentConsent('localStorage') !== null;
    const hasSeenNotice = localStorage.getItem('__privacy_notice_seen');
    
    if (!hasConsent && !hasSeenNotice) {
      // Show notice after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    consentManager.recordConsent('localStorage', true);
    consentManager.recordConsent('analytics', true);
    consentManager.recordConsent('dataCollection', true);
    
    privacyManager.updateSettings({
      localStorage: true,
      analytics: true,
      dataCollection: true
    });
    
    localStorage.setItem('__privacy_notice_seen', 'true');
    setIsVisible(false);
    setHasInteracted(true);
  };

  const handleRejectAll = () => {
    consentManager.recordConsent('localStorage', false);
    consentManager.recordConsent('analytics', false);
    consentManager.recordConsent('dataCollection', false);
    
    privacyManager.updateSettings({
      localStorage: false,
      analytics: false,
      dataCollection: false
    });
    
    localStorage.setItem('__privacy_notice_seen', 'true');
    setIsVisible(false);
    setHasInteracted(true);
  };

  const handleCustomize = () => {
    localStorage.setItem('__privacy_notice_seen', 'true');
    setIsVisible(false);
    onOpenDashboard();
  };

  const handleDismiss = () => {
    localStorage.setItem('__privacy_notice_seen', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 animate-slide-up">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Privacy First</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="w-6 h-6 bg-gray-800 hover:bg-gray-700 rounded-md flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            We respect your privacy. All your data stays on your device - no servers, no tracking, no BS.
          </p>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Lock className="w-3 h-3 text-green-400" />
              <span className="text-gray-300">Data encrypted locally</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Eye className="w-3 h-3 text-blue-400" />
              <span className="text-gray-300">No external tracking</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Settings className="w-3 h-3 text-purple-400" />
              <span className="text-gray-300">Full control over your data</span>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 leading-relaxed">
              We may store preferences and usage data locally to improve your experience. 
              You can customize these settings or disable them entirely.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2 mt-6">
          <div className="flex space-x-2">
            <button
              onClick={handleAcceptAll}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Accept All
            </button>
            <button
              onClick={handleRejectAll}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Reject All
            </button>
          </div>
          <button
            onClick={handleCustomize}
            className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
          >
            Customize Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyNotice;