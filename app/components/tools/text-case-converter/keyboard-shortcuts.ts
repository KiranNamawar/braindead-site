/**
 * Keyboard shortcuts for the Text Case Converter
 */
export const KEYBOARD_SHORTCUTS = {
  COPY: { key: 'c', modifier: 'Alt', description: 'Copy converted text' },
  DOWNLOAD: { key: 'd', modifier: 'Alt', description: 'Download converted text' },
  FOCUS_INPUT: { key: '1', modifier: 'Alt', description: 'Focus input field' },
  FOCUS_OUTPUT: { key: '2', modifier: 'Alt', description: 'Focus output field' },
  TOGGLE_OPTIONS: { key: 'o', modifier: 'Alt', description: 'Toggle advanced options' },
  CLEAR: { key: 'Delete', modifier: 'Alt', description: 'Clear input text' },
};

/**
 * Helper function to check if a keyboard event matches a shortcut
 */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: { key: string; modifier: string }
): boolean {
  const isAlt = shortcut.modifier === 'Alt' && event.altKey;
  const isCtrl = shortcut.modifier === 'Ctrl' && event.ctrlKey;
  const isShift = shortcut.modifier === 'Shift' && event.shiftKey;
  const isMeta = shortcut.modifier === 'Meta' && event.metaKey;
  
  const modifierMatches = isAlt || isCtrl || isShift || isMeta;
  const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
  
  return modifierMatches && keyMatches;
}

/**
 * Format a keyboard shortcut for display
 */
export function formatShortcut(shortcut: { key: string; modifier: string }): string {
  return `${shortcut.modifier}+${shortcut.key.toUpperCase()}`;
}