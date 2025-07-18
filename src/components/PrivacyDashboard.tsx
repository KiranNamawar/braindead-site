import React, { useState, useEffect } from 'react';
import { Shield, Download, Trash2, Eye, Settings, Lock, Database, AlertTriangle } from 'lucide-react';
import { 
  privacyManager, 
  dataUsageTracker, 
  privateAnalytics, 
  consentManager,
  secureStorage,
  type PrivacySettings 
} from '../utils/privacy';
import { useToast } from './ToastContainer';

interface PrivacyDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyDashboard: React.FC<PrivacyDashboardProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<PrivacySettings>(privacyManager.getSettings());
  const [activeTab, setActiveTab] = useState<'settings' | 'data' | 'usage' | 'export'>('settings');
  const [storageInfo, setStorageInfo] = useState(secureStorage.getStorageInfo());
  const [usageSummary, setUsageSummary] = useState(dataUsageTracker.getSummary());
  const [analyticsSummary, setAnalyticsSummary] = useState(privateAnalytics.getSummary());
  const { showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    if (isOpen) {
      setSettings(privacyManager.getSettings());
      setStorageInfo(secureStorage.getStorageInfo());
      setUsageSummary(dataUsageTracker.getSummary());
      setAnalyticsSummary(privateAnalytics.getSummary());
    }
  }, [isOpen]);

  const handleSettingChange = (key: keyof PrivacySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    privacyManager.updateSettings({ [key]: value });
    
    // Record consent
    consentManager.recordConsent(key, value);
    
    showSuccess(`Privacy setting updated: ${key}`);
  };

  const exportUserData = () => {
    try {
      const data = privacyManager.exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `braindead-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess('Data exported successfully');
    } catch (error) {
      showError('Failed to export data');
    }
  };

  const deleteAllData = () => {
    if (window.confirm('Are you sure you want to delete ALL your data? This action cannot be undone.')) {
      try {
        privacyManager.deleteAllUserData();
        dataUsageTracker.clear();
        privateAnalytics.clear();
        
        // Refresh the dashboard
        setSettings(privacyManager.getSettings());
        setStorageInfo(secureStorage.getStorageInfo());
        setUsageSummary(dataUsageTracker.getSummary());
        setAnalyticsSummary(privateAnalytics.getSummary());
        
        showWarning('All user data has been deleted');
      } catch (error) {
        showError('Failed to delete data');
      }
    }
  };

  const clearAnalytics = () => {
    privateAnalytics.clear();
    setAnalyticsSummary(privateAnalytics.getSummary());
    showSuccess('Analytics data cleared');
  };

  const clearUsageTracking = () => {
    dataUsageTracker.clear();
    setUsageSummary(dataUsageTracker.getSummary());
    showSuccess('Usage tracking data cleared');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Privacy Dashboard</h2>
              <p className="text-gray-400 text-sm">Manage your data and privacy settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          {[
            { id: 'settings', label: 'Privacy Settings', icon: Settings },
            { id: 'data', label: 'Data Overview', icon: Database },
            { id: 'usage', label: 'Usage Tracking', icon: Eye },
            { id: 'export', label: 'Export & Delete', icon: Download }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="text-blue-400 font-semibold mb-1">Privacy First</h3>
                    <p className="text-gray-300 text-sm">
                      All your data stays on your device. We don't collect, store, or share any personal information.
                      These settings control what data is stored locally in your browser.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div>
                    <h4 className="text-white font-medium">Local Storage</h4>
                    <p className="text-gray-400 text-sm">Store preferences and tool history locally</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.localStorage}
                      onChange={(e) => handleSettingChange('localStorage', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div>
                    <h4 className="text-white font-medium">Usage Analytics</h4>
                    <p className="text-gray-400 text-sm">Anonymous usage data to improve the app (local only)</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.analytics}
                      onChange={(e) => handleSettingChange('analytics', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div>
                    <h4 className="text-white font-medium">Data Collection Transparency</h4>
                    <p className="text-gray-400 text-sm">Track what data is being stored for transparency</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.dataCollection}
                      onChange={(e) => handleSettingChange('dataCollection', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">Storage Used</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {Math.round(storageInfo.estimatedSize / 1024)}KB
                  </div>
                  <div className="text-gray-400 text-sm">
                    of ~{Math.round(storageInfo.maxSize / 1024 / 1024)}MB available
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lock className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-medium">Encrypted Items</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{storageInfo.totalKeys}</div>
                  <div className="text-gray-400 text-sm">All data encrypted locally</div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 font-medium">Analytics Events</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{analyticsSummary.totalEvents}</div>
                  <div className="text-gray-400 text-sm">Local only, no tracking</div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-white font-medium mb-3">Data Types Stored</h4>
                <div className="grid grid-cols-2 gap-2">
                  {usageSummary.dataTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h3 className="text-yellow-400 font-semibold mb-1">Transparency Notice</h3>
                    <p className="text-gray-300 text-sm">
                      This shows what data we track for transparency. All data stays on your device and is never sent anywhere.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h4 className="text-white font-medium mb-3">Usage Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Entries:</span>
                      <span className="text-white">{usageSummary.totalEntries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Data Types:</span>
                      <span className="text-white">{usageSummary.dataTypes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Purposes:</span>
                      <span className="text-white">{usageSummary.purposes.length}</span>
                    </div>
                  </div>
                  <button
                    onClick={clearUsageTracking}
                    className="mt-3 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-400 text-sm transition-colors"
                  >
                    Clear Usage Data
                  </button>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h4 className="text-white font-medium mb-3">Analytics Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Events:</span>
                      <span className="text-white">{analyticsSummary.totalEvents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Event Types:</span>
                      <span className="text-white">{analyticsSummary.eventTypes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sessions:</span>
                      <span className="text-white">{analyticsSummary.sessionCount}</span>
                    </div>
                  </div>
                  <button
                    onClick={clearAnalytics}
                    className="mt-3 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-400 text-sm transition-colors"
                  >
                    Clear Analytics
                  </button>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-white font-medium mb-3">Purposes for Data Collection</h4>
                <div className="space-y-2">
                  {usageSummary.purposes.map(purpose => (
                    <div key={purpose} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300">{purpose}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Download className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h3 className="text-green-400 font-semibold mb-1">Data Portability</h3>
                    <p className="text-gray-300 text-sm">
                      Export all your data in a standard JSON format. You own your data and can take it with you anytime.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h4 className="text-white font-medium mb-2">Export Your Data</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Download a complete copy of all your data stored in this browser.
                  </p>
                  <button
                    onClick={exportUserData}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                  </button>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h4 className="text-white font-medium mb-2">Delete All Data</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Permanently delete all your data from this browser. This action cannot be undone.
                  </p>
                  <button
                    onClick={deleteAllData}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete All Data</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-white font-medium mb-3">What's Included in Export</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Privacy settings and preferences</li>
                  <li>• Tool usage history and favorites</li>
                  <li>• Local analytics data (if enabled)</li>
                  <li>• Data usage tracking records</li>
                  <li>• Consent records and timestamps</li>
                  <li>• All encrypted local storage data</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacyDashboard;