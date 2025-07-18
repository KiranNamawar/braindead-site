// PWA Installation Manager - Coordinates install prompts and update notifications
import { requestNotificationPermission, getNotificationStatus } from './pwa';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallConfig {
  showInstallPromptDelay: number;
  maxInstallPromptShows: number;
  installPromptCooldown: number;
  enableAutoPrompt: boolean;
}

class PWAInstallManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installPromptShownCount: number = 0;
  private lastInstallPromptTime: number = 0;
  private config: PWAInstallConfig;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: Partial<PWAInstallConfig> = {}) {
    this.config = {
      showInstallPromptDelay: 30000, // 30 seconds
      maxInstallPromptShows: 3,
      installPromptCooldown: 86400000, // 24 hours
      enableAutoPrompt: true,
      ...config
    };

    this.loadInstallData();
    this.initializeInstallManager();
  }

  private loadInstallData(): void {
    try {
      const stored = localStorage.getItem('pwa-install-data');
      if (stored) {
        const data = JSON.parse(stored);
        this.installPromptShownCount = data.promptShownCount || 0;
        this.lastInstallPromptTime = data.lastPromptTime || 0;
      }
    } catch (error) {
      console.warn('Failed to load install data:', error);
    }
  }

  private saveInstallData(): void {
    try {
      const data = {
        promptShownCount: this.installPromptShownCount,
        lastPromptTime: this.lastInstallPromptTime
      };
      localStorage.setItem('pwa-install-data', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save install data:', error);
    }
  }

  private initializeInstallManager(): void {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      
      if (this.shouldShowInstallPrompt()) {
        this.scheduleInstallPrompt();
      }
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed successfully');
      this.deferredPrompt = null;
      this.emit('pwa-installed');
      this.trackInstallation();
    });

    // Check if already installed
    if (this.isPWAInstalled()) {
      console.log('PWA is already installed');
    }
  }

  private shouldShowInstallPrompt(): boolean {
    // Don't show if already installed
    if (this.isPWAInstalled()) {
      return false;
    }

    // Don't show if auto prompt is disabled
    if (!this.config.enableAutoPrompt) {
      return false;
    }

    // Don't show if max shows reached
    if (this.installPromptShownCount >= this.config.maxInstallPromptShows) {
      return false;
    }

    // Don't show if within cooldown period
    const timeSinceLastPrompt = Date.now() - this.lastInstallPromptTime;
    if (timeSinceLastPrompt < this.config.installPromptCooldown) {
      return false;
    }

    // Don't show if user dismissed recently
    const dismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      return false;
    }

    return true;
  }

  private scheduleInstallPrompt(): void {
    setTimeout(() => {
      if (this.deferredPrompt && this.shouldShowInstallPrompt()) {
        this.showInstallPrompt();
      }
    }, this.config.showInstallPromptDelay);
  }

  private showInstallPrompt(): void {
    this.installPromptShownCount++;
    this.lastInstallPromptTime = Date.now();
    this.saveInstallData();
    
    this.emit('install-prompt-available', {
      prompt: this.deferredPrompt,
      showCount: this.installPromptShownCount,
      maxShows: this.config.maxInstallPromptShows
    });
  }

  // Public methods
  public async triggerInstallPrompt(): Promise<{ outcome: 'accepted' | 'dismissed' } | null> {
    if (!this.deferredPrompt) {
      console.warn('No install prompt available');
      return null;
    }

    try {
      await this.deferredPrompt.prompt();
      const result = await this.deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        this.emit('install-accepted');
      } else {
        console.log('User dismissed the install prompt');
        this.emit('install-dismissed');
      }

      this.deferredPrompt = null;
      return result;
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return null;
    }
  }

  public isPWAInstalled(): boolean {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Check if running as PWA on iOS
    if ((window.navigator as any).standalone === true) {
      return true;
    }

    // Check if launched from home screen on Android
    if (document.referrer.includes('android-app://')) {
      return true;
    }

    return false;
  }

  public canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  public getInstallStats(): {
    canInstall: boolean;
    isInstalled: boolean;
    promptShownCount: number;
    maxPromptShows: number;
    canShowPrompt: boolean;
  } {
    return {
      canInstall: this.canInstall(),
      isInstalled: this.isPWAInstalled(),
      promptShownCount: this.installPromptShownCount,
      maxPromptShows: this.config.maxInstallPromptShows,
      canShowPrompt: this.shouldShowInstallPrompt()
    };
  }

  public async setupNotifications(): Promise<boolean> {
    if (!this.isPWAInstalled()) {
      return false;
    }

    try {
      const permission = await requestNotificationPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to setup notifications:', error);
      return false;
    }
  }

  public getNotificationCapabilities(): {
    supported: boolean;
    permission: NotificationPermission;
    enabled: boolean;
  } {
    return getNotificationStatus();
  }

  private trackInstallation(): void {
    try {
      const analytics = JSON.parse(localStorage.getItem('braindead-analytics') || '{}');
      analytics.pwaInstalled = true;
      analytics.pwaInstallDate = new Date().toISOString();
      analytics.installPromptShownCount = this.installPromptShownCount;
      localStorage.setItem('braindead-analytics', JSON.stringify(analytics));
    } catch (error) {
      console.warn('Failed to track PWA installation:', error);
    }
  }

  // Event emitter functionality
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }

    // Also dispatch as window event for components to listen
    window.dispatchEvent(new CustomEvent(`pwa-${event}`, { detail: data }));
  }

  // Configuration methods
  public updateConfig(newConfig: Partial<PWAInstallConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public resetInstallPromptCount(): void {
    this.installPromptShownCount = 0;
    this.lastInstallPromptTime = 0;
    this.saveInstallData();
  }

  public enableAutoPrompt(): void {
    this.config.enableAutoPrompt = true;
  }

  public disableAutoPrompt(): void {
    this.config.enableAutoPrompt = false;
  }
}

// Create singleton instance
export const pwaInstallManager = new PWAInstallManager();

// Convenience functions
export const canInstallPWA = () => pwaInstallManager.canInstall();
export const isPWAInstalled = () => pwaInstallManager.isPWAInstalled();
export const triggerPWAInstall = () => pwaInstallManager.triggerInstallPrompt();
export const getPWAInstallStats = () => pwaInstallManager.getInstallStats();
export const setupPWANotifications = () => pwaInstallManager.setupNotifications();
export const getPWANotificationCapabilities = () => pwaInstallManager.getNotificationCapabilities();

export default pwaInstallManager;