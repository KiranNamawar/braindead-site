import React, { useState, useRef } from 'react';
import { Upload, Play, Pause, Square, Download, AlertCircle, CheckCircle, Loader2, FileText, Trash2 } from 'lucide-react';
import { createBatchExport, processBatchExport, exportManager } from '../../utils/exportManager';
import { useToast } from '../ToastContainer';

interface BatchProcessorProps {
  toolId: string;
  toolName: string;
  processor: (input: any) => Promise<any>;
  inputParser?: (text: string) => any[];
  placeholder?: string;
  className?: string;
}

interface BatchJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
  progress: number;
  totalItems: number;
  processedItems: number;
  results: any[];
  errors: string[];
  startTime?: Date;
  endTime?: Date;
}

const BatchProcessor: React.FC<BatchProcessorProps> = ({
  toolId,
  toolName,
  processor,
  inputParser,
  placeholder = "Enter multiple inputs, one per line...",
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [currentJob, setCurrentJob] = useState<BatchJob | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'txt'>('json');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingRef = useRef<boolean>(false);
  
  const { showToast } = useToast();

  const parseInput = (text: string): any[] => {
    if (inputParser) {
      return inputParser(text);
    }
    
    // Default parser: split by lines and filter empty lines
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  };

  const startBatchProcessing = async () => {
    if (!inputText.trim()) {
      showToast({
        type: 'warning',
        title: 'No Input',
        message: 'Please provide input data for batch processing.'
      });
      return;
    }

    try {
      const inputs = parseInput(inputText);
      if (inputs.length === 0) {
        showToast({
          type: 'warning',
          title: 'No Valid Input',
          message: 'No valid input items found. Please check your input format.'
        });
        return;
      }

      const jobId = createBatchExport(toolId, inputs, exportFormat);
      
      const job: BatchJob = {
        id: jobId,
        status: 'processing',
        progress: 0,
        totalItems: inputs.length,
        processedItems: 0,
        results: [],
        errors: [],
        startTime: new Date()
      };

      setCurrentJob(job);
      processingRef.current = true;
      setIsPaused(false);

      await processBatchExport(
        jobId,
        async (input: any) => {
          // Check if processing is paused
          while (isPaused && processingRef.current) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // Check if processing was stopped
          if (!processingRef.current) {
            throw new Error('Processing stopped by user');
          }

          return await processor(input);
        },
        (progress: number) => {
          setCurrentJob(prev => prev ? {
            ...prev,
            progress,
            processedItems: Math.floor((progress / 100) * inputs.length)
          } : null);
        }
      );

      const batchJob = exportManager.getBatchExportJob(jobId);
      if (batchJob) {
        setCurrentJob(prev => prev ? {
          ...prev,
          status: batchJob.status,
          results: batchJob.results,
          errors: batchJob.errors,
          endTime: batchJob.endTime
        } : null);

        if (batchJob.status === 'completed') {
          showToast({
            type: 'success',
            title: 'Batch Processing Complete',
            message: `Successfully processed ${batchJob.results.filter(r => r !== null).length} out of ${inputs.length} items.`
          });
        } else if (batchJob.status === 'failed') {
          showToast({
            type: 'error',
            title: 'Batch Processing Failed',
            message: `Processing failed with ${batchJob.errors.length} errors.`
          });
        }
      }
    } catch (error) {
      console.error('Batch processing failed:', error);
      setCurrentJob(prev => prev ? { ...prev, status: 'failed' } : null);
      showToast({
        type: 'error',
        title: 'Processing Failed',
        message: error instanceof Error ? error.message : 'Batch processing failed'
      });
    } finally {
      processingRef.current = false;
    }
  };

  const pauseProcessing = () => {
    setIsPaused(true);
    setCurrentJob(prev => prev ? { ...prev, status: 'paused' } : null);
  };

  const resumeProcessing = () => {
    setIsPaused(false);
    setCurrentJob(prev => prev ? { ...prev, status: 'processing' } : null);
  };

  const stopProcessing = () => {
    processingRef.current = false;
    setIsPaused(false);
    setCurrentJob(prev => prev ? { ...prev, status: 'failed' } : null);
  };

  const downloadResults = async () => {
    if (!currentJob || !currentJob.results.length) return;

    try {
      const validResults = currentJob.results.filter(r => r !== null);
      const blob = await exportManager.exportData(toolId, validResults, {
        format: exportFormat,
        includeMetadata: true,
        filename: `${toolName.toLowerCase().replace(/\s+/g, '-')}-batch-results`
      });

      exportManager.downloadBlob(blob, `${toolName}-batch-results.${exportFormat}`);
      
      showToast({
        type: 'success',
        title: 'Results Downloaded',
        message: `Batch results exported as ${exportFormat.toUpperCase()}`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download batch results'
      });
    }
  };

  const clearJob = () => {
    setCurrentJob(null);
    setInputText('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors ${className}`}
        title="Batch Processing"
      >
        <Upload className="w-4 h-4" />
        Batch Process
      </button>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Batch Processing</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {!currentJob ? (
        <>
          {/* Input Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Input Data
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <FileText className="w-4 h-4" />
                Upload File
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={placeholder}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter one item per line, or upload a text file
            </p>
          </div>

          {/* Export Format */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="flex gap-2">
              {(['json', 'csv', 'txt'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    exportFormat === format
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startBatchProcessing}
            disabled={!inputText.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <Play className="w-4 h-4" />
            Start Batch Processing
          </button>
        </>
      ) : (
        <>
          {/* Job Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">
                {currentJob.processedItems} / {currentJob.totalItems}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentJob.status === 'completed' ? 'bg-green-500' :
                  currentJob.status === 'failed' ? 'bg-red-500' :
                  currentJob.status === 'paused' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}
                style={{ width: `${currentJob.progress}%` }}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              {currentJob.status === 'processing' && (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              )}
              {currentJob.status === 'completed' && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {currentJob.status === 'failed' && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm text-gray-600 capitalize">
                {currentJob.status}
              </span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2 mb-4">
            {currentJob.status === 'processing' && (
              <button
                onClick={pauseProcessing}
                className="flex items-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            )}
            
            {currentJob.status === 'paused' && (
              <button
                onClick={resumeProcessing}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                <Play className="w-4 h-4" />
                Resume
              </button>
            )}

            {(currentJob.status === 'processing' || currentJob.status === 'paused') && (
              <button
                onClick={stopProcessing}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            )}

            {(currentJob.status === 'completed' || currentJob.status === 'failed') && (
              <>
                <button
                  onClick={downloadResults}
                  disabled={!currentJob.results.some(r => r !== null)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Results
                </button>
                
                <button
                  onClick={clearJob}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Results Summary */}
          {currentJob.results.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Results Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Successful:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {currentJob.results.filter(r => r !== null).length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Failed:</span>
                  <span className="ml-2 font-medium text-red-600">
                    {currentJob.errors.length}
                  </span>
                </div>
              </div>
              
              {currentJob.errors.length > 0 && (
                <details className="mt-3">
                  <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800">
                    View Errors ({currentJob.errors.length})
                  </summary>
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    {currentJob.errors.map((error, index) => (
                      <div key={index} className="text-xs text-red-600 py-1">
                        {error}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BatchProcessor;