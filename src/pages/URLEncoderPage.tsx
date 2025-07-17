import React, { useState, useCallback } from 'react';
import { Link2, Copy, Upload, Download, Globe, CheckCircle, XCircle, RotateCcw, Eye } from 'lucide-react';
import BackButton from '../components/BackButton';
import { LIMITS } from '../utils/constants';

interface URLComponents {
  protocol?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  origin?: string;
  searchParams?: Record<string, string>;
}

const URLEncoderPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode' | 'component'>('encode');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [urlComponents, setUrlComponents] = useState<URLComponents | null>(null);
  const [queryParams, setQueryParams] = useState<Array<{ key: string; value: string }>>([]);

  const encodeURL = useCallback((text: string): string => {
    return encodeURIComponent(text);
  }, []);

  const decodeURL = useCallback((text: string): string => {
    try {
      return decodeURIComponent(text);
    } catch (err) {
      throw new Error('Invalid URL encoding');
    }
  }, []);

  const parseURL = useCallback((url: string): URLComponents => {
    try {
      const urlObj = new URL(url);
      const searchParams: Record<string, string> = {};
      
      urlObj.searchParams.forEach((value, key) => {
        searchParams[key] = value;
      });

      return {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        origin: urlObj.origin,
        searchParams
      };
    } catch (err) {
      throw new Error('Invalid URL format');
    }
  }, []);

  const isValidURL = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const processText = useCallback(() => {
    if (!inputText.trim()) {
      setOutputText('');
      setError('');
      setIsValid(null);
      setUrlComponents(null);
      return;
    }

    if (inputText.length > LIMITS.maxTextLength) {
      setError(`Text too large. Maximum size is ${LIMITS.maxTextLength / 1000}KB`);
      setIsValid(false);
      setOutputText('');
      setUrlComponents(null);
      return;
    }

    try {
      let result: string;
      
      if (mode === 'encode') {
        result = encodeURL(inputText);
        setUrlComponents(null);
      } else if (mode === 'decode') {
        result = decodeURL(inputText);
        setUrlComponents(null);
      } else { // component mode
        if (!isValidURL(inputText)) {
          throw new Error('Please enter a valid URL for component analysis');
        }
        const components = parseURL(inputText);
        setUrlComponents(components);
        result = JSON.stringify(components, null, 2);
      }
      
      setOutputText(result);
      setError('');
      setIsValid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      setIsValid(false);
      setOutputText('');
      setUrlComponents(null);
    }
  }, [inputText, mode, encodeURL, decodeURL, parseURL, isValidURL]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > LIMITS.maxFileSize) {
      setError(`File too large. Maximum size is ${LIMITS.maxFileSize / (1024 * 1024)}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  }, []);

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
    link.download = `url-${mode}-result.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const swapInputOutput = () => {
    if (outputText && !error && mode !== 'component') {
      setInputText(outputText);
      setOutputText('');
      setMode(mode === 'encode' ? 'decode' : 'encode');
    }
  };

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '' }]);
  };

  const updateQueryParam = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...queryParams];
    updated[index][field] = value;
    setQueryParams(updated);
  };

  const removeQueryParam = (index: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== index));
  };

  const buildURLFromParams = () => {
    const baseUrl = inputText.split('?')[0];
    const params = new URLSearchParams();
    
    queryParams.forEach(({ key, value }) => {
      if (key.trim()) {
        params.append(key.trim(), value);
      }
    });

    const queryString = params.toString();
    const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    setOutputText(fullUrl);
  };

  const sampleData = [
    {
      name: 'Simple Text',
      text: 'Hello World!',
      encoded: 'Hello%20World!'
    },
    {
      name: 'URL with Spaces',
      text: 'https://example.com/path with spaces',
      encoded: 'https%3A//example.com/path%20with%20spaces'
    },
    {
      name: 'Query Parameters',
      text: 'name=John Doe&email=john@example.com',
      encoded: 'name%3DJohn%20Doe%26email%3Djohn%40example.com'
    },
    {
      name: 'Special Characters',
      text: 'Hello & welcome to café!',
      encoded: 'Hello%20%26%20welcome%20to%20caf%C3%A9!'
    },
    {
      name: 'Complete URL',
      text: 'https://example.com/search?q=hello world&lang=en#results',
      encoded: 'https%3A//example.com/search%3Fq%3Dhello%20world%26lang%3Den%23results'
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-6">
          <Link2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
          URL Encoder/Decoder
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Encode, decode, and analyze URLs with component parsing and query parameter management.
          <span className="text-green-400"> Making URLs readable by humans again!</span>
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
                        ? 'bg-green-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Encode
                  </button>
                  <button
                    onClick={() => setMode('decode')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      mode === 'decode'
                        ? 'bg-green-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Decode
                  </button>
                  <button
                    onClick={() => setMode('component')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      mode === 'component'
                        ? 'bg-green-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Analyze
                  </button>
                </div>

                <input
                  type="file"
                  accept=".txt,.url"
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
                placeholder={
                  mode === 'encode' 
                    ? 'Enter text or URL to encode...' 
                    : mode === 'decode'
                    ? 'Enter URL-encoded text to decode...'
                    : 'Enter a complete URL to analyze...'
                }
                className="w-full h-80 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono text-sm resize-none focus:border-green-500 focus:outline-none"
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
                  disabled={!outputText || !!error || mode === 'component'}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Swap</span>
                </button>
                {mode === 'component' && isValidURL(inputText) && (
                  <button
                    onClick={() => window.open(inputText, '_blank')}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 text-sm transition-colors flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Visit URL</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Query Parameter Builder */}
          {mode === 'component' && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Query Parameter Builder</h3>
              
              <div className="space-y-4">
                {queryParams.map((param, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={param.key}
                      onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                      placeholder="Parameter name"
                      className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:border-green-500 focus:outline-none"
                    />
                    <span className="text-gray-400">=</span>
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                      placeholder="Parameter value"
                      className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:border-green-500 focus:outline-none"
                    />
                    <button
                      onClick={() => removeQueryParam(index)}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                <div className="flex space-x-2">
                  <button
                    onClick={addQueryParam}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 text-sm transition-colors"
                  >
                    Add Parameter
                  </button>
                  <button
                    onClick={buildURLFromParams}
                    disabled={queryParams.length === 0}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Build URL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sample Data */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Sample Data</h3>
            <div className="space-y-2">
              {sampleData.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (mode === 'encode') {
                      setInputText(sample.text);
                    } else if (mode === 'decode') {
                      setInputText(sample.encoded);
                    } else {
                      setInputText(sample.name === 'Complete URL' ? sample.text : 'https://example.com/search?q=hello world&lang=en#results');
                    }
                  }}
                  className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-white transition-colors"
                >
                  <div className="font-semibold text-sm mb-1">{sample.name}</div>
                  <div className="text-gray-400 text-xs font-mono truncate">
                    {mode === 'encode' ? sample.text : mode === 'decode' ? sample.encoded : sample.text}
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
              <h3 className="text-xl font-bold text-white">
                {mode === 'component' ? 'URL Analysis' : 'Output'}
              </h3>
              {copyFeedback && (
                <span className="text-green-400 text-sm">{copyFeedback}</span>
              )}
            </div>

            <textarea
              value={outputText}
              readOnly
              placeholder="Result will appear here..."
              className="w-full h-80 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono text-sm resize-none focus:border-green-500 focus:outline-none"
            />

            <div className="flex justify-between items-center mt-4">
              <span className="text-gray-400 text-sm">
                {outputText ? `${outputText.length} characters` : 'No output'}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(outputText)}
                  disabled={!outputText}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={downloadResult}
                  disabled={!outputText}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>

          {/* URL Components Display */}
          {urlComponents && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">URL Components</h3>
              
              <div className="space-y-4">
                {Object.entries(urlComponents).map(([key, value]) => {
                  if (key === 'searchParams' && typeof value === 'object') {
                    return (
                      <div key={key} className="space-y-2">
                        <div className="text-sm font-semibold text-gray-300">Query Parameters:</div>
                        {Object.entries(value as Record<string, string>).length > 0 ? (
                          <div className="space-y-1">
                            {Object.entries(value as Record<string, string>).map(([paramKey, paramValue]) => (
                              <div key={paramKey} className="flex items-center space-x-2 text-sm">
                                <span className="text-blue-400 font-mono">{paramKey}</span>
                                <span className="text-gray-400">=</span>
                                <span className="text-green-400 font-mono">{paramValue}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">No query parameters</div>
                        )}
                      </div>
                    );
                  }
                  
                  if (value) {
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-gray-300 capitalize">{key}:</span>
                        <span className="text-white font-mono text-sm">{value}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🔗 Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Use encoding for special characters in URLs</li>
              <li>• Analyze mode breaks down URL components</li>
              <li>• Query parameter builder helps construct URLs</li>
              <li>• Spaces become %20 in URL encoding</li>
              <li>• Always encode user input before adding to URLs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default URLEncoderPage;