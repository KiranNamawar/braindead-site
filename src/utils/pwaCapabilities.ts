// PWA Advanced Capabilities Manager
// Handles File System Access, Clipboard API, Web Share API, and Background Processing

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
  getFile(): Promise<File>;
  name: string;
  kind: 'file';
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: string | BufferSource | Blob): Promise<void>;
  close(): Promise<void>;
}

interface FileSystemDirectoryHandle {
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  name: string;
  kind: 'directory';
}

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

interface BackgroundTaskOptions {
  priority?: 'high' | 'normal' | 'low';
  timeout?: number;
  retries?: number;
}

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

class PWACapabilitiesManager {
  private backgroundTasks: Map<string, BackgroundTask> = new Map();
  private workers: Map<string, Worker> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeCapabilities();
  }

  private initializeCapabilities(): void {
    // Check and log available capabilities
    console.log('PWA Capabilities Available:', {
      fileSystemAccess: this.supportsFileSystemAccess(),
      clipboardAPI: this.supportsClipboardAPI(),
      webShareAPI: this.supportsWebShareAPI(),
      webWorkers: this.supportsWebWorkers(),
      offscreenCanvas: this.supportsOffscreenCanvas()
    });
  }

  // File System Access API
  public supportsFileSystemAccess(): boolean {
    return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
  }

  public async saveFile(
    content: string | Blob,
    filename: string,
    mimeType: string = 'text/plain'
  ): Promise<boolean> {
    if (!this.supportsFileSystemAccess()) {
      // Fallback to download
      return this.downloadFile(content, filename, mimeType);
    }

    try {
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Files',
          accept: { [mimeType]: [`.${filename.split('.').pop()}`] }
        }]
      }) as FileSystemFileHandle;

      const writable = await fileHandle.createWritable();
      
      if (typeof content === 'string') {
        await writable.write(content);
      } else {
        await writable.write(content);
      }
      
      await writable.close();
      
      console.log('File saved successfully:', filename);
      this.emit('file-saved', { filename, success: true });
      return true;
    } catch (error) {
      console.error('Failed to save file:', error);
      this.emit('file-save-error', { filename, error });
      
      // Fallback to download
      return this.downloadFile(content, filename, mimeType);
    }
  }

  public async openFile(accept?: string[]): Promise<File | null> {
    if (!this.supportsFileSystemAccess()) {
      // Fallback to file input
      return this.openFileWithInput(accept);
    }

    try {
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: accept ? [{
          description: 'Files',
          accept: accept.reduce((acc, type) => {
            acc[type] = [`.${type.split('/')[1]}`];
            return acc;
          }, {} as Record<string, string[]>)
        }] : undefined
      }) as FileSystemFileHandle[];

      const file = await fileHandle.getFile();
      console.log('File opened successfully:', file.name);
      this.emit('file-opened', { filename: file.name, size: file.size });
      return file;
    } catch (error) {
      console.error('Failed to open file:', error);
      this.emit('file-open-error', { error });
      return null;
    }
  }

  private downloadFile(content: string | Blob, filename: string, mimeType: string): boolean {
    try {
      const blob = typeof content === 'string' 
        ? new Blob([content], { type: mimeType })
        : content;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('File downloaded successfully:', filename);
      this.emit('file-downloaded', { filename, success: true });
      return true;
    } catch (error) {
      console.error('Failed to download file:', error);
      this.emit('file-download-error', { filename, error });
      return false;
    }
  }

  private openFileWithInput(accept?: string[]): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      if (accept) {
        input.accept = accept.join(',');
      }
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        resolve(file || null);
      };
      
      input.oncancel = () => resolve(null);
      input.click();
    });
  }

  // Clipboard API
  public supportsClipboardAPI(): boolean {
    return 'clipboard' in navigator && 'writeText' in navigator.clipboard;
  }

  public async copyToClipboard(text: string): Promise<boolean> {
    if (!this.supportsClipboardAPI()) {
      return this.fallbackCopyToClipboard(text);
    }

    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard');
      this.emit('clipboard-copy-success', { text: text.substring(0, 50) + '...' });
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      this.emit('clipboard-copy-error', { error });
      return this.fallbackCopyToClipboard(text);
    }
  }

  public async readFromClipboard(): Promise<string | null> {
    if (!this.supportsClipboardAPI()) {
      console.warn('Clipboard read not supported');
      return null;
    }

    try {
      const text = await navigator.clipboard.readText();
      console.log('Text read from clipboard');
      this.emit('clipboard-read-success', { text: text.substring(0, 50) + '...' });
      return text;
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      this.emit('clipboard-read-error', { error });
      return null;
    }
  }

  private fallbackCopyToClipboard(text: string): boolean {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (result) {
        console.log('Text copied to clipboard (fallback)');
        this.emit('clipboard-copy-success', { text: text.substring(0, 50) + '...', fallback: true });
      }
      
      return result;
    } catch (error) {
      console.error('Fallback copy failed:', error);
      return false;
    }
  }

  // Web Share API
  public supportsWebShareAPI(): boolean {
    return 'share' in navigator;
  }

  public canShareFiles(): boolean {
    return this.supportsWebShareAPI() && 'canShare' in navigator && 
           (navigator as any).canShare({ files: [new File([''], 'test.txt')] });
  }

  public async shareContent(data: ShareData): Promise<boolean> {
    if (!this.supportsWebShareAPI()) {
      console.warn('Web Share API not supported');
      this.emit('share-not-supported', { data });
      return false;
    }

    try {
      // Check if we can share this data
      if ('canShare' in navigator && !(navigator as any).canShare(data)) {
        console.warn('Cannot share this data');
        this.emit('share-not-supported', { data });
        return false;
      }

      await navigator.share(data);
      console.log('Content shared successfully');
      this.emit('share-success', { data });
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Share cancelled by user');
        this.emit('share-cancelled', { data });
      } else {
        console.error('Failed to share content:', error);
        this.emit('share-error', { data, error });
      }
      return false;
    }
  }

  public async shareText(title: string, text: string, url?: string): Promise<boolean> {
    return this.shareContent({ title, text, url });
  }

  public async shareFile(file: File, title?: string, text?: string): Promise<boolean> {
    if (!this.canShareFiles()) {
      console.warn('File sharing not supported');
      return false;
    }

    return this.shareContent({
      title,
      text,
      files: [file]
    });
  }

  // Background Processing with Web Workers
  public supportsWebWorkers(): boolean {
    return typeof Worker !== 'undefined';
  }

  public supportsOffscreenCanvas(): boolean {
    return typeof OffscreenCanvas !== 'undefined';
  }

  public async runBackgroundTask<T>(
    taskName: string,
    workerScript: string,
    data: any,
    options: BackgroundTaskOptions = {}
  ): Promise<T> {
    if (!this.supportsWebWorkers()) {
      throw new Error('Web Workers not supported');
    }

    const taskId = `${taskName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const task: BackgroundTask = {
      id: taskId,
      name: taskName,
      status: 'pending',
      progress: 0,
      startTime: Date.now()
    };

    this.backgroundTasks.set(taskId, task);
    this.emit('background-task-started', { task });

    return new Promise((resolve, reject) => {
      try {
        const worker = new Worker(workerScript);
        this.workers.set(taskId, worker);

        // Set up timeout if specified
        let timeoutId: NodeJS.Timeout | undefined;
        if (options.timeout) {
          timeoutId = setTimeout(() => {
            worker.terminate();
            this.workers.delete(taskId);
            task.status = 'failed';
            task.error = 'Task timeout';
            task.endTime = Date.now();
            this.backgroundTasks.set(taskId, task);
            this.emit('background-task-failed', { task });
            reject(new Error('Task timeout'));
          }, options.timeout);
        }

        worker.onmessage = (event) => {
          const { type, data: responseData, progress, error } = event.data;

          switch (type) {
            case 'progress':
              task.progress = progress;
              task.status = 'running';
              this.backgroundTasks.set(taskId, task);
              this.emit('background-task-progress', { task, progress });
              break;

            case 'success':
              if (timeoutId) clearTimeout(timeoutId);
              worker.terminate();
              this.workers.delete(taskId);
              task.status = 'completed';
              task.progress = 100;
              task.result = responseData;
              task.endTime = Date.now();
              this.backgroundTasks.set(taskId, task);
              this.emit('background-task-completed', { task });
              resolve(responseData);
              break;

            case 'error':
              if (timeoutId) clearTimeout(timeoutId);
              worker.terminate();
              this.workers.delete(taskId);
              task.status = 'failed';
              task.error = error;
              task.endTime = Date.now();
              this.backgroundTasks.set(taskId, task);
              this.emit('background-task-failed', { task });
              reject(new Error(error));
              break;
          }
        };

        worker.onerror = (error) => {
          if (timeoutId) clearTimeout(timeoutId);
          worker.terminate();
          this.workers.delete(taskId);
          task.status = 'failed';
          task.error = error.message;
          task.endTime = Date.now();
          this.backgroundTasks.set(taskId, task);
          this.emit('background-task-failed', { task });
          reject(error);
        };

        // Start the task
        task.status = 'running';
        this.backgroundTasks.set(taskId, task);
        worker.postMessage({ data, options });

      } catch (error) {
        task.status = 'failed';
        task.error = (error as Error).message;
        task.endTime = Date.now();
        this.backgroundTasks.set(taskId, task);
        this.emit('background-task-failed', { task });
        reject(error);
      }
    });
  }

  public getBackgroundTasks(): BackgroundTask[] {
    return Array.from(this.backgroundTasks.values());
  }

  public getBackgroundTask(taskId: string): BackgroundTask | undefined {
    return this.backgroundTasks.get(taskId);
  }

  public cancelBackgroundTask(taskId: string): boolean {
    const worker = this.workers.get(taskId);
    const task = this.backgroundTasks.get(taskId);

    if (worker && task) {
      worker.terminate();
      this.workers.delete(taskId);
      task.status = 'failed';
      task.error = 'Cancelled by user';
      task.endTime = Date.now();
      this.backgroundTasks.set(taskId, task);
      this.emit('background-task-cancelled', { task });
      return true;
    }

    return false;
  }

  public clearCompletedTasks(): void {
    const completedTasks = Array.from(this.backgroundTasks.entries())
      .filter(([_, task]) => task.status === 'completed' || task.status === 'failed');

    completedTasks.forEach(([taskId]) => {
      this.backgroundTasks.delete(taskId);
    });

    this.emit('background-tasks-cleared', { count: completedTasks.length });
  }

  // Event emitter functionality
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }

    // Also dispatch as window event for components to listen
    window.dispatchEvent(new CustomEvent(`pwa-capability-${event}`, { detail: data }));
  }

  // Utility methods
  public getCapabilitiesStatus(): {
    fileSystemAccess: boolean;
    clipboardAPI: boolean;
    webShareAPI: boolean;
    webWorkers: boolean;
    offscreenCanvas: boolean;
    canShareFiles: boolean;
  } {
    return {
      fileSystemAccess: this.supportsFileSystemAccess(),
      clipboardAPI: this.supportsClipboardAPI(),
      webShareAPI: this.supportsWebShareAPI(),
      webWorkers: this.supportsWebWorkers(),
      offscreenCanvas: this.supportsOffscreenCanvas(),
      canShareFiles: this.canShareFiles()
    };
  }
}

// Create singleton instance
export const pwaCapabilities = new PWACapabilitiesManager();

// Convenience functions
export const saveFile = (content: string | Blob, filename: string, mimeType?: string) => 
  pwaCapabilities.saveFile(content, filename, mimeType);

export const openFile = (accept?: string[]) => 
  pwaCapabilities.openFile(accept);

export const copyToClipboard = (text: string) => 
  pwaCapabilities.copyToClipboard(text);

export const readFromClipboard = () => 
  pwaCapabilities.readFromClipboard();

export const shareContent = (data: ShareData) => 
  pwaCapabilities.shareContent(data);

export const shareText = (title: string, text: string, url?: string) => 
  pwaCapabilities.shareText(title, text, url);

export const shareFile = (file: File, title?: string, text?: string) => 
  pwaCapabilities.shareFile(file, title, text);

export const runBackgroundTask = <T>(taskName: string, workerScript: string, data: any, options?: BackgroundTaskOptions) => 
  pwaCapabilities.runBackgroundTask<T>(taskName, workerScript, data, options);

export const getCapabilitiesStatus = () => 
  pwaCapabilities.getCapabilitiesStatus();

export default pwaCapabilities;