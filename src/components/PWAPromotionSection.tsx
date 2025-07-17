import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  Zap, 
  Wifi, 
  Shield, 
  Clock, 
  Star,
  CheckCircle,
  ArrowRight,
  Monitor,
  Tablet
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAPromotionSection: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallSteps, setShowInstallSteps] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInstallSteps(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error during installation:', error);
      setShowInstallSteps(true);
    }
  };

  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Loads instantly, faster than your attention span",
      sarcasticNote: "No more waiting for websites to load while your productivity dies"
    },
    {
      icon: Wifi,
      title: "Works Offline",
      description: "Use tools even when your WiFi betrays you",
      sarcasticNote: "Because internet outages don't respect your deadlines"
    },
    {
      icon: Shield,
      title: "No App Store",
      description: "Install directly, skip the corporate gatekeepers",
      sarcasticNote: "No 'this app wants to access your contacts, photos, and soul'"
    },
    {
      icon: Clock,
      title: "Always Available",
      description: "One click away from your home screen",
      sarcasticNote: "Like having a Swiss Army knife, but for procrastination"
    }
  ];

  const installSteps = {
    chrome: [
      "Click the install button in your address bar",
      "Or use the menu → 'Install BrainDead.site'",
      "Click 'Install' in the popup",
      "Enjoy instant access from your desktop!"
    ],
    safari: [
      "Tap the share button (square with arrow)",
      "Scroll down and tap 'Add to Home Screen'",
      "Tap 'Add' in the top right",
      "Find the app on your home screen!"
    ],
    firefox: [
      "Click the menu button (three lines)",
      "Select 'Install this site as an app'",
      "Click 'Install' in the dialog",
      "Launch from your applications!"
    ]
  };

  if (isInstalled) {
    return (
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 backdrop-blur-sm border border-green-800 rounded-3xl p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              🎉 App Installed Successfully!
            </h2>
            <p className="text-gray-400 text-lg mb-6">
              BrainDead.site is now available on your device. Enjoy lightning-fast access to all your favorite tools!
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span>Instant loading</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-blue-400" />
                <span>Offline ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Privacy focused</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Install <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">BrainDead.site</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get app-like experience without the app store hassle. Because downloading from app stores is so 2010.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Benefits */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Why Install?</h3>
            
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="flex items-start space-x-4 p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-gray-700 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{benefit.title}</h4>
                  <p className="text-gray-400 text-sm mb-2">{benefit.description}</p>
                  <p className="text-gray-500 text-xs italic">"{benefit.sarcasticNote}"</p>
                </div>
              </div>
            ))}

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h4 className="text-white font-semibold mb-2">Storage Benefits:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-green-400 font-medium">✓ Your preferences</div>
                  <div className="text-gray-400">Saved locally</div>
                </div>
                <div>
                  <div className="text-green-400 font-medium">✓ Your favorites</div>
                  <div className="text-gray-400">Always available</div>
                </div>
                <div>
                  <div className="text-green-400 font-medium">✓ Usage history</div>
                  <div className="text-gray-400">Private & secure</div>
                </div>
                <div>
                  <div className="text-green-400 font-medium">✓ No cloud sync</div>
                  <div className="text-gray-400">Your device only</div>
                </div>
              </div>
            </div>
          </div>

          {/* Installation CTA */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-3xl p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Download className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Install?</h3>
              <p className="text-gray-400 mb-6">
                Get instant access to all tools, work offline, and enjoy a native app experience.
              </p>

              <button
                onClick={handleInstallClick}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl font-semibold text-white hover:from-blue-400 hover:to-purple-500 transition-all duration-300 hover:scale-105 flex items-center space-x-2 mx-auto mb-6"
              >
                <Download className="w-5 h-5" />
                <span>{isInstallable ? 'Install Now' : 'Get Installation Guide'}</span>
              </button>

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Monitor className="w-4 h-4" />
                  <span>Desktop</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Tablet className="w-4 h-4" />
                  <span>Tablet</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile</span>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Works on Chrome, Safari, Firefox, and Edge
              </div>
            </div>
          </div>
        </div>

        {/* Installation Steps Modal */}
        {showInstallSteps && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Installation Guide</h3>
                  <button
                    onClick={() => setShowInstallSteps(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {Object.entries(installSteps).map(([browser, steps]) => (
                  <div key={browser} className="bg-gray-800/50 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-3 capitalize">
                      {browser === 'chrome' ? 'Chrome/Edge' : browser}
                    </h4>
                    <ol className="space-y-2">
                      {steps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-3 text-sm">
                          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-300">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}

                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Need help? The installation process is different for each browser, but it's always just a few clicks away!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Comparison */}
        <div className="mt-16 bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            App vs Browser Performance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">0.1s</div>
              <div className="text-white font-semibold mb-1">App Load Time</div>
              <div className="text-gray-400 text-sm">Instant startup</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">100%</div>
              <div className="text-white font-semibold mb-1">Offline Capability</div>
              <div className="text-gray-400 text-sm">Works without internet</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">0MB</div>
              <div className="text-white font-semibold mb-1">Data Usage</div>
              <div className="text-gray-400 text-sm">After initial install</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PWAPromotionSection;