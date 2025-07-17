import React, { useState, useEffect } from 'react';
import { ArrowRight, Share2, Download, Copy, ExternalLink, Zap } from 'lucide-react';
import { ToolIntegration, Tool } from '../../types';
import { getToolIntegrations, integrateToolData } from '../../utils/toolIntegration';
import { getTool, suggestSimilarTools } from '../../utils/toolRegistry';
import { useToast } from '../ToastContainer';
import { useNavigate } from 'react-router-dom';

interface ToolIntegrationPanelProps {
  currentToolId: string;
  outputData: any;
  onExport?: (format: string) => void;
  onShare?: () => void;
  className?: string;
}

const ToolIntegrationPanel: React.FC<ToolIntegrationPanelProps> = ({
  currentToolId,
  outputData,
  onExport,
  onShare,
  className = ''
}) => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [availableIntegrations, setAvailableIntegrations] = useState<ToolIntegration[]>([]);
  const [suggestedTools, setSuggestedTools] = useState<Tool[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Get available integrations for current tool
    const integrations = getToolIntegrations(currentToolId);
    const compatibleIntegrations = integrations.filter(integration => {
      try {
        return integration.compatibilityCheck(outputData);
      } catch {
        return false;
      }
    });
    setAvailableIntegrations(compatibleIntegrations);

    // Get suggested similar tools
    const similar = suggestSimilarTools(currentToolId);
    setSuggestedTools(similar.slice(0, 3));
  }, [currentToolId, outputData]);

  const handleIntegration = async (integration: ToolIntegration) => {
    try {
      const transformedData = integrateToolData(
        integration.sourceToolId,
        integration.targetToolId,
        outputData
      );

      // Navigate to target tool with data
      const targetTool = getTool(integration.targetToolId);
      if (targetTool) {
        // Store the transformed data in sessionStorage for the target tool
        sessionStorage.setItem(
          `tool-integration-${integration.targetToolId}`,
          JSON.stringify({
            data: transformedData,
            sourceToolId: currentToolId,
            timestamp: new Date().toISOString()
          })
        );

        navigate(targetTool.path);
        showSuccess(
          'Integration successful',
          `Data sent to ${targetTool.name}`
        );
      }
    } catch (error) {
      showError(
        'Integration failed',
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  };

  const handleCopyOutput = async () => {
    try {
      const textToCopy = typeof outputData === 'object' 
        ? JSON.stringify(outputData, null, 2)
        : String(outputData);
      
      await navigator.clipboard.writeText(textToCopy);
      showSuccess('Copied to clipboard');
    } catch (error) {
      showError('Failed to copy to clipboard');
    }
  };

  const exportFormats = ['JSON', 'CSV', 'TXT'];

  if (!outputData && availableIntegrations.length === 0 && suggestedTools.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Quick Actions
            </span>
          </div>
          {(availableIntegrations.length > 0 || suggestedTools.length > 0) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm"
            >
              {isExpanded ? 'Less' : 'More'}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {/* Basic Actions */}
          {outputData && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopyOutput}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Result
              </button>
              
              {onShare && (
                <button
                  onClick={onShare}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              )}

              {onExport && (
                <div className="flex gap-1">
                  {exportFormats.map(format => (
                    <button
                      key={format}
                      onClick={() => onExport(format.toLowerCase())}
                      className="flex items-center gap-1 px-2 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xs transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      {format}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tool Integrations */}
          {availableIntegrations.length > 0 && (
            <div className={`space-y-2 ${!isExpanded && availableIntegrations.length > 2 ? 'max-h-20 overflow-hidden' : ''}`}>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Send to Other Tools:
              </div>
              {availableIntegrations.map((integration, index) => {
                const targetTool = getTool(integration.targetToolId);
                return (
                  <button
                    key={index}
                    onClick={() => handleIntegration(integration)}
                    className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 hover:from-purple-100 dark:hover:from-purple-900/30 hover:to-blue-100 dark:hover:to-blue-900/30 rounded-lg border border-purple-200 dark:border-purple-700 transition-all"
                  >
                    <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {targetTool?.name || integration.targetToolId}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {integration.description}
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Suggested Similar Tools */}
          {suggestedTools.length > 0 && isExpanded && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Related Tools:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {suggestedTools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => navigate(tool.path)}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    <div className="w-6 h-6 rounded bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs">
                      {tool.name.charAt(0)}
                    </div>
                    <span className="truncate">{tool.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolIntegrationPanel;