import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, Copy, ExternalLink, Shuffle, Link2, CheckCircle } from 'lucide-react';
import { getToolIntegrations, integrateToolData, setSharedData, getSharedData } from '../../utils/toolIntegration';
import { toolRegistry } from '../../utils/toolRegistry';
import { useToast } from '../ToastContainer';
import { ToolIntegration as ToolIntegrationType, SharedClipboard } from '../../types';

interface ToolIntegrationProps {
  toolId: string;
  outputData: any;
  onIntegrate?: (targetToolId: string, transformedData: any) => void;
  className?: string;
}

const ToolIntegration: React.FC<ToolIntegrationProps> = ({
  toolId,
  outputData,
  onIntegrate,
  className = ''
}) => {
  const [availableIntegrations, setAvailableIntegrations] = useState<ToolIntegrationType[]>([]);
  const [sharedClipboard, setSharedClipboardState] = useState<SharedClipboard | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [processingIntegration, setProcessingIntegration] = useState<string | null>(null);
  
  const { showToast } = useToast();

  useEffect(() => {
    // Get available integrations for this tool
    const integrations = getToolIntegrations(toolId);
    setAvailableIntegrations(integrations);

    // Check for shared clipboard data
    const clipboard = getSharedData();
    setSharedClipboardState(clipboard);
  }, [toolId, outputData]);

  const handleIntegration = async (integration: ToolIntegrationType) => {
    if (!outputData) {
      showToast({
        type: 'warning',
        title: 'No Data',
        message: 'Generate some output data first to use integrations.'
      });
      return;
    }

    setProcessingIntegration(integration.targetToolId);

    try {
      const transformedData = integrateToolData(toolId, integration.targetToolId, outputData);
      
      // Store in shared clipboard
      setSharedData({
        data: transformedData,
        sourceToolId: toolId,
        timestamp: new Date(),
        dataType: typeof transformedData === 'string' ? 'text' : 
                  typeof transformedData === 'number' ? 'number' : 'json'
      });

      showToast({
        type: 'success',
        title: 'Integration Successful',
        message: `Data prepared for ${toolRegistry.getTool(integration.targetToolId)?.name}`
      });

      if (onIntegrate) {
        onIntegrate(integration.targetToolId, transformedData);
      }
    } catch (error) {
      console.error('Integration failed:', error);
      showToast({
        type: 'error',
        title: 'Integration Failed',
        message: error instanceof Error ? error.message : 'Failed to integrate data'
      });
    } finally {
      setProcessingIntegration(null);
    }
  };

  const navigateToTool = (targetToolId: string, transformedData?: any) => {
    const tool = toolRegistry.getTool(targetToolId);
    if (!tool) return;

    // Store data in shared clipboard if provided
    if (transformedData) {
      setSharedData({
        data: transformedData,
        sourceToolId: toolId,
        timestamp: new Date(),
        dataType: typeof transformedData === 'string' ? 'text' : 
                  typeof transformedData === 'number' ? 'number' : 'json'
      });
    }

    // Navigate to the target tool
    window.location.href = tool.path;
  };

  const copyToSharedClipboard = () => {
    if (!outputData) return;

    setSharedData({
      data: outputData,
      sourceToolId: toolId,
      timestamp: new Date(),
      dataType: typeof outputData === 'string' ? 'text' : 
                typeof outputData === 'number' ? 'number' : 'json'
    });

    showToast({
      type: 'success',
      title: 'Data Shared',
      message: 'Data copied to shared clipboard for use in other tools'
    });

    setSharedClipboardState({
      data: outputData,
      sourceToolId: toolId,
      timestamp: new Date(),
      dataType: typeof outputData === 'string' ? 'text' : 
                typeof outputData === 'number' ? 'number' : 'json'
    });
  };

  const useSharedData = () => {
    if (!sharedClipboard) return;

    // This would typically be handled by the parent component
    // For now, we'll just show a success message
    showToast({
      type: 'info',
      title: 'Shared Data Available',
      message: `Data from ${toolRegistry.getTool(sharedClipboard.sourceToolId)?.name} is ready to use`
    });
  };

  const clearSharedClipboard = () => {
    setSharedData({
      data: null,
      sourceToolId: '',
      timestamp: new Date(),
      dataType: 'text'
    });
    setSharedClipboardState(null);
    
    showToast({
      type: 'success',
      title: 'Clipboard Cleared',
      message: 'Shared clipboard has been cleared'
    });
  };

  if (availableIntegrations.length === 0 && !sharedClipboard && !outputData) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-purple-900">Tool Integration</h3>
        </div>
        {(availableIntegrations.length > 0 || sharedClipboard) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-600 hover:text-purple-800 text-sm"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>

      {/* Shared Clipboard Status */}
      {sharedClipboard && (
        <div className="mb-4 p-3 bg-white border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-700">
                Data from {toolRegistry.getTool(sharedClipboard.sourceToolId)?.name} available
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={useSharedData}
                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Use Data
              </button>
              <button
                onClick={clearSharedClipboard}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(sharedClipboard.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {outputData && (
          <button
            onClick={copyToSharedClipboard}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-sm"
          >
            <Copy className="w-3 h-3" />
            Share Data
          </button>
        )}
        
        {availableIntegrations.length > 0 && (
          <span className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm">
            <Zap className="w-3 h-3" />
            {availableIntegrations.length} integration{availableIntegrations.length !== 1 ? 's' : ''} available
          </span>
        )}
      </div>

      {/* Available Integrations */}
      {isExpanded && availableIntegrations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Available Integrations</h4>
          {availableIntegrations.map((integration) => {
            const targetTool = toolRegistry.getTool(integration.targetToolId);
            if (!targetTool) return null;

            const isProcessing = processingIntegration === integration.targetToolId;

            return (
              <div
                key={integration.targetToolId}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {targetTool.name.charAt(0)}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {targetTool.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {targetTool.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {integration.description}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleIntegration(integration)}
                    disabled={!outputData || isProcessing}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm"
                  >
                    {isProcessing ? (
                      <>
                        <Shuffle className="w-3 h-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3" />
                        Integrate
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => navigateToTool(integration.targetToolId)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Integration Tips */}
      {isExpanded && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Integration Tips</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Use "Share Data" to make your results available to other tools</li>
            <li>• Integrations automatically transform data to the correct format</li>
            <li>• Shared data expires after 1 hour for privacy</li>
            <li>• Some integrations work better with specific data types</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ToolIntegration;