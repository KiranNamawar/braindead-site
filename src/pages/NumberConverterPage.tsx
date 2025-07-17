import React, { useState, useCallback, useEffect } from 'react';
import { Binary, Hash, Copy, RotateCcw, Calculator, Info, Download, FileText } from 'lucide-react';
import BackButton from '../components/BackButton';

interface ConversionResult {
  decimal: string;
  binary: string;
  hexadecimal: string;
  octal: string;
}

interface ConversionStep {
  operation: string;
  description: string;
  result: string;
}

interface BatchItem {
  input: string;
  inputBase: 'decimal' | 'binary' | 'hexadecimal' | 'octal';
  results: ConversionResult;
  error?: string;
}

const NumberConverterPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputBase, setInputBase] = useState<'decimal' | 'binary' | 'hexadecimal' | 'octal'>('decimal');
  const [results, setResults] = useState<ConversionResult>({
    decimal: '',
    binary: '',
    hexadecimal: '',
    octal: ''
  });
  const [conversionSteps, setConversionSteps] = useState<ConversionStep[]>([]);
  const [error, setError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [showBitwise, setShowBitwise] = useState(false);
  const [bitwiseOperations, setBitwiseOperations] = useState<any>({});
  const [batchInput, setBatchInput] = useState('');
  const [batchResults, setBatchResults] = useState<BatchItem[]>([]);

  const validateInput = useCallback((value: string, base: string): boolean => {
    if (!value.trim()) return true; // Empty is valid
    
    const cleanValue = value.replace(/\s/g, '').toUpperCase();
    
    switch (base) {
      case 'decimal':
        return /^-?\d+$/.test(cleanValue);
      case 'binary':
        return /^[01]+$/.test(cleanValue);
      case 'hexadecimal':
        return /^[0-9A-F]+$/.test(cleanValue);
      case 'octal':
        return /^[0-7]+$/.test(cleanValue);
      default:
        return false;
    }
  }, []);

  const convertToDecimal = useCallback((value: string, fromBase: string): number => {
    const cleanValue = value.replace(/\s/g, '').toUpperCase();
    
    switch (fromBase) {
      case 'decimal':
        return parseInt(cleanValue, 10);
      case 'binary':
        return parseInt(cleanValue, 2);
      case 'hexadecimal':
        return parseInt(cleanValue, 16);
      case 'octal':
        return parseInt(cleanValue, 8);
      default:
        throw new Error('Invalid base');
    }
  }, []);

  const generateConversionSteps = useCallback((value: string, fromBase: string, decimalValue: number): ConversionStep[] => {
    const steps: ConversionStep[] = [];
    const cleanValue = value.replace(/\s/g, '').toUpperCase();

    if (fromBase !== 'decimal') {
      // Step 1: Convert to decimal
      let explanation = '';
      switch (fromBase) {
        case 'binary':
          explanation = cleanValue.split('').reverse().map((bit, index) => 
            `${bit} × 2^${index} = ${bit === '1' ? Math.pow(2, index) : 0}`
          ).reverse().join(' + ');
          break;
        case 'hexadecimal':
          explanation = cleanValue.split('').reverse().map((digit, index) => {
            const digitValue = parseInt(digit, 16);
            return `${digit} × 16^${index} = ${digitValue * Math.pow(16, index)}`;
          }).reverse().join(' + ');
          break;
        case 'octal':
          explanation = cleanValue.split('').reverse().map((digit, index) => {
            const digitValue = parseInt(digit, 8);
            return `${digit} × 8^${index} = ${digitValue * Math.pow(8, index)}`;
          }).reverse().join(' + ');
          break;
      }
      
      steps.push({
        operation: `Convert ${fromBase} to decimal`,
        description: explanation,
        result: decimalValue.toString()
      });
    }

    // Step 2: Convert decimal to other bases
    if (fromBase !== 'binary') {
      const binarySteps = [];
      let temp = Math.abs(decimalValue);
      while (temp > 0) {
        binarySteps.unshift(`${temp} ÷ 2 = ${Math.floor(temp / 2)} remainder ${temp % 2}`);
        temp = Math.floor(temp / 2);
      }
      steps.push({
        operation: 'Convert decimal to binary',
        description: binarySteps.join(', '),
        result: decimalValue.toString(2)
      });
    }

    if (fromBase !== 'hexadecimal') {
      const hexSteps = [];
      let temp = Math.abs(decimalValue);
      while (temp > 0) {
        const remainder = temp % 16;
        const hexDigit = remainder < 10 ? remainder.toString() : String.fromCharCode(65 + remainder - 10);
        hexSteps.unshift(`${temp} ÷ 16 = ${Math.floor(temp / 16)} remainder ${remainder} (${hexDigit})`);
        temp = Math.floor(temp / 16);
      }
      steps.push({
        operation: 'Convert decimal to hexadecimal',
        description: hexSteps.join(', '),
        result: decimalValue.toString(16).toUpperCase()
      });
    }

    if (fromBase !== 'octal') {
      const octalSteps = [];
      let temp = Math.abs(decimalValue);
      while (temp > 0) {
        octalSteps.unshift(`${temp} ÷ 8 = ${Math.floor(temp / 8)} remainder ${temp % 8}`);
        temp = Math.floor(temp / 8);
      }
      steps.push({
        operation: 'Convert decimal to octal',
        description: octalSteps.join(', '),
        result: decimalValue.toString(8)
      });
    }

    return steps;
  }, []);

  const generateBitwiseOperations = useCallback((decimalValue: number) => {
    const binary = decimalValue.toString(2).padStart(8, '0');
    
    return {
      original: {
        decimal: decimalValue,
        binary: binary,
        description: `Original value: ${decimalValue}`
      },
      not: {
        decimal: ~decimalValue & 0xFF, // Limit to 8 bits for display
        binary: (~decimalValue & 0xFF).toString(2).padStart(8, '0'),
        description: `Bitwise NOT (~${decimalValue})`
      },
      leftShift: {
        decimal: (decimalValue << 1) & 0xFF,
        binary: ((decimalValue << 1) & 0xFF).toString(2).padStart(8, '0'),
        description: `Left shift by 1 (${decimalValue} << 1)`
      },
      rightShift: {
        decimal: decimalValue >> 1,
        binary: (decimalValue >> 1).toString(2).padStart(8, '0'),
        description: `Right shift by 1 (${decimalValue} >> 1)`
      }
    };
  }, []);

  const processConversion = useCallback(() => {
    if (!inputValue.trim()) {
      setResults({ decimal: '', binary: '', hexadecimal: '', octal: '' });
      setConversionSteps([]);
      setError('');
      setBitwiseOperations({});
      return;
    }

    if (!validateInput(inputValue, inputBase)) {
      setError(`Invalid ${inputBase} number format`);
      setResults({ decimal: '', binary: '', hexadecimal: '', octal: '' });
      setConversionSteps([]);
      setBitwiseOperations({});
      return;
    }

    try {
      const decimalValue = convertToDecimal(inputValue, inputBase);
      
      if (isNaN(decimalValue) || !isFinite(decimalValue)) {
        throw new Error('Invalid number');
      }

      // Check for reasonable limits
      if (Math.abs(decimalValue) > Number.MAX_SAFE_INTEGER) {
        throw new Error('Number too large for accurate conversion');
      }

      const newResults: ConversionResult = {
        decimal: decimalValue.toString(),
        binary: decimalValue.toString(2),
        hexadecimal: decimalValue.toString(16).toUpperCase(),
        octal: decimalValue.toString(8)
      };

      setResults(newResults);
      setConversionSteps(generateConversionSteps(inputValue, inputBase, decimalValue));
      
      if (showBitwise && decimalValue >= 0 && decimalValue <= 255) {
        setBitwiseOperations(generateBitwiseOperations(decimalValue));
      } else {
        setBitwiseOperations({});
      }
      
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setResults({ decimal: '', binary: '', hexadecimal: '', octal: '' });
      setConversionSteps([]);
      setBitwiseOperations({});
    }
  }, [inputValue, inputBase, validateInput, convertToDecimal, generateConversionSteps, showBitwise, generateBitwiseOperations]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(`${label} copied!`);
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (err) {
      setCopyFeedback('Failed to copy');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  const swapConversion = (targetBase: 'decimal' | 'binary' | 'hexadecimal' | 'octal') => {
    const targetValue = results[targetBase];
    if (targetValue && targetBase !== inputBase) {
      setInputValue(targetValue);
      setInputBase(targetBase);
    }
  };

  const processBatch = () => {
    if (!batchInput.trim()) return;

    const lines = batchInput.split('\n').filter(line => line.trim());
    const results: BatchItem[] = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      let detectedBase: 'decimal' | 'binary' | 'hexadecimal' | 'octal' = 'decimal';
      let cleanInput = trimmedLine;

      // Auto-detect base
      if (trimmedLine.startsWith('0x') || trimmedLine.startsWith('0X')) {
        detectedBase = 'hexadecimal';
        cleanInput = trimmedLine.slice(2);
      } else if (trimmedLine.startsWith('0b') || trimmedLine.startsWith('0B')) {
        detectedBase = 'binary';
        cleanInput = trimmedLine.slice(2);
      } else if (trimmedLine.startsWith('0o') || trimmedLine.startsWith('0O')) {
        detectedBase = 'octal';
        cleanInput = trimmedLine.slice(2);
      } else if (/^[01]+$/.test(trimmedLine) && trimmedLine.length > 3) {
        detectedBase = 'binary';
      } else if (/^[0-7]+$/.test(trimmedLine) && trimmedLine.includes('8') === false && trimmedLine.includes('9') === false) {
        detectedBase = 'octal';
      } else if (/^[0-9A-Fa-f]+$/.test(trimmedLine) && /[A-Fa-f]/.test(trimmedLine)) {
        detectedBase = 'hexadecimal';
      }

      try {
        if (!validateInput(cleanInput, detectedBase)) {
          throw new Error(`Invalid ${detectedBase} format`);
        }

        const decimalValue = convertToDecimal(cleanInput, detectedBase);
        const conversionResults: ConversionResult = {
          decimal: decimalValue.toString(),
          binary: decimalValue.toString(2),
          hexadecimal: decimalValue.toString(16).toUpperCase(),
          octal: decimalValue.toString(8)
        };

        results.push({
          input: trimmedLine,
          inputBase: detectedBase,
          results: conversionResults
        });
      } catch (err) {
        results.push({
          input: trimmedLine,
          inputBase: detectedBase,
          results: { decimal: '', binary: '', hexadecimal: '', octal: '' },
          error: err instanceof Error ? err.message : 'Conversion failed'
        });
      }
    });

    setBatchResults(results);
  };

  const downloadBatchResults = () => {
    if (batchResults.length === 0) return;

    const csvContent = [
      'Input,Input Base,Decimal,Binary,Hexadecimal,Octal,Error',
      ...batchResults.map(item => 
        `"${item.input}","${item.inputBase}","${item.results.decimal}","${item.results.binary}","${item.results.hexadecimal}","${item.results.octal}","${item.error || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'number-conversion-results.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const sampleNumbers = [
    { value: '42', base: 'decimal' as const, description: 'The answer to everything' },
    { value: '11111111', base: 'binary' as const, description: '8-bit maximum' },
    { value: 'FF', base: 'hexadecimal' as const, description: 'Hex maximum (255)' },
    { value: '377', base: 'octal' as const, description: 'Octal maximum (255)' },
    { value: '1010', base: 'binary' as const, description: 'Binary 10' },
    { value: 'CAFE', base: 'hexadecimal' as const, description: 'Hex CAFE' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      processConversion();
    }, 300);
    return () => clearTimeout(timer);
  }, [processConversion]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6">
          <Binary className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Number Base Converter
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Convert numbers between binary, decimal, hexadecimal, and octal with step-by-step explanations.
          <span className="text-purple-400"> Convert numbers like a computer science student!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Input Controls */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Input</h3>
              {copyFeedback && (
                <span className="text-green-400 text-sm">{copyFeedback}</span>
              )}
            </div>

            <div className="space-y-4">
              {/* Base Selection */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['decimal', 'binary', 'hexadecimal', 'octal'] as const).map((base) => (
                  <button
                    key={base}
                    onClick={() => setInputBase(base)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                      inputBase === base
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {base}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Enter ${inputBase} number...`}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono text-lg focus:border-purple-500 focus:outline-none"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  {inputBase.charAt(0).toUpperCase() + inputBase.slice(1)}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="text-red-400 text-sm font-semibold mb-1">Error:</div>
                  <div className="text-red-300 text-sm">{error}</div>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showBitwise}
                    onChange={(e) => setShowBitwise(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-gray-400 text-sm">Show bitwise operations</span>
                </label>
              </div>
            </div>
          </div>

          {/* Sample Numbers */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Sample Numbers</h3>
            <div className="space-y-2">
              {sampleNumbers.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputValue(sample.value);
                    setInputBase(sample.base);
                  }}
                  className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-white transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-sm mb-1">{sample.description}</div>
                      <div className="text-gray-400 text-xs font-mono">
                        {sample.value} ({sample.base})
                      </div>
                    </div>
                    <Calculator className="w-4 h-4 text-gray-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Conversion Results */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Results</h3>
            
            <div className="space-y-4">
              {Object.entries(results).map(([base, value]) => (
                <div key={base} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm capitalize font-medium">{base}:</span>
                      {base !== inputBase && value && (
                        <button
                          onClick={() => swapConversion(base as any)}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                          title={`Use as ${base} input`}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {value && (
                      <button
                        onClick={() => copyToClipboard(value, base)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="font-mono text-white text-lg break-all">
                    {value || 'No result'}
                  </div>
                  {value && (
                    <div className="text-gray-500 text-xs mt-1">
                      {value.length} characters
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Steps */}
          {conversionSteps.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <div className="flex items-center space-x-2 mb-6">
                <Info className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Step-by-Step Explanation</h3>
              </div>
              
              <div className="space-y-4">
                {conversionSteps.map((step, index) => (
                  <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                    <div className="text-blue-400 font-semibold text-sm mb-2">
                      Step {index + 1}: {step.operation}
                    </div>
                    <div className="text-gray-300 text-sm mb-2 font-mono">
                      {step.description}
                    </div>
                    <div className="text-white font-mono">
                      Result: {step.result}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bitwise Operations */}
          {Object.keys(bitwiseOperations).length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <div className="flex items-center space-x-2 mb-6">
                <Hash className="w-5 h-5 text-green-400" />
                <h3 className="text-xl font-bold text-white">Bitwise Operations</h3>
              </div>
              
              <div className="space-y-3">
                {Object.entries(bitwiseOperations).map(([operation, data]: [string, any]) => (
                  <div key={operation} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                    <div className="text-green-400 font-semibold text-sm mb-2">
                      {data.description}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-white">
                        {data.binary} ({data.decimal})
                      </div>
                      <button
                        onClick={() => copyToClipboard(data.binary, 'Binary')}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Batch Processing */}
      <div className="mt-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Batch Processing</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <textarea
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="Enter multiple numbers (one per line)&#10;Supports prefixes: 0x (hex), 0b (binary), 0o (octal)&#10;Examples:&#10;42&#10;0xFF&#10;0b1010&#10;0o77"
              className="w-full h-40 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono text-sm resize-none focus:border-purple-500 focus:outline-none"
            />

            <div className="flex space-x-2">
              <button
                onClick={processBatch}
                disabled={!batchInput.trim()}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <FileText className="w-4 h-4" />
                <span>Process Batch</span>
              </button>
              <button
                onClick={() => {
                  setBatchInput('');
                  setBatchResults([]);
                }}
                disabled={batchResults.length === 0 && !batchInput}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
              <button
                onClick={downloadBatchResults}
                disabled={batchResults.length === 0}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {batchResults.length > 0 && (
              <div className="max-h-80 overflow-y-auto space-y-2">
                {batchResults.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      item.error
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-gray-800/50 border-gray-700'
                    }`}
                  >
                    <div className="text-xs text-gray-400 mb-1">
                      Input: {item.input} ({item.inputBase})
                    </div>
                    {item.error ? (
                      <div className="text-xs text-red-400">{item.error}</div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-xs font-mono text-white">
                          Dec: {item.results.decimal} | Bin: {item.results.binary}
                        </div>
                        <div className="text-xs font-mono text-white">
                          Hex: {item.results.hexadecimal} | Oct: {item.results.octal}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-white mb-3">💡 Pro Tips</h4>
        <ul className="text-sm text-gray-400 space-y-2">
          <li>• Use prefixes in batch mode: 0x for hex, 0b for binary, 0o for octal</li>
          <li>• Click the swap icon to use any result as new input</li>
          <li>• Bitwise operations work best with values 0-255 (8-bit)</li>
          <li>• Step-by-step explanations show the math behind conversions</li>
          <li>• Batch processing auto-detects number formats</li>
        </ul>
      </div>
    </div>
  );
};

export default NumberConverterPage;