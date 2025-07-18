import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link2, AlertCircle, CheckCircle, Clock, Eye } from 'lucide-react';
import { getShareableLink } from '../../utils/exportManager';
import { useToast } from '../ToastContainer';

interface ShareableLinkHandlerProps {
  toolId: string;
  onDataLoaded?: (data: any, configuration: any) => void;
  className?: string;
}

const ShareableLinkHandler: React.FC<ShareableLinkHandlerProps> = ({
  toolId,
  onDataLoaded,
  className = ''
}) => {
  const [searchParams] = useSearchParams();
  const [linkData, setLinkData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { showToast } = useToast();

  useEffect(() => {
    const shareId = searchParams.get('share');
    if (shareId) {
      loadSharedData(shareId);
    }
  }, [searchParams]);

  const loadSharedData = async (shareId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const sharedLink = getShareableLink(shareId);
      
      if (!sharedLink) {
        setError('Shared link not found or has expired');
        showToast({
          type: 'error',
          title: 'Link Not Found',
          message: 'This shared link is not valid or has expired.'
        });
        return;
      }

      if (sharedLink.toolId !== toolId) {
        setError('This shared link is for a different tool');
        showToast({
          type: 'error',
          title: 'Wrong Tool',
          message: `This link is for ${sharedLink.toolId}, not ${toolId}.`
        });
        return;
      }

      setLinkData(sharedLink);
      
      if (onDataLoaded) {
        onDataLoaded(sharedLink.data, sharedLink.configuration);
      }

      showToast({
        type: 'success',
        title: 'Shared Data Loaded',
        message: 'Configuration and data have been loaded from the shared link.'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load shared data';
      setError(errorMessage);
      showToast({
        type: 'error',
        title: 'Load Failed',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  if (!searchParams.get('share')) {
    return null;
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Link2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Shared Configuration
          </h3>
          
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-700">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading shared data...</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {linkData && !error && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Data loaded successfully</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-blue-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Created: {formatDate(linkData.createdAt)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>Views: {linkData.accessCount}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{getTimeRemaining(linkData.expiresAt)}</span>
                </div>
                
                {linkData.maxAccess && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>Max views: {linkData.maxAccess}</span>
                  </div>
                )}
              </div>
              
              {linkData.data && (
                <details className="mt-3">
                  <summary className="text-xs text-blue-700 cursor-pointer hover:text-blue-900">
                    View shared data
                  </summary>
                  <pre className="mt-2 p-2 bg-white border border-blue-200 rounded text-xs text-gray-700 overflow-x-auto max-h-32">
                    {typeof linkData.data === 'object' 
                      ? JSON.stringify(linkData.data, null, 2)
                      : String(linkData.data)
                    }
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareableLinkHandler;