import React, { useState, useEffect } from 'react';
import { Code, Copy, Download, Upload, CheckCircle, XCircle, Minimize, Maximize, FileText, Zap } from 'lucide-react';
import ToolLayout from '../components/shared/ToolLayout';
import { validateJSONEnhanced, ValidationResult } from '../utils/validation';
import { LIMITS } from '../utils/constants';
import { useToast } from '../components/ToastContainer';

const JSONFormatterPage: React.FC = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  const [indentSize, setIndentSize] = useState(2);
  const [operation, setOperation] = useState<'format' | 'minify' | 'validate'>('format');

  // Check for integration data on mount
  useEffect(() => {
    const integrationData = sessionStorage.getItem('tool-integration-json-formatter');
    if (integrationData) {
      try {
        const parsed = JSON.parse(integrationData);
        if (parsed.data && typeof parsed.data === 'string') {
          setInputJson(parsed.data);
          showSuccess('Data integrated from ' + parsed.sourceToolId);
        }
        sessionStorage.removeItem('tool-integration-json-formatter');
      } catch (error) {
        console.warn('Failed to load integration data:', error);
      }
    }
  }, [showSuccess]);

  // Auto-validate JSON as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputJson.trim()) {
        const result = validateJSONEnhanced(inputJson);
        setValidation(result);
        
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach(warning => showWarning(warning));
        }
      } else {
        setValidation({ isValid: true });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputJson, showWarning]);

  const processJson = () => {
    if (!inputJson.trim()) {
      showError('Please enter JSON to process');
      return;
    }

    const result = validateJSONEnhanced(inputJson);
    setValidation(result);

    if (!result.isValid) {
      showError('Invalid JSON', result.error);
      if (result.suggestions) {
        result.suggestions.forEach(suggestion => showWarning(suggestion));
      }
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      let processed: string;

      switch (operation) {
        case 'format':
          processed = JSON.stringify(parsed, null, indentSize);
          break;
        case 'minify':
          processed = JSON.stringify(parsed);
          break;
        case 'validate':
          processed = 'JSON is valid ✓';
          break;
        default:
          processed = JSON.stringify(parsed, null, indentSize);
      }

      setOutputJson(processed);
      showSuccess(`JSON ${operation}ted successfully`);
    } catch (error) {
      showError('Processing failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > LIMITS.maxFileSize) {
      showError('File too large', `Maximum file size is ${LIMITS.maxFileSize / 1024 / 1024}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputJson(content);
      showSuccess('File loaded successfully');
    };
    reader.onerror = () => {
      showError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleExport = (format: string) => {
    if (!outputJson) return;

    let content: string;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'json':
        content = outputJson;
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'txt':
        content = outputJson;
        mimeType = 'text/plain';
        extension = 'txt';
        break;
      default:
        content = outputJson;
        mimeType = 'application/json';
        extension = 'json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `json-${operation}-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBatchProcess = async (input: string): Promise<string> => {
    try {
      const result = validateJSONEnhanced(input);
      if (!result.isValid) {
        throw new Error(result.error || 'Invalid JSON');
      }

      const parsed = JSON.parse(input);
      switch (operation) {
        case 'format':
          return JSON.stringify(parsed, null, indentSize);
        case 'minify':
          return JSON.stringify(parsed);
        case 'validate':
          return 'Valid JSON ✓';
        default:
          return JSON.stringify(parsed, null, indentSize);
      }
    } catch (error) {
      throw new Error(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <ToolLayout
      toolId="json-formatter"
      title="JSON Formatter"
      description="Format, validate, and minify JSON data with enhanced error handling and batch processing"
      outputData={outputJson}
      onExport={handleExport}
      onBatchProcess={handleBatchProcess}
      batchInputPlaceholder="Enter JSON strings, one per line"
      showBatchOperations={true}
    >
      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Operation:
            </label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="format">Format</option>
              <option value="minify">Minify</option>
              <option value="validate">Validate</option>
            </select>
          </div>

          {operation === 'format' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Indent:
              </label>
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".json,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="json-upload"
            />
            <label
              htmlFor="json-upload"
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload File
            </label>
          </div>

          <button
            onClick={processJson}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Zap className="w-4 h-4" />
            Process JSON
          </button>
        </div>

        {/* Validation Status */}
        {validation && (
          <div className={`p-4 rounded-lg border ${
            validation.isValid 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {validation.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <span className={`font-medium ${
                validation.isValid 
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {validation.isValid ? 'Valid JSON' : 'Invalid JSON'}
              </span>
            </div>
            
            {validation.error && (
              <p className="text-red-700 dark:text-red-300 text-sm mb-2">
                {validation.error}
              </p>
            )}
            
            {validation.suggestions && validation.suggestions.length > 0 && (
              <div className="text-sm">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Suggestions:</p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                  {validation.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Input JSON
            </h3>
            
            <textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              placeholder="Paste your JSON here..."
              className="w-full h-80 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Output
            </h3>
            
            <textarea
              value={outputJson}
              readOnly
              placeholder="Processed JSON will appear here..."
              className="w-full h-80 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none"
            />
          </div>
        </div>

        {/* Tips */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            💡 Pro Tips
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Use 2-space indentation for web APIs</li>
            <li>• Minify JSON for production to save bandwidth</li>
            <li>• Always validate JSON before sending to APIs</li>
            <li>• Use proper quotes (double quotes only)</li>
            <li>• Avoid trailing commas in JSON</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
};

export default JSONFormatterPage;