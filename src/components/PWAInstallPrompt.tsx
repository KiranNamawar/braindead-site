import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Zap, Shield, Clock, CheckCircle, Wifi, WifiOff } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallationProgress {
  step: 'prompt' | 'installing' | 'installed' | 'error';
  message: string;
  progress: number;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  const [installProgress, setInstallProgress] = useState<InstallationProgress>({
    step: 'prompt',
    message: '',
    progress: 0
  });
  const [dismissCount, setDismissCount] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    // Load dismiss count
    const stored = localStorage.getItem('pwa-install-dismiss-count');
    if (stored) {
      setDismissCount(parseInt(stored, 10));
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt based on dismiss count and timing
      const shouldShow = dismissCount < 3 && !sessionStorage.getItem('pwa-install-dismissed');
      if (shouldShow) {
        // Delay showing the prompt to avoid being intrusive
        setTimeout(() => setShowInstallPrompt(true), 3000);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      setShowOnboarding(true);
      
      // Clear dismiss count since user installed
      localStorage.removeItem('pwa-install-dismiss-count');
      
      // Track installation
      localStorage.setItem('pwa-installed-date', new Date().toISOString());
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [dismissCount]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setInstallProgress({
      step: 'installing',
      message: 'Preparing installation...',
      progress: 25
    });

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      setInstallProgress({
        step: 'installing',
        message: 'Waiting for your confirmation...',
        progress: 50
      });

      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setInstallProgress({
          step: 'installing',
          message: 'Installing BrainDead.site...',
          progress: 75
        });
        
        // Simulate installation progress
        setTimeout(() => {
          setInstallProgress({
            step: 'installed',
            message: 'Installation complete!',
            progress: 100
          });
          
          setTimeout(() => {
            setShowInstallPrompt(false);
          }, 2000);
        }, 1500);
      } else {
        setInstallProgress({
          step: 'prompt',
          message: '',
          progress: 0
        });
      }
    } catch (error) {
      setInstallProgress({
        step: 'error',
        message: 'Installation failed. Please try again.',
        progress: 0
      });
      
      setTimeout(() => {
        setInstallProgress({
          step: 'prompt',
          message: '',
          progress: 0
        });
      }, 3000);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    
    // Track dismissals
    const newCount = dismissCount + 1;
    setDismissCount(newCount);
    localStorage.setItem('pwa-install-dismiss-count', newCount.toString());
    
    // Remember user dismissed for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    
    // If dismissed multiple times, don't show again for a while
    if (newCount >= 3) {
      localStorage.setItem('pwa-install-suppress-until', 
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      );
    }
  };

  const handleShowBenefits = () => {
    setShowBenefits(true);
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  // Check if we should suppress the prompt
  const suppressUntil = localStorage.getItem('pwa-install-suppress-until');
  if (suppressUntil && new Date(suppressUntil) > new Date()) {
    return null;
  }

  // Don't show if already installed or user dismissed this session
  if (isInstalled || !showInstallPrompt || sessionStorage.getItem('pwa-install-dismissed')) {
    // Show onboarding if just installed
    if (showOnboarding && isInstalled) {
      return <PWAOnboarding onClose={handleCloseOnboarding} />;
    }
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
        {/* Progress bar */}
        {installProgress.step === 'installing' && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 transition-all duration-500"
              style={{ width: `${installProgress.progress}%` }}
            />
          </div>
        )}
        
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              {installProgress.step === 'installing' ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : installProgress.step === 'installed' ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <Download className="w-6 h-6 text-white" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {installProgress.step === 'installed' ? 'Welcome to BrainDead!' : 'Install BrainDead.site'}
              </h3>
              
              {installProgress.step === 'installing' ? (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {installProgress.message}
                </p>
              ) : installProgress.step === 'installed' ? (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  App installed successfully! Look for the icon on your home screen.
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Get instant access to 30+ utility tools. No ads, no tracking, works offline.
                  </p>
                  
                  {!showBenefits && (
                    <button
                      onClick={handleShowBenefits}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                    >
                      Why install? →
                    </button>
                  )}
                </>
              )}
              
              {showBenefits && installProgress.step === 'prompt' && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span>Instant loading - faster than your browser</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <WifiOff className="w-3 h-3 text-green-500" />
                    <span>Works completely offline</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <Shield className="w-3 h-3 text-blue-500" />
                    <span>No data collection or tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <Smartphone className="w-3 h-3 text-purple-500" />
                    <span>Native app experience</span>
                  </div>
                </div>
              )}
              
              {installProgress.step === 'prompt' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleInstallClick}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Install Now
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-sm font-medium transition-colors"
                  >
                    {dismissCount >= 2 ? "Don't ask again" : "Not now"}
                  </button>
                </div>
              )}
            </div>
            
            {installProgress.step === 'prompt' && (
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Post-installation onboarding component
const PWAOnboarding: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const onboardingSteps = [
    {
      title: "🎉 Welcome to BrainDead!",
      description: "You've successfully installed the app. Here's what you can do now:",
      features: [
        "Access all tools instantly from your home screen",
        "Use everything offline - no internet required",
        "Your data stays private and secure",
        "Enjoy faster loading than the web version"
      ]
    },
    {
      title: "🚀 Pro Tips",
      description: "Get the most out of your new app:",
      features: [
        "Pin your favorite tools for quick access",
        "Use Ctrl+K (Cmd+K) to search tools quickly",
        "All your preferences sync automatically",
        "Tools work seamlessly together"
      ]
    }
  ];

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {currentStepData.description}
          </p>
          
          <div className="space-y-3 mb-6">
            {currentStepData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-left">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              {currentStep < onboardingSteps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;