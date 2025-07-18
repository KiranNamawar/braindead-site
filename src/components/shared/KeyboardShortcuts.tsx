import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Edit3, Save, X, RotateCcw, Plus, Trash2, Check } from 'lucide-react';
import { KeyboardShortcut } from '../../types';
import { useToast } from '../ToastContainer';

interface KeyboardShortcutsProps {
  toolId?: string;
  onShortcutTriggered?: (action: string) => void;
  className?: string;
}

const defaultShortcuts: KeyboardShortcut[] = [
  {
    key: 'k',
    ctrlKey: true,
    action: 'search',
    description: 'Open search modal',
  },
  {
    key: 'Enter',
    ctrlKey: true,
    action: 'execute',
    description: 'Execute main action',
  },
  {
    key: 's',
    ctrlKey: true,
    action: 'save',
    description: 'Save/Export result',
  },
  {
    key: 'r',
    ctrlKey: true,
    action: 'reset',
    description: 'Reset/Clear input',
  },
  {
    key: 'c',
    ctrlKey: true,
    shiftKey: true,
    action: 'copy',
    description: 'Copy result to clipboard',
  },
  {
    key: 'h',
    ctrlKey: true,
    action: 'help',
    description: 'Show help/tutorial',
  },
  {
    key: 'b',
    ctrlKey: true,
    action: 'batch',
    description: 'Open batch processing',
  },
  {
    key: 'e',
    ctrlKey: true,
    action: 'export',
    description: 'Open export panel',
  }
];

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  toolId,
  onShortcutTriggered,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>(defaultShortcuts);
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [recordingKeys, setRecordingKeys] = useState(false);
  const [newShortcut, setNewShortcut] = useState<Partial<KeyboardShortcut>>({});
  const recordingRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Load custom shortcuts from localStorage
    const storageKey = toolId ? `shortcuts-${toolId}` : 'global-shortcuts';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setShortcuts(parsed);
      } catch (error) {
        console.warn('Failed to load shortcuts:', error);
      }
    }
  }, [toolId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (recordingKeys) {
        event.preventDefault();
        event.stopPropagation();
        
        const shortcut: Partial<KeyboardShortcut> = {
          key: event.key,
          ctrlKey: event.ctrlKey,
          altKey: event.altKey,
          shiftKey: event.shiftKey,
          metaKey: event.metaKey
        };
        
        setNewShortcut(shortcut);
        return;
      }

      // Check if any shortcut matches
      const matchingShortcut = shortcuts.find(shortcut => 
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.metaKey === event.metaKey
      );

      if (matchingShortcut) {
        event.preventDefault();
        event.stopPropagation();
        
        if (onShortcutTriggered) {
          onShortcutTriggered(matchingShortcut.action);
        }
        
        showToast({
          type: 'info',
          title: 'Shortcut Triggered',
          message: matchingShortcut.description
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, recordingKeys, newShortcut, onShortcutTriggered, showToast]);

  const saveShortcuts = () => {
    const storageKey = toolId ? `shortcuts-${toolId}` : 'global-shortcuts';
    localStorage.setItem(storageKey, JSON.stringify(shortcuts));
    showToast({
      type: 'success',
      title: 'Shortcuts Saved',
      message: 'Your keyboard shortcuts have been saved'
    });
  };

  const resetToDefaults = () => {
    setShortcuts(defaultShortcuts);
    const storageKey = toolId ? `shortcuts-${toolId}` : 'global-shortcuts';
    localStorage.removeItem(storageKey);
    showToast({
      type: 'success',
      title: 'Shortcuts Reset',
      message: 'Keyboard shortcuts have been reset to defaults'
    });
  };

  const startRecording = (action: string) => {
    setEditingShortcut(action);
    setRecordingKeys(true);
    setNewShortcut({ action });
    
    showToast({
      type: 'info',
      title: 'Recording Shortcut',
      message: 'Press the key combination you want to use'
    });
  };

  const stopRecording = () => {
    setRecordingKeys(false);
    if (recordingRef.current) {
      recordingRef.current.blur();
    }
  };

  const saveNewShortcut = () => {
    if (!newShortcut.key || !editingShortcut) return;

    // Check for conflicts
    const conflict = shortcuts.find(s => 
      s.action !== editingShortcut &&
      s.key.toLowerCase() === newShortcut.key!.toLowerCase() &&
      !!s.ctrlKey === !!newShortcut.ctrlKey &&
      !!s.altKey === !!newShortcut.altKey &&
      !!s.shiftKey === !!newShortcut.shiftKey &&
      !!s.metaKey === !!newShortcut.metaKey
    );

    if (conflict) {
      showToast({
        type: 'error',
        title: 'Shortcut Conflict',
        message: `This combination is already used for "${conflict.description}"`
      });
      return;
    }

    const updatedShortcuts = shortcuts.map(shortcut => 
      shortcut.action === editingShortcut
        ? { ...shortcut, ...newShortcut }
        : shortcut
    );

    setShortcuts(updatedShortcuts);
    setEditingShortcut(null);
    setNewShortcut({});
    stopRecording();
    
    showToast({
      type: 'success',
      title: 'Shortcut Updated',
      message: 'Keyboard shortcut has been updated'
    });
  };

  const cancelEditing = () => {
    setEditingShortcut(null);
    setNewShortcut({});
    stopRecording();
  };

  const deleteShortcut = (action: string) => {
    const updatedShortcuts = shortcuts.filter(s => s.action !== action);
    setShortcuts(updatedShortcuts);
    showToast({
      type: 'success',
      title: 'Shortcut Deleted',
      message: 'Keyboard shortcut has been removed'
    });
  };

  const addNewShortcut = () => {
    const newAction = `custom-${Date.now()}`;
    const newShortcutObj: KeyboardShortcut = {
      key: '',
      action: newAction,
      description: 'New custom shortcut'
    };
    
    setShortcuts([...shortcuts, newShortcutObj]);
    setEditingShortcut(newAction);
  };

  const formatShortcut = (shortcut: KeyboardShortcut | Partial<KeyboardShortcut>) => {
    const parts: string[] = [];
    
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.metaKey) parts.push('Cmd');
    if (shortcut.key) parts.push(shortcut.key.toUpperCase());
    
    return parts.join(' + ');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm ${className}`}
      >
        <Keyboard className="w-4 h-4" />
        Shortcuts
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.action}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {shortcut.description}
                  </div>
                  <div className="text-sm text-gray-500">
                    Action: {shortcut.action}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {editingShortcut === shortcut.action ? (
                    <div className="flex items-center gap-2">
                      <div
                        ref={recordingRef}
                        className={`px-3 py-1 border-2 rounded text-sm font-mono min-w-24 text-center ${
                          recordingKeys
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-700'
                        }`}
                        tabIndex={0}
                        onFocus={() => setRecordingKeys(true)}
                        onBlur={stopRecording}
                      >
                        {newShortcut.key ? formatShortcut(newShortcut) : 'Press keys...'}
                      </div>
                      
                      <button
                        onClick={saveNewShortcut}
                        disabled={!newShortcut.key}
                        className="p-1 text-green-600 hover:text-green-800 disabled:text-gray-400"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={cancelEditing}
                        className="p-1 text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-200 rounded text-sm font-mono">
                        {formatShortcut(shortcut)}
                      </code>
                      
                      <button
                        onClick={() => startRecording(shortcut.action)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteShortcut(shortcut.action)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addNewShortcut}
            className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Custom Shortcut
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={saveShortcuts}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="px-4 pb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              How to use:
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Click the edit button to change a shortcut</li>
              <li>• Press the key combination you want to use</li>
              <li>• Use Ctrl/Cmd + key combinations for best compatibility</li>
              <li>• Avoid system shortcuts like Ctrl+C, Ctrl+V</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;