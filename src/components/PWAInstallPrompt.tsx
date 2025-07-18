import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Zap, Shield, Wifi, Clock } from 'lucide-react';
import { pwaInstallManager } from '../utils/pwaInstallManager';

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onInstall,
  onDismiss
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installStep, setInstallStep] = useState(0);
  const [installStats, setInstallStats] = useState(pwaInstallManager.getInstallStats());

  useEffect(() => {
    const handleInstallPromptAvailable = (event: CustomEvent) => {
      const { showCount, maxShows } = event.detail;
      setInstallStats(pwaInstallManager.getInstallStats());
      setShowPrompt(true);
    };

    const handlePWAInstalled = () => {
      console.log('PWA was installed');
      setShowPrompt(false);
      setInstallStats(pwaInstallManager.getInstallStats());
      onInstall?.();
    };

    const handleInstallAccepted = () => {
      console.log('Install accepted');
    };

    const handleInstallDismissed = () => {
      console.log('Install dismissed');
      setShowPrompt(false);
      onDismiss?.();
    };

    // Listen for PWA install manager events
    window.addEventListener('pwa-install-prompt-available', handleInstallPromptAvailable as EventListener);
    window.addEventListener('pwa-pwa-installed', handlePWAInstalled as EventListener);
    window.addEventListener('pwa-install-accepted', handleInstallAccepted as EventListener);
    window.addEventListener('pwa-install-dismissed', handleInstallDismissed as EventListener);

    return () => {
      window.removeEventListener('pwa-install-prompt-available', handleInstallPromptAvailable as EventListener);
      window.removeEventListener('pwa-pwa-installed', handlePWAInstalled as EventListener);
      window.removeEventListener('pwa-install-accepted', handleInstallAccepted as EventListener);
      window.removeEventListener('pwa-install-dismissed', handleInstallDismissed as EventListener);
    };
  }, [onInstall, onDismiss]);

  const handleInstall = async () => {
    if (!installStats.canInstall) return;

    setIsInstalling(true);
    setInstallStep(1);

    try {
      setInstallStep(2);
      
      // Use the PWA install manager to trigger the install
      const result = await pwaInstallManager.triggerInstallPrompt();
      
      if (result?.outcome === 'accepted') {
        setInstallStep(3);
        console.log('User accepted the install prompt');
        
        // Wait a bit to show success state
        setTimeout(() => {
          setShowPrompt(false);
          onInstall?.();
        }, 2000);
      } else {
        console.log('User dismissed the install prompt');
        setShowPrompt(false);
        onDismiss?.();
      }
    } catch (error) {
      console.error('Error during installation:', error);
      setShowPrompt(false);
    } finally {
      setIsInstalling(false);
      setInstallStep(0);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onDismiss?.();
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already dismissed this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  // Don't show if already installed or can't install
  if (!showPrompt || installStats.isInstalled || !installStats.canInstall) {
    return null;
  }

  const benefits = [
    {
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      title: "Lightning Fast",
      description: "Instant loading, no browser overhead"
    },
    {
      icon: <Wifi className="w-5 h-5 text-blue-400" />,
      title: "Works Offline",
      description: "Use tools even without internet"
    },
    {
      icon: <Shield className="w-5 h-5 text-green-400" />,
      title: "Privacy First",
      description: "No tracking, data stays local"
    },
    {
      icon: <Clock className="w-5 h-5 text-purple-400" />,
      title: "Always Available",
      description: "Quick access from home screen"
    }
  ];

  const installSteps = [
    "Preparing installation...",
    "Waiting for your confirmation...",
    "Installing app...",
    "Installation complete!"
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            disabled={isInstalling}
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Install BrainDead.site</h3>
              <p className="text-blue-100 text-sm">Get the full app experience</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isInstalling ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {installSteps[installStep]}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                This will only take a moment...
              </p>
            </div>
          ) : (
            <>
              {/* Benefits */}
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Why install the app?
                </h4>
                
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {benefit.icon}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                        {benefit.title}
                      </h5>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sarcastic Note */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  "Finally, an app that doesn't ask for your location, contacts, or firstborn child. 
                  Revolutionary concept, we know."
                </p>
              </div>

              {/* Install Button */}
              <button
                onClick={handleInstall}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                <span>Install App</span>
              </button>

              {/* Dismiss Option */}
              <button
                onClick={handleDismiss}
                className="w-full mt-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm py-2 transition-colors"
              >
                Maybe later
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;