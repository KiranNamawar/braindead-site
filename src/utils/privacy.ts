/**
 * Privacy-focused data handling utilities with local encryption
 */

import CryptoJS from 'crypto-js';

// Generate a unique key for this browser session
const getEncryptionKey = (): string => {
  let key = localStorage.getItem('__bd_key');
  if (!key) {
    key = CryptoJS.lib.WordArray.random(256/8).toString();
    localStorage.setItem('__bd_key', key);
  }
  return key;
};

/**
 * Encrypts data before storing in localStorage
 */
export function encryptData(data: any): string {
  try {
    const key = getEncryptionKey();
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
    return encrypted;
  } catch (error) {
    console.warn('Failed to encrypt data:', error);
    return JSON.stringify(data); // Fallback to unencrypted
  }
}

/**
 * Decrypts data from localStorage
 */
export function decryptData<T>(encryptedData: string): T | null {
  try {
    const key = getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString);
  } catch (error) {
    // Try parsing as unencrypted data (backward compatibility)
    try {
      return JSON.parse(encryptedData);
    } catch {
      console.warn('Failed to decrypt data:', error);
      return null;
    }
  }
}

/**
 * Secure localStorage wrapper with encryption
 */
export class SecureStorage {
  private prefix: string;

  constructor(prefix: string = '__bd_') {
    this.prefix = prefix;
  }

  /**
   * Store data securely in localStorage
   */
  setItem(key: string, value: any): void {
    try {
      const encryptedValue = encryptData(value);
      localStorage.setItem(this.prefix + key, encryptedValue);
    } catch (error) {
      console.warn(`Failed to store ${key}:`, error);
    }
  }

