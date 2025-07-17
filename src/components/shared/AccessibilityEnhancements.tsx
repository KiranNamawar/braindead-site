import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Keyboard, MousePointer, Volume2, VolumeX } from 'lucide-react';

interface AccessibilityEnhancementsProps {
  children: React.ReactNode;
}

const AccessibilityEnhancements: React.FC<AccessibilityEnhancementsProps> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Load accessibility preferences
    const preferences = localStorage.getItem('accessibility-preferences');
    if (preferences) {
      try {
        const parsed = JSON.parse(preferences);
        setHighContrast(parsed.highContrast || false);
        setReducedMotion(parsed.reducedMotion || false);
        setKeyboardNavigation(parsed.keyboardNavigation || false);
        setScreenReaderMode(parsed.screenReaderMode || false);
        setFontSize(parsed.fontSize || 100);
        setSoundEnabled(parsed.soundEnabled !== false);
      } catch (error) {
        console.warn('Failed to load accessibility preferences:', error);
      }
    }

    // Detect system preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
    }

    if (window.matchMedia('(prefers-contrast: high)').matches) {
      setHighContrast(true);
    }
  }, []);

  useEffect(() => {
    // Save preferences
    const preferences = {
      highContrast,
      reducedMotion,
      keyboardNavigation,
      screenReaderMode,
      fontSize,
      soundEnabled
    };
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));

    // Apply CSS classes
    const root = document.documentElement;
    
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    if (keyboardNavigation) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }

    if (screenReaderMode) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }

    // Apply font size
    root.style.fontSize = `${fontSize}%`;

  }, [highContrast, reducedMotion, keyboardNavigation, screenReaderMode, fontSize]);

  useEffect(() => {
    // Keyboard navigation detection
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setKeyboardNavigation(true);
      }
    };

    const handleMouseDown = () => {
      setKeyboardNavigation(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const playSound = (type: 'success' | 'error' | 'info' = 'info') => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different types
    const frequencies = {
      success: 800,
      error: 300,
      info: 600
    };

    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  return (
    <div className="accessibility-wrapper">
      {/* Accessibility Toolbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white p-2 transform -translate-y-full focus-within:translate-y-0 transition-transform">
        <div className="container mx-auto flex items-center justify-between">
          <span className="text-sm font-medium">Accessibility Options</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setHighContrast(!highContrast)}
              className="flex items-center gap-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
              aria-label={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
            >
              {highContrast ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              High Contrast
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
              aria-label={`${soundEnabled ? 'Disable' : 'Enable'} sound feedback`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              Sound
            </button>

            <div className="flex items-center gap-2">
              <label htmlFor="font-size" className="text-sm">Font Size:</label>
              <input
                id="font-size"
                type="range"
                min="75"
                max="150"
                step="25"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-20"
                aria-label="Adjust font size"
              />
              <span className="text-sm w-8">{fontSize}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skip Links */}
      <div className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50">
        <a
          href="#main-content"
          className="bg-blue-600 text-white px-4 py-2 rounded-br-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to main content
        </a>
      </div>

      {/* Live Region for Screen Readers */}
      <div
        id="live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Main Content */}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      {/* Keyboard Navigation Indicator */}
      {keyboardNavigation && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg z-40">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            <span className="text-sm">Keyboard Navigation Active</span>
          </div>
        </div>
      )}

      {/* Focus Trap for Modals */}
      <style jsx global>{`
        /* High Contrast Mode */
        .high-contrast {
          --tw-bg-gray-50: #ffffff;
          --tw-bg-gray-100: #f0f0f0;
          --tw-bg-gray-800: #000000;
          --tw-bg-gray-900: #000000;
          --tw-text-gray-900: #000000;
          --tw-text-gray-100: #ffffff;
          --tw-border-gray-200: #000000;
          --tw-border-gray-700: #ffffff;
        }

        .high-contrast * {
          border-color: currentColor !important;
        }

        .high-contrast button:focus,
        .high-contrast input:focus,
        .high-contrast textarea:focus,
        .high-contrast select:focus {
          outline: 3px solid #0066cc !important;
          outline-offset: 2px !important;
        }

        /* Reduced Motion */
        .reduced-motion *,
        .reduced-motion *::before,
        .reduced-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }

        /* Keyboard Navigation */
        .keyboard-navigation *:focus {
          outline: 2px solid #0066cc !important;
          outline-offset: 2px !important;
        }

        .keyboard-navigation button:focus,
        .keyboard-navigation [role="button"]:focus {
          box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.3) !important;
        }

        /* Screen Reader Mode */
        .screen-reader-mode .sr-only {
          position: static !important;
          width: auto !important;
          height: auto !important;
          padding: 0.25rem !important;
          margin: 0.25rem !important;
          overflow: visible !important;
          clip: auto !important;
          white-space: normal !important;
          background: #f0f0f0 !important;
          border: 1px solid #ccc !important;
        }

        /* Focus Management */
        [tabindex="-1"]:focus {
          outline: none !important;
        }

        /* Skip Links */
        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: #000;
          color: #fff;
          padding: 8px;
          text-decoration: none;
          z-index: 1000;
        }

        .skip-link:focus {
          top: 6px;
        }

        /* Improved Focus Indicators */
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible,
        select:focus-visible,
        [role="button"]:focus-visible {
          outline: 2px solid #0066cc;
          outline-offset: 2px;
        }

        /* High Contrast Focus */
        @media (prefers-contrast: high) {
          button:focus,
          input:focus,
          textarea:focus,
          select:focus {
            outline: 3px solid;
            outline-offset: 2px;
          }
        }

        /* Reduced Motion Preference */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

// Utility functions for accessibility
export const announceToScreenReader = (message: string) => {
  const liveRegion = document.getElementById('live-region');
  if (liveRegion) {
    liveRegion.textContent = message;
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }
};

export const focusElement = (selector: string) => {
  const element = document.querySelector(selector) as HTMLElement;
  if (element) {
    element.focus();
  }
};

export const trapFocus = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);
  
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
};

export default AccessibilityEnhancements;