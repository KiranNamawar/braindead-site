import React, { useState } from 'react';
import { Code, Copy, Download, Upload, CheckCircle, XCircle, Minimize, Maximize } from 'lucide-react';
import BackButton from '../components/BackButton';
import { validateJSON } from '../utils/validation';
import { LIMITS } from '../utils/constants';

const JSONFormatterPage: React.FC = () => {
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [indentSize, setIndentSize] = useState(2);

  const formatJson = () => {
    if (!inputJson.trim()) {
      setOutputJson('');
      setIsValid(null);
      setError('');
      return;
    }
    
    if (inputJson.length > LIMITS.maxTextLength) {
      setError(`JSON too large. Maximum size is ${LIMITS.maxTextLength / 1000}KB`);
      setIsValid(false);
      return;
    }

    const validation = validateJSON(inputJson);
    if (!validation.isValid) {
      setIsValid(false);
      setError(validation.error || 'Invalid JSON');
      setOutputJson('');
      return;
    }
    
    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutputJson(formatted);
      setIsValid(true);
      setError('');
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutputJson('');
    }
  };

  const minifyJson = () => {
    if (!inputJson.trim()) return;

    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
      setIsValid(true);
      setError('');
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutputJson('');
    }
  };

  const validateJson = () => {
    if (!inputJson.trim()) {
      setIsValid(null);
      setError('');
      return;
    }

    try {
      JSON.parse(inputJson);
      setIsValid(true);
      setError('');
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback('Copied!');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (err) {
      setCopyFeedback('Failed to copy');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  const downloadJson = () => {
    if (!outputJson) return;

    const blob = new Blob([outputJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formatted.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputJson(content);
    };
    reader.readAsText(file);
  };

  const sampleJsons = [
    {
      name: 'Simple Object',
      json: '{"name":"John Doe","age":30,"city":"New York"}'
    },
    {
      name: 'Array with Objects',
      json: '[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]'
    },
    {
      name: 'Nested Structure',
      json: '{"user":{"profile":{"name":"Jane","settings":{"theme":"dark","notifications":true}}}}'
    },
    {
      name: 'API Response',
      json: '{"status":"success","data":{"users":[{"id":1,"email":"user@example.com","active":true}],"total":1},"timestamp":"2024-01-01T00:00:00Z"}'
    }
  ];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      validateJson();
    }, 500);
    return () => clearTimeout(timer);
  }, [inputJson]);

  const getJsonStats = (json: string) => {
    if (!json) return null;
    
    try {
      const parsed = JSON.parse(json);
      const stringify = JSON.stringify(parsed);
      
      const countObjects = (obj: any): number => {
        if (typeof obj !== 'object' || obj === null) return 0;
        if (Array.isArray(obj)) {
          return obj.reduce((count, item) => count + countObjects(item), 0);
        }
        return 1 + Object.values(obj).reduce((count: number, value) => count + countObjects(value), 0);
      };

      const countArrays = (obj: any): number => {
        if (typeof obj !== 'object' || obj === null) return 0;
        if (Array.isArray(obj)) {
          return 1 + obj.reduce((count, item) => count + countArrays(item), 0);
        }
        return Object.values(obj).reduce((count: number, value) => count + countArrays(value), 0);
      };

      const countKeys = (obj: any): number => {
        if (typeof obj !== 'object' || obj === null) return 0;
        if (Array.isArray(obj)) {
          return obj.reduce((count, item) => count + countKeys(item), 0);
        }
        return Object.keys(obj).length + Object.values(obj).reduce((count: number, value) => count + countKeys(value), 0);
      };

      return {
        size: stringify.length,
        objects: countObjects(parsed),
        arrays: countArrays(parsed),
        keys: countKeys(parsed),
        type: Array.isArray(parsed) ? 'Array' : typeof parsed
      };
    } catch {
      return null;
    }
  };

  const stats = getJsonStats(inputJson);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl mb-6">
          <Code className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-4">
          JSON Formatter
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Format, validate, and minify JSON data with syntax highlighting and error detection. 
          <span className="text-violet-400"> Because messy JSON is a crime against humanity!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Input Controls */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Input JSON</h3>
              <div className="flex items-center space-x-2">
                {isValid === true && (
                  <div className="flex items-center space-x-1 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Valid</span>
                  </div>
                )}
                {isValid === false && (
                  <div className="flex items-center space-x-1 text-red-400">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">Invalid</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="json-upload"
                />
                <label
                  htmlFor="json-upload"
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-sm transition-colors cursor-pointer flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload JSON</span>
                </label>

                <div className="flex items-center space-x-2">
                  <label className="text-gray-400 text-sm">Indent:</label>
                  <select
                    value={indentSize}
                    onChange={(e) => setIndentSize(Number(e.target.value))}
                    className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-violet-500 focus:outline-none"
                  >
                    <option value={2}>2 spaces</option>
                    <option value={4}>4 spaces</option>
                    <option value={8}>8 spaces</option>
                  </select>
                </div>
              </div>

              <textarea
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                placeholder="Paste your JSON here..."
                className="w-full h-80 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono text-sm resize-none focus:border-violet-500 focus:outline-none"
              />

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="text-red-400 text-sm font-semibold mb-1">Error:</div>
                  <div className="text-red-300 text-sm">{error}</div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={formatJson}
                  className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-xl font-semibold text-white hover:from-violet-400 hover:to-fuchsia-500 transition-all duration-300 flex items-center space-x-2"
                >
                  <Maximize className="w-4 h-4" />
                  <span>Format</span>
                </button>
                <button
                  onClick={minifyJson}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors flex items-center space-x-2"
                >
                  <Minimize className="w-4 h-4" />
                  <span>Minify</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sample JSONs */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Sample JSONs</h3>
            <div className="space-y-2">
              {sampleJsons.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => setInputJson(sample.json)}
                  className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-white transition-colors"
                >
                  <div className="font-semibold text-sm mb-1">{sample.name}</div>
                  <div className="text-gray-400 text-xs font-mono truncate">{sample.json}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {/* Output */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Formatted Output</h3>
              {copyFeedback && (
                <span className="text-green-400 text-sm">{copyFeedback}</span>
              )}
            </div>

            <textarea
              value={outputJson}
              readOnly
              placeholder="Formatted JSON will appear here..."
              className="w-full h-80 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono text-sm resize-none focus:border-violet-500 focus:outline-none"
            />

            <div className="flex justify-between items-center mt-4">
              <span className="text-gray-400 text-sm">
                {outputJson ? `${outputJson.length} characters` : 'No output'}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(outputJson)}
                  disabled={!outputJson}
                  className="px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-lg text-violet-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={downloadJson}
                  disabled={!outputJson}
                  className="px-4 py-2 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/30 rounded-lg text-fuchsia-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>

          {/* JSON Statistics */}
          {stats && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">JSON Statistics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-violet-400">{stats.size}</div>
                  <div className="text-gray-400 text-sm">Characters</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-fuchsia-400">{stats.objects}</div>
                  <div className="text-gray-400 text-sm">Objects</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{stats.arrays}</div>
                  <div className="text-gray-400 text-sm">Arrays</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.keys}</div>
                  <div className="text-gray-400 text-sm">Keys</div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-800/50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Root Type:</span>
                  <span className="text-white font-semibold">{stats.type}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">📝 Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Use 2-space indentation for web APIs</li>
              <li>• Minify JSON for production to save bandwidth</li>
              <li>• Validate JSON before sending to APIs</li>
              <li>• Use proper quotes (double quotes only)</li>
              <li>• Avoid trailing commas in JSON</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JSONFormatterPage;