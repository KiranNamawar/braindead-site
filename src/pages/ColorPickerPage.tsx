import React, { useState, useRef } from 'react';
import { Palette, Copy, Download, RefreshCw, Eye, Pipette } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useClipboard } from '../hooks/useClipboard';
import { useToast } from '../components/ToastContainer';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { STORAGE_KEYS, APP_CONFIG } from '../utils/constants';
import { validateHexColor } from '../utils/validation';

const ColorPickerPage: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [colorHistory, setColorHistory] = useLocalStorage<string[]>(STORAGE_KEYS.colorHistory, ['#3B82F6']);
  const [palette, setPalette] = useState<string[]>([]);
  const { copyToClipboard } = useClipboard();
  const { showSuccess, showError } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const handleCopy = async (text: string, format: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      showSuccess(`${format} copied!`);
    } else {
      showError('Failed to copy');
    }
  };

  const addToHistory = (color: string) => {
    if (!colorHistory.includes(color)) {
      setColorHistory(prev => [color, ...prev.slice(0, 19)]);
    }
  };

  const generatePalette = () => {
    const rgb = hexToRgb(selectedColor);
    if (!rgb) return;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const newPalette: string[] = [];

    // Generate complementary and analogous colors
    for (let i = 0; i < 8; i++) {
      const newHue = (hsl.h + (i * 45)) % 360;
      const newColor = hslToHex(newHue, hsl.s, hsl.l);
      newPalette.push(newColor);
    }

    setPalette(newPalette);
  };

  const hslToHex = (h: number, s: number, l: number) => {
    const lightness = l / 100;
    const a = s * Math.min(lightness, 1 - lightness) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > APP_CONFIG.maxFileSize) {
      showError('File too large', 'Please select a file smaller than 10MB');
      return;
    }

    if (!APP_CONFIG.supportedImageTypes.includes(file.type as any)) {
      showError('Unsupported file type', 'Please select a JPEG, PNG, WebP, or GIF image');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b] = imageData.data;

    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    setSelectedColor(hex);
    addToHistory(hex);
  };

  const rgb = hexToRgb(selectedColor);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead
        title="Color Picker"
        description="Extract colors from images, generate palettes, and convert between color formats. Perfect for designers and developers."
        canonical="/color-picker"
      />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl mb-6">
          <Palette className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-4">
          Color Picker
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Extract colors from images, generate palettes, and convert between formats.
          <span className="text-pink-400"> Because naming colors is hard!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Color Picker */}
        <div className="lg:col-span-2 space-y-6">
          {/* Color Input */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Color Selector</h3>

            <div className="flex items-center space-x-4 mb-6">
              <div
                className="w-20 h-20 rounded-2xl border-4 border-gray-700 shadow-lg"
                style={{ backgroundColor: selectedColor }}
              ></div>
              <div className="flex-1">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => {
                    setSelectedColor(e.target.value);
                    addToHistory(e.target.value);
                  }}
                  className="w-full h-12 rounded-xl border-2 border-gray-700 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => {
                  const value = e.target.value;
                  if (validateHexColor(value)) {
                    setSelectedColor(e.target.value);
                    addToHistory(e.target.value);
                  } else if (value.length <= 7) {
                    setSelectedColor(value); // Allow partial input
                  }
                }}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono focus:border-pink-500 focus:outline-none"
                placeholder="#000000"
                maxLength={7}
              />
              <button
                onClick={generatePalette}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-600 rounded-xl font-semibold text-white hover:from-pink-400 hover:to-red-500 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate Palette</span>
              </button>
            </div>
          </div>

          {/* Image Color Picker */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Pipette className="w-5 h-5 mr-2" />
              Extract from Image
            </h3>

            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Upload Image</span>
              </button>
            </div>

            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="max-w-full h-auto border border-gray-700 rounded-xl cursor-crosshair"
              style={{ maxHeight: '300px' }}
            />
            <p className="text-gray-400 text-sm mt-2">Click on the image to pick a color</p>
          </div>

          {/* Generated Palette */}
          {palette.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Generated Palette</h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {palette.map((color, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square rounded-xl cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color);
                      addToHistory(color);
                    }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-colors flex items-center justify-center">
                      <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Color Information & History */}
        <div className="space-y-6">
          {/* Color Formats */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Color Formats</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <div className="text-gray-400 text-xs">HEX</div>
                  <div className="font-mono text-white">{selectedColor}</div>
                </div>
                <button
                  onClick={() => handleCopy(selectedColor, 'HEX')}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {rgb && (
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-gray-400 text-xs">RGB</div>
                    <div className="font-mono text-white">{`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}</div>
                  </div>
                  <button
                    onClick={() => handleCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'RGB')}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}

              {hsl && (
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-gray-400 text-xs">HSL</div>
                    <div className="font-mono text-white">{`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}</div>
                  </div>
                  <button
                    onClick={() => handleCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'HSL')}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Color History */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Colors</h3>
            <div className="grid grid-cols-5 gap-2">
              {colorHistory.map((color, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg cursor-pointer hover:scale-110 transition-transform border-2 border-transparent hover:border-white/20"
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                ></div>
              ))}
            </div>
            {colorHistory.length > 1 && (
              <button
                onClick={() => setColorHistory([selectedColor])}
                className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Clear History
              </button>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🎨 Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Upload images to extract colors</li>
              <li>• Click palette colors to select them</li>
              <li>• Copy colors in different formats</li>
              <li>• Generate harmonious color palettes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerPage;