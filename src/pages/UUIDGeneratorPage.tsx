import React, { useState, useCallback } from 'react';
import { Hash, Copy, Download, RefreshCw, CheckCircle, XCircle, Settings, Shuffle } from 'lucide-react';
import BackButton from '../components/BackButton';

const UUIDGeneratorPage: React.FC = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [version, setVersion] = useState<'v1' | 'v4' | 'v5'>('v4');
  const [quantity, setQuantity] = useState(1);
  const [format, setFormat] = useState<'standard' | 'uppercase' | 'lowercase' | 'nohyphens' | 'brackets'>('standard');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [validationInput, setValidationInput] = useState('');
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; version?: string; variant?: string } | null>(null);
  const [namespace, setNamespace] = useState('6ba7b810-9dad-11d1-80b4-00c04fd430c8'); // DNS namespace
  const [name, setName] = useState('example.com');

  // Simple UUID v4 generator (crypto.randomUUID() alternative)
  const generateUUIDv4 = useCallback((): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }, []);

  // Simple UUID v1 generator (timestamp-based)
  const generateUUIDv1 = useCallback((): string => {
    const timestamp = Date.now();
    const timestampHex = timestamp.toString(16).padStart(12, '0');
    const clockSeq = Math.floor(Math.random() * 0x4000);
    const node = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
    
    // Rearrange timestamp for UUID v1 format
    const timeLow = timestampHex.slice(-8);
    const timeMid = timestampHex.slice(-12, -8);
    const timeHigh = '1' + timestampHex.slice(0, 3); // Version 1
    const clockSeqHex = clockSeq.toString(16).padStart(4, '0');
    const clockSeqLow = clockSeqHex.slice(-2);
    const clockSeqHigh = (parseInt(clockSeqHex.slice(0, 2), 16) | 0x80).toString(16); // Variant bits
    
    return `${timeLow}-${timeMid}-${timeHigh}-${clockSeqHigh}${clockSeqLow}-${node}`;
  }, []);

  // Simple UUID v5 generator (name-based with SHA-1)
  const generateUUIDv5 = useCallback(async (namespace: string, name: string): Promise<string> => {
    // This is a simplified implementation
    // In a real implementation, you'd use proper SHA-1 hashing
    const combined = namespace + name;
    const hash = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(combined));
    const hashArray = new Uint8Array(hash);
    
    // Convert to hex and format as UUID v5
    const hex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      '5' + hex.slice(13, 16), // Version 5
      ((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16) + hex.slice(18, 20), // Variant bits
      hex.slice(20, 32)
    ].join('-');
  }, []);

  const formatUUID = useCallback((uuid: string, format: string): string => {
    switch (format) {
      case 'uppercase':
        return uuid.toUpperCase();
      case 'lowercase':
        return uuid.toLowerCase();
      case 'nohyphens':
        return uuid.replace(/-/g, '');
      case 'brackets':
        return `{${uuid}}`;
      default:
        return uuid;
    }
  }, []);

  const generateUUIDs = useCallback(async () => {
    const newUuids: string[] = [];
    
    for (let i = 0; i < quantity; i++) {
      let uuid: string;
      
      switch (version) {
        case 'v1':
          uuid = generateUUIDv1();
          break;
        case 'v5':
          uuid = await generateUUIDv5(namespace, `${name}-${i}`);
          break;
        default:
          uuid = generateUUIDv4();
      }
      
      newUuids.push(formatUUID(uuid, format));
    }
    
    setUuids(newUuids);
  }, [version, quantity, format, namespace, name, generateUUIDv1, generateUUIDv4, generateUUIDv5, formatUUID]);

  const validateUUID = useCallback((uuid: string) => {
    const cleanUuid = uuid.replace(/[{}]/g, '').replace(/-/g, '');
    
    if (cleanUuid.length !== 32) {
      return { isValid: false };
    }
    
    if (!/^[0-9a-fA-F]{32}$/.test(cleanUuid)) {
      return { isValid: false };
    }
    
    // Add hyphens back for version detection
    const formattedUuid = [
      cleanUuid.slice(0, 8),
      cleanUuid.slice(8, 12),
      cleanUuid.slice(12, 16),
      cleanUuid.slice(16, 20),
      cleanUuid.slice(20, 32)
    ].join('-');
    
    const versionChar = formattedUuid.charAt(14);
    const variantChar = formattedUuid.charAt(19);
    
    let version = 'Unknown';
    switch (versionChar) {
      case '1': version = 'v1 (Time-based)'; break;
      case '2': version = 'v2 (DCE Security)'; break;
      case '3': version = 'v3 (Name-based MD5)'; break;
      case '4': version = 'v4 (Random)'; break;
      case '5': version = 'v5 (Name-based SHA-1)'; break;
    }
    
    const variantBits = parseInt(variantChar, 16);
    let variant = 'Unknown';
    if ((variantBits & 0x8) === 0) {
      variant = 'NCS backward compatibility';
    } else if ((variantBits & 0xC) === 0x8) {
      variant = 'RFC 4122';
    } else if ((variantBits & 0xE) === 0xC) {
      variant = 'Microsoft GUID';
    } else {
      variant = 'Reserved for future';
    }
    
    return { isValid: true, version, variant };
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

  const copyAllUUIDs = async () => {
    const allUuids = uuids.join('\n');
    await copyToClipboard(allUuids);
  };

  const downloadUUIDs = () => {
    if (uuids.length === 0) return;

    const content = uuids.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `uuids-${version}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    if (uuids.length === 0) return;

    const csvContent = [
      'UUID,Version,Format,Generated',
      ...uuids.map((uuid, index) => `"${uuid}","${version}","${format}","${new Date().toISOString()}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `uuids-${version}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  React.useEffect(() => {
    generateUUIDs();
  }, []);

  React.useEffect(() => {
    if (validationInput.trim()) {
      const result = validateUUID(validationInput.trim());
      setValidationResult(result);
    } else {
      setValidationResult(null);
    }
  }, [validationInput, validateUUID]);

  const predefinedNamespaces = [
    { name: 'DNS', value: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' },
    { name: 'URL', value: '6ba7b811-9dad-11d1-80b4-00c04fd430c8' },
    { name: 'OID', value: '6ba7b812-9dad-11d1-80b4-00c04fd430c8' },
    { name: 'X.500', value: '6ba7b814-9dad-11d1-80b4-00c04fd430c8' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6">
          <Hash className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          UUID Generator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Generate and validate UUIDs in multiple versions and formats with bulk generation support.
          <span className="text-indigo-400"> Unique IDs for your unique problems!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generator Section */}
        <div className="space-y-6">
          {/* Configuration */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center space-x-2 mb-6">
              <Settings className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xl font-bold text-white">Generator Settings</h3>
            </div>

            <div className="space-y-6">
              {/* Version Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">UUID Version</label>
                <div className="flex bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setVersion('v1')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      version === 'v1'
                        ? 'bg-indigo-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    v1 (Time)
                  </button>
                  <button
                    onClick={() => setVersion('v4')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      version === 'v4'
                        ? 'bg-indigo-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    v4 (Random)
                  </button>
                  <button
                    onClick={() => setVersion('v5')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      version === 'v5'
                        ? 'bg-indigo-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    v5 (Name)
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Output Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="standard">Standard (lowercase with hyphens)</option>
                  <option value="uppercase">Uppercase with hyphens</option>
                  <option value="lowercase">Lowercase with hyphens</option>
                  <option value="nohyphens">No hyphens</option>
                  <option value="brackets">With curly brackets</option>
                </select>
              </div>

              {/* UUID v5 specific options */}
              {version === 'v5' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Namespace</label>
                    <div className="space-y-2">
                      <select
                        value={namespace}
                        onChange={(e) => setNamespace(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                      >
                        {predefinedNamespaces.map((ns) => (
                          <option key={ns.value} value={ns.value}>
                            {ns.name} - {ns.value}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={namespace}
                        onChange={(e) => setNamespace(e.target.value)}
                        placeholder="Or enter custom namespace UUID"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter name to hash"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={generateUUIDs}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold text-white hover:from-indigo-400 hover:to-purple-500 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Shuffle className="w-5 h-5" />
                <span>Generate UUIDs</span>
              </button>
            </div>
          </div>

          {/* UUID Validator */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">UUID Validator</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={validationInput}
                  onChange={(e) => setValidationInput(e.target.value)}
                  placeholder="Enter UUID to validate..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono text-sm focus:border-indigo-500 focus:outline-none pr-12"
                />
                {validationResult && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {validationResult.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                )}
              </div>

              {validationResult && (
                <div className={`p-4 rounded-lg border ${
                  validationResult.isValid
                    ? 'bg-green-500/20 border-green-500/30'
                    : 'bg-red-500/20 border-red-500/30'
                }`}>
                  {validationResult.isValid ? (
                    <div className="space-y-2">
                      <div className="text-green-400 font-semibold">Valid UUID</div>
                      <div className="text-sm text-gray-300">
                        <div>Version: <span className="text-white">{validationResult.version}</span></div>
                        <div>Variant: <span className="text-white">{validationResult.variant}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-400 font-semibold">Invalid UUID format</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Generated UUIDs */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Generated UUIDs</h3>
              {copyFeedback && (
                <span className="text-green-400 text-sm">{copyFeedback}</span>
              )}
            </div>

            <div className="space-y-4">
              <div className="max-h-80 overflow-y-auto space-y-2">
                {uuids.length > 0 ? (
                  uuids.map((uuid, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-xl"
                    >
                      <span className="text-white font-mono text-sm flex-1 mr-4">{uuid}</span>
                      <button
                        onClick={() => copyToClipboard(uuid)}
                        className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg text-indigo-400 text-sm transition-colors flex items-center space-x-1"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Click "Generate UUIDs" to create new UUIDs
                  </div>
                )}
              </div>

              {uuids.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700">
                  <button
                    onClick={copyAllUUIDs}
                    className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg text-indigo-400 text-sm transition-colors flex items-center space-x-1"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy All</span>
                  </button>
                  <button
                    onClick={downloadUUIDs}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm transition-colors flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download TXT</span>
                  </button>
                  <button
                    onClick={downloadCSV}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm transition-colors flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV</span>
                  </button>
                  <button
                    onClick={generateUUIDs}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-sm transition-colors flex items-center space-x-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Regenerate</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* UUID Information */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🔑 UUID Versions</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div>
                <span className="text-indigo-400 font-semibold">Version 1:</span> Time-based UUIDs using MAC address and timestamp
              </div>
              <div>
                <span className="text-indigo-400 font-semibold">Version 4:</span> Random UUIDs (most common)
              </div>
              <div>
                <span className="text-indigo-400 font-semibold">Version 5:</span> Name-based UUIDs using SHA-1 hash
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">💡 Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Use v4 for general purposes (random)</li>
              <li>• Use v1 when you need time-based ordering</li>
              <li>• Use v5 for deterministic UUIDs from names</li>
              <li>• UUIDs are 128-bit values (32 hex characters)</li>
              <li>• Standard format: 8-4-4-4-12 character groups</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UUIDGeneratorPage;