import React, { useState, useEffect } from 'react';
import { Code, Copy, CheckCircle, AlertCircle } from 'lucide-react';

interface DeveloperPreviewProps {
  isActive: boolean;
}

const DeveloperPreview: React.FC<DeveloperPreviewProps> = ({ isActive }) => {
  const [jsonInput, setJsonInput] = useState('{"name":"BrainDead.site","tools":13,"awesome":true,"users":"developers who hate thinking","features":["no signup","no ads","actually works"]}');
  const [formattedJson, setFormattedJson] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setFormattedJson(formatted);
      setIsValid(true);
      setError('');
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setFormattedJson('');
    }
  }, [jsonInput]);

  const copyToClipboard = () => {
    if (formattedJson) {
      navigator.clipboard.writeText(formattedJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const minifyJson = () => {
    if (isValid && formattedJson) {
      try {
        const parsed = JSON.parse(formattedJson);
        const minified = JSON.stringify(parsed);
        setJsonInput(minified);
      } catch (err) {
        // Handle error
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Code className="w-5 h-5 text-violet-400" />
        <span className="text-white font-medium">JSON Formatter Preview</span>
      </div>
      
      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm text-gray-400">Raw JSON:</label>
          <div className="flex items-center space-x-2">
            {isValid ? (
              <div className="flex items-center space-x-1 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Valid</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">Invalid</span>
              </div>
            )}
          </div>
        </div>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className={`w-full h-20 p-3 bg-gray-800 border rounded-lg text-white text-sm font-mono focus:outline-none transition-colors resize-none ${
            isValid ? 'border-gray-700 focus:border-violet-500' : 'border-red-500 focus:border-red-400'
          }`}
          placeholder="Paste your JSON here..."
        />
        {!isValid && error && (
          <div className="mt-1 text-xs text-red-400">
            Error: {error}
          </div>
        )}
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm text-gray-400">Formatted JSON:</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={minifyJson}
              disabled={!isValid}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded text-xs text-gray-300 transition-colors"
            >
              Minify
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!formattedJson}
              className="flex items-center space-x-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded text-xs text-gray-300 transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 h-32 overflow-auto">
          {formattedJson ? (
            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
              {formattedJson}
            </pre>
          ) : (
            <div className="text-gray-500 text-sm italic">
              {isValid ? 'Formatted JSON will appear here...' : 'Fix JSON syntax to see formatted output'}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {isValid && formattedJson && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-2 text-center border border-gray-700/50">
            <div className="text-violet-400 font-bold text-sm">{jsonInput.length}</div>
            <div className="text-gray-400 text-xs">Raw Size</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 text-center border border-gray-700/50">
            <div className="text-blue-400 font-bold text-sm">{formattedJson.length}</div>
            <div className="text-gray-400 text-xs">Formatted</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 text-center border border-gray-700/50">
            <div className="text-green-400 font-bold text-sm">
              {Object.keys(JSON.parse(jsonInput)).length}
            </div>
            <div className="text-gray-400 text-xs">Keys</div>
          </div>
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-gray-500 italic">
          "Makes your JSON prettier than a sunset over Silicon Valley"
        </p>
      </div>
    </div>
  );
};

export default DeveloperPreview;