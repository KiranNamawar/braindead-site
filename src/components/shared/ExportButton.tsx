import React, { useState } from 'react';
import { Download, FileText, Database, Code, FileImage } from 'lucide-react';
import { ToolExportData } from '../../types';
import { toolIntegrationManager } from '../../utils/toolIntegration';
import { useToast } from '../ToastContainer';

interface ExportButtonProps {
  toolId: string;
  data: any;
  filename?: string;
  formats?: Array<'json' | 'csv' | 'txt' | 'xml' | 'pdf'>;
  className?: string;
  variant?: 'button' | 'dropdown';
}

const ExportButton: React.FC<ExportButtonProps> = ({
  toolId,
  data,
  filename,
  formats = ['json', 'csv', 'txt'],
  className = '',
  variant = 'dropdown'
}) => {
  const { showSuccess, showError } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json':
        return <Code className="w-4 h-4" />;
      case 'csv':
        return <Database className="w-4 h-4" />;
      case 'txt':
        return <FileText className="w-4 h-4" />;
      case 'xml':
        return <Code className="w-4 h-4" />;
      case 'pdf':
        return <FileImage className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const generateFilename = (format: string) => {
    if (filename) return `${filename}.${format}`;
    const timestamp = new Date().toISOString().split('T')[0];
    return `${toolId}-export-${timestamp}.${format}`;
  };

  const exportData = async (format: 'json' | 'csv' | 'txt' | 'xml' | 'pdf') => {
    try {
      let exportContent: string;
      let mimeType: string;

      switch (format) {
        case 'json':
          exportContent = JSON.stringify(data, null, 2);
          mimeType = 'application/json';
          break;
        
        case 'csv':
          exportContent = convertToCSV(data);
          mimeType = 'text/csv';
          break;
        
        case 'txt':
          exportContent = typeof data === 'object' 
            ? JSON.stringify(data, null, 2)
            : String(data);
          mimeType = 'text/plain';
          break;
        
        case 'xml':
          exportContent = convertToXML(data);
          mimeType = 'application/xml';
          break;
        
        case 'pdf':
          // For PDF, we'll create a simple text-based PDF
          exportContent = createSimplePDF(data);
          mimeType = 'application/pdf';
          break;
        
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Create and download file
      const blob = new Blob([exportContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = generateFilename(format);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Track export
      const exportData: ToolExportData = toolIntegrationManager.exportData(
        toolId,
        data,
        format,
        { filename: generateFilename(format) }
      );

      showSuccess(`Exported as ${format.toUpperCase()}`, `File: ${generateFilename(format)}`);
      setIsOpen(false);
    } catch (error) {
      showError('Export failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const convertToCSV = (data: any): string => {
    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      
      // Get headers from first object
      const headers = Object.keys(data[0]);
      const csvHeaders = headers.join(',');
      
      // Convert rows
      const csvRows = data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      );
      
      return [csvHeaders, ...csvRows].join('\n');
    } else if (typeof data === 'object') {
      // Convert object to key-value CSV
      const entries = Object.entries(data);
      return entries.map(([key, value]) => `${key},${value}`).join('\n');
    } else {
      return String(data);
    }
  };

  const convertToXML = (data: any): string => {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    
    const objectToXML = (obj: any, rootName = 'root'): string => {
      if (typeof obj !== 'object' || obj === null) {
        return `<${rootName}>${String(obj)}</${rootName}>`;
      }
      
      if (Array.isArray(obj)) {
        const items = obj.map((item, index) => 
          objectToXML(item, `item_${index}`)
        ).join('\n  ');
        return `<${rootName}>\n  ${items}\n</${rootName}>`;
      }
      
      const entries = Object.entries(obj).map(([key, value]) => {
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
        return `  ${objectToXML(value, sanitizedKey)}`;
      }).join('\n');
      
      return `<${rootName}>\n${entries}\n</${rootName}>`;
    };
    
    return xmlHeader + objectToXML(data, 'export');
  };

  const createSimplePDF = (data: any): string => {
    // This is a very basic PDF-like format
    // In a real implementation, you'd use a library like jsPDF
    const content = typeof data === 'object' 
      ? JSON.stringify(data, null, 2)
      : String(data);
    
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${content.length}
>>
stream
BT
/F1 12 Tf
72 720 Td
(${content.replace(/\n/g, ') Tj T* (')}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${400 + content.length}
%%EOF`;
  };

  if (variant === 'button') {
    return (
      <button
        onClick={() => exportData(formats[0])}
        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors ${className}`}
      >
        <Download className="w-4 h-4" />
        Export
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="py-2">
              {formats.map(format => (
                <button
                  key={format}
                  onClick={() => exportData(format)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {getFormatIcon(format)}
                  <span className="capitalize">{format}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;