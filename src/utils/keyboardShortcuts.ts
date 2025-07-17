// Keyboard shortcuts management utility
import { KeyboardShortcut } from '../types';

class KeyboardShortcutsManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private listeners: Map<string, (event: KeyboardEvent) => void> = new Map();
  private enabled: boolean = true;

  constructor() {
    this.setupDefaultShortcuts();
    this.bindGlobalListeners();
  }

  private setupDefaultShortcuts(): void {
    const defaultShortcuts: KeyboardShortcut[] = [
      {
        key: 'k',
        ctrlKey: true,
        action: 'open-search',
        description: 'Open search modal'
      },
      {
        key: 'k',
        metaKey: true,
        action: 'open-search',
        description: 'Open search modal (Mac)'
      },
      {
        key: '/',
        action: 'focus-search',
        description: 'Focus search input'
      },
      {
        key: 'Escape',
        action: 'close-modal',
        description: 'Close any open modal'
      },
      {
        key: 'h',
        ctrlKey: true,
        action: 'go-home',
        description: 'Go to homepage'
      },
      {
        key: 'f',
        ctrlKey: true,
        action: 'toggle-favorites',
        description: 'Toggle favorites panel'
      },
      {
        key: 'r',
        ctrlKey: true,
        action: 'show-recent',
        description: 'Show recent tools'
      },
      {
        key: '?',
        shiftKey: true,
        action: 'show-help',
        description: 'Show keyboard shortcuts help'
      },
      // Tool-specific shortcuts
      {
        key: '1',
        altKey: true,
        action: 'open-tool',
        toolId: 'calculator',
        description: 'Open Calculator'
      },
      {
        key: '2',
        altKey: true,
        action: 'open-tool',
        toolId: 'json-formatter',
        description: 'Open JSON Formatter'
      },
      {
        key: '3',
        altKey: true,
        action: 'open-tool',
        toolId: 'password-generator',
        description: 'Open Password Generator'
      },
      {
        key: '4',
        altKey: true,
        action: 'open-tool',
        toolId: 'color-picker',
        description: 'Open Color Picker'
      },
      {
        key: '5',
        altKey: true,
        action: 'open-tool',
        toolId: 'text-tools',
        description: 'Open Text Tools'
      }
    ];

    defaultShortcuts.forEach(shortcut => {
      this.registerShortcut(shortcut);
    });
  }

  private bindGlobalListeners(): void {
    document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
  }

  private handleGlobalKeydown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Allow Escape to work in inputs
      if (event.key !== 'Escape') return;
    }

    const shortcutKey = this.getShortcutKey(event);
    const shortcut = this.shortcuts.get(shortcutKey);

    if (shortcut) {
      event.preventDefault();
      this.executeShortcut(shortcut, event);
    }
  }

  private getShortcutKey(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('meta');
    
    parts.push(event.key.toLowerCase());
    
    return parts.join('+');
  }

  private executeShortcut(shortcut: KeyboardShortcut, event: KeyboardEvent): void {
    // Emit custom event for components to listen to
    const customEvent = new CustomEvent('keyboard-shortcut', {
      detail: {
        shortcut,
        originalEvent: event
      }
    });
    
    document.dispatchEvent(customEvent);
  }

  public registerShortcut(shortcut: KeyboardShortcut): void {
    const key = this.buildShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  public unregisterShortcut(shortcut: KeyboardShortcut): void {
    const key = this.buildShortcutKey(shortcut);
    this.shortcuts.delete(key);
  }

  private buildShortcutKey(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    
    if (shortcut.ctrlKey) parts.push('ctrl');
    if (shortcut.altKey) parts.push('alt');
    if (shortcut.shiftKey) parts.push('shift');
    if (shortcut.metaKey) parts.push('meta');
    
    parts.push(shortcut.key.toLowerCase());
    
    return parts.join('+');
  }

  public getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  public getShortcutsByAction(action: string): KeyboardShortcut[] {
    return this.getAllShortcuts().filter(s => s.action === action);
  }

  public getShortcutsByTool(toolId: string): KeyboardShortcut[] {
    return this.getAllShortcuts().filter(s => s.toolId === toolId);
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    
    // Use platform-specific modifier names
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    if (shortcut.ctrlKey) {
      parts.push(isMac ? '⌘' : 'Ctrl');
    }
    if (shortcut.altKey) {
      parts.push(isMac ? '⌥' : 'Alt');
    }
    if (shortcut.shiftKey) {
      parts.push(isMac ? '⇧' : 'Shift');
    }
    if (shortcut.metaKey) {
      parts.push(isMac ? '⌘' : 'Win');
    }
    
    // Format key name
    let keyName = shortcut.key;
    if (keyName === ' ') keyName = 'Space';
    if (keyName.length === 1) keyName = keyName.toUpperCase();
    
    parts.push(keyName);
    
    return parts.join(isMac ? '' : '+');
  }

  public addCustomShortcut(
    key: string,
    modifiers: {
      ctrlKey?: boolean;
      altKey?: boolean;
      shiftKey?: boolean;
      metaKey?: boolean;
    },
    action: string,
    description: string,
    toolId?: string
  ): void {
    const shortcut: KeyboardShortcut = {
      key,
      ...modifiers,
      action,
      description,
      toolId
    };
    
    this.registerShortcut(shortcut);
  }

  public removeCustomShortcut(key: string, modifiers: any): void {
    const shortcut = { key, ...modifiers } as KeyboardShortcut;
    this.unregisterShortcut(shortcut);
  }

  // Helper method to check if a shortcut conflicts with existing ones
  public hasConflict(shortcut: KeyboardShortcut): boolean {
    const key = this.buildShortcutKey(shortcut);
    return this.shortcuts.has(key);
  }

  // Get shortcuts grouped by category for help display
  public getShortcutsGrouped(): Record<string, KeyboardShortcut[]> {
    const shortcuts = this.getAllShortcuts();
    const grouped: Record<string, KeyboardShortcut[]> = {
      'Navigation': [],
      'Search': [],
      'Tools': [],
      'General': []
    };

    shortcuts.forEach(shortcut => {
      if (shortcut.action.includes('search')) {
        grouped['Search'].push(shortcut);
      } else if (shortcut.action.includes('tool') || shortcut.toolId) {
        grouped['Tools'].push(shortcut);
      } else if (shortcut.action.includes('go-') || shortcut.action.includes('show-')) {
        grouped['Navigation'].push(shortcut);
      } else {
        grouped['General'].push(shortcut);
      }
    });

    return grouped;
  }
}

// Create singleton instance
export const keyboardShortcutsManager = new KeyboardShortcutsManager();

// Convenience functions
export const registerShortcut = (shortcut: KeyboardShortcut) => 
  keyboardShortcutsManager.registerShortcut(shortcut);

export const getAllShortcuts = () => 
  keyboardShortcutsManager.getAllShortcuts();

export const getShortcutsGrouped = () => 
  keyboardShortcutsManager.getShortcutsGrouped();

export const formatShortcut = (shortcut: KeyboardShortcut) => 
  keyboardShortcutsManager.formatShortcut(shortcut);

export const enableShortcuts = () => 
  keyboardShortcutsManager.enable();

export const disableShortcuts = () => 
  keyboardShortcutsManager.disable();

export const addCustomShortcut = (
  key: string,
  modifiers: any,
  action: string,
  description: string,
  toolId?: string
) => keyboardShortcutsManager.addCustomShortcut(key, modifiers, action, description, toolId);