  /**
   * Retrieve and decrypt data from localStorage
   */
  getItem<T>(key: string): T | null {
    try {
      const encryptedValue = localStorage.getItem(this.prefix + key);
      if (!encryptedValue) return null;
      return decryptData<T>(encryptedValue);
    } catch (error) {
      console.warn(`Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * Clear all items with this prefix
   */
  clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Get all keys with this prefix
   */
  getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    return keys;
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): {
    totalKeys: number;
    estimatedSize: number;
    maxSize: number;
  } {
    const keys = this.getAllKeys();
    let estimatedSize = 0;
    
    keys.forEach(key => {
      const value = localStorage.getItem(this.prefix + key);
      if (value) {
        estimatedSize += key.length + value.length;
      }
    });

    return {
      totalKeys: keys.length,
      estimatedSize,
      maxSize: 5 * 1024 * 1024 // 5MB typical localStorage limit
    };
  }
}

// Default secure storage instance
export const secureStorage = new SecureStorage();

/**
 * Privacy-compliant user preferences
 */
export interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  localStorage: boolean;
  cookies: boolean;
  lastUpdated: Date;
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  dataCollection: false,
  analytics: false,
  localStorage: true,
  cookies: false,
  lastUpdated: new Date()
};

/**
 * Privacy settings manager
 */
export class PrivacyManager {
  private storage: SecureStorage;
  private settings: PrivacySettings;

  constructor() {
    this.storage = new SecureStorage('__privacy_');
    this.settings = this.loadSettings();
  }

  private loadSettings(): PrivacySettings {
    const saved = this.storage.getItem<PrivacySettings>('settings');
    return saved ? { ...DEFAULT_PRIVACY_SETTINGS, ...saved } : DEFAULT_PRIVACY_SETTINGS;
  }

  /**
   * Get current privacy settings
   */
  getSettings(): PrivacySettings {
    return { ...this.settings };
  }

  /**
   * Update privacy settings
   */
  updateSettings(updates: Partial<PrivacySettings>): void {
    this.settings = {
      ...this.settings,
      ...updates,
      lastUpdated: new Date()
    };
    this.storage.setItem('settings', this.settings);
  }

  /**
   * Check if a specific privacy feature is enabled
   */
  isEnabled(feature: keyof PrivacySettings): boolean {
    return this.settings[feature] as boolean;
  }

  /**
   * Reset all privacy settings to defaults
   */
  resetToDefaults(): void {
    this.settings = { ...DEFAULT_PRIVACY_SETTINGS };
    this.storage.setItem('settings', this.settings);
  }

  /**
   * Export all user data for transparency
   */
  exportUserData(): {
    privacySettings: PrivacySettings;
    userData: Record<string, any>;
    metadata: {
      exportDate: Date;
      version: string;
      storageInfo: any;
    };
  } {
    const userData: Record<string, any> = {};
    const allStorage = new SecureStorage();
    const keys = allStorage.getAllKeys();
    
    keys.forEach(key => {
      if (!key.startsWith('privacy_')) {
        userData[key] = allStorage.getItem(key);
      }
    });

    return {
      privacySettings: this.getSettings(),
      userData,
      metadata: {
        exportDate: new Date(),
        version: '1.0.0',
        storageInfo: allStorage.getStorageInfo()
      }
    };
  }

  /**
   * Delete all user data
   */
  deleteAllUserData(): void {
    // Clear all localStorage data
    const allStorage = new SecureStorage();
    allStorage.clear();
    
    // Clear regular localStorage items
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('__bd_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Reset privacy settings
    this.resetToDefaults();
  }
}

// Default privacy manager instance
export const privacyManager = new PrivacyManager();

/**
 * Data usage tracking for transparency
 */
export interface DataUsageEntry {
  timestamp: Date;
  action: string;
  dataType: string;
  purpose: string;
  retention: string;
}

export class DataUsageTracker {
  private storage: SecureStorage;
  private entries: DataUsageEntry[];

  constructor() {
    this.storage = new SecureStorage('__usage_');
    this.entries = this.loadEntries();
  }

  private loadEntries(): DataUsageEntry[] {
    const saved = this.storage.getItem<DataUsageEntry[]>('entries');
    return saved || [];
  }

  private saveEntries(): void {
    // Keep only last 100 entries to prevent storage bloat
    const recentEntries = this.entries.slice(-100);
    this.storage.setItem('entries', recentEntries);
    this.entries = recentEntries;
  }

  /**
   * Track data usage
   */
  track(action: string, dataType: string, purpose: string, retention: string = 'Session only'): void {
    if (!privacyManager.isEnabled('dataCollection')) {
      return; // Don't track if user hasn't consented
    }

    const entry: DataUsageEntry = {
      timestamp: new Date(),
      action,
      dataType,
      purpose,
      retention
    };

    this.entries.push(entry);
    this.saveEntries();
  }

  /**
   * Get all data usage entries
   */
  getEntries(): DataUsageEntry[] {
    return [...this.entries];
  }

  /**
   * Clear all tracking data
   */
  clear(): void {
    this.entries = [];
    this.storage.removeItem('entries');
  }

  /**
   * Get usage summary
   */
  getSummary(): {
    totalEntries: number;
    dataTypes: string[];
    purposes: string[];
    oldestEntry?: Date;
    newestEntry?: Date;
  } {
    if (this.entries.length === 0) {
      return {
        totalEntries: 0,
        dataTypes: [],
        purposes: []
      };
    }

    const dataTypes = [...new Set(this.entries.map(e => e.dataType))];
    const purposes = [...new Set(this.entries.map(e => e.purpose))];
    const timestamps = this.entries.map(e => new Date(e.timestamp));

    return {
      totalEntries: this.entries.length,
      dataTypes,
      purposes,
      oldestEntry: new Date(Math.min(...timestamps.map(d => d.getTime()))),
      newestEntry: new Date(Math.max(...timestamps.map(d => d.getTime())))
    };
  }
}

// Default data usage tracker instance
export const dataUsageTracker = new DataUsageTracker();

/**
 * Privacy-compliant analytics
 */
export class PrivateAnalytics {
  private storage: SecureStorage;

  constructor() {
    this.storage = new SecureStorage('__analytics_');
  }

  /**
   * Track event without personal data
   */
  trackEvent(event: string, properties?: Record<string, any>): void {
    if (!privacyManager.isEnabled('analytics')) {
      return;
    }

    // Only track anonymized, aggregated data
    const sanitizedProperties = this.sanitizeProperties(properties || {});
    
    const eventData = {
      event,
      properties: sanitizedProperties,
      timestamp: new Date(),
      sessionId: this.getSessionId()
    };

    // Store locally only, never send to external services
    const events = this.storage.getItem<any[]>('events') || [];
    events.push(eventData);
    
    // Keep only last 1000 events
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    
    this.storage.setItem('events', events);
    
    // Track data usage
    dataUsageTracker.track('Analytics Event', 'Usage Data', 'Improve User Experience', 'Local only');
  }

  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    Object.entries(properties).forEach(([key, value]) => {
      // Remove any potentially identifying information
      if (typeof value === 'string') {
        // Don't store long text that might contain personal info
        if (value.length > 100) return;
        
        // Don't store email-like strings
        if (value.includes('@')) return;
        
        // Don't store URL-like strings with personal info
        if (value.includes('://') && (value.includes('user') || value.includes('id='))) return;
      }
      
      sanitized[key] = value;
    });
    
    return sanitized;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('__session_id');
    if (!sessionId) {
      sessionId = CryptoJS.lib.WordArray.random(128/8).toString();
      sessionStorage.setItem('__session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get analytics summary (no personal data)
   */
  getSummary(): {
    totalEvents: number;
    eventTypes: string[];
    sessionCount: number;
    dateRange?: { start: Date; end: Date };
  } {
    const events = this.storage.getItem<any[]>('events') || [];
    
    if (events.length === 0) {
      return {
        totalEvents: 0,
        eventTypes: [],
        sessionCount: 0
      };
    }

    const eventTypes = [...new Set(events.map(e => e.event))];
    const sessions = [...new Set(events.map(e => e.sessionId))];
    const timestamps = events.map(e => new Date(e.timestamp));

    return {
      totalEvents: events.length,
      eventTypes,
      sessionCount: sessions.length,
      dateRange: {
        start: new Date(Math.min(...timestamps.map(d => d.getTime()))),
        end: new Date(Math.max(...timestamps.map(d => d.getTime())))
      }
    };
  }

  /**
   * Clear all analytics data
   */
  clear(): void {
    this.storage.removeItem('events');
  }
}

// Default private analytics instance
export const privateAnalytics = new PrivateAnalytics();

/**
 * Privacy notice and consent management
 */
export interface ConsentRecord {
  type: string;
  granted: boolean;
  timestamp: Date;
  version: string;
}

export class ConsentManager {
  private storage: SecureStorage;

  constructor() {
    this.storage = new SecureStorage('__consent_');
  }

  /**
   * Record user consent
   */
  recordConsent(type: string, granted: boolean, version: string = '1.0'): void {
    const record: ConsentRecord = {
      type,
      granted,
      timestamp: new Date(),
      version
    };

    const consents = this.storage.getItem<ConsentRecord[]>('records') || [];
    consents.push(record);
    this.storage.setItem('records', consents);

    // Update privacy settings based on consent
    if (type === 'analytics') {
      privacyManager.updateSettings({ analytics: granted });
    } else if (type === 'localStorage') {
      privacyManager.updateSettings({ localStorage: granted });
    }
  }

  /**
   * Get consent history
   */
  getConsentHistory(): ConsentRecord[] {
    return this.storage.getItem<ConsentRecord[]>('records') || [];
  }

  /**
   * Get current consent status
   */
  getCurrentConsent(type: string): boolean | null {
    const records = this.getConsentHistory();
    const latestRecord = records
      .filter(r => r.type === type)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    return latestRecord ? latestRecord.granted : null;
  }

  /**
   * Check if consent is required
   */
  isConsentRequired(type: string): boolean {
    return this.getCurrentConsent(type) === null;
  }

  /**
   * Withdraw all consents
   */
  withdrawAllConsents(): void {
    const types = ['analytics', 'localStorage', 'dataCollection'];
    types.forEach(type => {
      this.recordConsent(type, false);
    });
  }
}

// Default consent manager instance
export const consentManager = new ConsentManager();