import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Heart, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tool } from '../../types';
import { useFavorites } from '../../hooks/useFavorites';
import { useRecentTools } from '../../hooks/useRecentTools';
import { getTool } from '../../utils/toolRegistry';
import { setSharedData } from '../../utils/toolIntegration';
import { addWorkflowStep } from '../../utils/workflowManager';
import SharedClipboard from './SharedClipboard';
import ToolIntegrationPanel from './ToolIntegrationPanel';
import ExportButton from './ExportButton';
import BatchOperationPanel from './BatchOperationPanel';
import ExportPanel from './ExportPanel';
import BatchProcessor from './BatchProcessor';
import ToolIntegration from './ToolIntegration';
import ShareableLinkHandler from './ShareableLinkHandler';
import ToolTutorial from './ToolTutorial';
import ContextualHelp from './ContextualHelp';
import KeyboardShortcuts from './KeyboardShortcuts';
import ToolRecommendations from './ToolRecommendations';
import SEOHead from '../SEOHead';
import Breadcrumbs from '../Breadcrumbs';
import { useToast } from '../ToastContainer';
import { generateToolSEO } from '../../utils/seo';

interface ToolLayoutProps {
  toolId: string;
  title: string;
  description: string;
  children: React.ReactNode;
  outputData?: any;
  onExport?: (format: string) => void;
  onBatchProcess?: (input: any) => Promise<any>;
  onSharedDataLoaded?: (data: any, configuration: any) => void;
  batchInputPlaceholder?: string;
  showSharedClipboard?: boolean;
  showIntegrationPanel?: boolean;
  showBatchOperations?: boolean;
  showExportButton?: boolean;
  className?: string;
}

const ToolLayout: React.FC<ToolLayoutProps> = ({
  toolId,
  title,
  description,
  children,
  outputData,
  onExport,
  onBatchProcess,
  onSharedDataLoaded,
  batchInputPlaceholder,
  showSharedClipboard = true,
  showIntegrationPanel = true,
  showBatchOperations = false,
  showExportButton = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { addRecentTool } = useRecentTools();
  const [startTime] = useState(Date.now());
  const [tool, setTool] = useState<Tool | null>(null);

  useEffect(() => {
    const toolData = getTool(toolId);
    setTool(toolData || null);
    
    if (toolData) {
      // Track tool usage
      addRecentTool(toolData);
    }
  }, [toolId, addRecentTool]);

  useEffect(() => {
    // Track workflow step when output data changes
    if (outputData && tool) {
      const duration = Date.now() - startTime;
      addWorkflowStep(toolId, null, outputData, duration);
    }
  }, [outputData, toolId, tool, startTime]);

  const isFavorite = favorites.includes(toolId);

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      removeFavorite(toolId);
      showSuccess('Removed from favorites');
    } else {
      addFavorite(toolId);
      showSuccess('Added to favorites');
    }
  };

  const handleShare = async () => {
    if (!outputData) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${title} Result`,
          text: typeof outputData === 'object' 
            ? JSON.stringify(outputData, null, 2)
            : String(outputData),
          url: window.location.href
        });
      } else {
        // Fallback to clipboard
        const textToShare = typeof outputData === 'object' 
          ? JSON.stringify(outputData, null, 2)
          : String(outputData);
        await navigator.clipboard.writeText(textToShare);
        showSuccess('Result copied to clipboard');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleIntegrateData = (targetToolId: string, data: any) => {
    // Store data in shared clipboard for target tool
    setSharedData({
      data,
      sourceToolId: toolId,
      timestamp: new Date(),
      dataType: typeof data === 'object' ? 'json' : typeof data as any
    });
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      <SEOHead 
        toolId={toolId}
        title={title}
        description={description}
        keywords={tool?.keywords}
      />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Breadcrumbs */}
        {tool && (
          <div className="mb-4">
            <Breadcrumbs items={generateToolSEO(tool).breadcrumbs || []} />
          </div>
        )}
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <div className="flex items-center gap-2">
              {outputData && (
                <>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  
                  {showExportButton && onExport && (
                    <ExportButton
                      toolId={toolId}
                      data={outputData}
                      onExport={onExport}
                    />
                  )}
                </>
              )}
              
              <button
                onClick={handleFavoriteToggle}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isFavorite
                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Favorited' : 'Favorite'}
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {description}
            </p>
            {tool?.sarcasticQuote && (
              <p className="text-sm text-gray-500 dark:text-gray-500 italic mt-2">
                "{tool.sarcasticQuote}"
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Shareable Link Handler */}
            <ShareableLinkHandler
              toolId={toolId}
              onDataLoaded={onSharedDataLoaded || ((data, config) => {
                console.log('Shared data loaded:', { data, config });
              })}
            />

            {/* Shared Clipboard */}
            {showSharedClipboard && (
              <SharedClipboard
                currentToolId={toolId}
                onIntegrateData={handleIntegrateData}
              />
            )}

            {/* Tool Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {children}
            </div>

            {/* Advanced Export Panel */}
            {outputData && (
              <ExportPanel
                toolId={toolId}
                data={outputData}
                toolName={title}
                onExport={onExport}
                className="mb-6"
              />
            )}

            {/* Tool Integration */}
            <ToolIntegration
              toolId={toolId}
              outputData={outputData}
              onIntegrate={handleIntegrateData}
              className="mb-6"
            />

            {/* Advanced Batch Processing */}
            {showBatchOperations && onBatchProcess && (
              <BatchProcessor
                toolId={toolId}
                toolName={title}
                processor={onBatchProcess}
                placeholder={batchInputPlaceholder}
                className="mb-6"
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tutorial and Help */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Help & Shortcuts
              </h3>
              <div className="flex flex-wrap gap-2">
                <ToolTutorial
                  toolId={toolId}
                  steps={[
                    {
                      id: 'intro',
                      title: 'Welcome!',
                      description: `Learn how to use ${title} effectively`,
                      content: (
                        <div>
                          <p>This tutorial will guide you through the main features of this tool.</p>
                          <p className="mt-2 text-sm text-gray-600">
                            You can always replay this tutorial from the help section.
                          </p>
                        </div>
                      )
                    },
                    {
                      id: 'main-features',
                      title: 'Main Features',
                      description: 'Discover what this tool can do',
                      content: (
                        <div>
                          <p>Key features:</p>
                          <ul className="mt-2 space-y-1">
                            {tool?.features.slice(0, 3).map((feature, index) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    },
                    {
                      id: 'shortcuts',
                      title: 'Keyboard Shortcuts',
                      description: 'Work faster with keyboard shortcuts',
                      content: (
                        <div>
                          <p>Use these shortcuts to work more efficiently:</p>
                          <div className="mt-2 space-y-1 text-sm">
                            <div>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+Enter</kbd> - Execute</div>
                            <div>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+S</kbd> - Save/Export</div>
                            <div>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+R</kbd> - Reset</div>
                          </div>
                        </div>
                      )
                    }
                  ]}
                  autoStart={false}
                />
                
                <KeyboardShortcuts
                  toolId={toolId}
                  onShortcutTriggered={(action) => {
                    // Handle shortcut actions
                    switch (action) {
                      case 'help':
                        // Trigger tutorial
                        break;
                      case 'export':
                        if (outputData && onExport) {
                          onExport('json');
                        }
                        break;
                      case 'save':
                        if (outputData && onExport) {
                          onExport('json');
                        }
                        break;
                      default:
                        console.log('Shortcut triggered:', action);
                    }
                  }}
                />
              </div>
            </div>

            {/* Tool Recommendations */}
            <ToolRecommendations
              currentToolId={toolId}
              limit={3}
              showComparison={true}
            />

            {/* Tool Integration Panel */}
            {showIntegrationPanel && (
              <ToolIntegrationPanel
                currentToolId={toolId}
                outputData={outputData}
                onExport={onExport}
                onShare={handleShare}
              />
            )}

            {/* Tool Info */}
            {tool && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Tool Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Saves ~{tool.estimatedTimeSaved} minutes</span>
                  </div>
                  
                  <div>
                    <div className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                      Features:
                    </div>
                    <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                      {tool.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {tool.keywords.length > 0 && (
                    <div>
                      <div className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                        Keywords:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tool.keywords.slice(0, 6).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
                Privacy First
              </h3>
              <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <p>• All processing happens locally</p>
                <p>• No data sent to servers</p>
                <p>• No tracking or analytics</p>
                <p>• Your data stays private</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolLayout;