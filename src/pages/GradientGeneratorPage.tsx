import React, { useState, useCallback, useEffect } from 'react';
import { Palette, Copy, Download, RefreshCw, Plus, Trash2, RotateCcw } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';
import { useToast } from '../components/ToastContainer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { STORAGE_KEYS } from '../utils/constants';

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

interface GradientConfig {
  type: 'linear' | 'radial' | 'conic';
  angle: number;
  stops: ColorStop[];
  radialShape: 'circle' | 'ellipse';
  radialSize: 'closest-side' | 'closest-corner' | 'farthest-side' | 'farthest-corner';
  centerX: number;
  centerY: number;
}

const GradientGeneratorPage: React.FC = () => {
  const [config, setConfig] = useState<GradientConfig>({
    type: 'linear',
    angle: 45,
    stops: [
      { id: '1', color: '#3B82F6', position: 0 },
      { id: '2', color: '#8B5CF6', position: 100 }
    ],
    radialShape: 'circle',
    radialSize: 'farthest-corner',
    centerX: 50,
    centerY: 50
  });

  const [gradientHistory, setGradientHistory] = useLocalStorage<string[]>(
    STORAGE_KEYS.gradientHistory, 
    []
  );

  const { copyToClipboard } = useClipboard();
  const { showSuccess, showError } = useToast();

  const generateGradientCSS = useCallback((gradientConfig: GradientConfig): string => {
    const { type, angle, stops, radialShape, radialSize, centerX, centerY } = gradientConfig;
    
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const colorStops = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');

    switch (type) {
      case 'linear':
        return `linear-gradient(${angle}deg, ${colorStops})`;
      case 'radial':
        return `radial-gradient(${radialShape} ${radialSize} at ${centerX}% ${centerY}%, ${colorStops})`;
      case 'conic':
        return `conic-gradient(from ${angle}deg at ${centerX}% ${centerY}%, ${colorStops})`;
      default:
        return `linear-gradient(${angle}deg, ${colorStops})`;
    }
  }, []);

  const gradientCSS = generateGradientCSS(config);

  const handleCopyCSS = async () => {
    const cssProperty = `background: ${gradientCSS};`;
    const success = await copyToClipboard(cssProperty);
    if (success) {
      showSuccess('CSS copied to clipboard!');
      // Add to history
      if (!gradientHistory.includes(gradientCSS)) {
        setGradientHistory(prev => [gradientCSS, ...prev.slice(0, 9)]);
      }
    } else {
      showError('Failed to copy CSS');
    }
  };

  const handleDownloadCSS = () => {
    const cssContent = `/* Generated CSS Gradient */
.gradient {
  background: ${gradientCSS};
}

/* Alternative with fallback */
.gradient-with-fallback {
  background: ${config.stops[0]?.color || '#3B82F6'}; /* Fallback */
  background: ${gradientCSS};
}`;

    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradient.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('CSS file downloaded!');
  };

  const addColorStop = () => {
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: '#FF0000',
      position: 50
    };
    setConfig(prev => ({
      ...prev,
      stops: [...prev.stops, newStop].sort((a, b) => a.position - b.position)
    }));
  };

  const removeColorStop = (id: string) => {
    if (config.stops.length <= 2) {
      showError('Gradient must have at least 2 color stops');
      return;
    }
    setConfig(prev => ({
      ...prev,
      stops: prev.stops.filter(stop => stop.id !== id)
    }));
  };

  const updateColorStop = (id: string, updates: Partial<ColorStop>) => {
    setConfig(prev => ({
      ...prev,
      stops: prev.stops.map(stop => 
        stop.id === id ? { ...stop, ...updates } : stop
      ).sort((a, b) => a.position - b.position)
    }));
  };

  const generateRandomGradient = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    
    const randomColors = Array.from({ length: Math.floor(Math.random() * 3) + 2 }, () => 
      colors[Math.floor(Math.random() * colors.length)]
    );
    
    const newStops: ColorStop[] = randomColors.map((color, index) => ({
      id: Date.now().toString() + index,
      color,
      position: (100 / (randomColors.length - 1)) * index
    }));

    setConfig(prev => ({
      ...prev,
      stops: newStops,
      angle: Math.floor(Math.random() * 360),
      type: ['linear', 'radial', 'conic'][Math.floor(Math.random() * 3)] as any
    }));
  };

  const resetGradient = () => {
    setConfig({
      type: 'linear',
      angle: 45,
      stops: [
        { id: '1', color: '#3B82F6', position: 0 },
        { id: '2', color: '#8B5CF6', position: 100 }
      ],
      radialShape: 'circle',
      radialSize: 'farthest-corner',
      centerX: 50,
      centerY: 50
    });
  };

  const loadFromHistory = (gradientCss: string) => {
    // This is a simplified parser - in a real app you'd want more robust parsing
    try {
      // For now, just copy the CSS to show it was selected
      copyToClipboard(`background: ${gradientCss};`);
      showSuccess('Gradient CSS copied from history!');
    } catch (error) {
      showError('Failed to load gradient from history');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead
        title="CSS Gradient Generator"
        description="Create beautiful CSS gradients with live preview. Generate linear, radial, and conic gradients with custom colors and export CSS code."
        canonical="/gradient-generator"
      />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6">
          <Palette className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          CSS Gradient Generator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Create stunning CSS gradients with live preview and instant code generation.
          <span className="text-purple-400"> Because flat colors are so 2010!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Gradient Type */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Gradient Type</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['linear', 'radial', 'conic'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setConfig(prev => ({ ...prev, type }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    config.type === type
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Angle/Direction Controls */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {config.type === 'linear' ? 'Angle' : 'Rotation'}
            </h3>
            <div className="space-y-4">
              <input
                type="range"
                min="0"
                max="360"
                value={config.angle}
                onChange={(e) => setConfig(prev => ({ ...prev, angle: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex items-center justify-between">
                <span className="text-gray-400">0°</span>
                <span className="text-white font-mono">{config.angle}°</span>
                <span className="text-gray-400">360°</span>
              </div>
            </div>
          </div>

          {/* Radial Gradient Options */}
          {config.type === 'radial' && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Radial Options</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Shape</label>
                  <select
                    value={config.radialShape}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      radialShape: e.target.value as 'circle' | 'ellipse' 
                    }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="circle">Circle</option>
                    <option value="ellipse">Ellipse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Size</label>
                  <select
                    value={config.radialSize}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      radialSize: e.target.value as any
                    }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="closest-side">Closest Side</option>
                    <option value="closest-corner">Closest Corner</option>
                    <option value="farthest-side">Farthest Side</option>
                    <option value="farthest-corner">Farthest Corner</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Center Position (for radial and conic) */}
          {(config.type === 'radial' || config.type === 'conic') && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Center Position</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">X Position: {config.centerX}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.centerX}
                    onChange={(e) => setConfig(prev => ({ ...prev, centerX: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Y Position: {config.centerY}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.centerY}
                    onChange={(e) => setConfig(prev => ({ ...prev, centerY: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={generateRandomGradient}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-semibold text-white hover:from-purple-400 hover:to-pink-500 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Random Gradient</span>
              </button>
              <button
                onClick={resetGradient}
                className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview and Color Stops */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Preview */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Live Preview</h3>
            <div
              className="w-full h-64 rounded-2xl border-2 border-gray-700 shadow-lg"
              style={{ background: gradientCSS }}
            ></div>
          </div>

          {/* CSS Output */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">CSS Code</h3>
              <div className="flex space-x-3">
                <button
                  onClick={handleCopyCSS}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={handleDownloadCSS}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 font-mono text-sm">
              <div className="text-gray-400">/* CSS Property */</div>
              <div className="text-white break-all">background: {gradientCSS};</div>
            </div>
          </div>

          {/* Color Stops */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Color Stops</h3>
              <button
                onClick={addColorStop}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Stop</span>
              </button>
            </div>
            <div className="space-y-4">
              {config.stops.map((stop, index) => (
                <div key={stop.id} className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-xl">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-600"
                    style={{ backgroundColor: stop.color }}
                  ></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={stop.color}
                        onChange={(e) => updateColorStop(stop.id, { color: e.target.value })}
                        className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={stop.color}
                        onChange={(e) => updateColorStop(stop.id, { color: e.target.value })}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400 text-sm w-16">Position:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stop.position}
                        onChange={(e) => updateColorStop(stop.id, { position: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <span className="text-white font-mono text-sm w-12">{stop.position}%</span>
                    </div>
                  </div>
                  {config.stops.length > 2 && (
                    <button
                      onClick={() => removeColorStop(stop.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Gradient History */}
          {gradientHistory.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Recent Gradients</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gradientHistory.map((gradient, index) => (
                  <div
                    key={index}
                    className="aspect-video rounded-xl cursor-pointer hover:scale-105 transition-transform border-2 border-gray-700 hover:border-purple-500"
                    style={{ background: gradient }}
                    onClick={() => loadFromHistory(gradient)}
                    title="Click to copy CSS"
                  ></div>
                ))}
              </div>
              <button
                onClick={() => setGradientHistory([])}
                className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Clear History
              </button>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🎨 Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Use 2-3 colors for subtle gradients</li>
              <li>• Try different gradient types for variety</li>
              <li>• Adjust color stop positions for unique effects</li>
              <li>• Copy CSS and paste directly into your stylesheets</li>
              <li>• Use radial gradients for spotlight effects</li>
              <li>• Conic gradients work great for progress indicators</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradientGeneratorPage;