import React, { useState, useEffect } from 'react';
import { Hash, Copy, FileText, AlertTriangle, Upload, Download, History } from 'lucide-react';
import CryptoJS from 'crypto-js';
import ToolLayout from '../components/shared/ToolLayout';
import { useToast } from '../components/ToastContainer';
import { LIMITS } from '../utils/constants';

const HashGeneratorPage: React.FC = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [inputText, setInputText] = useState('');
  const [hashes, setHashes] = useState<{ [key: string]: string }>({});
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['MD5', 'SHA256']);
  const [hashHistory, setHashHistory] = useState<Array<{
    input: string;
    algorithm: string;
    hash: string;
    timestamp: string;
  }>>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareHash, setCompareHash] = useState('');

  const availableAlgorithms = [
    { name: 'MD5', description: 'Fast but not cryptographically secure' },
    { name: 'SHA1', description: 'Legacy algorithm, avoid for security' },
    { name: 'SHA256', description: 'Secure and widely used' },
    { name: 'SHA512', description: 'More secure, longer hash' },
    { name: 'SHA3-256', description: 'Latest SHA-3 standard' },
    { name: 'SHA3-512', description: 'SHA-3 with longer output' }
  ];

  // Check for integration data on mount
  useEffect(() => {
    const integrationData = sessionStorage.getItem('tool-integration-hash-generator');
    if (integrationData) {
      try {
        const parsed = JSON.parse(integrationData);
        if (parsed.data && typeof parsed.data === 'string') {
          setInputText(parsed.data);
          showSuccess('Data integrated from ' + parsed.sourceToolId);
        }
        sessionStorage.removeItem('tool-integration-hash-generator');
      } catch (error) {
        console.warn('Failed to load integration data:', error);
      }
    }

    // Load hash history
    const savedHistory = localStorage.getItem('hash-history');
    if (savedHistory) {
      try {
        setHashHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.warn('Failed to load hash history:', error);
      }
    }
  }, [showSuccess]);

  // Auto-generate hashes when input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputText.trim()) {
        generateHashes(inputText);
      } else {
        setHashes({});
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputText, selectedAlgorithms]);

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
      
      // Generate only selected algorithms
      for (const algorithm of selectedAlgorithms) {
        switch (algorithm) {
          case 'MD5':
            newHashes['MD5'] = CryptoJS.MD5(input).toString();
            break;
          case 'SHA1':
            newHashes['SHA1'] = CryptoJS.SHA1(input).toString();
            break;
          case 'SHA256':
            newHashes['SHA256'] = CryptoJS.SHA256(input).toString();
            break;
          case 'SHA512':
            newHashes['SHA512'] = CryptoJS.SHA512(input).toString();
            break;
          case 'SHA3-256':
            newHashes['SHA3-256'] = CryptoJS.SHA3(input, { outputLength: 256 }).toString();
            break;
          case 'SHA3-512':
            newHashes['SHA3-512'] = CryptoJS.SHA3(input, { outputLength: 512 }).toString();
            break;
        }
      }
      
      setHashes(newHashes);

      // Add to history
      const timestamp = new Date().toISOString();
      const newHistoryEntries = Object.entries(newHashes).map(([algorithm, hash]) => ({
        input: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
        algorithm,
        hash,
        timestamp
      }));

      const updatedHistory = [...newHistoryEntries, ...hashHistory].slice(0, 50);
      setHashHistory(updatedHistory);
      localStorage.setItem('hash-history', JSON.stringify(updatedHistory));

    } catch (error) {
      showError('Hash generation failed', 'An error occurred while generating hashes');
      console.error('Hash generation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > LIMITS.maxFileSize) {
      showError('File too large', `Maximum file size is ${LIMITS.maxFileSize / 1024 / 1024}MB`);
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
      
      const newHashes: { [key: string]: string } = {};
      
      for (const algorithm of selectedAlgorithms) {
        switch (algorithm) {
          case 'MD5':
            newHashes['MD5'] = CryptoJS.MD5(wordArray).toString();
            break;
          case 'SHA1':
            newHashes['SHA1'] = CryptoJS.SHA1(wordArray).toString();
            break;
          case 'SHA256':
            newHashes['SHA256'] = CryptoJS.SHA256(wordArray).toString();
            break;
          case 'SHA512':
            newHashes['SHA512'] = CryptoJS.SHA512(wordArray).toString();
            break;
          case 'SHA3-256':
            newHashes['SHA3-256'] = CryptoJS.SHA3(wordArray, { outputLength: 256 }).toString();
            break;
          case 'SHA3-512':
            newHashes['SHA3-512'] = CryptoJS.SHA3(wordArray, { outputLength: 512 }).toString();
            break;
        }
      }

      setHashes(newHashes);
      showSuccess(`File hashed: ${file.name}`);
    } catch (error) {
      showError('File hashing failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAlgorithmToggle = (algorithm: string) => {
    setSelectedAlgorithms(prev => 
      prev.includes(algorithm)
        ? prev.filter(a => a !== algorithm)
        : [...prev, algorithm]
    );
  };

  const handleExport = (format: string) => {
    if (Object.keys(hashes).length === 0) return;

    let content: string;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'json':
        content = JSON.stringify({
          input: selectedFile ? selectedFile.name : inputText.substring(0, 100),
          timestamp: new Date().toISOString(),
          hashes
        }, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'csv':
        const csvRows = [
          'Algorithm,Hash',
          ...Object.entries(hashes).map(([alg, hash]) => `${alg},${hash}`)
        ];
        content = csvRows.join('\n');
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      case 'txt':
        content = Object.entries(hashes)
          .map(([alg, hash]) => `${alg}: ${hash}`)
          .join('\n');
        mimeType = 'text/plain';
        extension = 'txt';
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hashes-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBatchProcess = async (input: string): Promise<string> => {
    try {
      if (input.length > LIMITS.maxTextLength) {
        throw new Error('Input too large');
      }

      const results: string[] = [];
      
      for (const algorithm of selectedAlgorithms) {
        let hash: string;
        switch (algorithm) {
          case 'MD5':
            hash = CryptoJS.MD5(input).toString();
            break;
          case 'SHA1':
            hash = CryptoJS.SHA1(input).toString();
            break;
          case 'SHA256':
            hash = CryptoJS.SHA256(input).toString();
            break;
          case 'SHA512':
            hash = CryptoJS.SHA512(input).toString();
            break;
          case 'SHA3-256':
            hash = CryptoJS.SHA3(input, { outputLength: 256 }).toString();
            break;
          case 'SHA3-512':
            hash = CryptoJS.SHA3(input, { outputLength: 512 }).toString();
            break;
          default:
            continue;
        }
        results.push(`${algorithm}: ${hash}`);
      }

      return results.join('\n');
    } catch (error) {
      throw new Error(`Hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const compareHashes = () => {
    if (!compareHash.trim()) {
      showWarning('Enter a hash to compare');
      return;
    }

    const matches = Object.entries(hashes).filter(([, hash]) => 
      hash.toLowerCase() === compareHash.toLowerCase().trim()
    );

    if (matches.length > 0) {
      showSuccess(`Hash matches ${matches[0][0]} algorithm`);
    } else {
      showWarning('No matching hash found');
    }
  };

  const clearHistory = () => {
    setHashHistory([]);
    localStorage.removeItem('hash-history');
    showSuccess('History cleared');
  };

  return (
    <ToolLayout
      toolId="hash-generator"
      title="Hash Generator"
      description="Generate cryptographic hashes with multiple algorithms, file support, and batch processing"
      outputData={hashes}
      onExport={handleExport}
      onBatchProcess={handleBatchProcess}
      batchInputPlaceholder="Enter text strings, one per line"
      showBatchOperations={true}
    >
      <div className="p-6 space-y-6">
        {/* Algorithm Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Select Algorithms
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableAlgorithms.map(({ name, description }) => (
              <label
                key={name}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedAlgorithms.includes(name)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedAlgorithms.includes(name)}
                  onChange={() => handleAlgorithmToggle(name)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Input Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Text Input */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Text Input
            </h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to hash..."
              className="w-full h-40 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {inputText && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {inputText.length} characters
              </div>
            )}
          </div>

          {/* File Input */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              File Input
            </h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Click to upload file
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  Max {LIMITS.maxFileSize / 1024 / 1024}MB
                </span>
              </label>
            </div>
            {selectedFile && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        </div>

        {/* Hash Results */}
        {Object.keys(hashes).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Generated Hashes
            </h3>
            <div className="space-y-3">
              {Object.entries(hashes).map(([algorithm, hash]) => (
                <div
                  key={algorithm}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {algorithm}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(hash);
                        showSuccess(`${algorithm} hash copied`);
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <div className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all">
                    {hash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hash Comparison */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Hash Comparison
            </h3>
            <button
              onClick={() => setCompareMode(!compareMode)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {compareMode ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {compareMode && (
            <div className="flex gap-2">
              <input
                type="text"
                value={compareHash}
                onChange={(e) => setCompareHash(e.target.value)}
                placeholder="Enter hash to compare..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={compareHashes}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Compare
              </button>
            </div>
          )}
        </div>

        {/* Hash History */}
        {hashHistory.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Recent Hashes
              </h3>
              <button
                onClick={clearHistory}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Clear History
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {hashHistory.slice(0, 10).map((entry, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {entry.algorithm}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 mb-1">
                    Input: {entry.input}
                  </div>
                  <div className="font-mono text-gray-700 dark:text-gray-300 break-all">
                    {entry.hash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Security Notice
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• MD5 and SHA1 are not cryptographically secure</li>
                <li>• Use SHA256 or SHA3 for security-critical applications</li>
                <li>• All processing happens locally - no data is sent to servers</li>
                <li>• Consider using salt for password hashing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default HashGeneratorPage;