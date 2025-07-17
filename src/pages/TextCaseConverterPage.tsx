import React, { useState, useMemo } from 'react';
import { Type, Copy, RotateCcw, Eye, Download } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';
import { useToast } from '../components/ToastContainer';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { LIMITS } from '../utils/constants';

interface CaseConversion {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  convert: (text: string) => string;
}

const TextCaseConverterPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedConversion, setSelectedConversion] = useState<string>('');
  const [previewMode, setPreviewMode] = useState(false);
  const { copyToClipboard } = useClipboard();
  const { showSuccess, showError } = useToast();

  const caseConversions: CaseConversion[] = [
    {
      id: 'uppercase',
      name: 'UPPERCASE',
      description: 'Convert all text to uppercase letters',
      icon: Type,
      convert: (text: string) => text.toUpperCase()
    },
    {
      id: 'lowercase',
      name: 'lowercase',
      description: 'Convert all text to lowercase letters',
      icon: Type,
      convert: (text: string) => text.toLowerCase()
    },
    {
      id: 'titlecase',
      name: 'Title Case',
      description: 'Capitalize the first letter of each word',
      icon: Type,
      convert: (text: string) => text.replace(/\b\w/g, l => l.toUpperCase())
    },
    {
      id: 'sentencecase',
      name: 'Sentence case',
      description: 'Capitalize the first letter of each sentence',
      icon: Type,
      convert: (text: string) => {
        return text.toLowerCase().replace(/(^\w|[.!?]\s*\w)/g, l => l.toUpperCase());
      }
    },
    {
      id: 'camelcase',
      name: 'camelCase',
      description: 'Remove spaces and capitalize each word except the first',
      icon: Type,
      convert: (text: string) => {
        return text
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
          })
          .replace(/\s+/g, '');
      }
    },
    {
      id: 'pascalcase',
      name: 'PascalCase',
      description: 'Remove spaces and capitalize each word including the first',
      icon: Type,
      convert: (text: string) => {
        return text
          .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
          .replace(/\s+/g, '');
      }
    },
    {
      id: 'snakecase',
      name: 'snake_case',
      description: 'Replace spaces with underscores and convert to lowercase',
      icon: Type,
      convert: (text: string) => {
        return text
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^\w_]/g, '');
      }
    },
    {
      id: 'kebabcase',
      name: 'kebab-case',
      description: 'Replace spaces with hyphens and convert to lowercase',
      icon: Type,
      convert: (text: string) => {
        return text
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');
      }
    },
    {
      id: 'constantcase',
      name: 'CONSTANT_CASE',
      description: 'Replace spaces with underscores and convert to uppercase',
      icon: Type,
      convert: (text: string) => {
        return text
          .toUpperCase()
          .replace(/\s+/g, '_')
          .replace(/[^\w_]/g, '');
      }
    },
    {
      id: 'alternatingcase',
      name: 'aLtErNaTiNg CaSe',
      description: 'Alternate between lowercase and uppercase letters',
      icon: Type,
      convert: (text: string) => {
        return text
          .split('')
          .map((char, index) => {
            if (char.match(/[a-zA-Z]/)) {
              return index % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
            }
            return char;
          })
          .join('');
      }
    },
    {
      id: 'inversecase',
      name: 'iNVERSE cASE',
      description: 'Swap the case of each letter',
      icon: Type,
      convert: (text: string) => {
        return text
          .split('')
          .map(char => {
            if (char === char.toUpperCase()) {
              return char.toLowerCase();
            } else {
              return char.toUpperCase();
            }
          })
          .join('');
      }
    },
    {
      id: 'reverse',
      name: 'esreveR txeT',
      description: 'Reverse the entire text',
      icon: RotateCcw,
      convert: (text: string) => text.split('').reverse().join('')
    }
  ];

  const convertedTexts = useMemo(() => {
    if (!inputText.trim()) return {};
    
    const results: { [key: string]: string } = {};
    caseConversions.forEach(conversion => {
      try {
        results[conversion.id] = conversion.convert(inputText);
      } catch (error) {
        results[conversion.id] = 'Error in conversion';
      }
    });
    return results;
  }, [inputText]);

  const handleCopy = async (text: string, conversionName: string) => {
    if (!text.trim()) {
      showError('Nothing to copy');
      return;
    }
    
    const success = await copyToClipboard(text);
    if (success) {
      showSuccess(`${conversionName} copied to clipboard`);
    } else {
      showError('Failed to copy text');
    }
  };

  const handleCopyAll = async () => {
    if (!inputText.trim()) {
      showError('Nothing to copy');
      return;
    }

    const allConversions = caseConversions
      .map(conversion => `${conversion.name}:\n${convertedTexts[conversion.id]}\n`)
      .join('\n');

    const success = await copyToClipboard(`Original Text:\n${inputText}\n\n${allConversions}`);
    if (success) {
      showSuccess('All conversions copied to clipboard');
    } else {
      showError('Failed to copy all conversions');
    }
  };

  const handleBatchProcess = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length <= 1) {
      setInputText(text);
      return;
    }

    // For batch processing, we'll process each line separately
    setInputText(text);
    showSuccess(`Ready to process ${lines.length} lines`);
  };

  const downloadResults = () => {
    if (!inputText.trim()) {
      showError('Nothing to download');
      return;
    }

    const content = `Text Case Conversion Results
Generated on: ${new Date().toLocaleString()}

Original Text:
${inputText}

Conversions:
${caseConversions.map(conversion => 
  `${conversion.name}:\n${convertedTexts[conversion.id]}\n`
).join('\n')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-case-conversions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Results downloaded successfully');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead 
        title="Text Case Converter"
        description="Convert text between different cases: uppercase, lowercase, camelCase, snake_case, kebab-case, and more. Batch processing and preview supported!"
        canonical="/text-case-converter"
      />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl mb-6">
          <Type className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent mb-4">
          Text Case Converter
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Convert text between different cases with batch processing and preview functionality.
          <span className="text-green-400"> Because manually changing case is for cavemen!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Input Text</h3>
            <textarea
              value={inputText}
              onChange={(e) => handleBatchProcess(e.target.value)}
              placeholder="Enter your text here...&#10;&#10;For batch processing, enter multiple lines."
              className="w-full h-64 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white resize-none focus:border-green-500 focus:outline-none text-sm md:text-base"
              maxLength={LIMITS.maxTextLength}
            />
            <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
              <span>{inputText.length} / {LIMITS.maxTextLength} characters</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors ${
                    previewMode 
                      ? 'bg-green-500/20 border-green-500/30 text-green-400'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setInputText('')}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleCopyAll}
                disabled={!inputText.trim()}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Copy className="w-4 h-4" />
                <span>Copy All Results</span>
              </button>
              <button
                onClick={downloadResults}
                disabled={!inputText.trim()}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>Download Results</span>
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">✨ Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Use batch processing for multiple lines</li>
              <li>• Preview mode shows results in real-time</li>
              <li>• camelCase is great for JavaScript variables</li>
              <li>• snake_case is common in Python</li>
              <li>• kebab-case is perfect for URLs</li>
            </ul>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Conversion Results</h3>
              {inputText.trim() && (
                <span className="text-sm text-gray-400">
                  {inputText.split('\n').filter(line => line.trim()).length} line(s) to process
                </span>
              )}
            </div>
            
            {!inputText.trim() ? (
              <div className="text-center py-12">
                <Type className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Enter some text to see all case conversions</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseConversions.map((conversion) => {
                  const IconComponent = conversion.icon;
                  const result = convertedTexts[conversion.id] || '';
                  
                  return (
                    <div key={conversion.id} className="bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-4 h-4 text-green-400" />
                          <span className="font-semibold text-white">{conversion.name}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(result, conversion.name)}
                          className="p-1 hover:bg-gray-700/50 rounded text-gray-400 hover:text-white transition-colors"
                          title={`Copy ${conversion.name}`}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{conversion.description}</p>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <pre className="text-sm text-white whitespace-pre-wrap break-words font-mono">
                          {result || 'No result'}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextCaseConverterPage;