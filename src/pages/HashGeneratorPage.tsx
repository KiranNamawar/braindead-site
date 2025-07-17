import React, { useState, useEffect } from 'react';
import { Hash, Copy, FileText, AlertTriangle } from 'lucide-react';
import CryptoJS from 'crypto-js';
import BackButton from '../components/BackButton';
import { useToast } from '../components/ToastContainer';
import SEOHead from '../components/SEOHead';
import { APP_CONFIG, LIMITS } from '../utils/constants';

const HashGeneratorPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [inputText, setInputText] = useState('');
  const [hashes, setHashes] = useState<{ [key: string]: string }>({});
  const [copyFeedback, setCopyFeedback] = useState('');
  const [hashHistory, setHashHistory] = useState<Array<{input: string, algorithm: string, hash: string, timestamp: string}>>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const generateHashes = async (input: string) => {
    if (!input) {
      setHashes({});
      return;
    }

    if (input.length > LIMITS.maxTextLength) {
      showError('Input too large', `Maximum input size is ${LIMITS.maxTextLength / 1000}KB`);
      return;
    }

    setIsProcessing(true);
    
    try {
      const newHashes: { [key: string]: string } = {};
      
      // Generate hashes using crypto-js
      newHashes['MD5'] = CryptoJS.MD5(input).toString();
      newHashes['SHA1'] = CryptoJS.SHA1(input).toString();
      newHashes['SHA256'] = CryptoJS.SHA256(input).toString();
      newHashes['SHA512'] = CryptoJS.SHA512(input).toString();
      newHashes['SHA3-256'] = CryptoJS.SHA3(input, { outputLength: 256 }).toString();
      newHashes['SHA3-512'] = CryptoJS.SHA3(input, { outputLength: 512 }).toString();
      
      setHashes(newHashes);
    } catch (error) {
      showError('Hash generation failed', 'An error occurred while generating hashes');
      console.error('Hash generation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string, algorithm: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(`${algorithm} copied!`);
      setTimeout(() => setCopyFeedback(''), 2000);
      
      // Add to history
      const historyEntry = {
        input: inputText.length > 50 ? inputText.substring(0, 50) + '...' : inputText,
        algorithm,
        hash: text,
        timestamp: new Date().toLocaleString()
      };
      setHashHistory(prev => [historyEntry, ...prev.slice(0, LIMITS.maxHistoryItems - 1)]);
      showSuccess(`${algorithm} hash copied to clipboard`);
    } catch (err) {
      setCopyFeedback('Failed to copy');
      setTimeout(() => setCopyFeedback(''), 2000);
      showError('Failed to copy to clipboard');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > APP_CONFIG.maxFileSize) {
      showError('File too large', `Maximum file size is ${APP_CONFIG.maxFileSize / 1024 / 1024}MB`);
      return;
    }
    
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputText(content);
    };
    reader.onerror = () => {
      showError('Failed to read file');
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (inputText) {
        generateHashes(inputText);
      } else {
        setHashes({});
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [inputText]);

  const hashAlgorithms = [
    {
      name: 'MD5',
      description: 'Fast but cryptographically broken. Good for checksums only.',
      color: 'from-red-400 to-red-600',
      length: 32,
      security: 'Broken'
    },
    {
      name: 'SHA1',
      description: 'Deprecated for security. Still used in some legacy systems.',
      color: 'from-orange-400 to-orange-600',
      length: 40,
      security: 'Weak'
    },
    {
      name: 'SHA256',
      description: 'Secure and widely used. Part of the SHA-2 family.',
      color: 'from-blue-400 to-blue-600',
      length: 64,
      security: 'Strong'
    },
    {
      name: 'SHA512',
      description: 'Most secure SHA-2 option. Slower but extremely robust.',
      color: 'from-purple-400 to-purple-600',
      length: 128,
      security: 'Very Strong'
    },
    {
      name: 'SHA3-256',
      description: 'Modern SHA-3 algorithm. Quantum-resistant design.',
      color: 'from-green-400 to-green-600',
      length: 64,
      security: 'Very Strong'
    },
    {
      name: 'SHA3-512',
      description: 'Most secure SHA-3 option. Future-proof cryptography.',
      color: 'from-indigo-400 to-indigo-600',
      length: 128,
      security: 'Excellent'
    }
  ];

  const presetInputs = [
    'Hello, World!',
    'The quick brown fox jumps over the lazy dog',
    'password123',
    'BrainDead.site',
    JSON.stringify({ message: 'test', timestamp: Date.now() })
  ];

  const getSecurityColor = (security: string) => {
    switch (security) {
      case 'Broken': return 'text-red-400';
      case 'Weak': return 'text-orange-400';
      case 'Strong': return 'text-blue-400';
      case 'Very Strong': return 'text-green-400';
      case 'Excellent': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead 
        title="Hash Generator"
        description="Generate cryptographic hashes for text, files, and data integrity verification using industry-standard algorithms."
        canonical="/hash-generator"
      />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-6">
          <Hash className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Hash Generator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Generate cryptographic hashes for text, files, and data integrity verification. 
          <span className="text-cyan-400"> Because trust, but verify!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Text Input */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Input</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Text Input</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text to hash..."
                  className="w-full h-32 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white resize-none focus:border-cyan-500 focus:outline-none"
                  maxLength={LIMITS.maxTextLength}
                />
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-gray-400">{inputText.length} / {LIMITS.maxTextLength} characters</span>
                  {isProcessing && (
                    <div className="flex items-center space-x-2 text-cyan-400">
                      <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-gray-400 text-sm mb-2">Or Upload File</label>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".txt,.json,.csv,.xml,.html,.js,.css,.md"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30"
                  />
                </div>
                {selectedFile && (
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <FileText className="w-4 h-4" />
                    <span>{selectedFile.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Quick Presets</label>
                <div className="flex flex-wrap gap-2">
                  {presetInputs.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setInputText(preset)}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                    >
                      {preset.length > 30 ? preset.substring(0, 30) + '...' : preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hash Results */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Generated Hashes</h3>
              {copyFeedback && (
                <span className="text-green-400 text-sm">{copyFeedback}</span>
              )}
            </div>
            
            <div className="space-y-4">
              {hashAlgorithms.map((algorithm) => (
                <div key={algorithm.name} className="bg-gray-800/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${algorithm.color}`}></div>
                      <h4 className="text-lg font-semibold text-white">{algorithm.name}</h4>
                      <span className="text-xs text-gray-400">({algorithm.length} chars)</span>
                      <span className={`text-xs px-2 py-1 rounded-full bg-gray-700/50 ${getSecurityColor(algorithm.security)}`}>
                        {algorithm.security}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(hashes[algorithm.name] || '', algorithm.name)}
                      disabled={!hashes[algorithm.name] || isProcessing}
                      className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-3">{algorithm.description}</p>
                  
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <code className="text-green-400 font-mono text-sm break-all">
                      {hashes[algorithm.name] || (isProcessing ? 'Generating...' : 'Enter text to generate hash...')}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History & Info */}
        <div className="space-y-6">
          {/* Security Warning */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h4 className="text-lg font-semibold text-amber-400">Security Notice</h4>
            </div>
            <p className="text-amber-200 text-sm">
              MD5 and SHA1 are cryptographically broken. Use SHA-256 or SHA-3 for security-critical applications.
            </p>
          </div>

          {/* Hash History */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Hashes</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {hashHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hashes generated yet.<br />
                  <span className="text-sm">Start hashing to see history!</span>
                </p>
              ) : (
                hashHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => copyToClipboard(entry.hash, entry.algorithm)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-cyan-400 text-sm font-semibold">{entry.algorithm}</span>
                      <span className="text-xs text-gray-400">{entry.timestamp}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-1">Input: {entry.input}</div>
                    <div className="font-mono text-xs text-green-400 break-all">
                      {entry.hash.substring(0, 40)}...
                    </div>
                  </div>
                ))
              )}
            </div>
            {hashHistory.length > 0 && (
              <button
                onClick={() => setHashHistory([])}
                className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Clear History
              </button>
            )}
          </div>

          {/* Algorithm Comparison */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🔍 Algorithm Guide</h4>
            <div className="space-y-3 text-sm">
              {hashAlgorithms.map((algo) => (
                <div key={algo.name} className="flex items-start space-x-2">
                  <div className={`w-2 h-2 rounded-full mt-2 bg-gradient-to-r ${algo.color}`}></div>
                  <div>
                    <div className="text-white font-medium">{algo.name}</div>
                    <div className="text-gray-400">{algo.security}, {algo.length}-bit</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">💡 Use Cases</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• File integrity verification</li>
              <li>• Password storage (with salt)</li>
              <li>• Digital signatures</li>
              <li>• Blockchain and cryptocurrency</li>
              <li>• Data deduplication</li>
              <li>• API authentication tokens</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HashGeneratorPage;