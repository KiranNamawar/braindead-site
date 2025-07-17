import React, { useState, useCallback, useEffect } from 'react';
import { Type, Copy, Download, RefreshCw, Palette, RotateCcw } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';
import { useToast } from '../components/ToastContainer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { STORAGE_KEYS } from '../utils/constants';

interface ASCIIFont {
  name: string;
  id: string;
  chars: { [key: string]: string[] };
}

interface ASCIITemplate {
  name: string;
  art: string;
  category: string;
}

const ASCIIArtGeneratorPage: React.FC = () => {
  const [inputText, setInputText] = useState('HELLO');
  const [selectedFont, setSelectedFont] = useState('block');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customArt, setCustomArt] = useState('');
  const [mode, setMode] = useState<'text' | 'template' | 'custom'>('text');
  const [artHistory, setArtHistory] = useLocalStorage<string[]>(
    STORAGE_KEYS.asciiArtHistory,
    []
  );

  const { copyToClipboard } = useClipboard();
  const { showSuccess, showError } = useToast();

  // ASCII Font definitions (simplified for demo)
  const fonts: ASCIIFont[] = [
    {
      name: 'Block',
      id: 'block',
      chars: {
        'A': ['██████', '██  ██', '██████', '██  ██', '██  ██'],
        'B': ['██████', '██  ██', '██████', '██  ██', '██████'],
        'C': ['██████', '██    ', '██    ', '██    ', '██████'],
        'D': ['██████', '██  ██', '██  ██', '██  ██', '██████'],
        'E': ['██████', '██    ', '██████', '██    ', '██████'],
        'F': ['██████', '██    ', '██████', '██    ', '██    '],
        'G': ['██████', '██    ', '██ ███', '██  ██', '██████'],
        'H': ['██  ██', '██  ██', '██████', '██  ██', '██  ██'],
        'I': ['██████', '  ██  ', '  ██  ', '  ██  ', '██████'],
        'J': ['██████', '    ██', '    ██', '██  ██', '██████'],
        'K': ['██  ██', '██ ██ ', '████  ', '██ ██ ', '██  ██'],
        'L': ['██    ', '██    ', '██    ', '██    ', '██████'],
        'M': ['██  ██', '██████', '██████', '██  ██', '██  ██'],
        'N': ['██  ██', '██████', '██████', '██████', '██  ██'],
        'O': ['██████', '██  ██', '██  ██', '██  ██', '██████'],
        'P': ['██████', '██  ██', '██████', '██    ', '██    '],
        'Q': ['██████', '██  ██', '██  ██', '██ ███', '██████'],
        'R': ['██████', '██  ██', '██████', '██ ██ ', '██  ██'],
        'S': ['██████', '██    ', '██████', '    ██', '██████'],
        'T': ['██████', '  ██  ', '  ██  ', '  ██  ', '  ██  '],
        'U': ['██  ██', '██  ██', '██  ██', '██  ██', '██████'],
        'V': ['██  ██', '██  ██', '██  ██', ' ████ ', '  ██  '],
        'W': ['██  ██', '██  ██', '██████', '██████', '██  ██'],
        'X': ['██  ██', ' ████ ', '  ██  ', ' ████ ', '██  ██'],
        'Y': ['██  ██', '██  ██', ' ████ ', '  ██  ', '  ██  '],
        'Z': ['██████', '   ██ ', '  ██  ', ' ██   ', '██████'],
        ' ': ['      ', '      ', '      ', '      ', '      '],
        '0': ['██████', '██  ██', '██  ██', '██  ██', '██████'],
        '1': ['  ██  ', ' ███  ', '  ██  ', '  ██  ', '██████'],
        '2': ['██████', '    ██', '██████', '██    ', '██████'],
        '3': ['██████', '    ██', '██████', '    ██', '██████'],
        '4': ['██  ██', '██  ██', '██████', '    ██', '    ██'],
        '5': ['██████', '██    ', '██████', '    ██', '██████'],
        '6': ['██████', '██    ', '██████', '██  ██', '██████'],
        '7': ['██████', '    ██', '   ██ ', '  ██  ', ' ██   '],
        '8': ['██████', '██  ██', '██████', '██  ██', '██████'],
        '9': ['██████', '██  ██', '██████', '    ██', '██████']
      }
    },
    {
      name: 'Small',
      id: 'small',
      chars: {
        'A': ['▄▀█', '█▀█'],
        'B': ['█▄▄', '█▄█'],
        'C': ['▄▀█', '▀▄▄'],
        'D': ['█▄▄', '█▄█'],
        'E': ['█▀▀', '█▄▄'],
        'F': ['█▀▀', '█  '],
        'G': ['▄▀█', '▀▄█'],
        'H': ['█ █', '█▀█'],
        'I': ['█', '█'],
        'J': [' █', '▄█'],
        'K': ['█▄', '█▀'],
        'L': ['█ ', '█▄'],
        'M': ['█▄█', '█▀█'],
        'N': ['█▄█', '█▀█'],
        'O': ['▄▀█', '▀▄▀'],
        'P': ['█▀▄', '█  '],
        'Q': ['▄▀█', '▀▄█'],
        'R': ['█▀▄', '█▀▄'],
        'S': ['▄▀▀', '▄▄▀'],
        'T': ['▀█▀', ' █ '],
        'U': ['█ █', '▀▄▀'],
        'V': ['█ █', ' ▀ '],
        'W': ['█ █', '█▄█'],
        'X': ['▀▄▀', '▄▀▄'],
        'Y': ['▀▄▀', ' █ '],
        'Z': ['▀▀▄', '▄▀▀'],
        ' ': [' ', ' '],
        '0': ['▄▀▄', '▀▄▀'],
        '1': ['▄█', ' █'],
        '2': ['▀▀▄', '▄▀▀'],
        '3': ['▀▀▄', '▄▄▀'],
        '4': ['▄▀▄', '  █'],
        '5': ['█▀▀', '▄▄▀'],
        '6': ['▄▀▀', '█▄▀'],
        '7': ['▀▀▄', '  █'],
        '8': ['▄▀▄', '█▄█'],
        '9': ['▄▀▄', '▄▄▀']
      }
    },
    {
      name: 'Dots',
      id: 'dots',
      chars: {
        'A': ['●●●●●', '●   ●', '●●●●●', '●   ●', '●   ●'],
        'B': ['●●●●●', '●   ●', '●●●●●', '●   ●', '●●●●●'],
        'C': ['●●●●●', '●    ', '●    ', '●    ', '●●●●●'],
        'D': ['●●●●●', '●   ●', '●   ●', '●   ●', '●●●●●'],
        'E': ['●●●●●', '●    ', '●●●●●', '●    ', '●●●●●'],
        'F': ['●●●●●', '●    ', '●●●●●', '●    ', '●    '],
        'G': ['●●●●●', '●    ', '● ●●●', '●   ●', '●●●●●'],
        'H': ['●   ●', '●   ●', '●●●●●', '●   ●', '●   ●'],
        'I': ['●●●●●', '  ●  ', '  ●  ', '  ●  ', '●●●●●'],
        'J': ['●●●●●', '    ●', '    ●', '●   ●', '●●●●●'],
        'K': ['●   ●', '●  ● ', '●●●  ', '●  ● ', '●   ●'],
        'L': ['●    ', '●    ', '●    ', '●    ', '●●●●●'],
        'M': ['●   ●', '●●●●●', '●●●●●', '●   ●', '●   ●'],
        'N': ['●   ●', '●●  ●', '● ● ●', '●  ●●', '●   ●'],
        'O': ['●●●●●', '●   ●', '●   ●', '●   ●', '●●●●●'],
        'P': ['●●●●●', '●   ●', '●●●●●', '●    ', '●    '],
        'Q': ['●●●●●', '●   ●', '●   ●', '● ●●●', '●●●●●'],
        'R': ['●●●●●', '●   ●', '●●●●●', '●  ● ', '●   ●'],
        'S': ['●●●●●', '●    ', '●●●●●', '    ●', '●●●●●'],
        'T': ['●●●●●', '  ●  ', '  ●  ', '  ●  ', '  ●  '],
        'U': ['●   ●', '●   ●', '●   ●', '●   ●', '●●●●●'],
        'V': ['●   ●', '●   ●', '●   ●', ' ●●● ', '  ●  '],
        'W': ['●   ●', '●   ●', '●●●●●', '●●●●●', '●   ●'],
        'X': ['●   ●', ' ●●● ', '  ●  ', ' ●●● ', '●   ●'],
        'Y': ['●   ●', '●   ●', ' ●●● ', '  ●  ', '  ●  '],
        'Z': ['●●●●●', '   ● ', '  ●  ', ' ●   ', '●●●●●'],
        ' ': ['     ', '     ', '     ', '     ', '     '],
        '0': ['●●●●●', '●   ●', '●   ●', '●   ●', '●●●●●'],
        '1': ['  ●  ', ' ●●  ', '  ●  ', '  ●  ', '●●●●●'],
        '2': ['●●●●●', '    ●', '●●●●●', '●    ', '●●●●●'],
        '3': ['●●●●●', '    ●', '●●●●●', '    ●', '●●●●●'],
        '4': ['●   ●', '●   ●', '●●●●●', '    ●', '    ●'],
        '5': ['●●●●●', '●    ', '●●●●●', '    ●', '●●●●●'],
        '6': ['●●●●●', '●    ', '●●●●●', '●   ●', '●●●●●'],
        '7': ['●●●●●', '    ●', '   ● ', '  ●  ', ' ●   '],
        '8': ['●●●●●', '●   ●', '●●●●●', '●   ●', '●●●●●'],
        '9': ['●●●●●', '●   ●', '●●●●●', '    ●', '●●●●●']
      }
    }
  ];

  // ASCII Art Templates
  const templates: ASCIITemplate[] = [
    {
      name: 'Happy Face',
      category: 'Faces',
      art: `    ████████    
  ██        ██  
 ██  ██  ██  ██ 
██              ██
██   ██    ██   ██
██    ████████    ██
 ██              ██ 
  ██            ██  
    ████████████    `
    },
    {
      name: 'Heart',
      category: 'Symbols',
      art: `  ██████  ██████  
██████████████████
██████████████████
██████████████████
 ████████████████ 
  ██████████████  
   ████████████   
    ██████████    
     ████████     
      ██████      
       ████       
        ██        `
    },
    {
      name: 'Star',
      category: 'Symbols',
      art: `        ██        
        ██        
        ██        
██████████████████
 ████████████████ 
  ██████████████  
   ████████████   
  ██████████████  
 ████████████████ 
██████████████████
        ██        
        ██        
        ██        `
    },
    {
      name: 'Arrow Right',
      category: 'Arrows',
      art: `    ██    
    ████  
    ██████
████████████
████████████
    ██████
    ████  
    ██    `
    },
    {
      name: 'Diamond',
      category: 'Shapes',
      art: `      ██      
    ██████    
  ██████████  
██████████████
██████████████
  ██████████  
    ██████    
      ██      `
    },
    {
      name: 'Cat',
      category: 'Animals',
      art: `  ██    ██  
 ████  ████ 
██████████████
██ ██████ ██
██    ██    ██
██████████████
██ ████████ ██
██          ██
 ████████████ 
  ██████████  `
    }
  ];

  const generateTextArt = useCallback((text: string, fontId: string): string => {
    const font = fonts.find(f => f.id === fontId);
    if (!font) return '';

    const chars = text.toUpperCase().split('');
    const lines: string[] = [];
    
    // Get the height of the font (number of lines per character)
    const fontHeight = font.chars['A']?.length || 5;
    
    // Initialize lines array
    for (let i = 0; i < fontHeight; i++) {
      lines[i] = '';
    }
    
    // Build each line
    chars.forEach((char, charIndex) => {
      const charLines = font.chars[char] || font.chars[' '] || [];
      
      for (let lineIndex = 0; lineIndex < fontHeight; lineIndex++) {
        const charLine = charLines[lineIndex] || '      ';
        lines[lineIndex] += charLine;
        
        // Add spacing between characters (except for the last character)
        if (charIndex < chars.length - 1) {
          lines[lineIndex] += ' ';
        }
      }
    });
    
    return lines.join('\n');
  }, [fonts]);

  const [generatedArt, setGeneratedArt] = useState('');

  useEffect(() => {
    if (mode === 'text') {
      const art = generateTextArt(inputText, selectedFont);
      setGeneratedArt(art);
    } else if (mode === 'template' && selectedTemplate) {
      const template = templates.find(t => t.name === selectedTemplate);
      setGeneratedArt(template?.art || '');
    } else if (mode === 'custom') {
      setGeneratedArt(customArt);
    }
  }, [inputText, selectedFont, mode, selectedTemplate, customArt, generateTextArt]);

  const handleCopyArt = async () => {
    const success = await copyToClipboard(generatedArt);
    if (success) {
      showSuccess('ASCII art copied to clipboard!');
      // Add to history
      if (generatedArt && !artHistory.includes(generatedArt)) {
        setArtHistory(prev => [generatedArt, ...prev.slice(0, 9)]);
      }
    } else {
      showError('Failed to copy ASCII art');
    }
  };

  const handleDownloadArt = () => {
    const content = `ASCII Art Generated by BrainDead.site
${new Date().toLocaleDateString()}

${generatedArt}

Generated with: ${mode === 'text' ? `Text: "${inputText}", Font: ${selectedFont}` : 
                 mode === 'template' ? `Template: ${selectedTemplate}` : 'Custom Art'}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('ASCII art downloaded!');
  };

  const generateRandomText = () => {
    const words = ['COOL', 'AWESOME', 'EPIC', 'NICE', 'WOW', 'GREAT', 'SUPER', 'AMAZING', 'FANTASTIC', 'BRILLIANT'];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setInputText(randomWord);
  };

  const resetAll = () => {
    setInputText('HELLO');
    setSelectedFont('block');
    setSelectedTemplate(null);
    setCustomArt('');
    setMode('text');
  };

  const loadFromHistory = (art: string) => {
    setGeneratedArt(art);
    setMode('custom');
    setCustomArt(art);
    showSuccess('ASCII art loaded from history!');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead
        title="ASCII Art Generator"
        description="Create stunning ASCII art from text with multiple font styles, use templates, or create custom ASCII art. Export and share your creations."
        canonical="/ascii-art-generator"
      />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-6">
          <Type className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
          ASCII Art Generator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Transform text into stunning ASCII art with multiple fonts and templates.
          <span className="text-green-400"> Because sometimes plain text is just too boring!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Mode Selection */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Mode</h3>
            <div className="space-y-2">
              {[
                { id: 'text', label: 'Text to ASCII', icon: Type },
                { id: 'template', label: 'Templates', icon: Palette },
                { id: 'custom', label: 'Custom Art', icon: RefreshCw }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setMode(id as any)}
                  className={`w-full px-4 py-3 rounded-xl text-left transition-all flex items-center space-x-3 ${
                    mode === id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Input (Text Mode) */}
          {mode === 'text' && (
            <>
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Text Input</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value.slice(0, 20))}
                    placeholder="Enter text (max 20 chars)"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                  <div className="text-sm text-gray-400">
                    {inputText.length}/20 characters
                  </div>
                  <button
                    onClick={generateRandomText}
                    className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white transition-colors flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Random Word</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Font Style</h3>
                <div className="space-y-2">
                  {fonts.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setSelectedFont(font.id)}
                      className={`w-full px-4 py-3 rounded-xl text-left transition-all ${
                        selectedFont === font.id
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Template Selection (Template Mode) */}
          {mode === 'template' && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Templates</h3>
              <div className="space-y-4">
                {Object.entries(
                  templates.reduce((acc, template) => {
                    if (!acc[template.category]) acc[template.category] = [];
                    acc[template.category].push(template);
                    return acc;
                  }, {} as Record<string, ASCIITemplate[]>)
                ).map(([category, categoryTemplates]) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">{category}</h4>
                    <div className="space-y-1">
                      {categoryTemplates.map((template) => (
                        <button
                          key={template.name}
                          onClick={() => setSelectedTemplate(template.name)}
                          className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-all ${
                            selectedTemplate === template.name
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Art Input (Custom Mode) */}
          {mode === 'custom' && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Custom ASCII Art</h3>
              <textarea
                value={customArt}
                onChange={(e) => setCustomArt(e.target.value)}
                placeholder="Paste or create your own ASCII art here..."
                className="w-full h-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none font-mono text-sm resize-none"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleCopyArt}
                disabled={!generatedArt}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl font-semibold text-white hover:from-green-400 hover:to-blue-500 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Copy className="w-4 h-4" />
                <span>Copy ASCII Art</span>
              </button>
              <button
                onClick={handleDownloadArt}
                disabled={!generatedArt}
                className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={resetAll}
                className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* ASCII Art Preview */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">ASCII Art Preview</h3>
            <div className="bg-black rounded-2xl p-6 min-h-[300px] overflow-auto">
              <pre className="text-green-400 font-mono text-sm leading-tight whitespace-pre">
                {generatedArt || 'Your ASCII art will appear here...'}
              </pre>
            </div>
          </div>

          {/* ASCII Art History */}
          {artHistory.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Recent ASCII Art</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {artHistory.map((art, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 rounded-xl p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
                    onClick={() => loadFromHistory(art)}
                  >
                    <pre className="text-green-400 font-mono text-xs leading-tight whitespace-pre overflow-hidden">
                      {art.split('\n').slice(0, 5).join('\n')}
                      {art.split('\n').length > 5 && '\n...'}
                    </pre>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setArtHistory([])}
                className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Clear History
              </button>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🎨 ASCII Art Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Keep text short for better readability</li>
              <li>• Try different fonts for various styles</li>
              <li>• Use templates for quick decorative elements</li>
              <li>• Custom mode lets you paste existing ASCII art</li>
              <li>• ASCII art works great in code comments</li>
              <li>• Perfect for terminal applications and text files</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ASCIIArtGeneratorPage;