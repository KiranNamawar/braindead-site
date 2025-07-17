// PWA status and benefits component for homepage and other pages
import React, { useState, useEffect } from 'react';
import { Smartphone, Download, CheckCircle, Zap, Shield, WifiOff, Clock, Star } from 'lucide-react';

interface PWAStatusProps {
  variant?: 'compact' | 'full' | 'banner';
  showBenefits?: boolean;
  className?: string;
}

const PWAStatus: React.FC<PWAStatusProps> = ({ 
  variant = 'compact', 
  showBenefits = true,
  className = '' 
}) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [installDate, setInstallDate] = useState<Date | null>(null);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    // Check if installation is available
    const handleBeforeInstallPrompt = () => {
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Get installation date if available
    const storedDate = localStorage.getItem('pwa-installed-date');
    if (storedDate) {
      setInstallDate(new Date(storedDate));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const benefits = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Loads instantly, faster than any browser',
      color: 'text-yellow-500'
    },
    {
      icon: WifiOff,
      title: 'Works Offline',
      description: 'All tools work without internet',
      color: 'text-green-500'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'No tracking, no data collection',
      color: 'text-blue-500'
    },
    {
      icon: Smartphone,
      title: 'Native Feel',
      description: 'App-like experience on any device',
      color: 'text-purple-500'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {isInstalled ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              App Installed
            </span>
          </>
        ) : canInstall ? (
          <>
            <Download className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Install Available
            </span>
          </>
        ) : (
          <>
            <Smartphone className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              PWA Ready
            </span>
          </>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              {isInstalled ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <Download className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {isInstalled ? 'App Installed!' : 'Install BrainDead.site'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {isInstalled 
                  ? `Installed ${installDate ? installDate.toLocaleDateString() : 'recently'}`
                  : 'Get the full app experience'
                }
              </p>
            </div>
          </div>
          
          {!isInstalled && canInstall && (
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              Install
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          {isInstalled ? (
            <CheckCircle className="w-8 h-8 text-white" />
          ) : (
            <Download className="w-8 h-8 text-white" />
          )}
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {isInstalled ? 'App Installed!' : 'Install BrainDead.site'}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300">
          {isInstalled 
            ? 'You\'re using the full app experience'
            : 'Get instant access to all tools with the native app'
          }
        </p>
      </div>

      {showBenefits && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <benefit.icon className={`w-5 h-5 ${benefit.color} flex-shrink-0 mt-0.5`} />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                  {benefit.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isInstalled ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800 dark:text-green-200">
              Thanks for installing!
            </span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            You now have the fastest, most private way to access all your utility tools.
          </p>
        </div>
      ) : canInstall ? (
        <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
          Install Now - It's Free!
        </button>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
            Your browser supports PWA features. Installation may become available soon.
          </p>
        </div>
      )}
    </div>
  );
};

export default PWAStatus;