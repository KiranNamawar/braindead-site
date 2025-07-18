// React Hook for PWA Capabilities
import { useState, useEffect, useCallback } from 'react';
import { pwaCapabilities } from '../utils/pwaCapabilities';

interface BackgroundTask {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  startTime?: number;
  endTime?: number;
}

interface PWACapabilitiesHook {
  // File System Access
  saveFile: (content: string | Blob, filename: string, mimeType?: string) => Promise<boolean>;
  openFile: (accept?: string[]) => Promise<File | null>;
  
  // Clipboard API
  copyToClipboard: (text: string) => Promise<boolean>;
  readFromClipboard: () => Promise<string | null>;
  
  // Web Share API
  shareText: (title: string, text: string, url?: string) => Promise<boolean>;
  shareFile: (file: File, title?: string, text?: string) => Promise<boolean>;
  
  // Background Processing
  runBackgroundTask: <T>(taskName: string, workerScript: string, data: any, options?: any) => Promise<T>;
  backgroundTasks: BackgroundTask[];
  cancelBackgroundTask: (taskId: string) => boolean;
  clearCompletedTasks: () => void;
  
  // Capabilities Status
  capabilities: {
    fileSystemAccess: boolean;
    clipboardAPI: boolean;
    webShareAPI: boolean;
    webWorkers: boolean;
    offscreenCanvas: boolean;
    canShareFiles: boolean;
  };
  
  // Loading States
  isLoading: boolean;
  error: string | null;
}

export const usePWACapabilities = (): PWACapabilitiesHook => {
  const [backgroundTasks, setBackgroundTasks] = useState<BackgroundTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capabilities] = useState(() => pwaCapabilities.getCapabilitiesStatus());

  // Update background tasks when they change
  useEffect(() => {
    const updateTasks = () => {
      setBackgroundTasks(pwaCapabilities.getBackgroundTasks());
    };

    const handleTaskEvent = () => {
      updateTasks();
    };

    // Listen for background task events
    pwaCapabilities.on('background-task-started', handleTaskEvent);
    pwaCapabilities.on('background-task-progress', handleTaskEvent);
    pwaCapabilities.on('background-task-completed', handleTaskEvent);
    pwaCapabilities.on('background-task-failed', handleTaskEvent);
    pwaCapabilities.on('background-task-cancelled', handleTaskEvent);

    // Initial load
    updateTasks();

    return () => {
      pwaCapabilities.off('background-task-started', handleTaskEvent);
      pwaCapabilities.off('background-task-progress', handleTaskEvent);
      pwaCapabilities.off('background-task-completed', handleTaskEvent);
      pwaCapabilities.off('background-task-failed', handleTaskEvent);
      pwaCapabilities.off('background-task-cancelled', handleTaskEvent);
    };
  }, []);

  // File System Access
  const saveFile = useCallback(async (content: string | Blob, filename: string, mimeType?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await pwaCapabilities.saveFile(content, filename, mimeType);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save file');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openFile = useCallback(async (accept?: string[]): Promise<File | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await pwaCapabilities.openFile(accept);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open file');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clipboard API
  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    setError(null);
    
    try {
      const result = await pwaCapabilities.copyToClipboard(text);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy to clipboard');
      return false;
    }
  }, []);

  const readFromClipboard = useCallback(async (): Promise<string | null> => {
    setError(null);
    
    try {
      const result = await pwaCapabilities.readFromClipboard();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read from clipboard');
      return null;
    }
  }, []);

  // Web Share API
  const shareText = useCallback(async (title: string, text: string, url?: string): Promise<boolean> => {
    setError(null);
    
    try {
      const result = await pwaCapabilities.shareText(title, text, url);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share text');
      return false;
    }
  }, []);

  const shareFile = useCallback(async (file: File, title?: string, text?: string): Promise<boolean> => {
    setError(null);
    
    try {
      const result = await pwaCapabilities.shareFile(file, title, text);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share file');
      return false;
    }
  }, []);

  // Background Processing
  const runBackgroundTask = useCallback(async <T>(
    taskName: string, 
    workerScript: string, 
    data: any, 
    options?: any
  ): Promise<T> => {
    setError(null);
    
    try {
      const result = await pwaCapabilities.runBackgroundTask<T>(taskName, workerScript, data, options);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Background task failed');
      throw err;
    }
  }, []);

  const cancelBackgroundTask = useCallback((taskId: string): boolean => {
    return pwaCapabilities.cancelBackgroundTask(taskId);
  }, []);

  const clearCompletedTasks = useCallback((): void => {
    pwaCapabilities.clearCompletedTasks();
  }, []);

  return {
    // File System Access
    saveFile,
    openFile,
    
    // Clipboard API
    copyToClipboard,
    readFromClipboard,
    
    // Web Share API
    shareText,
    shareFile,
    
    // Background Processing
    runBackgroundTask,
    backgroundTasks,
    cancelBackgroundTask,
    clearCompletedTasks,
    
    // Status
    capabilities,
    isLoading,
    error
  };
};

// Convenience hooks for specific capabilities
export const useFileSystemAccess = () => {
  const { saveFile, openFile, capabilities, isLoading, error } = usePWACapabilities();
  
  return {
    saveFile,
    openFile,
    supported: capabilities.fileSystemAccess,
    isLoading,
    error
  };
};

export const useClipboardAPI = () => {
  const { copyToClipboard, readFromClipboard, capabilities, error } = usePWACapabilities();
  
  return {
    copyToClipboard,
    readFromClipboard,
    supported: capabilities.clipboardAPI,
    error
  };
};

export const useWebShareAPI = () => {
  const { shareText, shareFile, capabilities, error } = usePWACapabilities();
  
  return {
    shareText,
    shareFile,
    supported: capabilities.webShareAPI,
    canShareFiles: capabilities.canShareFiles,
    error
  };
};

export const useBackgroundProcessing = () => {
  const { 
    runBackgroundTask, 
    backgroundTasks, 
    cancelBackgroundTask, 
    clearCompletedTasks, 
    capabilities, 
    error 
  } = usePWACapabilities();
  
  return {
    runBackgroundTask,
    backgroundTasks,
    cancelBackgroundTask,
    clearCompletedTasks,
    supported: capabilities.webWorkers,
    error
  };
};

export default usePWACapabilities;