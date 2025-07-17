// Tool integration and data sharing utilities
import { ToolIntegration, SharedClipboard, ToolExportData } from '../types';

class ToolIntegrationManager {
  private integrations: Map<string, ToolIntegration[]> = new Map();
  private sharedClipboard: SharedClipboard | null = null;
  private integrationHistory: Array<{
    from: string;
    to: string;
    timestamp: Date;
    success: boolean;
  }> = [];

  constructor() {
    this.setupDefaultIntegrations();
  }

  private setupDefaultIntegrations(): void {
    // Hash Generator → Base64 Encoder
    this.registerIntegration({
      sourceToolId: 'hash-generator',
      targetToolId: 'base64-encoder',
      dataTransform: (hash: string) => ({ input: hash, operation: 'encode' }),
      compatibilityCheck: (data: any) => typeof data === 'string',
      description: 'Encode hash output as Base64'
    });

    // JSON Formatter → Text Analyzer
    this.registerIntegration({
      sourceToolId: 'json-formatter',
      targetToolId: 'text-analyzer',
      dataTransform: (json: string) => ({ text: json }),
      compatibilityCheck: (data: any) => typeof data === 'string',
      description: 'Analyze formatted JSON text'
    });

    // Gradient Generator → CSS Formatter
    this.registerIntegration({
      sourceToolId: 'gradient-generator',
      targetToolId: 'css-formatter',
      dataTransform: (gradient: any) => ({ 
        input: `background: ${gradient.css};`,
        operation: 'format'
      }),
      compatibilityCheck: (data: any) => data && data.css,
      description: 'Format gradient CSS code'
    });

    // Timestamp Converter → World Clock
    this.registerIntegration({
      sourceToolId: 'timestamp-converter',
      targetToolId: 'world-clock',
      dataTransform: (timestamp: number) => ({ 
        timestamp,
        showInTimezones: true
      }),
      compatibilityCheck: (data: any) => typeof data === 'number',
      description: 'Show timestamp in multiple timezones'
    });

    // Text Tools → Word Counter
    this.registerIntegration({
      sourceToolId: 'text-tools',
      targetToolId: 'word-counter',
      dataTransform: (text: string) => ({ text }),
      compatibilityCheck: (data: any) => typeof data === 'string',
      description: 'Analyze processed text'
    });
  }

  public registerIntegration(integration: ToolIntegration): void {
    const sourceIntegrations = this.integrations.get(integration.sourceToolId) || [];
    sourceIntegrations.push(integration);
    this.integrations.set(integration.sourceToolId, sourceIntegrations);
  }

  public getAvailableIntegrations(sourceToolId: string): ToolIntegration[] {
    return this.integrations.get(sourceToolId) || [];
  }

  public canIntegrateWith(sourceToolId: string, targetToolId: string, data: any): boolean {
    const integrations = this.getAvailableIntegrations(sourceToolId);
    const integration = integrations.find(i => i.targetToolId === targetToolId);
    
    if (!integration) return false;
    
    try {
      return integration.compatibilityCheck(data);
    } catch (error) {
      console.warn('Integration compatibility check failed:', error);
      return false;
    }
  }

  public integrateData(sourceToolId: string, targetToolId: string, data: any): any {
    const integrations = this.getAvailableIntegrations(sourceToolId);
    const integration = integrations.find(i => i.targetToolId === targetToolId);
    
    if (!integration) {
      throw new Error(`No integration found from ${sourceToolId} to ${targetToolId}`);
    }

    if (!integration.compatibilityCheck(data)) {
      throw new Error('Data is not compatible with target tool');
    }

    try {
      const transformedData = integration.dataTransform(data);
      
      // Record integration usage
      this.integrationHistory.push({
        from: sourceToolId,
        to: targetToolId,
        timestamp: new Date(),
        success: true
      });

      return transformedData;
    } catch (error) {
      this.integrationHistory.push({
        from: sourceToolId,
        to: targetToolId,
        timestamp: new Date(),
        success: false
      });
      throw error;
    }
  }

  public setSharedClipboard(data: SharedClipboard): void {
    this.sharedClipboard = data;
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('shared-clipboard', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to persist shared clipboard:', error);
    }
  }

  public getSharedClipboard(): SharedClipboard | null {
    if (this.sharedClipboard) {
      return this.sharedClipboard;
    }

    // Try to restore from localStorage
    try {
      const stored = localStorage.getItem('shared-clipboard');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if data is not too old (1 hour)
        const timestamp = new Date(parsed.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 1) {
          this.sharedClipboard = parsed;
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to restore shared clipboard:', error);
    }

    return null;
  }

  public clearSharedClipboard(): void {
    this.sharedClipboard = null;
    localStorage.removeItem('shared-clipboard');
  }

  public getIntegrationHistory(): Array<{
    from: string;
    to: string;
    timestamp: Date;
    success: boolean;
  }> {
    return [...this.integrationHistory];
  }

  public exportData(toolId: string, data: any, format: string, metadata?: Record<string, any>): ToolExportData {
    const exportData: ToolExportData = {
      toolId,
      data,
      format: format as any,
      timestamp: new Date(),
      metadata
    };

    return exportData;
  }

  public validateDataFormat(data: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'text':
        return typeof data === 'string';
      case 'number':
        return typeof data === 'number' && !isNaN(data);
      case 'json':
        try {
          if (typeof data === 'string') {
            JSON.parse(data);
            return true;
          }
          return typeof data === 'object';
        } catch {
          return false;
        }
      case 'binary':
        return data instanceof ArrayBuffer || data instanceof Uint8Array;
      case 'image':
        return data instanceof File && data.type.startsWith('image/');
      default:
        return true;
    }
  }

  public suggestIntegrations(toolId: string, outputData: any): ToolIntegration[] {
    const availableIntegrations = this.getAvailableIntegrations(toolId);
    
    return availableIntegrations.filter(integration => {
      try {
        return integration.compatibilityCheck(outputData);
      } catch {
        return false;
      }
    });
  }
}

// Create singleton instance
export const toolIntegrationManager = new ToolIntegrationManager();

// Convenience functions
export const registerToolIntegration = (integration: ToolIntegration) => {
  toolIntegrationManager.registerIntegration(integration);
};

export const getToolIntegrations = (sourceToolId: string) => {
  return toolIntegrationManager.getAvailableIntegrations(sourceToolId);
};

export const integrateToolData = (sourceToolId: string, targetToolId: string, data: any) => {
  return toolIntegrationManager.integrateData(sourceToolId, targetToolId, data);
};

export const setSharedData = (data: SharedClipboard) => {
  toolIntegrationManager.setSharedClipboard(data);
};

export const getSharedData = () => {
  return toolIntegrationManager.getSharedClipboard();
};

export const clearSharedData = () => {
  toolIntegrationManager.clearSharedClipboard();
};

export const suggestToolIntegrations = (toolId: string, outputData: any) => {
  return toolIntegrationManager.suggestIntegrations(toolId, outputData);
};