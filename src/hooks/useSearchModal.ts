import { useState, useEffect, useCallback } from 'react';

export function useSearchModal() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        openModal();
        return;
      }

      // Forward slash to open search (like GitHub)
      if (event.key === '/' && !isInputFocused()) {
        event.preventDefault();
        openModal();
        return;
      }
    };

    // Helper to check if an input is focused
    const isInputFocused = (): boolean => {
      const activeElement = document.activeElement;
      return (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement instanceof HTMLElement && activeElement.isContentEditable)
      );
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openModal]);

  // Handle custom keyboard shortcut events
  useEffect(() => {
    const handleCustomShortcut = (event: CustomEvent) => {
      const { shortcut } = event.detail;
      
      if (shortcut.action === 'open-search') {
        openModal();
      } else if (shortcut.action === 'close-modal' && isOpen) {
        closeModal();
      }
    };

    document.addEventListener('keyboard-shortcut', handleCustomShortcut as EventListener);
    return () => document.removeEventListener('keyboard-shortcut', handleCustomShortcut as EventListener);
  }, [openModal, closeModal, isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
}