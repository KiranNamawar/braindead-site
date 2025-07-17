import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Download, Upload, Zap, FileImage, Info } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useToast } from '../components/ToastContainer';
import SEOHead from '../components/SEOHead';
import { APP_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import { formatFileSize } from '../utils/performance';

const ImageOptimizerPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [optimizedImage, setOptimizedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState('jpeg');
  const [originalSize, setOriginalSize] = useState(0);
  const [optimizedSize, setOptimizedSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState('balanced');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > APP_CONFIG.maxFileSize) {
      showError('File too large', ERROR_MESSAGES.fileTooBig);
      return;
    }
    
    if (!APP_CONFIG.supportedImageTypes.includes(file.type)) {
      showError('Unsupported file type', ERROR_MESSAGES.unsupportedFileType);
      return;
    }

    setOriginalSize(file.size);
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setOptimizedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const optimizeImage = () => {
    if (!originalImage) return;

    setIsProcessing(true);
    
    // Adjust quality based on compression level
    let adjustedQuality = quality;
    switch (compressionLevel) {
      case 'maximum':
        adjustedQuality = Math.max(10, quality - 20);
        break;
      case 'balanced':
        adjustedQuality = quality;
        break;
      case 'minimal':
        adjustedQuality = Math.min(100, quality + 10);
        break;
    }
    
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Calculate optimal dimensions for better compression
      let { width, height } = img;
      const maxDimension = 2048; // Reasonable max for web
      
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Use better image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const optimized = canvas.toDataURL(`image/${format}`, adjustedQuality / 100);
      setOptimizedImage(optimized);

      // Calculate optimized size (approximate)
      const optimizedSizeBytes = Math.round((optimized.length * 3) / 4);
      setOptimizedSize(optimizedSizeBytes);
      setIsProcessing(false);
      showSuccess('Image optimized successfully');
    };
    img.onerror = () => {
      setIsProcessing(false);
      showError('Failed to process image');
    };
    img.src = originalImage;
  };

  const downloadImage = () => {
    if (!optimizedImage) return;

    const link = document.createElement('a');
    link.download = `optimized-image.${format}`;
    link.href = optimizedImage;
    link.click();
    showSuccess(SUCCESS_MESSAGES.downloaded);
  };


  const compressionRatio = originalSize > 0 && optimizedSize > 0 
    ? Math.round(((originalSize - optimizedSize) / originalSize) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead 
        title="Image Optimizer"
        description="Compress and optimize images without losing quality. Reduce file sizes while maintaining visual quality."
        canonical="/image-optimizer"
      />
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl mb-6">
          <ImageIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent mb-4">
          Image Optimizer
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Compress and optimize images without losing quality. 
          <span className="text-teal-400"> Because nobody likes slow-loading websites!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload & Settings */}
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Upload Image</h3>
            
            <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center hover:border-teal-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {originalImage ? (
                <div className="space-y-4">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="max-w-full max-h-48 mx-auto rounded-lg"
                  />
                  <div className="text-gray-400">
                    Original size: {formatFileSize(originalSize)}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 rounded-xl text-teal-400 transition-colors"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileImage className="w-16 h-16 text-gray-500 mx-auto" />
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-8 py-4 bg-gradient-to-r from-teal-500 to-green-600 rounded-xl font-semibold text-white hover:from-teal-400 hover:to-green-500 transition-all duration-300"
                    >
                      <Upload className="w-5 h-5 inline mr-2" />
                      Choose Image
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Supports JPEG, PNG, WebP formats
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Optimization Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-400 text-sm mb-3">
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Lower size</span>
                  <span>Higher quality</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-3">Output Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-teal-500 focus:outline-none"
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-3">Compression Level</label>
                <select
                  value={compressionLevel}
                  onChange={(e) => setCompressionLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-teal-500 focus:outline-none"
                >
                  <option value="minimal">Minimal (Higher Quality)</option>
                  <option value="balanced">Balanced</option>
                  <option value="maximum">Maximum (Smaller Size)</option>
                </select>
              </div>

              <button
                onClick={optimizeImage}
                disabled={!originalImage || isProcessing}
                className="w-full px-6 py-4 bg-gradient-to-r from-teal-500 to-green-600 rounded-xl font-semibold text-white hover:from-teal-400 hover:to-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Optimize Image</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Performance Notice */}
        <div className="lg:col-span-2">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Info className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-semibold text-blue-400">Performance Notice</h4>
            </div>
            <p className="text-blue-200 text-sm">
              This tool provides basic image optimization. For production use, consider server-side optimization 
              with tools like Sharp, ImageMagick, or cloud services like Cloudinary for better compression and format support.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Optimized Image */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Optimized Result</h3>
            
            {optimizedImage ? (
              <div className="space-y-4">
                <img
                  src={optimizedImage}
                  alt="Optimized"
                  className="max-w-full max-h-48 mx-auto rounded-lg"
                />
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-teal-400">{formatFileSize(optimizedSize)}</div>
                    <div className="text-gray-400 text-sm">New Size</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-400">{compressionRatio}%</div>
                    <div className="text-gray-400 text-sm">Reduced</div>
                  </div>
                </div>

                <button
                  onClick={downloadImage}
                  className="w-full px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Optimized</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileImage className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">
                  Upload an image and click optimize to see results
                </p>
              </div>
            )}
          </div>

          {/* Stats */}
          {originalImage && optimizedImage && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Compression Stats</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Original Size:</span>
                  <span className="text-white font-mono">{formatFileSize(originalSize)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Optimized Size:</span>
                  <span className="text-white font-mono">{formatFileSize(optimizedSize)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Savings:</span>
                  <span className="text-green-400 font-mono">{formatFileSize(originalSize - optimizedSize)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Compression Ratio:</span>
                  <span className="text-teal-400 font-mono">{compressionRatio}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🖼️ Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• JPEG is best for photos with many colors</li>
              <li>• PNG is ideal for images with transparency</li>
              <li>• WebP offers the best compression for modern browsers</li>
              <li>• Quality 80-90% usually provides good balance</li>
              <li>• Large images are automatically resized for web use</li>
              <li>• Use maximum compression for thumbnails</li>
            </ul>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageOptimizerPage;