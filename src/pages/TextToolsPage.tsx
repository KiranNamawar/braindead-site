import React, { useState } from 'react';
import { FileText, Copy, RotateCcw, Type, Hash, AlignLeft } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';
import { useToast } from '../components/ToastContainer';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { LIMITS } from '../utils/constants';
import { sanitizeInput } from '../utils/validation';

const TextToolsPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [activeTab, setActiveTab] = useState('transform');
  const { copyToClipboard, isCopied } = useClipboard();
  const { showSuccess, showError } = useToast();

  const handleCopy = async (text: string) => {
    if (!text.trim()) {
      showError('Nothing to copy');
      return;
    }
    
    const success = await copyToClipboard(text);
    if (success) {
      showSuccess('Text copied to clipboard');
    } else {
      showError('Failed to copy text');
    }
  };

  const transformText = (type: string) => {
    if (inputText.length > LIMITS.maxTextLength) {
      showError('Text too long', `Maximum text length is ${LIMITS.maxTextLength / 1000}KB`);
      return;
    }
    
    let result = '';
    switch (type) {
      case 'uppercase':
        result = inputText.toUpperCase();
        break;
      case 'lowercase':
        result = inputText.toLowerCase();
        break;
      case 'capitalize':
        result = inputText.replace(/\b\w/g, l => l.toUpperCase());
        break;
      case 'reverse':
        result = inputText.split('').reverse().join('');
        break;
      case 'removeSpaces':
        result = inputText.replace(/\s+/g, '');
        break;
      case 'removeLineBreaks':
        result = inputText.replace(/\n/g, ' ').replace(/\s+/g, ' ');
        break;
      case 'addLineNumbers':
        result = inputText.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n');
        break;
      case 'sortLines':
        result = inputText.split('\n').sort().join('\n');
        break;
      case 'removeDuplicateLines':
        const lines = inputText.split('\n');
        result = [...new Set(lines)].join('\n');
        break;
      case 'extractEmails':
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const emails = sanitizeInput(inputText).match(emailRegex) || [];
        result = emails.join('\n');
        break;
      case 'extractUrls':
        const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
        const urls = sanitizeInput(inputText).match(urlRegex) || [];
        result = urls.join('\n');
        break;
      default:
        result = inputText;
    }
    setOutputText(result);
  };

  const analyzeText = () => {
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    const lines = inputText.split('\n').length;
    const paragraphs = inputText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    const wordFrequency: { [key: string]: number } = {};
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord) {
        wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
      }
    });

    const topWords = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      lines,
      paragraphs,
      sentences,
      topWords
    };
  };

  const stats = analyzeText();

  const transformButtons = [
    { id: 'uppercase', label: 'UPPERCASE', icon: Type },
    { id: 'lowercase', label: 'lowercase', icon: Type },
    { id: 'capitalize', label: 'Capitalize Words', icon: Type },
    { id: 'reverse', label: 'Reverse Text', icon: RotateCcw },
    { id: 'removeSpaces', label: 'Remove Spaces', icon: AlignLeft },
    { id: 'removeLineBreaks', label: 'Remove Line Breaks', icon: AlignLeft },
    { id: 'addLineNumbers', label: 'Add Line Numbers', icon: Hash },
    { id: 'sortLines', label: 'Sort Lines', icon: AlignLeft },
    { id: 'removeDuplicateLines', label: 'Remove Duplicates', icon: AlignLeft },
    { id: 'extractEmails', label: 'Extract Emails', icon: FileText },
    { id: 'extractUrls', label: 'Extract URLs', icon: FileText },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead 
        title="Text Tools"
        description="Transform, analyze, and manipulate text with powerful utilities. Count words, extract data, and format text easily."
        canonical="/text-tools"
      />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-6">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-4">
          Text Tools
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Transform, analyze, and manipulate text with powerful utilities. 
          <span className="text-amber-400"> Because manual text editing is for masochists!</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-2">
          <button
            onClick={() => setActiveTab('transform')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'transform'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Transform
          </button>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'analyze'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Analyze
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Input Text</h3>
            <textarea
              className="w-full h-80 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white resize-none focus:border-amber-500 focus:outline-none"
            />
            <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
              <span>{inputText.length} characters</span>
              <button
                onClick={() => setInputText('')}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {activeTab === 'transform' && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Transform Options</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {transformButtons.map((button) => (
                  <button
                    key={button.id}
                    onClick={() => transformText(button.id)}
                    className="flex items-center space-x-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-white transition-colors text-left"
                  >
                    <button.icon className="w-4 h-4" />
                    <span className="text-sm">{button.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output/Analysis */}
        <div className="space-y-6">
          {activeTab === 'transform' ? (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Output</h3>
              </div>
              <textarea
                value={outputText}
                readOnly
                placeholder="Transformed text will appear here..."
                className="w-full h-80 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white resize-none focus:border-amber-500 focus:outline-none"
              />
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-400">{outputText.length} characters</span>
                <button
                  onClick={() => handleCopy(outputText)}
                  disabled={!outputText}
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Text Analysis</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">{stats.words}</div>
                  <div className="text-gray-400 text-sm">Words</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">{stats.characters}</div>
                  <div className="text-gray-400 text-sm">Characters</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">{stats.lines}</div>
                  <div className="text-gray-400 text-sm">Lines</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">{stats.sentences}</div>
                  <div className="text-gray-400 text-sm">Sentences</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-white font-semibold mb-2">Detailed Stats</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Characters (no spaces):</span>
                      <span className="text-white">{stats.charactersNoSpaces}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Paragraphs:</span>
                      <span className="text-white">{stats.paragraphs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average words per sentence:</span>
                      <span className="text-white">
                        {stats.sentences > 0 ? Math.round(stats.words / stats.sentences) : 0}
                      </span>
                    </div>
                  </div>
                </div>

                {stats.topWords.length > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="text-white font-semibold mb-3">Most Frequent Words</div>
                    <div className="space-y-2">
                      {stats.topWords.map(([word, count], index) => (
                        <div key={word} className="flex justify-between items-center">
                          <span className="text-gray-300">{index + 1}. {word}</span>
                          <span className="text-amber-400 font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">✨ Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Use extract functions to find emails/URLs</li>
              <li>• Sort lines alphabetically for better organization</li>
              <li>• Remove duplicates to clean up lists</li>
              <li>• Analyze text to improve readability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToolsPage;