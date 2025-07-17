import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Zap } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      
      // Show prompt after a delay (don't be too aggressive)
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      
      // Show success message
      showInstallSuccessMessage();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        trackInstallAttempt('accepted');
      } else {
        console.log('User dismissed the install prompt');
        trackInstallAttempt('dismissed');
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
      trackInstallAttempt('error');
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    trackInstallAttempt('dismissed');
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const showInstallSuccessMessage = () => {
    // Create a temporary success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
        <span>App installed successfully!</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  };

  const trackInstallAttempt = (outcome: string) => {
    try {
      const analytics = JSON.parse(localStorage.getItem('braindead-analytics') || '{}');
      analytics.pwaInstallAttempts = (analytics.pwaInstallAttempts || 0) + 1;
      analytics.lastInstallAttempt = {
        outcome,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('braindead-analytics', JSON.stringify(analytics));
    } catch (error) {
      console.warn('Failed to track install attempt:', error);
    }
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Install BrainDead App</h3>
            <p className="text-gray-400 text-sm">Get faster access to all tools</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-3 text-sm text-gray-300">
          <Zap className="w-4 h-4 text-blue-400" />
          <span>Instant loading, even offline</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-300">
          <Monitor className="w-4 h-4 text-blue-400" />
          <span>Works like a native app</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-300">
          <Smartphone className="w-4 h-4 text-blue-400" />
          <span>Add to home screen</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isInstalling ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Installing...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Install App</span>
            </>
          )}
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Later
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        No app store required • Free forever • Your data stays private
      </p>
    </div>
  );
};

export default PWAInstallPrompt;