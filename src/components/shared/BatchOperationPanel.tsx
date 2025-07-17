import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Upload, Download, Trash2, BarChart3 } from 'lucide-react';
import { BatchOperation } from '../../utils/workflowManager';
import { createBatchOperation, processBatchOperation, workflowManager } from '../../utils/workflowManager';
import { useToast } from '../ToastContainer';

interface BatchOperationPanelProps {
  toolId: string;
  onBatchProcess: (input: any) => Promise<any>;
  inputPlaceholder?: string;
  className?: string;
}

const BatchOperationPanel: React.FC<BatchOperationPanelProps> = ({
  toolId,
  onBatchProcess,
  inputPlaceholder = 'Enter inputs, one per line',
  className = ''
}) => {
  const { showSuccess, showError, showInfo } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [currentBatch, setCurrentBatch] = useState<BatchOperation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check for any existing batch operations for this tool
    const batches = workflowManager.getAllBatchOperations()
      .filter(batch => batch.toolId === toolId && batch.status === 'processing');
    
    if (batches.length > 0) {
      setCurrentBatch(batches[0]);
      setIsProcessing(true);
    }
  }, [toolId]);

  const parseBatchInput = (input: string): any[] => {
    return input
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  const handleStartBatch = async () => {
    const inputs = parseBatchInput(batchInput);
    
    if (inputs.length === 0) {
      showError('No inputs provided', 'Please enter at least one input');
      return;
    }

    if (inputs.length > 100) {
      showError('Too many inputs', 'Maximum 100 inputs allowed per batch');
      return;
    }

    try {
      const batchId = createBatchOperation(toolId, inputs);
      const batch = workflowManager.getBatchOperation(batchId);
      
      if (!batch) {
        throw new Error('Failed to create batch operation');
      }

      setCurrentBatch(batch);
      setIsProcessing(true);
      setProgress(0);

      showInfo('Batch processing started', `Processing ${inputs.length} inputs`);

      await processBatchOperation(
        batchId,
        onBatchProcess,
        (progressValue) => {
          setProgress(progressValue);
          const updatedBatch = workflowManager.getBatchOperation(batchId);
          if (updatedBatch) {
            setCurrentBatch(updatedBatch);
          }
        }
      );

      const finalBatch = workflowManager.getBatchOperation(batchId);
      if (finalBatch) {
        setCurrentBatch(finalBatch);
        
        if (finalBatch.status === 'completed') {
          showSuccess(
            'Batch processing completed',
            `Processed ${finalBatch.outputs.length} inputs successfully`
          );
        } else {
          showError(
            'Batch processing failed',
            `${finalBatch.errors.length} errors occurred`
          );
        }
      }
    } catch (error) {
      showError(
        'Batch processing failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopBatch = () => {
    setIsProcessing(false);
    if (currentBatch) {
      showInfo('Batch processing stopped');
    }
  };

  const handleClearBatch = () => {
    if (currentBatch) {
      workflowManager.deleteBatchOperation(currentBatch.id);
    }
    setCurrentBatch(null);
    setBatchInput('');
    setProgress(0);
    setIsProcessing(false);
  };

  const handleExportResults = () => {
    if (!currentBatch || currentBatch.outputs.length === 0) return;

    const results = currentBatch.inputs.map((input, index) => ({
      input,
      output: currentBatch.outputs[index],
      success: currentBatch.outputs[index] !== null
    }));

    const csvContent = [
      'Input,Output,Success',
      ...results.map(r => `"${r.input}","${r.output}","${r.success}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch-results-${toolId}-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSuccess('Results exported', 'Batch results saved as CSV');
  };

  const handleImportInputs = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setBatchInput(content);
      showInfo('Inputs imported', `Loaded ${parseBatchInput(content).length} inputs`);
    };
    reader.readAsText(file);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg transition-colors ${className}`}
      >
        <BarChart3 className="w-4 h-4" />
        Batch Process
      </button>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Batch Processing
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Batch Inputs
            </label>
            <div className="space-y-2">
              <textarea
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder={inputPlaceholder}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isProcessing}
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleImportInputs}
                  className="hidden"
                  id="import-inputs"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="import-inputs"
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm cursor-pointer transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  Import
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {parseBatchInput(batchInput).length} inputs
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {!isProcessing ? (
              <button
                onClick={handleStartBatch}
                disabled={parseBatchInput(batchInput).length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Start Batch
              </button>
            ) : (
              <button
                onClick={handleStopBatch}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            )}

            {currentBatch && (
              <>
                <button
                  onClick={handleExportResults}
                  disabled={currentBatch.outputs.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Results
                </button>
                <button
                  onClick={handleClearBatch}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Progress */}
          {currentBatch && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Status: <span className="capitalize font-medium">{currentBatch.status}</span>
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {currentBatch.inputs.length}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-600 dark:text-green-400">
                    {currentBatch.outputs.filter(o => o !== null).length}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Success</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-red-600 dark:text-red-400">
                    {currentBatch.errors.length}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Errors</div>
                </div>
              </div>

              {currentBatch.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                    Errors ({currentBatch.errors.length}):
                  </div>
                  <div className="text-xs text-red-700 dark:text-red-300 space-y-1 max-h-20 overflow-y-auto">
                    {currentBatch.errors.slice(0, 5).map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                    {currentBatch.errors.length > 5 && (
                      <div>... and {currentBatch.errors.length - 5} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchOperationPanel;