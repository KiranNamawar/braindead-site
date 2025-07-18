import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  Copy, 
  Share2, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Clock,
  X,
  FileText,
  Clipboard,
  Smartphone
} from 'lucide-react';
import { usePWACapabilities } from '../hooks/usePWACapabilities';

interface PWACapabilitiesPanelProps {
  onClose?: () => void;
  toolName?: string;
  toolData?: any;
}

export const PWACapabilitiesPanel: React.FC<PWACapabilitiesPanelProps> = ({
  onClose,
  toolName = 'Tool',
  toolData
}) => {
  const {
    capabilities,
    saveFile,
    openFile,
    copyToClipboard,
    shareText,
    shareFile,
    backgroundTasks,
    cancelBackgroundTask,
    clearCompletedTasks,
    isLoading,
    error
  } = usePWACapabilities();

  const [activeTab, setActiveTab] = useState<'capabilities' | 'tasks'>('capabilities');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportData = async () => {
    if (!toolData) {
      showNotification('error', 'No data to export');
      return;
    }

    const dataStr = JSON.stringify(toolData, null, 2);
    const filename = `${toolName.toLowerCase().replace(/\s+/g, '-')}-export.json`;
    
    const success = await saveFile(dataStr, filename, 'application/json');
    if (success) {
      showNotification('success', 'Data exported successfully!');
    } else {
      showNotification('error', 'Failed to export data');
    }
  };

  const handleCopyData = async () => {
    if (!toolData) {
      showNotification('error', 'No data to copy');
      return;
    }

    const dataStr = typeof toolData === 'string' ? toolData : JSON.stringify(toolData, null, 2);
    const success = await copyToClipboard(dataStr);
    
    if (success) {
      showNotification('success', 'Data copied to clipboard!');
    } else {
      showNotification('error', 'Failed to copy data');
    }
  };

  const handleShareData = async () => {
    if (!toolData) {
      showNotification('error', 'No data to share');
      return;
    }

    const dataStr = typeof toolData === 'string' ? toolData : JSON.stringify(toolData, null, 2);
    const success = await shareText(
      `${toolName} Results`,
      `Results from ${toolName}:\n\n${dataStr}`,
      window.location.href
    );
    
    if (success) {
      showNotification('success', 'Data shared successfully!');
    } else {
      showNotification('error', 'Failed to share data');
    }
  };

  const handleImportFile = async () => {
    const file = await openFile(['application/json', 'text/plain']);
    if (file) {
      try {
        const content = await file.text();
        showNotification('success', `File "${file.name}" imported successfully!`);
        // You would typically pass this data back to the parent component
        console.log('Imported data:', content);
      } catch (error) {
        showNotification('error', 'Failed to read imported file');
      }
    }
  };

  const getCapabilityIcon = (supported: boolean) => {
    return supported ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'running':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">PWA Capabilities</h3>
              <p className="text-purple-100 text-sm">Advanced features for {toolName}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('capabilities')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'capabilities'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Capabilities
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tasks'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Background Tasks ({backgroundTasks.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'capabilities' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExportData}
                    disabled={!toolData || isLoading}
                    className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Export Data</span>
                  </button>
                  
                  <button
                    onClick={handleImportFile}
                    disabled={isLoading}
                    className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Import File</span>
                  </button>
                  
                  <button
                    onClick={handleCopyData}
                    disabled={!toolData || isLoading}
                    className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm font-medium">Copy Data</span>
                  </button>
                  
                  <button
                    onClick={handleShareData}
                    disabled={!toolData || !capabilities.webShareAPI || isLoading}
                    className="flex items-center space-x-2 p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Share Data</span>
                  </button>
                </div>
              </div>

              {/* Capabilities Status */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Available Features</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">File System Access</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Save and open files directly</p>
                      </div>
                    </div>
                    {getCapabilityIcon(capabilities.fileSystemAccess)}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clipboard className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Clipboard API</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Copy and paste with one click</p>
                      </div>
                    </div>
                    {getCapabilityIcon(capabilities.clipboardAPI)}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Web Share API</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Share content natively</p>
                      </div>
                    </div>
                    {getCapabilityIcon(capabilities.webShareAPI)}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Background Processing</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Heavy calculations in background</p>
                      </div>
                    </div>
                    {getCapabilityIcon(capabilities.webWorkers)}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">File Sharing</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Share files with other apps</p>
                      </div>
                    </div>
                    {getCapabilityIcon(capabilities.canShareFiles)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white">Background Tasks</h4>
                {backgroundTasks.length > 0 && (
                  <button
                    onClick={clearCompletedTasks}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Clear Completed
                  </button>
                )}
              </div>
              
              {backgroundTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No background tasks running</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Heavy calculations will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {backgroundTasks.map((task) => (
                    <div key={task.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 dark:text-white">{task.name}</h5>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTaskStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      
                      {task.status === 'running' && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {task.error && (
                        <p className="text-sm text-red-600 dark:text-red-400 mb-2">{task.error}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {task.startTime && (
                            <span>Started: {new Date(task.startTime).toLocaleTimeString()}</span>
                          )}
                        </div>
                        
                        {task.status === 'running' && (
                          <button
                            onClick={() => cancelBackgroundTask(task.id)}
                            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notification */}
        {notification && (
          <div className={`absolute bottom-4 right-4 p-3 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <XCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWACapabilitiesPanel;