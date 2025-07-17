import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Image, Download, Copy, RefreshCw, Palette, Type, RotateCcw } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';
import { useToast } from '../components/ToastContainer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { STORAGE_KEYS } from '../utils/constants';

interface FaviconConfig {
  type: 'text' | 'emoji' | 'shape';
  text: string;
  emoji: string;
  shape: 'circle' | 'square' | 'diamond' | 'heart' | 'star';
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  borderRadius: number;
  padding: number;
}

interface FaviconSize {
  size: number;
  name: string;
  description: string;
}

const FaviconGeneratorPage: React.FC = () => {
  const [config, setConfig] = useState<FaviconConfig>({
    type: 'text',
    text: 'BD',
    emoji: '🚀',
    shape: 'circle',
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Arial',
    borderRadius: 8,
    padding: 4
  });

  const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 48]);
  const [faviconHistory, setFaviconHistory] = useLocalStorage<string[]>(
    STORAGE_KEYS.faviconHistory,
    []
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { copyToClipboard } = useClipboard();
  const { showSuccess, showError } = useToast();

  const faviconSizes: FaviconSize[] = [
    { size: 16, name: '16x16', description: 'Browser tab' },
    { size: 32, name: '32x32', description: 'Taskbar' },
    { size: 48, name: '48x48', description: 'Desktop shortcut' },
    { size: 64, name: '64x64', description: 'High DPI' },
    { size: 96, name: '96x96', description: 'Android Chrome' },
    { size: 128, name: '128x128', description: 'Chrome Web Store' },
    { size: 152, name: '152x152', description: 'iPad' },
    { size: 180, name: '180x180', description: 'iPhone' },
    { size: 192, name: '192x192', description: 'Android' },
    { size: 512, name: '512x512', description: 'PWA' }
  ];

  const fontFamilies = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 
    'Verdana', 'Courier New', 'Impact', 'Comic Sans MS'
  ];

  const popularEmojis = [
    '🚀', '⭐', '🎯', '💡', '🔥', '⚡', '🎨', '🛠️',
    '📱', '💻', '🌟', '🎪', '🎭', '🎨', '🎯', '🎲',
    '🏆', '🎖️', '🥇', '🎊', '🎉', '🎈', '🎁', '🎀'
  ];

  const generateFavicon = useCallback((size: number): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background
    ctx.fillStyle = config.backgroundColor;
    if (config.borderRadius > 0) {
      // Rounded rectangle
      const radius = Math.min(config.borderRadius, size / 2);
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, radius);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, size, size);
    }

    // Draw content based on type
    if (config.type === 'text') {
      // Draw text
      ctx.fillStyle = config.textColor;
      ctx.font = `bold ${Math.floor(size * (config.fontSize / 32))}px ${config.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const text = config.text.slice(0, 3); // Limit to 3 characters
      ctx.fillText(text, size / 2, size / 2);
    } else if (config.type === 'emoji') {
      // Draw emoji
      ctx.font = `${Math.floor(size * 0.7)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.emoji, size / 2, size / 2);
    } else if (config.type === 'shape') {
      // Draw shape
      ctx.fillStyle = config.textColor;
      const centerX = size / 2;
      const centerY = size / 2;
      const shapeSize = size * 0.6;

      ctx.beginPath();
      switch (config.shape) {
        case 'circle':
          ctx.arc(centerX, centerY, shapeSize / 2, 0, 2 * Math.PI);
          break;
        case 'square':
          ctx.rect(centerX - shapeSize / 2, centerY - shapeSize / 2, shapeSize, shapeSize);
          break;
        case 'diamond':
          ctx.moveTo(centerX, centerY - shapeSize / 2);
          ctx.lineTo(centerX + shapeSize / 2, centerY);
          ctx.lineTo(centerX, centerY + shapeSize / 2);
          ctx.lineTo(centerX - shapeSize / 2, centerY);
          ctx.closePath();
          break;
        case 'heart':
          const heartSize = shapeSize / 2;
          ctx.moveTo(centerX, centerY + heartSize / 4);
          ctx.bezierCurveTo(centerX, centerY - heartSize / 4, centerX - heartSize, centerY - heartSize / 4, centerX - heartSize, centerY + heartSize / 8);
          ctx.bezierCurveTo(centerX - heartSize, centerY + heartSize / 2, centerX, centerY + heartSize, centerX, centerY + heartSize);
          ctx.bezierCurveTo(centerX, centerY + heartSize, centerX + heartSize, centerY + heartSize / 2, centerX + heartSize, centerY + heartSize / 8);
          ctx.bezierCurveTo(centerX + heartSize, centerY - heartSize / 4, centerX, centerY - heartSize / 4, centerX, centerY + heartSize / 4);
          break;
        case 'star':
          const starSize = shapeSize / 2;
          const spikes = 5;
          const outerRadius = starSize;
          const innerRadius = starSize * 0.4;
          
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = centerX + Math.cos(angle - Math.PI / 2) * radius;
            const y = centerY + Math.sin(angle - Math.PI / 2) * radius;
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          break;
      }
      ctx.fill();
    }

    return canvas.toDataURL('image/png');
  }, [config]);

  const [previewDataUrl, setPreviewDataUrl] = useState('');

  useEffect(() => {
    const dataUrl = generateFavicon(128);
    setPreviewDataUrl(dataUrl);
  }, [generateFavicon]);

  const handleDownloadFavicon = async (size: number) => {
    const dataUrl = generateFavicon(size);
    
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `favicon-${size}x${size}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess(`Favicon ${size}x${size} downloaded!`);
    } catch (error) {
      showError('Failed to download favicon');
    }
  };

  const handleDownloadAllSizes = async () => {
    for (const size of selectedSizes) {
      await handleDownloadFavicon(size);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    showSuccess(`Downloaded ${selectedSizes.length} favicon sizes!`);
  };

  const handleDownloadICO = async () => {
    // For ICO format, we'll create a simple implementation
    // In a real app, you'd want to use a proper ICO library
    const dataUrl = generateFavicon(32);
    
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'favicon.ico';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess('ICO favicon downloaded! (Note: This is a PNG renamed to .ico)');
    } catch (error) {
      showError('Failed to download ICO favicon');
    }
  };

  const handleCopyDataUrl = async () => {
    const success = await copyToClipboard(previewDataUrl);
    if (success) {
      showSuccess('Favicon data URL copied to clipboard!');
      // Add to history
      if (!faviconHistory.includes(previewDataUrl)) {
        setFaviconHistory(prev => [previewDataUrl, ...prev.slice(0, 9)]);
      }
    } else {
      showError('Failed to copy data URL');
    }
  };

  const generateRandomFavicon = () => {
    const types: ('text' | 'emoji' | 'shape')[] = ['text', 'emoji', 'shape'];
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
    const shapes: ('circle' | 'square' | 'diamond' | 'heart' | 'star')[] = ['circle', 'square', 'diamond', 'heart', 'star'];
    const words = ['BD', 'WEB', 'APP', 'DEV', 'UI', 'UX', 'JS', 'CSS', 'API', 'PWA'];

    setConfig(prev => ({
      ...prev,
      type: types[Math.floor(Math.random() * types.length)],
      text: words[Math.floor(Math.random() * words.length)],
      emoji: popularEmojis[Math.floor(Math.random() * popularEmojis.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      textColor: Math.random() > 0.5 ? '#FFFFFF' : '#000000'
    }));
  };

  const resetConfig = () => {
    setConfig({
      type: 'text',
      text: 'BD',
      emoji: '🚀',
      shape: 'circle',
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
      fontSize: 24,
      fontFamily: 'Arial',
      borderRadius: 8,
      padding: 4
    });
  };

  const loadFromHistory = (dataUrl: string) => {
    setPreviewDataUrl(dataUrl);
    showSuccess('Favicon loaded from history!');
  };

  const toggleSize = (size: number) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size].sort((a, b) => a - b)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead
        title="Favicon Generator"
        description="Create custom favicons from text, emojis, or shapes. Generate multiple sizes and download ICO files for your website."
        canonical="/favicon-generator"
      />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-6">
          <Image className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
          Favicon Generator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Create custom favicons from text, emojis, or shapes with multiple size exports.
          <span className="text-orange-400"> Because your website deserves a unique identity!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Favicon Type */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Favicon Type</h3>
            <div className="space-y-2">
              {[
                { id: 'text', label: 'Text', icon: Type },
                { id: 'emoji', label: 'Emoji', icon: Palette },
                { id: 'shape', label: 'Shape', icon: RefreshCw }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setConfig(prev => ({ ...prev, type: id as any }))}
                  className={`w-full px-4 py-3 rounded-xl text-left transition-all flex items-center space-x-3 ${
                    config.type === id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Configuration */}
          {config.type === 'text' && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Text Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Text (max 3 chars)</label>
                  <input
                    type="text"
                    value={config.text}
                    onChange={(e) => setConfig(prev => ({ ...prev, text: e.target.value.slice(0, 3).toUpperCase() }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                    placeholder="BD"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Font Family</label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) => setConfig(prev => ({ ...prev, fontFamily: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  >
                    {fontFamilies.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Font Size: {config.fontSize}px</label>
                  <input
                    type="range"
                    min="12"
                    max="40"
                    value={config.fontSize}
                    onChange={(e) => setConfig(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>
          )}

          {config.type === 'emoji' && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Emoji Selection</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Custom Emoji</label>
                  <input
                    type="text"
                    value={config.emoji}
                    onChange={(e) => setConfig(prev => ({ ...prev, emoji: e.target.value.slice(0, 2) }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none text-center text-2xl"
                    placeholder="🚀"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Popular Emojis</label>
                  <div className="grid grid-cols-6 gap-2">
                    {popularEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => setConfig(prev => ({ ...prev, emoji }))}
                        className={`p-2 rounded-lg text-xl transition-all ${
                          config.emoji === emoji
                            ? 'bg-orange-500'
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {config.type === 'shape' && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Shape Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Shape Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['circle', 'square', 'diamond', 'heart', 'star'] as const).map((shape) => (
                      <button
                        key={shape}
                        onClick={() => setConfig(prev => ({ ...prev, shape }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          config.shape === shape
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {shape.charAt(0).toUpperCase() + shape.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Color Settings */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Colors</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-600"
                  style={{ backgroundColor: config.backgroundColor }}
                ></div>
                <div className="flex-1">
                  <label className="block text-gray-400 text-sm mb-1">Background</label>
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-full h-8 rounded border border-gray-600 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-600"
                  style={{ backgroundColor: config.textColor }}
                ></div>
                <div className="flex-1">
                  <label className="block text-gray-400 text-sm mb-1">Foreground</label>
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
                    className="w-full h-8 rounded border border-gray-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Style Settings */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Style</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Border Radius: {config.borderRadius}px</label>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={config.borderRadius}
                  onChange={(e) => setConfig(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={generateRandomFavicon}
                className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl font-semibold text-white hover:from-orange-400 hover:to-red-500 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Random Favicon</span>
              </button>
              <button
                onClick={resetConfig}
                className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview and Export */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Preview</h3>
            <div className="flex items-center justify-center space-x-8 mb-8">
              {/* Different size previews */}
              {[16, 32, 64, 128].map(size => (
                <div key={size} className="text-center">
                  <div className="bg-gray-800 p-4 rounded-lg mb-2">
                    {previewDataUrl && (
                      <img
                        src={previewDataUrl}
                        alt={`Favicon ${size}x${size}`}
                        width={size}
                        height={size}
                        className="mx-auto"
                        style={{ imageRendering: size <= 32 ? 'pixelated' : 'auto' }}
                      />
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{size}x{size}</span>
                </div>
              ))}
            </div>
            
            {/* Browser Preview */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="bg-gray-700 rounded px-3 py-2 flex items-center space-x-2">
                {previewDataUrl && (
                  <img
                    src={previewDataUrl}
                    alt="Favicon preview"
                    width={16}
                    height={16}
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}
                <span className="text-white text-sm">Your Website</span>
              </div>
            </div>
          </div>

          {/* Size Selection */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Export Sizes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {faviconSizes.map(({ size, name, description }) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    selectedSizes.includes(size)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="font-semibold">{name}</div>
                  <div className="text-xs opacity-75">{description}</div>
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDownloadAllSizes}
                disabled={selectedSizes.length === 0}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>Download Selected ({selectedSizes.length})</span>
              </button>
              <button
                onClick={handleDownloadICO}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download ICO</span>
              </button>
              <button
                onClick={handleCopyDataUrl}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white transition-colors flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Data URL</span>
              </button>
            </div>
          </div>

          {/* HTML Code */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">HTML Code</h3>
            <div className="bg-gray-800/50 rounded-xl p-4 font-mono text-sm">
              <div className="text-gray-400 mb-2">/* Add to your HTML &lt;head&gt; */</div>
              <div className="text-white space-y-1">
                <div>&lt;link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"&gt;</div>
                <div>&lt;link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"&gt;</div>
                <div>&lt;link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png"&gt;</div>
                <div>&lt;link rel="manifest" href="/site.webmanifest"&gt;</div>
              </div>
            </div>
          </div>

          {/* Favicon History */}
          {faviconHistory.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Recent Favicons</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {faviconHistory.map((dataUrl, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-800 rounded-lg p-2 cursor-pointer hover:bg-gray-700 transition-colors flex items-center justify-center"
                    onClick={() => loadFromHistory(dataUrl)}
                    title="Click to load"
                  >
                    <img
                      src={dataUrl}
                      alt={`Favicon ${index + 1}`}
                      className="w-8 h-8"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setFaviconHistory([])}
                className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Clear History
              </button>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🎨 Favicon Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Keep designs simple - favicons are very small</li>
              <li>• Use high contrast colors for better visibility</li>
              <li>• Test your favicon at 16x16 size first</li>
              <li>• Include multiple sizes for different devices</li>
              <li>• Consider how it looks on both light and dark backgrounds</li>
              <li>• Use ICO format for maximum browser compatibility</li>
            </ul>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default FaviconGeneratorPage;