import { useState, useCallback } from 'react';
import { copyToClipboard as utilCopyToClipboard } from '../utils/performance';

export function useClipboard(timeout = 2000) {
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    if (!text) {
      setError('No text to copy');
      setTimeout(() => setError(null), timeout);
      return false;
    }

    try {
      const success = await utilCopyToClipboard(text);
      
      if (success) {
        setIsCopied(true);
        setError(null);
        setTimeout(() => setIsCopied(false), timeout);
        return true;
      } else {
        throw new Error('Copy operation failed');
      }
    } catch {
      setError('Failed to copy to clipboard');
      setIsCopied(false);
      setTimeout(() => setError(null), timeout);
      return false;
    }
  }, [timeout]);

  return { copyToClipboard, isCopied, error };
}