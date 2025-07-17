import React, { useState, useMemo } from 'react';
import { FileText, Copy, Shuffle, Code, Download, RefreshCw } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';
import { useToast } from '../components/ToastContainer';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';

interface LoremVariant {
  id: string;
  name: string;
  description: string;
  words: string[];
}

const LoremIpsumPage: React.FC = () => {
  const [wordCount, setWordCount] = useState(50);
  const [sentenceCount, setSentenceCount] = useState(5);
  const [paragraphCount, setParagraphCount] = useState(3);
  const [selectedVariant, setSelectedVariant] = useState('classic');
  const [outputFormat, setOutputFormat] = useState('plain');
  const [generationType, setGenerationType] = useState<'words' | 'sentences' | 'paragraphs'>('paragraphs');
  const [startWithLorem, setStartWithLorem] = useState(true);
  
  const { copyToClipboard } = useClipboard();
  const { showSuccess, showError } = useToast();

  const loremVariants: LoremVariant[] = [
    {
      id: 'classic',
      name: 'Classic Lorem Ipsum',
      description: 'Traditional Latin placeholder text',
      words: [
        'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
        'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
        'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
        'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
        'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
        'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
        'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
        'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
        'accusamus', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
        'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis'
      ]
    },
    {
      id: 'hipster',
      name: 'Hipster Ipsum',
      description: 'Trendy hipster placeholder text',
      words: [
        'artisan', 'craft', 'beer', 'organic', 'sustainable', 'locally', 'sourced',
        'vintage', 'retro', 'authentic', 'handcrafted', 'small', 'batch', 'fixie',
        'bicycle', 'messenger', 'bag', 'vinyl', 'record', 'coffee', 'shop', 'beard',
        'mustache', 'flannel', 'shirt', 'skinny', 'jeans', 'tote', 'mason', 'jar',
        'kale', 'quinoa', 'kombucha', 'meditation', 'yoga', 'mindfulness', 'chakra',
        'energy', 'crystals', 'essential', 'oils', 'farmers', 'market', 'gluten',
        'free', 'vegan', 'raw', 'food', 'juice', 'cleanse', 'detox', 'wellness',
        'holistic', 'natural', 'eco', 'friendly', 'zero', 'waste', 'minimalist'
      ]
    },
    {
      id: 'corporate',
      name: 'Corporate Ipsum',
      description: 'Business buzzword placeholder text',
      words: [
        'synergy', 'leverage', 'paradigm', 'shift', 'disruptive', 'innovation',
        'scalable', 'solution', 'best', 'practices', 'core', 'competencies',
        'strategic', 'initiatives', 'value', 'proposition', 'market', 'penetration',
        'customer', 'centric', 'actionable', 'insights', 'deliverables',
        'stakeholder', 'engagement', 'optimization', 'streamline', 'efficiency',
        'productivity', 'roi', 'kpi', 'metrics', 'analytics', 'data', 'driven',
        'decision', 'making', 'agile', 'methodology', 'cross', 'functional',
        'collaboration', 'thought', 'leadership', 'game', 'changer', 'low',
        'hanging', 'fruit', 'circle', 'back', 'touch', 'base', 'bandwidth'
      ]
    },
    {
      id: 'pirate',
      name: 'Pirate Ipsum',
      description: 'Ahoy! Pirate-themed placeholder text',
      words: [
        'ahoy', 'matey', 'treasure', 'chest', 'parrot', 'ship', 'sail', 'anchor',
        'captain', 'crew', 'deck', 'mast', 'compass', 'map', 'island', 'rum',
        'sword', 'cutlass', 'cannon', 'flag', 'jolly', 'roger', 'plank', 'walk',
        'scurvy', 'landlubber', 'seadog', 'buccaneer', 'privateer', 'corsair',
        'booty', 'doubloon', 'pieces', 'eight', 'gold', 'silver', 'jewels',
        'adventure', 'voyage', 'ocean', 'sea', 'waves', 'storm', 'hurricane',
        'port', 'harbor', 'tavern', 'inn', 'grog', 'ale', 'shanty', 'song'
      ]
    },
    {
      id: 'zombie',
      name: 'Zombie Ipsum',
      description: 'Undead placeholder text for horror themes',
      words: [
        'zombie', 'brain', 'undead', 'apocalypse', 'outbreak', 'infection',
        'virus', 'plague', 'horde', 'shamble', 'groan', 'moan', 'bite',
        'scratch', 'decay', 'rot', 'corpse', 'cemetery', 'graveyard', 'tomb',
        'coffin', 'burial', 'resurrection', 'reanimation', 'walking', 'dead',
        'survivor', 'barricade', 'shelter', 'weapon', 'ammunition', 'supplies',
        'scavenge', 'forage', 'hunt', 'hide', 'escape', 'flee', 'run',
        'fear', 'terror', 'horror', 'nightmare', 'darkness', 'shadow',
        'blood', 'gore', 'flesh', 'bone', 'skull', 'skeleton'
      ]
    }
  ];

  const generateText = useMemo(() => {
    const variant = loremVariants.find(v => v.id === selectedVariant) || loremVariants[0];
    const words = [...variant.words];
    
    const getRandomWord = () => words[Math.floor(Math.random() * words.length)];
    
    const generateSentence = (minWords = 4, maxWords = 18) => {
      const sentenceLength = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
      const sentence = [];
      
      for (let i = 0; i < sentenceLength; i++) {
        sentence.push(getRandomWord());
      }
      
      // Capitalize first word
      sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
      
      return sentence.join(' ') + '.';
    };
    
    const generateParagraph = (minSentences = 3, maxSentences = 7) => {
      const sentenceCount = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
      const sentences = [];
      
      for (let i = 0; i < sentenceCount; i++) {
        sentences.push(generateSentence());
      }
      
      return sentences.join(' ');
    };
    
    let result = '';
    
    if (generationType === 'words') {
      const wordsArray = [];
      for (let i = 0; i < wordCount; i++) {
        wordsArray.push(getRandomWord());
      }
      
      if (startWithLorem && selectedVariant === 'classic') {
        wordsArray[0] = 'Lorem';
        if (wordsArray.length > 1) wordsArray[1] = 'ipsum';
      }
      
      result = wordsArray.join(' ') + '.';
      result = result.charAt(0).toUpperCase() + result.slice(1);
      
    } else if (generationType === 'sentences') {
      const sentences = [];
      for (let i = 0; i < sentenceCount; i++) {
        sentences.push(generateSentence());
      }
      
      if (startWithLorem && selectedVariant === 'classic' && sentences.length > 0) {
        sentences[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
      }
      
      result = sentences.join(' ');
      
    } else { // paragraphs
      const paragraphs = [];
      for (let i = 0; i < paragraphCount; i++) {
        paragraphs.push(generateParagraph());
      }
      
      if (startWithLorem && selectedVariant === 'classic' && paragraphs.length > 0) {
        paragraphs[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' + paragraphs[0];
      }
      
      result = paragraphs.join('\n\n');
    }
    
    return result;
  }, [wordCount, sentenceCount, paragraphCount, selectedVariant, generationType, startWithLorem]);

  const formatOutput = (text: string) => {
    switch (outputFormat) {
      case 'html-p':
        if (generationType === 'paragraphs') {
          return text.split('\n\n').map(p => `<p>${p}</p>`).join('\n');
        }
        return `<p>${text}</p>`;
        
      case 'html-div':
        if (generationType === 'paragraphs') {
          return text.split('\n\n').map(p => `<div>${p}</div>`).join('\n');
        }
        return `<div>${text}</div>`;
        
      case 'markdown':
        if (generationType === 'paragraphs') {
          return text; // Markdown paragraphs are separated by blank lines
        }
        return text;
        
      case 'json':
        if (generationType === 'paragraphs') {
          const paragraphs = text.split('\n\n');
          return JSON.stringify({ paragraphs }, null, 2);
        }
        return JSON.stringify({ text }, null, 2);
        
      default:
        return text;
    }
  };

  const formattedOutput = formatOutput(generateText);

  const handleCopy = async () => {
    if (!formattedOutput.trim()) {
      showError('Nothing to copy');
      return;
    }
    
    const success = await copyToClipboard(formattedOutput);
    if (success) {
      showSuccess('Lorem ipsum copied to clipboard');
    } else {
      showError('Failed to copy text');
    }
  };

  const handleDownload = () => {
    if (!formattedOutput.trim()) {
      showError('Nothing to download');
      return;
    }

    const filename = `lorem-ipsum-${selectedVariant}-${generationType}.${outputFormat === 'json' ? 'json' : 'txt'}`;
    const blob = new Blob([formattedOutput], { 
      type: outputFormat === 'json' ? 'application/json' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Lorem ipsum downloaded successfully');
  };

  const regenerate = () => {
    // Force re-render by updating a state that affects the useMemo dependency
    setStartWithLorem(prev => prev);
    showSuccess('New lorem ipsum generated');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead 
        title="Lorem Ipsum Generator"
        description="Generate customizable lorem ipsum placeholder text with multiple variants, HTML formatting, and export options. Perfect for designers and developers!"
        canonical="/lorem-ipsum"
      />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Lorem Ipsum Generator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Generate customizable placeholder text with multiple variants and formatting options.
          <span className="text-purple-400"> Because "test test test" is unprofessional!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Generation Type */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Generation Type</h3>
            <div className="space-y-4">
              <div className="flex space-x-2">
                {[
                  { id: 'words', label: 'Words' },
                  { id: 'sentences', label: 'Sentences' },
                  { id: 'paragraphs', label: 'Paragraphs' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setGenerationType(type.id as any)}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      generationType === type.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              
              {/* Count Controls */}
              <div className="space-y-4">
                {generationType === 'words' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Number of Words: {wordCount}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="500"
                      value={wordCount}
                      onChange={(e) => setWordCount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1</span>
                      <span>500</span>
                    </div>
                  </div>
                )}
                
                {generationType === 'sentences' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Number of Sentences: {sentenceCount}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={sentenceCount}
                      onChange={(e) => setSentenceCount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1</span>
                      <span>20</span>
                    </div>
                  </div>
                )}
                
                {generationType === 'paragraphs' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Number of Paragraphs: {paragraphCount}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={paragraphCount}
                      onChange={(e) => setParagraphCount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1</span>
                      <span>10</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Variant Selection */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Text Variant</h3>
            <div className="space-y-3">
              {loremVariants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                    selectedVariant === variant.id
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="font-semibold text-white mb-1">{variant.name}</div>
                  <div className="text-sm text-gray-400">{variant.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Output Format */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Output Format</h3>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="plain">Plain Text</option>
              <option value="html-p">HTML Paragraphs</option>
              <option value="html-div">HTML Divs</option>
              <option value="markdown">Markdown</option>
              <option value="json">JSON</option>
            </select>
          </div>

          {/* Options */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Options</h3>
            <div className="space-y-4">
              {selectedVariant === 'classic' && (
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={startWithLorem}
                    onChange={(e) => setStartWithLorem(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Start with "Lorem ipsum"</span>
                </label>
              )}
              
              <button
                onClick={regenerate}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Regenerate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Generated Text</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6">
              <pre className="text-sm text-white whitespace-pre-wrap break-words font-mono leading-relaxed">
                {formattedOutput || 'Generated text will appear here...'}
              </pre>
            </div>
            
            <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
              <span>
                {formattedOutput.length} characters, {formattedOutput.split(/\s+/).filter(w => w).length} words
              </span>
              <span>
                Format: {outputFormat === 'plain' ? 'Plain Text' : outputFormat.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">✨ Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Use HTML format for web development projects</li>
              <li>• JSON format is great for API testing</li>
              <li>• Different variants add personality to your designs</li>
              <li>• Regenerate for fresh content variations</li>
              <li>• Classic Lorem Ipsum is most recognizable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoremIpsumPage;