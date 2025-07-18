// Advanced export and sharing capabilities for all tools
import { ToolExportData } from '../types';
import { toolRegistry } from './toolRegistry';
import { storageManager } from './storage';

export interface ExportOptions {
  format: 'json' | 'csv' | 'txt' | 'xml' | 'pdf' | 'html';
  includeMetadata?: boolean;
  compression?: boolean;
  filename?: string;
  customFields?: Record<string, any>;
}

export interface ShareableLink {
  id: string;
  toolId: string;
  configuration: any;
  data?: any;
  expiresAt: Date;
  createdAt: Date;
  accessCount: number;
  maxAccess?: number;
}

export interface BatchExportJob {
  id: string;
  toolId: string;
  items: any[];
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  results: any[];
  errors: string[];
  startTime?: Date;
  endTime?: Date;
}

class ExportManager {
  private shareableLinks: Map<string, ShareableLink> = new Map();
  private batchJobs: Map<string, BatchExportJob> = new Map();

  constructor() {
    this.loadShareableLinks();
    this.cleanupExpiredLinks();
  }

  private loadShareableLinks(): void {
    try {
      const stored = localStorage.getItem('shareable-links');
      if (stored) {
        const links = JSON.parse(stored);
        links.forEach((link: ShareableLink) => {
          link.createdAt = new Date(link.createdAt);
          link.expiresAt = new Date(link.expiresAt);
          this.shareableLinks.set(link.id, link);
        });
      }
    } catch (error) {
      console.warn('Failed to load shareable links:', error);
    }
  }

  private saveShareableLinks(): void {
    try {
      const links = Array.from(this.shareableLinks.values());
      localStorage.setItem('shareable-links', JSON.stringify(links));
    } catch (error) {
      console.warn('Failed to save shareable links:', error);
    }
  }

  private cleanupExpiredLinks(): void {
    const now = new Date();
    const expired: string[] = [];

    this.shareableLinks.forEach((link, id) => {
      if (link.expiresAt < now) {
        expired.push(id);
      }
    });

    expired.forEach(id => this.shareableLinks.delete(id));
    
    if (expired.length > 0) {
      this.saveShareableLinks();
    }
  }

  // Multi-format export functionality
  public async exportData(
    toolId: string, 
    data: any, 
    options: ExportOptions
  ): Promise<Blob> {
    const tool = toolRegistry.getTool(toolId);
    if (!tool) {
      throw new Error(`Tool ${toolId} not found`);
    }

    const exportData: ToolExportData = {
      toolId,
      data,
      format: options.format,
      timestamp: new Date(),
      metadata: {
        toolName: tool.name,
        version: '1.0.0',
        exportedBy: 'BrainDead.site',
        ...options.customFields
      }
    };

    let content: string;
    let mimeType: string;

    switch (options.format) {
      case 'json':
        content = JSON.stringify(
          options.includeMetadata ? exportData : data, 
          null, 
          2
        );
        mimeType = 'application/json';
        break;

      case 'csv':
        content = this.convertToCSV(data, exportData.metadata);
        mimeType = 'text/csv';
        break;

      case 'txt':
        content = this.convertToText(data, exportData.metadata);
        mimeType = 'text/plain';
        break;

      case 'xml':
        content = this.convertToXML(data, exportData.metadata);
        mimeType = 'application/xml';
        break;

      case 'html':
        content = this.convertToHTML(data, exportData.metadata);
        mimeType = 'text/html';
        break;

      case 'pdf':
        // For PDF, we'll generate HTML and let the browser handle PDF conversion
        content = this.convertToPDFHTML(data, exportData.metadata);
        mimeType = 'text/html';
        break;

      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }

    // Track export
    storageManager.addExportHistory(toolId, options.format, content.length);

    const blob = new Blob([content], { type: mimeType });
    
    if (options.compression && options.format !== 'pdf') {
      return this.compressBlob(blob);
    }

    return blob;
  }

  private convertToCSV(data: any, metadata?: Record<string, any>): string {
    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      
      // Get all unique keys from all objects
      const keys = new Set<string>();
      data.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => keys.add(key));
        }
      });

      const headers = Array.from(keys);
      const csvRows = [headers.join(',')];

      data.forEach(item => {
        const row = headers.map(header => {
          const value = item[header] ?? '';
          // Escape commas and quotes
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(row.join(','));
      });

      return csvRows.join('\n');
    } else if (typeof data === 'object' && data !== null) {
      // Convert object to key-value CSV
      const csvRows = ['Key,Value'];
      Object.entries(data).forEach(([key, value]) => {
        const escapedValue = String(value).replace(/"/g, '""');
        csvRows.push(`"${key}","${escapedValue}"`);
      });
      return csvRows.join('\n');
    } else {
      return `Value\n"${String(data).replace(/"/g, '""')}"`;
    }
  }

  private convertToText(data: any, metadata?: Record<string, any>): string {
    let content = '';
    
    if (metadata) {
      content += `Generated by ${metadata.toolName}\n`;
      content += `Export Date: ${metadata.timestamp || new Date().toISOString()}\n`;
      content += `Source: BrainDead.site\n\n`;
      content += '='.repeat(50) + '\n\n';
    }

    if (typeof data === 'string') {
      content += data;
    } else if (Array.isArray(data)) {
      data.forEach((item, index) => {
        content += `Item ${index + 1}:\n`;
        content += typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item);
        content += '\n\n';
      });
    } else if (typeof data === 'object' && data !== null) {
      Object.entries(data).forEach(([key, value]) => {
        content += `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}\n`;
      });
    } else {
      content += String(data);
    }

    return content;
  }

  private convertToXML(data: any, metadata?: Record<string, any>): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<export>\n';
    
    if (metadata) {
      xml += '  <metadata>\n';
      Object.entries(metadata).forEach(([key, value]) => {
        xml += `    <${key}>${this.escapeXML(String(value))}</${key}>\n`;
      });
      xml += '  </metadata>\n';
    }

    xml += '  <data>\n';
    xml += this.objectToXML(data, '    ');
    xml += '  </data>\n';
    xml += '</export>';

    return xml;
  }

  private objectToXML(obj: any, indent: string = ''): string {
    if (Array.isArray(obj)) {
      return obj.map((item, index) => 
        `${indent}<item index="${index}">\n${this.objectToXML(item, indent + '  ')}\n${indent}</item>`
      ).join('\n');
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj).map(([key, value]) => {
        const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
        if (typeof value === 'object') {
          return `${indent}<${safeKey}>\n${this.objectToXML(value, indent + '  ')}\n${indent}</${safeKey}>`;
        } else {
          return `${indent}<${safeKey}>${this.escapeXML(String(value))}</${safeKey}>`;
        }
      }).join('\n');
    } else {
      return `${indent}${this.escapeXML(String(obj))}`;
    }
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private convertToHTML(data: any, metadata?: Record<string, any>): string {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Export from ${metadata?.toolName || 'BrainDead.site'}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
        .metadata { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .data-section { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; }
        pre { background: #f3f4f6; padding: 15px; border-radius: 6px; overflow-x: auto; }
        .object-key { font-weight: 600; color: #374151; }
    </style>
</head>
<body>`;

    html += `<div class="header">
        <h1>Export from ${metadata?.toolName || 'BrainDead.site'}</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>`;

    if (metadata) {
      html += '<div class="metadata"><h2>Export Information</h2>';
      Object.entries(metadata).forEach(([key, value]) => {
        html += `<p><span class="object-key">${key}:</span> ${value}</p>`;
      });
      html += '</div>';
    }

    html += '<div class="data-section"><h2>Data</h2>';
    html += this.dataToHTML(data);
    html += '</div>';

    html += '</body></html>';
    return html;
  }

  private dataToHTML(data: any): string {
    if (Array.isArray(data)) {
      if (data.length === 0) return '<p>No data</p>';
      
      // Check if array contains objects with consistent keys
      if (data.every(item => typeof item === 'object' && item !== null)) {
        const keys = new Set<string>();
        data.forEach(item => Object.keys(item).forEach(key => keys.add(key)));
        
        if (keys.size > 0) {
          let table = '<table><thead><tr>';
          Array.from(keys).forEach(key => {
            table += `<th>${key}</th>`;
          });
          table += '</tr></thead><tbody>';
          
          data.forEach(item => {
            table += '<tr>';
            Array.from(keys).forEach(key => {
              const value = item[key];
              table += `<td>${typeof value === 'object' ? JSON.stringify(value) : value || ''}</td>`;
            });
            table += '</tr>';
          });
          
          table += '</tbody></table>';
          return table;
        }
      }
      
      // Fallback to list
      let list = '<ul>';
      data.forEach(item => {
        list += `<li>${typeof item === 'object' ? JSON.stringify(item, null, 2) : item}</li>`;
      });
      list += '</ul>';
      return list;
    } else if (typeof data === 'object' && data !== null) {
      let content = '<div>';
      Object.entries(data).forEach(([key, value]) => {
        content += `<p><span class="object-key">${key}:</span> `;
        if (typeof value === 'object') {
          content += `<pre>${JSON.stringify(value, null, 2)}</pre>`;
        } else {
          content += `${value}`;
        }
        content += '</p>';
      });
      content += '</div>';
      return content;
    } else {
      return `<pre>${String(data)}</pre>`;
    }
  }

  private convertToPDFHTML(data: any, metadata?: Record<string, any>): string {
    // Enhanced HTML for PDF generation with better styling
    const html = this.convertToHTML(data, metadata);
    return html.replace(
      '<style>',
      `<style>
        @media print {
          body { margin: 0; }
          .header { page-break-after: avoid; }
        }
        @page { margin: 1in; }
      `
    );
  }

  private async compressBlob(blob: Blob): Promise<Blob> {
    // Simple compression using gzip (if supported)
    if ('CompressionStream' in window) {
      const stream = blob.stream().pipeThrough(new CompressionStream('gzip'));
      return new Blob([await new Response(stream).arrayBuffer()], {
        type: blob.type + '; charset=utf-8'
      });
    }
    return blob;
  }

  // Shareable links functionality
  public createShareableLink(
    toolId: string,
    configuration: any,
    data?: any,
    expirationHours: number = 24,
    maxAccess?: number
  ): string {
    const linkId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    const shareableLink: ShareableLink = {
      id: linkId,
      toolId,
      configuration,
      data,
      expiresAt,
      createdAt: new Date(),
      accessCount: 0,
      maxAccess
    };

    this.shareableLinks.set(linkId, shareableLink);
    this.saveShareableLinks();

    // Return the shareable URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/${toolId}?share=${linkId}`;
  }

  public getShareableLink(linkId: string): ShareableLink | null {
    this.cleanupExpiredLinks();
    
    const link = this.shareableLinks.get(linkId);
    if (!link) return null;

    // Check if link is still valid
    if (link.expiresAt < new Date()) {
      this.shareableLinks.delete(linkId);
      this.saveShareableLinks();
      return null;
    }

    // Check access limit
    if (link.maxAccess && link.accessCount >= link.maxAccess) {
      return null;
    }

    // Increment access count
    link.accessCount++;
    this.saveShareableLinks();

    return link;
  }

  public getAllShareableLinks(): ShareableLink[] {
    this.cleanupExpiredLinks();
    return Array.from(this.shareableLinks.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public deleteShareableLink(linkId: string): boolean {
    const deleted = this.shareableLinks.delete(linkId);
    if (deleted) {
      this.saveShareableLinks();
    }
    return deleted;
  }

  // Batch processing functionality
  public createBatchExportJob(
    toolId: string,
    items: any[],
    format: string
  ): string {
    const jobId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: BatchExportJob = {
      id: jobId,
      toolId,
      items,
      format,
      status: 'pending',
      progress: 0,
      results: [],
      errors: []
    };

    this.batchJobs.set(jobId, job);
    return jobId;
  }

  public async processBatchExport(
    jobId: string,
    processor: (item: any) => Promise<any>,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const job = this.batchJobs.get(jobId);
    if (!job) {
      throw new Error('Batch job not found');
    }

    job.status = 'processing';
    job.startTime = new Date();
    job.results = [];
    job.errors = [];

    try {
      for (let i = 0; i < job.items.length; i++) {
        try {
          const result = await processor(job.items[i]);
          job.results.push(result);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          job.errors.push(`Item ${i + 1}: ${errorMsg}`);
          job.results.push(null);
        }

        job.progress = ((i + 1) / job.items.length) * 100;
        if (onProgress) {
          onProgress(job.progress);
        }

        // Small delay to prevent blocking
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }

      job.status = job.errors.length === 0 ? 'completed' : 'failed';
    } catch (error) {
      job.status = 'failed';
      job.errors.push(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      job.endTime = new Date();
    }
  }

  public getBatchExportJob(jobId: string): BatchExportJob | undefined {
    return this.batchJobs.get(jobId);
  }

  public getAllBatchJobs(): BatchExportJob[] {
    return Array.from(this.batchJobs.values())
      .sort((a, b) => (b.startTime?.getTime() || 0) - (a.startTime?.getTime() || 0));
  }

  public deleteBatchJob(jobId: string): boolean {
    return this.batchJobs.delete(jobId);
  }

  // Utility functions
  public downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public getExportHistory(): Array<{
    toolId: string;
    format: string;
    size: number;
    timestamp: Date;
  }> {
    return storageManager.getExportHistory();
  }

  public clearExportHistory(): void {
    storageManager.clearExportHistory();
  }
}

// Create singleton instance
export const exportManager = new ExportManager();

// Convenience functions
export const exportToolData = (toolId: string, data: any, options: ExportOptions) =>
  exportManager.exportData(toolId, data, options);

export const createShareableLink = (toolId: string, config: any, data?: any, hours?: number, maxAccess?: number) =>
  exportManager.createShareableLink(toolId, config, data, hours, maxAccess);

export const getShareableLink = (linkId: string) =>
  exportManager.getShareableLink(linkId);

export const createBatchExport = (toolId: string, items: any[], format: string) =>
  exportManager.createBatchExportJob(toolId, items, format);

export const processBatchExport = (jobId: string, processor: (item: any) => Promise<any>, onProgress?: (progress: number) => void) =>
  exportManager.processBatchExport(jobId, processor, onProgress);

export const downloadFile = (blob: Blob, filename: string) =>
  exportManager.downloadBlob(blob, filename);