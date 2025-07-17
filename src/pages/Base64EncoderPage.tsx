import React, { useState, useCallback } from 'react';
import { Code2, Copy, Upload, Download, FileText, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import BackButton from '../components/BackButton';
import { LIMITS } from '../utils/constants';

const Base64EncoderPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [isUrlSafe, setIsUrlSafe] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [batchItems, setBatchItems] = useState<Array<{ input: string; output: string; error?: string }>>([]);
  const [batchInput, setBatchInput] = useState('');

  const encodeBase64 = useCallback((text: string, urlSafe: boolean = false): string => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(text)));
      return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '') : encoded;
    } catch (err) {
      throw new Error('Failed to encode text');
    }
  }, []);

  const decodeBase64 = useCallback((text: string, urlSafe: boolean = false): string => {
    try {
      let base64 = text;
      if (urlSafe) {
        // Convert URL-safe back to standard Base64
        base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding if needed
        while (base64.length % 4) {
          base64 += '=';
        }
      }
      return decodeURIComponent(escape(atob(base64)));
    } catch (err) {
      throw new Error('Invalid Base64 string');
    }
  }, []);

  const processText = useCallback(() => {
    if (!inputText.trim()) {
      setOutputText('');
      setError('');
      setIsValid(null);
      return;
    }

    if (inputText.length > LIMITS.maxTextLength) {
      setError(`Text too large. Maximum size is ${LIMITS.maxTextLength / 1000}KB`);
      setIsValid(false);
      setOutputText('');
      return;
    }

    try {
      let result: string;
      if (mode === 'encode') {
        result = encodeBase64(inputText, isUrlSafe);
      } else {
        result = decodeBase64(inputText, isUrlSafe);
      }
      
      setOutputText(result);
      setError('');
      setIsValid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      setIsValid(false);
      setOutputText('');
    }
  }, [inputText, mode, isUrlSafe, encodeBase64, decodeBase64]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > LIMITS.maxFileSize) {
      setError(`File too large. Maximum size is ${LIMITS.maxFileSize / (1024 * 1024)}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        if (mode === 'encode') {
          setInputText(result);
        } else {
          // For decode mode, read as base64
          const base64 = result.split(',')[1] || result;
          setInputText(base64);
        }
      } else if (result instanceof ArrayBuffer) {
        // Convert ArrayBuffer to base64 for binary files
        const bytes = new Uint8Array(result);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        if (mode === 'encode') {
          setOutputText(isUrlSafe ? base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '') : base64);
        } else {
          setInputText(base64);
        }
      }
    };

    if (mode === 'encode' && file.type.startsWith('text/')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, [mode, isUrlSafe]);

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

  const downloadResult = () => {
    if (!outputText) return;

    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${mode}d-result.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const processBatch = () => {
    if (!batchInput.trim()) return;

    const lines = batchInput.split('\n').filter(line => line.trim());
    const results = lines.map(line => {
      try {
        const output = mode === 'encode' 
          ? encodeBase64(line.trim(), isUrlSafe)
          : decodeBase64(line.trim(), isUrlSafe);
        return { input: line.trim(), output };
      } catch (err) {
        return { 
          input: line.trim(), 
          output: '', 
          error: err instanceof Error ? err.message : 'Processing failed' 
        };
      }
    });

    setBatchItems(results);
  };

  const clearBatch = () => {
    setBatchItems([]);
    setBatchInput('');
  };

  const downloadBatchResults = () => {
    if (batchItems.length === 0) return;

    const csvContent = [
      'Input,Output,Error',
      ...batchItems.map(item => 
        `"${item.input}","${item.output}","${item.error || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch-${mode}-results.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const swapInputOutput = () => {
    if (outputText && !error) {
      setInputText(outputText);
      setOutputText('');
      setMode(mode === 'encode' ? 'decode' : 'encode');
    }
  };

  const sampleTexts = [
    {
      name: 'Simple Text',
      text: 'Hello, World!',
      encoded: 'SGVsbG8sIFdvcmxkIQ=='
    },
    {
      name: 'JSON Data',
      text: '{"name":"John","age":30}',
      encoded: 'eyJuYW1lIjoiSm9obiIsImFnZSI6MzB9'
    },
    {
      name: 'URL',
      text: 'https://example.com/path?param=value',
      encoded: 'aHR0cHM6Ly9leGFtcGxlLmNvbS9wYXRoP3BhcmFtPXZhbHVl'
    },
    {
      name: 'Special Characters',
      text: 'Hello 世界! 🌍',
      encoded: 'SGVsbG8g5LiW55WMISAg8J+MjQ=='
    }
  ];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      processText();
    }, 300);
    return () => clearTimeout(timer);
  }, [processText]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
          <Code2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Base64 Encoder/Decoder
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Encode and decode Base64 data with support for URL-safe variants and file processing.
          <span className="text-blue-400"> Making gibberish readable since 1987!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Mode and Options */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Input</h3>
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
              {/* Mode Selection */}
              <div className="flex items-center space-x-4">
                <div className="flex bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setMode('encode')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      mode === 'encode'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Encode
                  </button>
                  <button
                    onClick={() => setMode('decode')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      mode === 'decode'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Decode
                  </button>
                </div>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isUrlSafe}
                    onChange={(e) => setIsUrlSafe(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-400 text-sm">URL-safe</span>
                </label>

                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-sm transition-colors cursor-pointer flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload File</span>
                </label>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
                className="w-full h-80 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono text-sm resize-none focus:border-blue-500 focus:outline-none"
              />

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="text-red-400 text-sm font-semibold mb-1">Error:</div>
                  <div className="text-red-300 text-sm">{error}</div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  onClick={swapInputOutput}
                  disabled={!outputText || !!error}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Swap</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sample Texts */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Sample Data</h3>
            <div className="space-y-2">
              {sampleTexts.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (mode === 'encode') {
                      setInputText(sample.text);
                    } else {
                      setInputText(sample.encoded);
                    }
                  }}
                  className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-white transition-colors"
                >
                  <div className="font-semibold text-sm mb-1">{sample.name}</div>
                  <div className="text-gray-400 text-xs font-mono truncate">
                    {mode === 'encode' ? sample.text : sample.encoded}
                  </div>
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
              <h3 className="text-xl font-bold text-white">Output</h3>
              {copyFeedback && (
                <span className="text-green-400 text-sm">{copyFeedback}</span>
              )}
            </div>

            <textarea
              value={outputText}
              readOnly
              placeholder="Result will appear here..."
              className="w-full h-80 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono text-sm resize-none focus:border-blue-500 focus:outline-none"
            />

            <div className="flex justify-between items-center mt-4">
              <span className="text-gray-400 text-sm">
                {outputText ? `${outputText.length} characters` : 'No output'}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(outputText)}
                  disabled={!outputText}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={downloadResult}
                  disabled={!outputText}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>

          {/* Batch Processing */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Batch Processing</h3>
            
            <div className="space-y-4">
              <textarea
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder="Enter multiple items (one per line)..."
                className="w-full h-32 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono text-sm resize-none focus:border-blue-500 focus:outline-none"
              />

              <div className="flex space-x-2">
                <button
                  onClick={processBatch}
                  disabled={!batchInput.trim()}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <FileText className="w-4 h-4" />
                  <span>Process Batch</span>
                </button>
                <button
                  onClick={clearBatch}
                  disabled={batchItems.length === 0}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                <button
                  onClick={downloadBatchResults}
                  disabled={batchItems.length === 0}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV</span>
                </button>
              </div>

              {batchItems.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {batchItems.map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        item.error
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-gray-800/50 border-gray-700'
                      }`}
                    >
                      <div className="text-xs text-gray-400 mb-1">Input:</div>
                      <div className="text-sm font-mono text-white mb-2 truncate">{item.input}</div>
                      {item.error ? (
                        <div className="text-xs text-red-400">{item.error}</div>
                      ) : (
                        <>
                          <div className="text-xs text-gray-400 mb-1">Output:</div>
                          <div className="text-sm font-mono text-green-400 truncate">{item.output}</div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">💡 Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• URL-safe Base64 replaces + with -, / with _, and removes padding</li>
              <li>• Use batch processing for multiple items at once</li>
              <li>• Upload files to encode/decode binary data</li>
              <li>• Base64 increases data size by ~33%</li>
              <li>• Perfect for embedding data in URLs or JSON</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Base64EncoderPage;