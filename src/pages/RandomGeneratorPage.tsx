import React, { useState } from 'react';
import { Shuffle, Copy, RefreshCw, Dice1, Hash, Type } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useToast } from '../components/ToastContainer';
import SEOHead from '../components/SEOHead';

const RandomGeneratorPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('numbers');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [generationHistory, setGenerationHistory] = useState<Array<{type: string, value: string, timestamp: string}>>([]);

  // Number generator state
  const [numberMin, setNumberMin] = useState(1);
  const [numberMax, setNumberMax] = useState(100);
  const [numberCount, setNumberCount] = useState(1);
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);

  // String generator state
  const [stringLength, setStringLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [generatedString, setGeneratedString] = useState('');

  // UUID state
  const [generatedUUID, setGeneratedUUID] = useState('');

  // Color state
  const [generatedColor, setGeneratedColor] = useState('#000000');

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(`${type} copied!`);
      setTimeout(() => setCopyFeedback(''), 2000);
      
      // Add to history
      const historyEntry = {
        type,
        value: text,
        timestamp: new Date().toLocaleString()
      };
      setGenerationHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
    } catch (err) {
      setCopyFeedback('Failed to copy');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  const generateNumbers = () => {
    const numbers: number[] = [];
    for (let i = 0; i < numberCount; i++) {
      const randomNum = Math.floor(Math.random() * (numberMax - numberMin + 1)) + numberMin;
      numbers.push(randomNum);
    }
    setGeneratedNumbers(numbers);
  };

  const generateString = () => {
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (!charset) {
      setGeneratedString('Please select at least one character type');
      return;
    }
    
    let result = '';
    for (let i = 0; i < stringLength; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedString(result);
  };

  const generateUUID = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    setGeneratedUUID(uuid);
  };

  const generateColor = () => {
    const color = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setGeneratedColor(color);
  };

  const tabs = [
    { id: 'numbers', label: 'Numbers', icon: Hash },
    { id: 'strings', label: 'Strings', icon: Type },
    { id: 'uuid', label: 'UUID', icon: Dice1 },
    { id: 'colors', label: 'Colors', icon: Shuffle }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead 
        title="Random Generator"
        description="Generate random numbers, strings, UUIDs, and colors for testing and development."
        canonical="/random-generator"
      />
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl mb-6">
          <Shuffle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Random Generator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Generate random numbers, strings, UUIDs, and colors for testing and development. 
          <span className="text-rose-400"> Because sometimes you need chaos in your life!</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-2 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generator */}
        <div className="lg:col-span-2">
          {activeTab === 'numbers' && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Random Numbers</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Minimum</label>
                    <input
                      type="number"
                      value={numberMin}
                      onChange={(e) => setNumberMin(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Maximum</label>
                    <input
                      type="number"
                      value={numberMax}
                      onChange={(e) => setNumberMax(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Count</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={numberCount}
                      onChange={(e) => setNumberCount(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={generateNumbers}
                  className="w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl font-semibold text-white hover:from-rose-400 hover:to-purple-500 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Generate Numbers</span>
                </button>

                {generatedNumbers.length > 0 && (
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Generated Numbers</h4>
                      <button
                        onClick={() => copyToClipboard(generatedNumbers.join(', '), 'Numbers')}
                        className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg text-rose-400 transition-colors flex items-center space-x-1"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {generatedNumbers.map((num, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-gray-700/50 rounded-lg text-white font-mono text-lg"
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'strings' && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Random Strings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-3">
                    Length: {stringLength}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={stringLength}
                    onChange={(e) => setStringLength(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeUppercase}
                      onChange={(e) => setIncludeUppercase(e.target.checked)}
                      className="w-5 h-5 text-rose-600 bg-gray-800 border-gray-600 rounded focus:ring-rose-500"
                    />
                    <span className="text-white">Uppercase (A-Z)</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeLowercase}
                      onChange={(e) => setIncludeLowercase(e.target.checked)}
                      className="w-5 h-5 text-rose-600 bg-gray-800 border-gray-600 rounded focus:ring-rose-500"
                    />
                    <span className="text-white">Lowercase (a-z)</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeNumbers}
                      onChange={(e) => setIncludeNumbers(e.target.checked)}
                      className="w-5 h-5 text-rose-600 bg-gray-800 border-gray-600 rounded focus:ring-rose-500"
                    />
                    <span className="text-white">Numbers (0-9)</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSymbols}
                      onChange={(e) => setIncludeSymbols(e.target.checked)}
                      className="w-5 h-5 text-rose-600 bg-gray-800 border-gray-600 rounded focus:ring-rose-500"
                    />
                    <span className="text-white">Symbols (!@#$%)</span>
                  </label>
                </div>

                <button
                  onClick={generateString}
                  className="w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl font-semibold text-white hover:from-rose-400 hover:to-purple-500 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Generate String</span>
                </button>

                {generatedString && (
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Generated String</h4>
                      <button
                        onClick={() => copyToClipboard(generatedString, 'String')}
                        className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg text-rose-400 transition-colors flex items-center space-x-1"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <code className="text-green-400 font-mono text-lg break-all">
                        {generatedString}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'uuid' && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">UUID Generator</h3>
              
              <div className="space-y-6">
                <div className="text-gray-400 text-sm">
                  Generate RFC 4122 compliant UUIDs (Version 4) for unique identifiers.
                </div>

                <button
                  onClick={generateUUID}
                  className="w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl font-semibold text-white hover:from-rose-400 hover:to-purple-500 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Generate UUID</span>
                </button>

                {generatedUUID && (
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Generated UUID</h4>
                      <button
                        onClick={() => copyToClipboard(generatedUUID, 'UUID')}
                        className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg text-rose-400 transition-colors flex items-center space-x-1"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <code className="text-blue-400 font-mono text-lg break-all">
                        {generatedUUID}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Random Colors</h3>
              
              <div className="space-y-6">
                <div className="text-gray-400 text-sm">
                  Generate random hex colors for design and development.
                </div>

                <button
                  onClick={generateColor}
                  className="w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl font-semibold text-white hover:from-rose-400 hover:to-purple-500 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Generate Color</span>
                </button>

                {generatedColor && (
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Generated Color</h4>
                      <button
                        onClick={() => copyToClipboard(generatedColor, 'Color')}
                        className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg text-rose-400 transition-colors flex items-center space-x-1"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-20 h-20 rounded-2xl border-4 border-gray-700"
                        style={{ backgroundColor: generatedColor }}
                      ></div>
                      <div className="flex-1">
                        <div className="p-4 bg-gray-900/50 rounded-lg">
                          <code className="text-pink-400 font-mono text-lg">
                            {generatedColor}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* History & Info */}
        <div className="space-y-6">
          {/* Copy Feedback */}
          {copyFeedback && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4">
              <div className="text-green-400 text-center font-semibold">
                {copyFeedback}
              </div>
            </div>
          )}

          {/* Generation History */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Generations</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {generationHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No generations yet.<br />
                  <span className="text-sm">Start generating random data!</span>
                </p>
              ) : (
                generationHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => copyToClipboard(entry.value, entry.type)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-rose-400 text-sm font-semibold">{entry.type}</span>
                      <span className="text-xs text-gray-400">{entry.timestamp}</span>
                    </div>
                    <div className="font-mono text-sm text-white break-all">
                      {entry.value.length > 50 ? entry.value.substring(0, 50) + '...' : entry.value}
                    </div>
                  </div>
                ))
              )}
            </div>
            {generationHistory.length > 0 && (
              <button
                onClick={() => setGenerationHistory([])}
                className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Clear History
              </button>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🎲 Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Use UUIDs for unique database identifiers</li>
              <li>• Random strings are great for testing</li>
              <li>• Generate colors for design mockups</li>
              <li>• Use random numbers for sampling data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomGeneratorPage;