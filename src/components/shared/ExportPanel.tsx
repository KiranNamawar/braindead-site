import React, { useState } from 'react';
import { Download, Share2, Copy, Settings, FileText, Database, Code, Globe, FileImage, Loader2 } from 'lucide-react';
import { ExportOptions, exportToolData, createShareableLink, downloadFile } from '../../utils/exportManager';
import { useToast } from '../ToastContainer';

interface ExportPanelProps {
  toolId: string;
  data: any;
  toolName: string;
  onExport?: (format: string) => void;
  className?: string;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  toolId,
  data,
  toolName,
  onExport,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeMetadata: true,
    compression: false,
    filename: `${toolName.toLowerCase().replace(/\s+/g, '-')}-export`
  });
  
  const { showToast } = useToast();

  const formatOptions = [
    { value: 'json', label: 'JSON', icon: Code, description: 'Structured data format' },
    { value: 'csv', label: 'CSV', icon: Database, description: 'Spreadsheet compatible' },
    { value: 'txt', label: 'Text', icon: FileText, description: 'Plain text format' },
    { value: 'xml', label: 'XML', icon: Code, description: 'Markup format' },
    { value: 'html', label: 'HTML', icon: Globe, description: 'Web page format' },
    { value: 'pdf', label: 'PDF', icon: FileImage, description: 'Printable document' }
  ];

  const handleExport = async () => {
    if (!data) {
      showToast({
        type: 'warning',
        title: 'No Data',
        message: 'There is no data to export. Please generate some results first.'
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const blob = await exportToolData(toolId, data, exportOptions);
      const filename = `${exportOptions.filename}.${exportOptions.format}`;
      
      downloadFile(blob, filename);
      
      showToast({
        type: 'success',
        title: 'Export Successful',
        message: `Data exported as ${exportOptions.format.toUpperCase()}`
      });

      if (onExport) {
        onExport(exportOptions.format);
      }
    } catch (error) {
      console.error('Export failed:', error);
      showToast({
        type: 'error',
        title: 'Export Failed',
        message: error instanceof Error ? error.message : 'Failed to export data'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateShareableLink = async () => {
    if (!data) {
      showToast({
        type: 'warning',
        title: 'No Data',
        message: 'There is no data to share. Please generate some results first.'
      });
      return;
    }

    try {
      const url = createShareableLink(toolId, { format: exportOptions.format }, data, 24);
      setShareUrl(url);
      setShowShareOptions(true);
      
      showToast({
        type: 'success',
        title: 'Shareable Link Created',
        message: 'Link will expire in 24 hours'
      });
    } catch (error) {
      console.error('Failed to create shareable link:', error);
      showToast({
        type: 'error',
        title: 'Share Failed',
        message: 'Failed to create shareable link'
      });
    }
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast({
        type: 'success',
        title: 'Copied',
        message: 'Shareable link copied to clipboard'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy link to clipboard'
      });
    }
  };

  const copyDataToClipboard = async () => {
    if (!data) return;

    try {
      let textData: string;
      
      if (typeof data === 'string') {
        textData = data;
      } else if (typeof data === 'object') {
        textData = JSON.stringify(data, null, 2);
      } else {
        textData = String(data);
      }

      await navigator.clipboard.writeText(textData);
      showToast({
        type: 'success',
        title: 'Copied',
        message: 'Data copied to clipboard'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy data to clipboard'
      });
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors ${className}`}
        title="Export & Share"
      >
        <Download className="w-4 h-4" />
        Export
      </button>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Export & Share</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Export Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          {formatOptions.map((format) => {
            const Icon = format.icon;
            return (
              <button
                key={format.value}
                onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                  exportOptions.format === format.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium text-sm">{format.label}</div>
                  <div className="text-xs text-gray-500">{format.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Options */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Options
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={exportOptions.includeMetadata}
              onChange={(e) => setExportOptions(prev => ({ 
                ...prev, 
                includeMetadata: e.target.checked 
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Include metadata</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={exportOptions.compression}
              onChange={(e) => setExportOptions(prev => ({ 
                ...prev, 
                compression: e.target.checked 
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Compress file</span>
          </label>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Filename</label>
            <input
              type="text"
              value={exportOptions.filename}
              onChange={(e) => setExportOptions(prev => ({ 
                ...prev, 
                filename: e.target.value 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="export-filename"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExport}
          disabled={isExporting || !data}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isExporting ? 'Exporting...' : 'Download'}
        </button>

        <button
          onClick={handleCreateShareableLink}
          disabled={!data}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share Link
        </button>

        <button
          onClick={copyDataToClipboard}
          disabled={!data}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copy Data
        </button>
      </div>

      {/* Share URL Display */}
      {showShareOptions && shareUrl && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-800">Shareable Link</span>
            <button
              onClick={() => setShowShareOptions(false)}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-md text-sm"
            />
            <button
              onClick={copyShareUrl}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-green-600 mt-2">
            Link expires in 24 hours and can be accessed unlimited times.
          </p>
        </div>
      )}

      {/* Data Preview */}
      {data && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Data Preview</span>
          </div>
          <pre className="text-xs text-gray-600 overflow-x-auto max-h-32">
            {typeof data === 'string' 
              ? data.slice(0, 200) + (data.length > 200 ? '...' : '')
              : JSON.stringify(data, null, 2).slice(0, 200) + '...'
            }
          </pre>
        </div>
      )}
    </div>
  );
};

export default ExportPanel;