import React, { useState, useEffect } from 'react';
import { Hash, ArrowRightLeft } from 'lucide-react';

interface NumberConversionPreviewProps {
  isActive: boolean;
}

const NumberConversionPreview: React.FC<NumberConversionPreviewProps> = ({ isActive }) => {
  const [inputValue, setInputValue] = useState('42');
  const [inputBase, setInputBase] = useState<'decimal' | 'binary' | 'hex'>('decimal');
  const [conversions, setConversions] = useState({
    decimal: '42',
    binary: '101010',
    hex: '2A',
    octal: '52'
  });

  useEffect(() => {
    try {
      let decimalValue: number;
      
      // Convert input to decimal first
      switch (inputBase) {
        case 'decimal':
          decimalValue = parseInt(inputValue) || 0;
          break;
        case 'binary':
          decimalValue = parseInt(inputValue, 2) || 0;
          break;
        case 'hex':
          decimalValue = parseInt(inputValue, 16) || 0;
          break;
        default:
          decimalValue = 0;
      }

      // Convert to all bases
      setConversions({
        decimal: decimalValue.toString(),
        binary: decimalValue.toString(2),
        hex: decimalValue.toString(16).toUpperCase(),
        octal: decimalValue.toString(8)
      });
    } catch (error) {
      // Handle invalid input
      setConversions({
        decimal: '0',
        binary: '0',
        hex: '0',
        octal: '0'
      });
    }
  }, [inputValue, inputBase]);

  const baseLabels = {
    decimal: 'Decimal (Base 10)',
    binary: 'Binary (Base 2)',
    hex: 'Hexadecimal (Base 16)',
    octal: 'Octal (Base 8)'
  };

  const baseColors = {
    decimal: 'text-blue-400',
    binary: 'text-green-400',
    hex: 'text-purple-400',
    octal: 'text-orange-400'
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Hash className="w-5 h-5 text-cyan-400" />
        <span className="text-white font-medium">Number Base Converter</span>
      </div>
      
      {/* Input Section */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Input Number:</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none transition-colors font-mono"
              placeholder="Enter number..."
            />
            <select
              value={inputBase}
              onChange={(e) => setInputBase(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none transition-colors"
            >
              <option value="decimal">Dec</option>
              <option value="binary">Bin</option>
              <option value="hex">Hex</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conversion Results */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 mb-2">
          <ArrowRightLeft className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Conversions:</span>
        </div>
        
        {Object.entries(conversions).map(([base, value]) => (
          <div key={base} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            <div className="flex-1">
              <div className="text-sm text-gray-400 mb-1">
                {baseLabels[base as keyof typeof baseLabels]}
              </div>
              <div className={`font-mono text-lg font-semibold ${baseColors[base as keyof typeof baseColors]}`}>
                {base === 'binary' && value.length > 8 
                  ? value.replace(/(.{4})/g, '$1 ').trim()
                  : value
                }
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(value)}
              className="ml-3 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              <ArrowRightLeft className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ))}
      </div>

      {/* Quick Examples */}
      <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
        <div className="text-sm text-gray-400 mb-2">Quick Examples:</div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '255', base: 'decimal' as const },
            { label: '11111111', base: 'binary' as const },
            { label: 'FF', base: 'hex' as const }
          ].map((example) => (
            <button
              key={example.label}
              onClick={() => {
                setInputValue(example.label);
                setInputBase(example.base);
              }}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 transition-colors"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500 italic">
          "Convert numbers like a computer science student"
        </p>
      </div>
    </div>
  );
};

export default NumberConversionPreview;