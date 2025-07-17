import React, { useState, useEffect } from 'react';
import { Copy, Clipboard, X, ArrowRight, Clock, Database } from 'lucide-react';
import { SharedClipboard as SharedClipboardType, ToolIntegration } from '../../types';
import { getSharedData, clearSharedData, suggestToolIntegrations } from '../../utils/toolIntegration';
import { getTool } from '../../utils/toolRegistry';
import { useToast } from '../ToastContainer';

interface SharedClipboardProps {
  currentToolId: string;
  onIntegrateData?: (targetToolId: string, data: any) => void;
}

const SharedClipboard: React.FC<SharedClipboardProps> = ({ 
  currentToolId, 
  onIntegrateData 
}) => {
  const { showSuccess, showInfo } = useToast();
  const [clipboardData, setClipboardData] = useState<SharedClipboardType | null>(null);
  const [suggestedIntegrations, setSuggestedIntegrations] = useState<ToolIntegration[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Load shared clipboard data
    const data = getSharedData();
    setClipboardData(data);

    if (data && data.sourceToolId !== currentToolId) {
      // Get suggested integrations for current tool
      const suggestions = suggestToolIntegrations(data.sourceToolId, data.data);
      const relevantSuggestions = suggestions.filter(
        integration => integration.targetToolId === currentToolId
      );
      setSuggestedIntegrations(relevantSuggestions);
    }
  }, [currentToolId]);

  const handleClearClipboard = () => {
    clearSharedData();
    setClipboardData(null);
    setSuggestedIntegrations([]);
    showInfo('Shared clipboard cleared');
  };

  const handleIntegrateData = (integration: ToolIntegration) => {
    if (!clipboardData || !onIntegrateData) return;

    try {
      const transformedData = integration.dataTransform(clipboardData.data);
      onIntegrateData(integration.targetToolId, transformedData);
      showSuccess('Data integrated successfully', integration.description);
    } catch (error) {
      console.error('Integration failed:', error);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const getDataPreview = (data: any, dataType: string) => {
    if (!data) return 'No data';
    
    switch (dataType) {
      case 'text':
        return typeof data === 'string' 
          ? data.length > 50 ? `${data.substring(0, 50)}...` : data
          : String(data).substring(0, 50);
      case 'number':
        return String(data);
      case 'json':
        return typeof data === 'object' 
          ? JSON.stringify(data).substring(0, 50) + '...'
          : String(data).substring(0, 50);
      default:
        return `${dataType} data`;
    }
  };

  if (!clipboardData) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Clipboard className="w-4 h-4" />
          <span className="text-sm">No shared data available</span>
        </div>
      </div>
    );
  }

  const sourceTool = getTool(clipboardData.sourceToolId);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-900 dark:text-blue-100">
              Shared Clipboard
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
            <button
              onClick={handleClearClipboard}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">From:</span>
            <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">
              {sourceTool?.name || clipboardData.sourceToolId}
            </span>
            <Clock className="w-3 h-3 ml-2" />
            <span>{formatTimestamp(new Date(clipboardData.timestamp))}</span>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded p-3 border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                {clipboardData.dataType} Data
              </span>
            </div>
            <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
              {isExpanded 
                ? (typeof clipboardData.data === 'object' 
                    ? JSON.stringify(clipboardData.data, null, 2)
                    : String(clipboardData.data))
                : getDataPreview(clipboardData.data, clipboardData.dataType)
              }
            </div>
          </div>

          {suggestedIntegrations.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Available Integrations:
              </div>
              {suggestedIntegrations.map((integration, index) => (
                <button
                  key={index}
                  onClick={() => handleIntegrateData(integration)}
                  className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Use in {getTool(integration.targetToolId)?.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {integration.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedClipboard;