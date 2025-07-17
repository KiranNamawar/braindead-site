import React, { useState, useCallback, useEffect } from 'react';
import { Crown, Copy, RotateCcw, BookOpen, Download, FileText, Info } from 'lucide-react';
import BackButton from '../components/BackButton';

interface RomanNumeralRule {
  symbol: string;
  value: number;
  description: string;
}

interface ConversionStep {
  operation: string;
  remaining: number;
  symbol: string;
  description: string;
}

interface BatchItem {
  input: string;
  inputType: 'decimal' | 'roman';
  result: string;
  error?: string;
}

const RomanNumeralPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState<'decimal' | 'roman'>('decimal');
  const [result, setResult] = useState('');
  const [conversionSteps, setConversionSteps] = useState<ConversionStep[]>([]);
  const [error, setError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [batchResults, setBatchResults] = useState<BatchItem[]>([]);

  // Roman numeral mapping with subtractive cases
  const romanNumerals: RomanNumeralRule[] = [
    { symbol: 'M', value: 1000, description: 'One thousand' },
    { symbol: 'CM', value: 900, description: 'Nine hundred (1000 - 100)' },
    { symbol: 'D', value: 500, description: 'Five hundred' },
    { symbol: 'CD', value: 400, description: 'Four hundred (500 - 100)' },
    { symbol: 'C', value: 100, description: 'One hundred' },
    { symbol: 'XC', value: 90, description: 'Ninety (100 - 10)' },
    { symbol: 'L', value: 50, description: 'Fifty' },
    { symbol: 'XL', value: 40, description: 'Forty (50 - 10)' },
    { symbol: 'X', value: 10, description: 'Ten' },
    { symbol: 'IX', value: 9, description: 'Nine (10 - 1)' },
    { symbol: 'V', value: 5, description: 'Five' },
    { symbol: 'IV', value: 4, description: 'Four (5 - 1)' },
    { symbol: 'I', value: 1, description: 'One' }
  ];

  const validateDecimal = useCallback((value: string): boolean => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num > 0 && num <= 3999 && num.toString() === value;
  }, []);

  const validateRoman = useCallback((value: string): boolean => {
    const cleanValue = value.toUpperCase().trim();
    
    // Check for valid characters
    if (!/^[IVXLCDM]+$/.test(cleanValue)) {
      return false;
    }

    // Check for invalid patterns
    const invalidPatterns = [
      /IIII/, /VV/, /XXXX/, /LL/, /CCCC/, /DD/, /MMMM/, // No more than 3 consecutive
      /VX/, /VL/, /VC/, /VD/, /VM/, // V cannot be subtracted
      /LC/, /LD/, /LM/, // L cannot be subtracted from C, D, M
      /DM/, // D cannot be subtracted from M
      /IL/, /IC/, /ID/, /IM/, // I can only be subtracted from V and X
      /XD/, /XM/ // X can only be subtracted from L and C
    ];

    return !invalidPatterns.some(pattern => pattern.test(cleanValue));
  }, []);

  const decimalToRoman = useCallback((num: number): { result: string; steps: ConversionStep[] } => {
    let remaining = num;
    let result = '';
    const steps: ConversionStep[] = [];

    for (const { symbol, value, description } of romanNumerals) {
      while (remaining >= value) {
        result += symbol;
        remaining -= value;
        steps.push({
          operation: `Subtract ${value}`,
          remaining,
          symbol,
          description: `Add ${symbol} (${description}), remaining: ${remaining}`
        });
      }
    }

    return { result, steps };
  }, []);

  const romanToDecimal = useCallback((roman: string): { result: number; steps: ConversionStep[] } => {
    const cleanRoman = roman.toUpperCase().trim();
    let result = 0;
    let i = 0;
    const steps: ConversionStep[] = [];

    while (i < cleanRoman.length) {
      // Check for two-character combinations first
      const twoChar = cleanRoman.substring(i, i + 2);
      const twoCharRule = romanNumerals.find(rule => rule.symbol === twoChar);
      
      if (twoCharRule) {
        result += twoCharRule.value;
        steps.push({
          operation: `Add ${twoChar}`,
          remaining: result,
          symbol: twoChar,
          description: `${twoChar} = ${twoCharRule.value} (${twoCharRule.description}), total: ${result}`
        });
        i += 2;
      } else {
        // Check single character
        const oneChar = cleanRoman.charAt(i);
        const oneCharRule = romanNumerals.find(rule => rule.symbol === oneChar);
        
        if (oneCharRule) {
          result += oneCharRule.value;
          steps.push({
            operation: `Add ${oneChar}`,
            remaining: result,
            symbol: oneChar,
            description: `${oneChar} = ${oneCharRule.value} (${oneCharRule.description}), total: ${result}`
          });
          i += 1;
        } else {
          throw new Error(`Invalid Roman numeral character: ${oneChar}`);
        }
      }
    }

    return { result, steps };
  }, []);

  const processConversion = useCallback(() => {
    if (!inputValue.trim()) {
      setResult('');
      setConversionSteps([]);
      setError('');
      return;
    }

    try {
      if (inputType === 'decimal') {
        if (!validateDecimal(inputValue)) {
          throw new Error('Please enter a valid number between 1 and 3999');
        }
        
        const num = parseInt(inputValue, 10);
        const { result: romanResult, steps } = decimalToRoman(num);
        setResult(romanResult);
        setConversionSteps(steps);
      } else {
        if (!validateRoman(inputValue)) {
          throw new Error('Invalid Roman numeral format');
        }
        
        const { result: decimalResult, steps } = romanToDecimal(inputValue);
        setResult(decimalResult.toString());
        setConversionSteps(steps);
      }
      
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setResult('');
      setConversionSteps([]);
    }
  }, [inputValue, inputType, validateDecimal, validateRoman, decimalToRoman, romanToDecimal]);

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

  const swapConversion = () => {
    if (result && !error) {
      setInputValue(result);
      setInputType(inputType === 'decimal' ? 'roman' : 'decimal');
    }
  };

  const processBatch = () => {
    if (!batchInput.trim()) return;

    const lines = batchInput.split('\n').filter(line => line.trim());
    const results: BatchItem[] = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Auto-detect input type
      const isDecimal = /^\d+$/.test(trimmedLine);
      const detectedType: 'decimal' | 'roman' = isDecimal ? 'decimal' : 'roman';

      try {
        let conversionResult: string;
        
        if (detectedType === 'decimal') {
          if (!validateDecimal(trimmedLine)) {
            throw new Error('Invalid decimal number (must be 1-3999)');
          }
          const num = parseInt(trimmedLine, 10);
          const { result } = decimalToRoman(num);
          conversionResult = result;
        } else {
          if (!validateRoman(trimmedLine)) {
            throw new Error('Invalid Roman numeral format');
          }
          const { result } = romanToDecimal(trimmedLine);
          conversionResult = result.toString();
        }

        results.push({
          input: trimmedLine,
          inputType: detectedType,
          result: conversionResult
        });
      } catch (err) {
        results.push({
          input: trimmedLine,
          inputType: detectedType,
          result: '',
          error: err instanceof Error ? err.message : 'Conversion failed'
        });
      }
    });

    setBatchResults(results);
  };

  const downloadBatchResults = () => {
    if (batchResults.length === 0) return;

    const csvContent = [
      'Input,Input Type,Result,Error',
      ...batchResults.map(item => 
        `"${item.input}","${item.inputType}","${item.result}","${item.error || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'roman-numeral-conversion-results.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const sampleNumbers = [
    { decimal: '42', roman: 'XLII', description: 'The answer to everything' },
    { decimal: '1984', roman: 'MCMLXXXIV', description: 'Orwell\'s year' },
    { decimal: '2024', roman: 'MMXXIV', description: 'Current year' },
    { decimal: '444', roman: 'CDXLIV', description: 'Lots of subtractions' },
    { decimal: '3999', roman: 'MMMCMXCIX', description: 'Maximum value' },
    { decimal: '1', roman: 'I', description: 'Minimum value' }
  ];

  const romanRules = [
    'I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000',
    'Symbols are written from largest to smallest, left to right',
    'When a smaller symbol appears before a larger one, it is subtracted',
    'Only I, X, and C can be used as subtractive symbols',
    'I can only be subtracted from V and X',
    'X can only be subtracted from L and C',
    'C can only be subtracted from D and M',
    'Never repeat a symbol more than three times in a row',
    'V, L, and D are never repeated or used subtractively',
    'Roman numerals traditionally go up to 3999 (MMMCMXCIX)'
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl mb-6">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent mb-4">
          Roman Numeral Converter
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Convert between Roman numerals and decimal numbers with historical context and validation.
          <span className="text-amber-400"> Because sometimes you need to feel ancient!</span>
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
              {/* Type Selection */}
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setInputType('decimal')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    inputType === 'decimal'
                      ? 'bg-amber-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Decimal to Roman
                </button>
                <button
                  onClick={() => setInputType('roman')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    inputType === 'roman'
                      ? 'bg-amber-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Roman to Decimal
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={inputType === 'decimal' ? 'Enter number (1-3999)...' : 'Enter Roman numeral...'}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono text-lg focus:border-amber-500 focus:outline-none"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  {inputType === 'decimal' ? 'Number' : 'Roman'}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="text-red-400 text-sm font-semibold mb-1">Error:</div>
                  <div className="text-red-300 text-sm">{error}</div>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <button
                  onClick={swapConversion}
                  disabled={!result || !!error}
                  className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Swap</span>
                </button>
                
                <button
                  onClick={() => setShowRules(!showRules)}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors flex items-center space-x-1"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Rules</span>
                </button>
              </div>
            </div>
          </div>

          {/* Roman Numeral Rules */}
          {showRules && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <div className="flex items-center space-x-2 mb-6">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Roman Numeral Rules</h3>
              </div>
              
              <div className="space-y-3">
                {romanRules.map((rule, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-400 text-xs font-bold">{index + 1}</span>
                    </div>
                    <div className="text-gray-300 text-sm">{rule}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Numbers */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Sample Conversions</h3>
            <div className="space-y-2">
              {sampleNumbers.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (inputType === 'decimal') {
                      setInputValue(sample.decimal);
                    } else {
                      setInputValue(sample.roman);
                    }
                  }}
                  className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-white transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-sm mb-1">{sample.description}</div>
                      <div className="text-gray-400 text-xs font-mono">
                        {sample.decimal} ↔ {sample.roman}
                      </div>
                    </div>
                    <Crown className="w-4 h-4 text-amber-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Conversion Result */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Result</h3>
              {result && (
                <button
                  onClick={() => copyToClipboard(result, 'Result')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Copy className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">
                  {inputType === 'decimal' ? 'Roman Numeral' : 'Decimal Number'}
                </div>
                <div className="font-mono text-white text-3xl font-bold break-all">
                  {result || 'No result'}
                </div>
                {result && (
                  <div className="text-gray-500 text-xs mt-2">
                    {result.length} characters
                  </div>
                )}
              </div>
            </div>

            {result && (
              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="text-amber-400 text-sm font-semibold mb-1">Conversion:</div>
                <div className="text-amber-300 text-sm">
                  {inputType === 'decimal' 
                    ? `${inputValue} (decimal) = ${result} (Roman)`
                    : `${inputValue} (Roman) = ${result} (decimal)`
                  }
                </div>
              </div>
            )}
          </div>

          {/* Conversion Steps */}
          {conversionSteps.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <div className="flex items-center space-x-2 mb-6">
                <Info className="w-5 h-5 text-green-400" />
                <h3 className="text-xl font-bold text-white">Step-by-Step Breakdown</h3>
              </div>
              
              <div className="space-y-3">
                {conversionSteps.map((step, index) => (
                  <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-green-400 font-semibold text-sm">
                        Step {index + 1}: {step.operation}
                      </div>
                      <div className="text-amber-400 font-mono text-sm">
                        {step.symbol}
                      </div>
                    </div>
                    <div className="text-gray-300 text-sm">
                      {step.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Symbol Reference */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Symbol Reference</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {romanNumerals.filter(rule => rule.symbol.length === 1).map((rule) => (
                <div key={rule.symbol} className="bg-gray-800/50 border border-gray-700 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-amber-400 text-lg font-bold">
                      {rule.symbol}
                    </div>
                    <div className="text-white font-semibold">
                      {rule.value}
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {rule.description}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-gray-400 text-sm mb-2">Subtractive Combinations:</div>
              <div className="grid grid-cols-2 gap-2">
                {romanNumerals.filter(rule => rule.symbol.length === 2).map((rule) => (
                  <div key={rule.symbol} className="text-xs">
                    <span className="font-mono text-amber-400">{rule.symbol}</span>
                    <span className="text-gray-400"> = {rule.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
              placeholder="Enter multiple numbers or Roman numerals (one per line)&#10;Examples:&#10;42&#10;XLII&#10;1984&#10;MCMLXXXIV&#10;2024"
              className="w-full h-40 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono text-sm resize-none focus:border-amber-500 focus:outline-none"
            />

            <div className="flex space-x-2">
              <button
                onClick={processBatch}
                disabled={!batchInput.trim()}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
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
                      Input: {item.input} ({item.inputType})
                    </div>
                    {item.error ? (
                      <div className="text-xs text-red-400">{item.error}</div>
                    ) : (
                      <div className="text-sm font-mono text-white">
                        Result: {item.result}
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
        <h4 className="text-lg font-semibold text-white mb-3">💡 Historical Context & Tips</h4>
        <ul className="text-sm text-gray-400 space-y-2">
          <li>• Roman numerals were used throughout the Roman Empire and medieval Europe</li>
          <li>• The subtractive notation (IV, IX, etc.) became standard in the Middle Ages</li>
          <li>• Romans originally wrote 4 as IIII and 9 as VIIII</li>
          <li>• Clock faces often still use IIII instead of IV for aesthetic balance</li>
          <li>• Batch processing auto-detects whether input is decimal or Roman</li>
          <li>• Maximum value is 3999 (MMMCMXCIX) - larger numbers used different notation</li>
        </ul>
      </div>
    </div>
  );
};

export default RomanNumeralPage;