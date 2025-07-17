// PWA installation guide for different platforms and browsers
import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Monitor, 
  MoreVertical, 
  Share, 
  Plus, 
  Download,
  Chrome,
  Firefox,
  Safari,
  X,
  ChevronRight
} from 'lucide-react';

interface PWAInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InstallStep {
  icon: React.ComponentType<any>;
  text: string;
  detail?: string;
}

interface PlatformGuide {
  name: string;
  icon: React.ComponentType<any>;
  steps: InstallStep[];
  note?: string;
}

const PWAInstallGuide: React.FC<PWAInstallGuideProps> = ({ isOpen, onClose }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserAgent(navigator.userAgent);
      
      // Auto-detect platform
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        setSelectedPlatform('ios-safari');
      } else if (/Android/.test(navigator.userAgent)) {
        if (/Chrome/.test(navigator.userAgent)) {
          setSelectedPlatform('android-chrome');
        } else if (/Firefox/.test(navigator.userAgent)) {
          setSelectedPlatform('android-firefox');
        }
      } else if (/Chrome/.test(navigator.userAgent)) {
        setSelectedPlatform('desktop-chrome');
      } else if (/Firefox/.test(navigator.userAgent)) {
        setSelectedPlatform('desktop-firefox');
      } else if (/Safari/.test(navigator.userAgent)) {
        setSelectedPlatform('desktop-safari');
      }
    }
  }, []);

  const installGuides: Record<string, PlatformGuide> = {
    'ios-safari': {
      name: 'iPhone/iPad (Safari)',
      icon: Safari,
      steps: [
        {
          icon: Share,
          text: 'Tap the Share button',
          detail: 'Look for the square with an arrow pointing up at the bottom of Safari'
        },
        {
          icon: Plus,
          text: 'Select "Add to Home Screen"',
          detail: 'Scroll down in the share menu to find this option'
        },
        {
          icon: Download,
          text: 'Tap "Add" to confirm',
          detail: 'The app icon will appear on your home screen'
        }
      ],
      note: 'The app will work just like a native iOS app with offline capabilities!'
    },
    'android-chrome': {
      name: 'Android (Chrome)',
      icon: Chrome,
      steps: [
        {
          icon: MoreVertical,
          text: 'Tap the menu (3 dots)',
          detail: 'Located in the top-right corner of Chrome'
        },
        {
          icon: Plus,
          text: 'Select "Add to Home screen"',
          detail: 'You might also see "Install app" option'
        },
        {
          icon: Download,
          text: 'Tap "Add" to confirm',
          detail: 'The app will be installed like any other Android app'
        }
      ],
      note: 'You can also look for the install banner that appears automatically!'
    },
    'android-firefox': {
      name: 'Android (Firefox)',
      icon: Firefox,
      steps: [
        {
          icon: MoreVertical,
          text: 'Tap the menu (3 dots)',
          detail: 'Located in the top-right corner'
        },
        {
          icon: Plus,
          text: 'Select "Install"',
          detail: 'Firefox will show an install option for PWAs'
        },
        {
          icon: Download,
          text: 'Confirm installation',
          detail: 'The app will be added to your home screen'
        }
      ]
    },
    'desktop-chrome': {
      name: 'Desktop (Chrome)',
      icon: Chrome,
      steps: [
        {
          icon: Download,
          text: 'Look for the install icon',
          detail: 'A download/install icon appears in the address bar'
        },
        {
          icon: Plus,
          text: 'Click "Install"',
          detail: 'Chrome will show an install dialog'
        },
        {
          icon: Monitor,
          text: 'App opens in its own window',
          detail: 'The app will behave like a native desktop application'
        }
      ],
      note: 'You can also use Chrome menu > More tools > Create shortcut'
    },
    'desktop-firefox': {
      name: 'Desktop (Firefox)',
      icon: Firefox,
      steps: [
        {
          icon: MoreVertical,
          text: 'Open Firefox menu',
          detail: 'Click the hamburger menu (3 lines)'
        },
        {
          icon: Plus,
          text: 'Look for "Install this site as an app"',
          detail: 'This option appears for PWA-compatible sites'
        },
        {
          icon: Download,
          text: 'Follow the installation prompts',
          detail: 'Firefox will create a desktop app'
        }
      ]
    },
    'desktop-safari': {
      name: 'Desktop (Safari)',
      icon: Safari,
      steps: [
        {
          icon: Share,
          text: 'Click File menu',
          detail: 'Go to File in the menu bar'
        },
        {
          icon: Plus,
          text: 'Select "Add to Dock"',
          detail: 'This creates a web app in your Dock'
        },
        {
          icon: Monitor,
          text: 'App appears in Dock',
          detail: 'Click the icon to open the app'
        }
      ],
      note: 'Safari\'s PWA support is more limited but still functional'
    }
  };

  const platforms = [
    { id: 'ios-safari', name: 'iPhone/iPad', icon: Smartphone },
    { id: 'android-chrome', name: 'Android', icon: Smartphone },
    { id: 'desktop-chrome', name: 'Desktop', icon: Monitor }
  ];

  if (!isOpen) return null;

  const currentGuide = installGuides[selectedPlatform];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Install BrainDead.site
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Platform Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Choose your platform:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
                    selectedPlatform === platform.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <platform.icon className="w-5 h-5" />
                  <span className="font-medium">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Installation Steps */}
          {currentGuide && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <currentGuide.icon className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentGuide.name}
                </h3>
              </div>

              <div className="space-y-4 mb-6">
                {currentGuide.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <step.icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {step.text}
                        </span>
                      </div>
                      {step.detail && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {step.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {currentGuide.note && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>💡 Pro tip:</strong> {currentGuide.note}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Benefits Reminder */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Why install the app?
            </h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Works completely offline</li>
              <li>• Faster loading than the website</li>
              <li>• No ads or tracking</li>
              <li>• Native app experience</li>
              <li>• Quick access from home screen/desktop</li>
            </ul>
          </div>

          {/* Troubleshooting */}
          <details className="mt-6">
            <summary className="cursor-pointer font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Troubleshooting & FAQ
            </summary>
            <div className="mt-3 space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <strong>Q: I don't see the install option</strong>
                <p>Make sure you're using a supported browser and that the site has loaded completely. Some browsers require you to interact with the site first.</p>
              </div>
              <div>
                <strong>Q: Will this use storage on my device?</strong>
                <p>Yes, but very little (usually under 10MB). The app caches essential files for offline use.</p>
              </div>
              <div>
                <strong>Q: Can I uninstall it later?</strong>
                <p>Absolutely! You can uninstall it just like any other app on your device.</p>
              </div>
              <div>
                <strong>Q: Is my data safe?</strong>
                <p>Yes! Everything stays on your device. We don't collect or transmit any personal data.</p>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallGuide;